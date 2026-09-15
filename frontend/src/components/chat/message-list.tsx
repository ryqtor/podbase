import React, { useEffect, useRef } from "react";
import { Message, SourceReference } from "@/types";
import { MessageBubble } from "./message-bubble";
import { PromptSuggestions } from "./prompt-suggestions";
import { Loader2, Database } from "lucide-react";
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
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-6 space-y-2 scrollbar-thin">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onOpenArtifact={onOpenArtifact} />
      ))}

      {/* Streaming Bubble */}
      {isStreaming && (
        <div className="flex gap-3.5 max-w-[680px] mx-auto w-full py-3 px-4 sm:px-6 animate-fade-in">
          <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-1 text-[11px] font-semibold">
            LG
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[12px] font-medium text-foreground">Lenny Growth</span>
              <span className="flex items-center gap-1.5 text-[11px] text-brand font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Thinking...</span>
              </span>
            </div>

            <div className="bg-white border border-border rounded-2xl p-5 shadow-card w-full">
              {streamingContent ? (
                <MarkdownRenderer content={streamingContent} />
              ) : (
                <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>Searching podcast transcripts...</span>
                  </div>
                </div>
              )}

              {currentSources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    <span>Citations ({currentSources.length})</span>
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
