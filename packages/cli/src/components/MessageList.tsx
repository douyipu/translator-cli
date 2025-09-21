import { } from "react";
import { Box, Text } from "ink";
import type { ModelMessage } from "@douyipu/translator-cli-core";

interface MessageListProps {
  messages: ModelMessage[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <Box padding={1}>
        <Text color="gray">No messages yet. Start by typing a command!</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      {messages.map((message, index) => (
        <Box key={index} marginBottom={1}>
          {message.role === "user" && (
            <Box>
              <Text color="blue" bold>
                User:{" "}
              </Text>
              {Array.isArray(message.content)
                ? message.content.map((content, contentIndex) => (
                    <Text key={contentIndex}>
                      {typeof content === "object" && content.type === "text"
                        ? content.text
                        : "[Non-text content]"}
                    </Text>
                  ))
                : <Text>{typeof message.content === "string" ? message.content : "[Complex content]"}</Text>
              }
            </Box>
          )}

          {message.role === "assistant" && (
            <Box>
              <Text color="green" bold>
                Assistant:{" "}
              </Text>
              {Array.isArray(message.content)
                ? message.content.map((content, contentIndex) => (
                    <Text key={contentIndex}>
                      {typeof content === "object" && content.type === "text"
                        ? content.text
                        : typeof content === "object" && content.type === "tool-call"
                        ? `[Tool Call: ${(content as any).toolName}]`
                        : "[Unknown content]"}
                    </Text>
                  ))
                : <Text>{typeof message.content === "string" ? message.content : "[Complex content]"}</Text>
              }
            </Box>
          )}

          {message.role === "tool" && (
            <Box>
              <Text color="yellow" bold>
                Tool Result:{" "}
              </Text>
              <Text color="gray">
                {message.content
                  .map((content) =>
                    content.type === "tool-result"
                      ? `[${content.toolCallId}: Result received]`
                      : "[Unknown tool content]"
                  )
                  .join(", ")}
              </Text>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};