import React from "react";
import { User, FileText, ArrowUpRight } from "lucide-react";
import { Message } from "@/types";
import { MarkdownRenderer } from "@/components/artifacts/markdown-renderer";
import { SourceCitationCard } from "./source-citation-card";

interface MessageBubbleProps {
  message: Message;
  onOpenArtifact?: (artifactId: string) => void;
}

export function MessageBubble({ message, onOpenArtifact }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3.5 max-w-[680px] mx-auto w-full py-3 px-4 sm:px-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-1 text-[11px] font-semibold">
          LG
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col min-w-0 ${isUser ? "items-end max-w-[85%]" : "flex-1"}`}>
        {/* Header for assistant */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[12px] font-medium text-foreground">Lenny Growth</span>
          </div>
        )}

        {/* Text Content */}
        {isUser ? (
          <div className="bg-foreground text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-[13px] leading-relaxed whitespace-pre-wrap font-normal">
            {message.content}
          </div>
        ) : (
          <div className="bg-white border border-border rounded-2xl p-5 shadow-card w-full">
            <MarkdownRenderer content={message.content} />

            {/* Generated Artifact Banner */}
            {message.artifact_id && onOpenArtifact && (
              <div className="mt-4 p-3.5 rounded-2xl bg-beige border border-amber-200/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[12px] font-semibold text-foreground truncate">
                      Artifact Generated
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      View in the workspace panel
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenArtifact(message.artifact_id!)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground hover:bg-slate-800 text-white text-[11px] font-medium transition-all flex-shrink-0 active:scale-95"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Source Citations */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  <span>Citations ({message.sources.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {message.sources.map((src, idx) => (
                    <SourceCitationCard key={idx} source={src} index={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-slate-100 text-muted-foreground flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
