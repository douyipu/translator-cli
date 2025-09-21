import { tool } from "ai";
import { z } from "zod";
import { readdir, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import type { ToolExecutor } from "../types.ts";

const description = `List files in a directory that can be translated. Supports text files like .txt, .md, etc.`;

const inputSchema = z.object({
    directory: z.string().optional().describe("Directory path to search (defaults to current directory)"),
    extensions: z.array(z.string()).optional().describe("File extensions to include (defaults to .txt, .md)"),
});

const outputSchema = z.object({
    files: z.array(
        z.object({
            id: z.string().describe("Unique ID for the file (file path)"),
            name: z.string().describe("File name"),
            path: z.string().describe("Full path to the file"),
            size: z.number().describe("File size in bytes"),
            extension: z.string().describe("File extension"),
            modified_at: z.string().describe("Last modified timestamp"),
        })
    ),
    total: z.number().describe("Total number of files found"),
});

export const lsTool = tool({
    name: "List",
    description,
    inputSchema,
    outputSchema,
});

export const lsExecutor: ToolExecutor<
    z.infer<typeof inputSchema>,
    z.infer<typeof outputSchema>
> = async (input, options) => {
    const directory = input.directory || process.cwd();
    const allowedExtensions = input.extensions || ['.txt', '.md'];

    try {
        const entries = await readdir(directory);
        const files = [];

        for (const entry of entries) {
            const fullPath = join(directory, entry);
            const stats = await stat(fullPath);

            if (stats.isFile()) {
                const ext = extname(entry);
                if (allowedExtensions.includes(ext)) {
                    files.push({
                        id: fullPath,
                        name: entry,
                        path: fullPath,
                        size: stats.size,
                        extension: ext,
                        modified_at: stats.mtime.toISOString(),
                    });
                }
            }
        }

        return {
            files: files.sort((a, b) => a.name.localeCompare(b.name)),
            total: files.length,
        };
    } catch (error) {
        return {
            files: [],
            total: 0,
        };
    }
};
