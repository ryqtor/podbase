import React, { useState, useEffect } from "react";
import { Sparkles, FileText, ChevronRight, PanelRight, Layers } from "lucide-react";
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

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-w-0 relative">
      {/* Top Editorial Navbar */}
      <header className="h-14 border-b border-border px-6 flex items-center justify-between gap-4 bg-white/70 backdrop-blur-md flex-shrink-0 z-10 shadow-subtle">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="font-serif font-bold text-slate-900 text-base truncate">
            {sessionTitle || "New Conversation"}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <ModelBadge provider={selectedProvider} model={selectedModel} />

          {/* Artifacts Quick Switcher Pill */}
          {artifacts.length > 0 && (
            <button
              onClick={() => {
                if (onToggleArtifactPanel) {
                  onToggleArtifactPanel();
                } else {
                  onOpenArtifact(artifacts[artifacts.length - 1].id);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                isArtifactPanelOpen
                  ? "bg-brand text-white border-brand shadow-sm shadow-brand/20"
                  : "bg-orange-50 hover:bg-orange-100 text-brand border-orange-200/70"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Artifacts ({artifacts.length})</span>
              <PanelRight className="w-3.5 h-3.5 ml-0.5 opacity-75" />
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

      {/* Floating Bottom Input Bar */}
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
