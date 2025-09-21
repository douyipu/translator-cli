import {createOpenAICompatible} from "@ai-sdk/openai-compatible";
import {getEnvVariable} from "./env.ts"

const openrouter = createOpenAICompatible({
    name: "openrouter",
    apiKey: getEnvVariable("OPENROUTER_API_KEY"),
    baseURL: `https://openrouter.ai/api/v1`,
});

export const models = {
    translator: openrouter("z-ai/glm-4.5"),
    memory: openrouter("google/gemini-2.5-flash-lite"),
};