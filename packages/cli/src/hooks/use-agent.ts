// --- 来源于第一张图片 ---
import {
    AgentLoop,
    Memory,
} from "@douyipu/translator-cli-core";
import type {
    CopilotRequest,
    CopilotResponse,
    ModelMessage,
    ToolCallPart,
} from "@douyipu/translator-cli-core";
import { useCallback, useRef, useState } from "react";

export const useAgent = () => {
    const [messages, setMessages] = useState<ModelMessage[]>([]);
    const [unprocessedToolCalls, setUnprocessedToolCalls] = useState<
        ToolCallPart[]
    >([]);
    const [currentActor, setCurrentActor] = useState("user");

    const [copilotRequest, setCopilotRequest] = useState<CopilotRequest | null>(
        null,
    );

    const copilotResolverRef = useRef<
        ((value: CopilotResponse | PromiseLike<CopilotResponse>) => void) | null
    >(null);

    const agentLoopRef = useRef<AgentLoop | null>(null);
    const runningRef = useRef(false);
    const abortController = useRef<AbortController | null>(null);

    const initAgentLoop = useCallback(async () => {
        abortController.current = new AbortController();

        const memory = new Memory();

        agentLoopRef.current = new AgentLoop({
            abortSignal: abortController.current.signal,
            copilotHandler: (req) => {
                setCopilotRequest(req);

                return new Promise((resolve) => {
                    copilotResolverRef.current = resolve;
                });
            },
            memory,
        });

        process.addListener("SIGINT", () => {
            runningRef.current = false;
            abortController.current?.abort();
            process.exit(0);
        });
    }, []);


// --- 代码不连续 ---


// --- 来源于第二张图片 ---
    const doNext = useCallback(async () => {
        if (!agentLoopRef.current) {
            await initAgentLoop();
        }

        setCurrentActor("agent");

        while (runningRef.current && agentLoopRef.current) {
            try {
                const { actor, unprocessedToolCalls } =
                    await agentLoopRef.current.next();
                setCurrentActor(actor);

                const newMessages = await agentLoopRef.current.getMessages();
                setMessages(newMessages.slice());
                setUnprocessedToolCalls(unprocessedToolCalls);

                if (actor === "user") {
                    break;
                }
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                    console.log("Agent loop aborted");
                    runningRef.current = false;
                    setCurrentActor("user");
                    break;
                } else {
                    console.error("Error in agent loop:", error);
                    runningRef.current = false;
                    setCurrentActor("user");
                    break;
                }
            }
        }
    }, []);

    const submitAgent = async (input: string) => {
        runningRef.current = true;
        if (!agentLoopRef.current) {
            await initAgentLoop();
        }

        await agentLoopRef.current?.userInput([
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: input,
                    },
                ],
            },
        ]);

        const newMessages = await agentLoopRef.current?.getMessages();
        if (newMessages) {
            setMessages(newMessages.slice());
        }

        await doNext();
    };

    const finishCopilotRequest = () => {
        setCopilotRequest(null);
        copilotResolverRef.current = null;
    };

    const stop = () => {
        runningRef.current = false;
        abortController.current?.abort();
        setCurrentActor("user");
    };

    return {
        messages,
        currentActor,
        unprocessedToolCalls,
        submitAgent,
        copilotRequest,
        copilotResolverRef,
        finishCopilotRequest,
        stop,
    };
};