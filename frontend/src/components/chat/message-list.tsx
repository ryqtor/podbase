import React, { useEffect, useRef } from "react";
import { Message, SourceReference } from "@/types";
import { MessageBubble } from "./message-bubble";
import { PromptSuggestions } from "./prompt-suggestions";
import { Sparkles, Loader2 } from "lucide-react";
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
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onOpenArtifact={onOpenArtifact} />
      ))}

      {/* Streaming Bubble */}
      {isStreaming && (
        <div className="flex gap-3.5 max-w-4xl mx-auto w-full py-3 px-4 rounded-2xl bg-transparent animate-fade-in">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary-500 to-primary-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          </div>

          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Lenny Growth Intelligence</span>
              <span className="flex items-center gap-1 text-[11px] text-primary-400 font-mono">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking & Streaming...
              </span>
            </div>

            {streamingContent ? (
              <MarkdownRenderer content={streamingContent} />
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary-400 animate-ping" />
                <span>Searching podcast transcripts with pgvector...</span>
              </div>
            )}

            {currentSources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Grounding Context ({currentSources.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentSources.map((src, idx) => (
                    <SourceCitationCard key={idx} source={src} index={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
