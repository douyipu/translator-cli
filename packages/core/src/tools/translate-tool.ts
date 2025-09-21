import { generateText, tool } from "ai";
import { z } from "zod";
import type { ToolExecutor } from "../types.ts";
import { models } from "../llm.ts";

const description = `Translate text segments and get user feedback on the translation quality.`;

const inputSchema = z.object({
    file_id: z.string().describe("The ID of the file being translated"),
    src_string: z.string().describe("The source string to translate"),
    translate_string: z.string().optional().describe("Optional pre-generated translation (if not provided, AI will generate it)"),
    target_language: z.string().default("Chinese").describe("Target language for translation"),
    context: z.string().optional().describe("Additional context for better translation"),
});

const outputSchema = z.object({
    translated_string: z.string().describe("The final translated string after user review"),
    status: z.enum(["approve", "reject", "refined"]).describe("The status of user review"),
    reason: z.string().describe("The reason for the status, if applicable"),
    original_translation: z.string().optional().describe("The original AI-generated translation before user feedback"),
});

export const translateTool = tool({
    name: "Translate",
    description,
    inputSchema,
    outputSchema,
});

export const translateExecutor: ToolExecutor<
    z.infer<typeof inputSchema>,
    z.infer<typeof outputSchema>
> = async (input, options): Promise<z.infer<typeof outputSchema>> => {
    // Validate input length
    if (input.src_string.length > 300) {
        return {
            translated_string: "",
            status: "reject",
            reason: "Source string exceeds maximum length of 300 characters",
        };
    }

    // Validate source string is not empty
    if (!input.src_string.trim()) {
        return {
            translated_string: "",
            status: "reject",
            reason: "Source string is empty",
        };
    }

    let draftTranslation = input.translate_string;

    // Generate translation if not provided
    if (!draftTranslation) {
        try {
            const { text } = await generateText({
                model: models.translator,
                prompt: `Translate the following English text to ${input.target_language}. Provide a natural, accurate translation that maintains the original meaning and tone.

${input.context ? `Context: ${input.context}\n\n` : ""}Source text: ${input.src_string}

Translation:`,
            });
            draftTranslation = text.trim();
        } catch (error) {
            return {
                translated_string: "",
                status: "reject",
                reason: `Failed to generate translation: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }

    // If no copilot handler, auto-approve the AI translation
    if (!options.copilotHandler) {
        return {
            translated_string: draftTranslation,
            status: "approve",
            reason: "Auto-approved (no user review configured)",
            original_translation: draftTranslation,
        };
    }

    // Send to copilot handler for user review
    const copilotRequest = {
        file_id: input.file_id,
        src_string: input.src_string,
        translate_string: draftTranslation,
    };

    try {
        const copilotResponse = await options.copilotHandler(copilotRequest);

        // Store learning data if not approved
        if (copilotResponse.status !== "approve" && options.memory) {
            await options.memory.extractMemory({
                req: copilotRequest,
                res: copilotResponse,
            });
        }

        return {
            translated_string: copilotResponse.translated_string,
            status: copilotResponse.status,
            reason: copilotResponse.reason,
            original_translation: draftTranslation,
        };
    } catch (error) {
        return {
            translated_string: draftTranslation,
            status: "reject",
            reason: `Copilot handler error: ${error instanceof Error ? error.message : "Unknown error"}`,
            original_translation: draftTranslation,
        };
    }
};