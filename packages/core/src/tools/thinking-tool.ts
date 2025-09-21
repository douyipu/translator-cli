import { tool } from "ai";
import { z } from "zod";
import type { ToolExecutor } from "../types.ts";

const description = `A tool for analyzing text content and planning translation strategies.`;

const inputSchema = z.object({
    action: z.enum(["segment_text", "analyze_content", "plan_translation"]).describe("The type of analysis to perform"),
    content: z.string().describe("The text content to analyze"),
    context: z.string().optional().describe("Additional context for the analysis"),
});

const outputSchema = z.object({
    result: z.string().describe("The result of the analysis"),
    segments: z.array(z.object({
        text: z.string().describe("The segment text"),
        index: z.number().describe("Segment index"),
        length: z.number().describe("Character length"),
    })).optional().describe("Text segments (for segment_text action)"),
    metadata: z.object({
        total_length: z.number().describe("Total content length"),
        estimated_segments: z.number().describe("Estimated number of segments"),
        language_detected: z.string().describe("Detected language"),
    }).optional(),
});

export const thinkingTool = tool({
    name: "Think",
    description,
    inputSchema,
    outputSchema,
});

export const thinkingExecutor: ToolExecutor<
    z.infer<typeof inputSchema>,
    z.infer<typeof outputSchema>
> = async (input, options) => {
    const { action, content, context } = input;

    switch (action) {
        case "segment_text":
            return segmentText(content);

        case "analyze_content":
            return analyzeContent(content);

        case "plan_translation":
            return planTranslation(content, context);

        default:
            return {
                result: "Unknown action",
                metadata: {
                    total_length: content.length,
                    estimated_segments: 0,
                    language_detected: "unknown",
                }
            };
    }
};

function segmentText(content: string) {
    const maxLength = 300;
    const segments = [];

    // Split by paragraphs first
    const paragraphs = content.split(/\n\s*\n/);
    let index = 0;

    for (const paragraph of paragraphs) {
        if (paragraph.trim().length === 0) continue;

        if (paragraph.length <= maxLength) {
            segments.push({
                text: paragraph.trim(),
                index: index++,
                length: paragraph.trim().length,
            });
        } else {
            // Split by sentences if paragraph is too long
            const sentences = paragraph.split(/[.!?]+\s+/);
            let currentSegment = "";

            for (const sentence of sentences) {
                if ((currentSegment + sentence).length <= maxLength) {
                    currentSegment += (currentSegment ? ". " : "") + sentence;
                } else {
                    if (currentSegment) {
                        segments.push({
                            text: currentSegment.trim(),
                            index: index++,
                            length: currentSegment.length,
                        });
                    }
                    currentSegment = sentence;
                }
            }

            if (currentSegment.trim()) {
                segments.push({
                    text: currentSegment.trim(),
                    index: index++,
                    length: currentSegment.length,
                });
            }
        }
    }

    return {
        result: `Successfully segmented text into ${segments.length} parts`,
        segments,
        metadata: {
            total_length: content.length,
            estimated_segments: segments.length,
            language_detected: detectLanguage(content),
        }
    };
}

function analyzeContent(content: string) {
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).length;
    const chars = content.length;

    return {
        result: `Content analysis: ${lines} lines, ${words} words, ${chars} characters`,
        metadata: {
            total_length: chars,
            estimated_segments: Math.ceil(chars / 300),
            language_detected: detectLanguage(content),
        }
    };
}

function planTranslation(content: string, context?: string) {
    const segments = Math.ceil(content.length / 300);
    const language = detectLanguage(content);

    return {
        result: `Translation plan: ${segments} segments needed, detected ${language} language${context ? `, context: ${context}` : ''}`,
        metadata: {
            total_length: content.length,
            estimated_segments: segments,
            language_detected: language,
        }
    };
}

function detectLanguage(content: string): string {
    // Simple language detection based on character patterns
    const englishWords = /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi;
    const chineseChars = /[\u4e00-\u9fff]/g;

    const englishMatches = content.match(englishWords)?.length || 0;
    const chineseMatches = content.match(chineseChars)?.length || 0;

    if (chineseMatches > englishMatches) return "Chinese";
    if (englishMatches > 0) return "English";
    return "Unknown";
}