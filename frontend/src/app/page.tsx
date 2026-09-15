"use client";

import React, { useState } from "react";
import { useSessions } from "@/hooks/use-sessions";
import { useChat } from "@/hooks/use-chat";
import { useArtifacts } from "@/hooks/use-artifacts";
import { useAuthSync } from "@/lib/auth-api-client";
import { SessionSidebar } from "@/components/sidebar/session-sidebar";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ArtifactPanel } from "@/components/artifacts/artifact-panel";
import { ContextPanel } from "@/components/context/context-panel";

export default function Home() {
  // Sync Clerk auth token to API client
  useAuthSync();

  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    isLoading: isSessionsLoading,
    createNewSession,
    deleteSession,
    refreshSessions,
  } = useSessions();

  const {
    artifacts,
    activeArtifact,
    isArtifactPanelOpen,
    openArtifact,
    closeArtifactPanel,
    fetchSessionArtifacts,
  } = useArtifacts(activeSessionId);

  const {
    messages,
    isStreaming,
    streamingContent,
    currentSources,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    sendMessage,
  } = useChat(
    activeSessionId,
    (artifactId) => {
      openArtifact(artifactId);
      fetchSessionArtifacts();
    },
    () => {
      refreshSessions();
    }
  );

  const handleSelectModel = (provider: string, model: string) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
  };

  const handleNewSession = async () => {
    const s = await createNewSession();
    if (s) {
      closeArtifactPanel();
    }
  };

  const handleContextAction = (action: string) => {
    // Convert quick actions into chat prompts
    sendMessage(action);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          closeArtifactPanel();
        }}
        onNewSession={handleNewSession}
        onDeleteSession={deleteSession}
        isLoading={isSessionsLoading}
        onTranscriptUploaded={() => {
          refreshSessions();
        }}
      />

      {/* Center Chat Panel */}
      <ChatPanel
        sessionTitle={activeSession?.title || "New Discussion"}
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        currentSources={currentSources}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        onSendMessage={sendMessage}
        onOpenArtifact={openArtifact}
        artifacts={artifacts}
        isArtifactPanelOpen={isArtifactPanelOpen}
        onToggleArtifactPanel={() => {
          if (isArtifactPanelOpen) {
            closeArtifactPanel();
          } else if (artifacts.length > 0) {
            openArtifact(artifacts[artifacts.length - 1].id);
          }
        }}
      />

      {/* Right Panel: Context (default) or Artifact (when opened) */}
      {isArtifactPanelOpen ? (
        <ArtifactPanel
          artifact={activeArtifact}
          onClose={closeArtifactPanel}
          sources={currentSources}
        />
      ) : (
        <ContextPanel onAction={handleContextAction} />
      )}
    </main>
  );
}
