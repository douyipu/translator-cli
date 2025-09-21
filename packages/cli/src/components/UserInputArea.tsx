import { useState } from "react";
import { Box, Text, useInput } from "ink";

interface UserInputAreaProps {
  currentActor: string;
  onSubmit: (input: string) => Promise<void>;
  cmd: string;
}

export const UserInputArea = ({ currentActor, onSubmit }: UserInputAreaProps) => {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useInput(async (char, key) => {
    if (isSubmitting) return;

    if (key.return) {
      if (input.trim().length > 0) {
        setIsSubmitting(true);
        await onSubmit(input.trim());
        setInput("");
        setIsSubmitting(false);
      }
    } else if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
    } else if (key.ctrl && char === "c") {
      process.exit(0);
    } else if (char.length === 1 && !key.ctrl && !key.meta) {
      setInput((prev) => prev + char);
    }
  });

  if (currentActor === "agent") {
    return (
      <Box borderStyle="single" padding={1}>
        <Text color="yellow">
          🤖 Agent is working...
        </Text>
      </Box>
    );
  }

  return (
    <Box borderStyle="single" padding={1}>
      <Box>
        <Text color="blue" bold>
          {">"}{" "}
        </Text>
        <Text>{input}</Text>
        <Text color="gray">_</Text>
      </Box>
    </Box>
  );
};