import React, { useState, useEffect } from "react";
import { FileText, PanelRight } from "lucide-react";
import { ArtifactSummary, ModelInfo } from "@/types";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { ApiClient } from "@/lib/api-client";

interface ChatPanelProps {
  sessionTitle: string;
  messages: any[];
  isStreaming: boolean;
  streamingContent: string;
  currentSources: any[];
  selectedProvider: string;
  selectedModel: string;
  onSelectModel: (provider: string, model: string) => void;
  onSendMessage: (msg: string) => void;
  onOpenArtifact: (artifactId: string) => void;
  artifacts: ArtifactSummary[];
  isArtifactPanelOpen: boolean;
  onToggleArtifactPanel?: () => void;
}

export function ChatPanel({
  sessionTitle,
  messages,
  isStreaming,
  streamingContent,
  currentSources,
  selectedProvider,
  selectedModel,
  onSelectModel,
  onSendMessage,
  onOpenArtifact,
  artifacts,
  isArtifactPanelOpen,
  onToggleArtifactPanel,
}: ChatPanelProps) {
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);

  useEffect(() => {
    ApiClient.listModels().then(setAvailableModels).catch(console.error);
  }, []);

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-w-0 relative">
      {/* ── Thin Top Bar (only when in conversation) ── */}
      {hasMessages && (
        <header className="h-12 border-b border-border px-6 flex items-center justify-between gap-4 bg-white/60 flex-shrink-0 z-10">
          <h2 className="font-serif text-[15px] text-foreground truncate">
            {sessionTitle || "New Conversation"}
          </h2>

          <div className="flex items-center gap-2 flex-shrink-0">
            {artifacts.length > 0 && (
              <button
                onClick={() => {
                  if (onToggleArtifactPanel) {
                    onToggleArtifactPanel();
                  } else {
                    onOpenArtifact(artifacts[artifacts.length - 1].id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all border ${
                  isArtifactPanelOpen
                    ? "bg-foreground text-white border-foreground"
                    : "bg-white hover:bg-slate-50 text-muted-foreground border-border"
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Artifacts ({artifacts.length})</span>
                <PanelRight className="w-3 h-3 ml-0.5 opacity-60" />
              </button>
            )}
          </div>
        </header>
      )}

      {/* ── Main Conversation Stream ── */}
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        currentSources={currentSources}
        onOpenArtifact={onOpenArtifact}
        onSelectPrompt={onSendMessage}
      />

      {/* ── Floating Bottom Composer ── */}
      <ChatInput
        onSend={onSendMessage}
        disabled={isStreaming}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
        availableModels={availableModels}
      />
    </div>
  );
}
