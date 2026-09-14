import React, { useState } from "react";
import { ChevronDown, ChevronUp, Quote, Radio } from "lucide-react";
import { SourceReference } from "@/types";

interface SourceCitationCardProps {
  source: SourceReference;
  index: number;
}

export function SourceCitationCard({ source, index }: SourceCitationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const similarityPct = Math.round(source.similarity_score * 100);

  return (
    <div className="bg-surface border border-border/80 rounded-xl p-3 text-xs transition-all hover:border-primary-500/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-md bg-primary-500/10 border border-primary-500/30 text-primary-400 flex items-center justify-center font-bold text-[10px]">
            [{index + 1}]
          </span>
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-200 truncate">
              {source.guest_name ? `${source.guest_name} — ` : ""}
              {source.episode_title}
            </h4>
            {source.episode_number && (
              <span className="text-[10px] text-slate-500">Episode #{source.episode_number}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              similarityPct >= 75
                ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                : "bg-surface-raised text-slate-400 border border-border"
            }`}
          >
            {similarityPct}% match
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-surface-raised transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Snippet */}
      <div className="mt-2 text-slate-400 text-[11px] leading-relaxed italic border-l-2 border-primary-500/40 pl-2.5 bg-surface-raised/40 py-1.5 rounded-r">
        <Quote className="w-3 h-3 inline mr-1 text-primary-400 opacity-60" />
        {isExpanded ? source.chunk_content : `${source.chunk_content.slice(0, 180)}...`}
      </div>
    </div>
  );
}
