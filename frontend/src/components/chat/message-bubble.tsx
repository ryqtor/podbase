import React from "react";
import { User, Sparkles, FileText, ArrowUpRight } from "lucide-react";
import { Message } from "@/types";
import { MarkdownRenderer } from "@/components/artifacts/markdown-renderer";
import { SourceCitationCard } from "./source-citation-card";
import { ModelBadge } from "./model-badge";

interface MessageBubbleProps {
  message: Message;
  onOpenArtifact?: (artifactId: string) => void;
}

export function MessageBubble({ message, onOpenArtifact }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3.5 max-w-3xl mx-auto w-full py-4 px-4 sm:px-6 transition-colors ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-brand/20">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      {/* Message Content Body */}
      <div className={`flex flex-col min-w-0 ${isUser ? "items-end max-w-[85%]" : "flex-1"}`}>
        {/* Header for assistant message */}
        {!isUser && (
          <div className="flex items-center justify-between gap-3 w-full mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 tracking-tight">Lenny Growth Intelligence</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-orange-50 text-brand border border-orange-200/60 uppercase tracking-wider">
                Synthesized
              </span>
            </div>
            {message.model_provider && message.model_name && (
              <ModelBadge
                provider={message.model_provider}
                model={message.model_name}
                retrievalLatency={message.retrieval_latency_ms}
                generationLatency={message.generation_latency_ms}
              />
            )}
          </div>
        )}

        {/* Text Content */}
        {isUser ? (
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-subtle text-sm leading-relaxed whitespace-pre-wrap font-normal">
            {message.content}
          </div>
        ) : (
          <div className="bg-white border border-border rounded-2xl p-5 shadow-card w-full">
            <MarkdownRenderer content={message.content} />

            {/* Generated Artifact Banner */}
            {message.artifact_id && onOpenArtifact && (
              <div className="mt-4 p-4 rounded-xl bg-orange-50/50 border border-brand/25 flex items-center justify-between gap-3 shadow-subtle">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-brand text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-brand/20">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-serif font-bold text-slate-900 truncate">
                      Interactive Artifact Generated
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      View full document and source citations in the workspace panel
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenArtifact(message.artifact_id!)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-all flex-shrink-0 shadow-sm shadow-brand/20 active:scale-95"
                >
                  <span>Open Artifact</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Source Citations Section */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Verified Podcast Citations ({message.sources.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
