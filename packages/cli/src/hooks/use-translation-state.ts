import { useMemo } from "react";
import type { ModelMessage } from "@douyipu/translator-cli-core";

export const useTranslationState = (messages: ModelMessage[]) => {
    const { currentFile, currentTranslation } = useMemo(() => {
        let currentFile: string | null = null;
        let currentTranslation = { src: "", translated: "" };

        // Find the latest file read and translation state from messages
        for (const message of [...messages].reverse()) {
            if (message.role === "tool") {
                for (const content of message.content) {
                    if (content.type === "tool-result") {
                        const result = (content as any).result;

                        // Look for file read results
                        if (typeof result === "object" && result && "content" in result) {
                            if (!currentFile && typeof result.content === "string") {
                                currentFile = result.content;
                            }
                        }

                        // Look for translation results
                        if (typeof result === "object" && result && "translated_string" in result) {
                            const translationResult = result as any;
                            if (translationResult.src_string && translationResult.translated_string) {
                                currentTranslation = {
                                    src: translationResult.src_string,
                                    translated: translationResult.translated_string,
                                };
                            }
                        }
                    }
                }
            }
        }

        return { currentFile, currentTranslation };
    }, [messages]);

    return { currentFile, currentTranslation };
};