import React from "react";
import { User, Sparkles, FileText, Globe, ExternalLink } from "lucide-react";
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
      className={`flex gap-3.5 max-w-4xl mx-auto w-full py-3 px-4 rounded-2xl transition-colors ${
        isUser ? "bg-surface-raised/40" : "bg-transparent"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
          isUser
            ? "bg-slate-700 text-slate-200 border border-slate-600"
            : "bg-gradient-to-tr from-primary-500 to-primary-700 text-white shadow-primary-500/20"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
      </div>

      {/* Message Content Body */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Header (for assistant) */}
        {!isUser && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground">Lenny Growth Intelligence</span>
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
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {/* Generated Artifact Banner */}
        {message.artifact_id && onOpenArtifact && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-primary-950/40 via-surface-card to-surface-card border border-primary-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-primary-500/20 text-primary-400">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-foreground truncate">Interactive Artifact Generated</h4>
                <p className="text-[11px] text-slate-400">Click to view in the split-screen workspace</p>
              </div>
            </div>

            <button
              onClick={() => onOpenArtifact(message.artifact_id!)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium transition-all flex-shrink-0 shadow-sm"
            >
              <span>View Artifact</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Source Citations Section */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Verified Sources ({message.sources.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {message.sources.map((src, idx) => (
                <SourceCitationCard key={idx} source={src} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
