import React, { useState, useEffect } from "react";
import { Sparkles, FileText, ChevronRight } from "lucide-react";
import { ArtifactSummary, ModelInfo } from "@/types";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { ModelBadge } from "./model-badge";
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
}: ChatPanelProps) {
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);

  useEffect(() => {
    ApiClient.listModels().then(setAvailableModels).catch(console.error);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-w-0 relative">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border px-5 flex items-center justify-between gap-4 bg-surface/40 backdrop-blur-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-sm font-semibold text-foreground truncate">{sessionTitle || "New Chat"}</h2>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <ModelBadge provider={selectedProvider} model={selectedModel} />

          {/* Artifacts Quick Switcher Pill */}
          {artifacts.length > 0 && !isArtifactPanelOpen && (
            <button
              onClick={() => onOpenArtifact(artifacts[artifacts.length - 1].id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-medium transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Artifacts ({artifacts.length})</span>
              <ChevronRight className="w-3 h-3 text-primary-400" />
            </button>
          )}
        </div>
      </header>

      {/* Main Conversation Stream */}
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        currentSources={currentSources}
        onOpenArtifact={onOpenArtifact}
        onSelectPrompt={onSendMessage}
      />

      {/* Sticky Bottom Input */}
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
