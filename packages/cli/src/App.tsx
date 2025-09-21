import React from "react";
import { Box, useInput } from "ink";
import { useAgent } from "./hooks/use-agent.js";
import { useEditor } from "./hooks/use-editor.js";
import { useUserInput } from "./hooks/use-user-input.js";
import { useTranslationState } from "./hooks/use-translation-state.js";
import { CopilotRequestHandler } from "./components/CopilotRequestHandler.js";
import { MessageList } from "./components/MessageList.js";
import { UserInputArea } from "./components/UserInputArea.js";

export const App = () => {
  const {
    // agent state
    messages,
    currentActor,
    unprocessedToolCalls,

    // user interactions
    submitAgent,
    stop,

    // copilot interactions
    copilotRequest,
    finishCopilotRequest,
    copilotResolverRef,
  } = useAgent();

  const { isEditing, withEditor } = useEditor();
  useInput((_, key) => {
    if (isEditing) {
      return;
    }

    if (key.escape) {
      stop();
    }
  });

  const { currentFile, currentTranslation } = useTranslationState(messages);

  const { handleUserInput, cmd } = useUserInput({
    submitAgent,
  });

  if (isEditing) {
    return null;
  }

  if (copilotRequest) {
    return (
      <CopilotRequestHandler
        copilotRequest={copilotRequest}
        copilotResolverRef={copilotResolverRef}
        withEditor={withEditor}
        onFinish={finishCopilotRequest}
        currentFile={currentFile}
        currentTranslation={currentTranslation}
      />
    );
  }

  return (
    <Box flexDirection="column" height="100%" width="100%">
      <Box flexDirection="column" flexGrow={1}>
        <MessageList messages={messages} />
      </Box>

      <Box flexDirection="column" height={3}>
        <UserInputArea
          currentActor={currentActor}
          onSubmit={handleUserInput}
          cmd={cmd}
        />
      </Box>
    </Box>
  );
};