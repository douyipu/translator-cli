import type { CopilotRequest, CopilotResponse } from "./types.ts";

export class Memory {
    public current: string = "";

    constructor(initialMemory: string = "") {
        this.current = initialMemory;
    }

    update(memory: string): void {
        this.current = memory;
    }

    append(memory: string): void {
        this.current += memory;
    }

    clear(): void {
        this.current = "";
    }

    async extractMemory(data: {
        req: CopilotRequest;
        res: CopilotResponse;
    }): Promise<void> {
        // Extract relevant information from failed translation attempts
        const { req, res } = data;
        const memoryEntry = `
Translation feedback:
- Source: ${req.src_string}
- Draft: ${req.translate_string}
- Status: ${res.status}
- Reason: ${res.reason}
- Final: ${res.translated_string}
- File: ${req.file_id}
---`;
        this.append(memoryEntry);
    }
}