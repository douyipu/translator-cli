import { Memory } from "./memory.ts";

import type { JSONValue } from "ai";

export type {
    ModelMessage,
    UserModelMessage,
    AssistantModelMessage,
    ToolModelMessage,
    SystemModelMessage,
    ToolCallPart,
    FinishReason,
} from "ai";

export type AgentLoopOptions = {
    abortSignal?: AbortSignal;
    copilotHandler?: (request: CopilotRequest) => Promise<CopilotResponse>;
    memory?: Memory;
};

export type NextActor = "user" | "agent";

export type ToolExecutor<T = any, U = JSONValue> = (
    input: T,
    options: AgentLoopOptions
) => Promise<U>;

export type CopilotStatus = "approve" | "reject" | "refined";

export type CopilotRequest = {
    src_string: string;
    translate_string: string;
    file_id: string;
};

export type CopilotResponse = {
    status: CopilotStatus;
    translated_string: string;
    reason: string;
};