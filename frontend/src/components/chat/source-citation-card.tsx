import React, { useState } from "react";
import { ChevronDown, ChevronUp, Quote, Sparkles, Headphones } from "lucide-react";
import { SourceReference } from "@/types";

interface SourceCitationCardProps {
  source: SourceReference;
  index: number;
}

export function SourceCitationCard({ source, index }: SourceCitationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const similarityPct = Math.round(source.similarity_score * 100);

  return (
    <div className="bg-white border border-border rounded-xl p-3 text-xs transition-all hover:border-brand/40 shadow-subtle hover:shadow-card">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-orange-50 border border-orange-200/70 text-brand flex items-center justify-center font-bold text-[11px]">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h4 className="font-serif font-bold text-slate-900 truncate leading-tight">
              {source.guest_name ? `${source.guest_name}` : source.episode_title}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <Headphones className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[200px]">
                {source.episode_number ? `Ep. #${source.episode_number} — ` : ""}
                {source.episode_title}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
              similarityPct >= 80
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-600 border-border"
            }`}
          >
            {similarityPct}% match
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse excerpt" : "Expand excerpt"}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quote Snippet */}
      <div className="mt-2.5 text-slate-600 text-[11px] leading-relaxed border-l-2 border-brand/60 pl-2.5 bg-orange-50/40 py-2 rounded-r-lg font-normal">
        <Quote className="w-3 h-3 inline mr-1 text-brand opacity-70" />
        {isExpanded ? source.chunk_content : `${source.chunk_content.slice(0, 160)}...`}
      </div>
    </div>
  );
}
