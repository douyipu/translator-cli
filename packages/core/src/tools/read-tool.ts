import { tool } from "ai";
import { z } from "zod";
import { readFile, stat } from "node:fs/promises";
import type { ToolExecutor } from "../types.ts";

const description = `Read a file's content for translation processing.`;

const inputSchema = z.object({
    file_path: z.string().describe("The path of the file to read"),
});

const outputSchema = z.object({
    content: z.string().describe("The content of the file"),
    status: z.enum(["success", "error"]).describe("The status of the read operation"),
    error_message: z.string().optional().describe("Error message if read failed"),
    metadata: z.object({
        size: z.number().describe("The size of the content in bytes"),
        path: z.string().describe("The file path that was read"),
        modified_at: z.string().describe("When the file was last modified"),
    }).optional(),
});

export const readTool = tool({
    name: "Read",
    description,
    inputSchema,
    outputSchema,
});

export const readExecutor: ToolExecutor<
    z.infer<typeof inputSchema>,
    z.infer<typeof outputSchema>
> = async (input, options) => {
    try {
        const content = await readFile(input.file_path, 'utf-8');
        const stats = await stat(input.file_path);

        return {
            content,
            status: "success",
            metadata: {
                size: stats.size,
                path: input.file_path,
                modified_at: stats.mtime.toISOString(),
            },
        };
    } catch (error) {
        return {
            content: "",
            status: "error",
            error_message: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
};