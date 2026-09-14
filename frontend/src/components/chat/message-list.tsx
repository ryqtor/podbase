import React, { useEffect, useRef } from "react";
import { Message, SourceReference } from "@/types";
import { MessageBubble } from "./message-bubble";
import { PromptSuggestions } from "./prompt-suggestions";
import { Sparkles, Loader2, Database } from "lucide-react";
import { MarkdownRenderer } from "@/components/artifacts/markdown-renderer";
import { SourceCitationCard } from "./source-citation-card";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  currentSources: SourceReference[];
  onOpenArtifact?: (artifactId: string) => void;
  onSelectPrompt: (prompt: string) => void;
}

export function MessageList({
  messages,
  isStreaming,
  streamingContent,
  currentSources,
  onOpenArtifact,
  onSelectPrompt,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isStreaming]);

  if (messages.length === 0 && !isStreaming) {
    return <PromptSuggestions onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-6 space-y-4 scrollbar-thin">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onOpenArtifact={onOpenArtifact} />
      ))}

      {/* Streaming Bubble */}
      {isStreaming && (
        <div className="flex gap-3.5 max-w-3xl mx-auto w-full py-4 px-4 sm:px-6 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-brand/20">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-900">Lenny Growth Intelligence</span>
              <span className="flex items-center gap-1.5 text-[11px] text-brand font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Synthesizing answer...</span>
              </span>
            </div>

            <div className="bg-white border border-border rounded-2xl p-5 shadow-card w-full">
              {streamingContent ? (
                <MarkdownRenderer content={streamingContent} />
              ) : (
                <div className="flex items-center gap-2.5 text-xs text-slate-500 py-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>Searching podcast transcript vectors & reranking...</span>
                  </div>
                </div>
              )}

              {currentSources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Grounding Context ({currentSources.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentSources.map((src, idx) => (
                      <SourceCitationCard key={idx} source={src} index={idx} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
