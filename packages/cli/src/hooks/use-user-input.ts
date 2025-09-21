import { useState, useCallback } from "react";

interface UseUserInputProps {
  submitAgent: (input: string) => Promise<void>;
}

export const useUserInput = ({ submitAgent }: UseUserInputProps) => {
  const [cmd, setCmd] = useState("");

  const handleUserInput = useCallback(async (input: string) => {
    if (!input.trim()) return;

    setCmd("");
    await submitAgent(input);
  }, [submitAgent]);

  const updateCmd = useCallback((newCmd: string) => {
    setCmd(newCmd);
  }, []);

  return {
    handleUserInput,
    cmd,
    updateCmd,
  };
};