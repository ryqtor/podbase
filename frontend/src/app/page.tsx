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
    error: sessionsError,
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
    <main className="relative flex h-screen w-screen overflow-hidden bg-background">
      {sessionsError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-950/90 border border-amber-500/30 text-amber-200 px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xl backdrop-blur-md">
          <span>⚠️ <strong>Backend Disconnected:</strong> Could not connect to API ({process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}). Set <code>NEXT_PUBLIC_API_URL</code> in Vercel settings or start backend server.</span>
        </div>
      )}

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
