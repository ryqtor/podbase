import React from "react";
import { Sparkles, PenTool, FileSpreadsheet, HelpCircle } from "lucide-react";

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: Sparkles,
    category: "Q&A Intelligence",
    prompt: "What is Founder Mode according to Brian Chesky and why does he advise against traditional delegating?",
  },
  {
    icon: PenTool,
    category: "Ship 30 for 30 Essay",
    prompt: "Write a Ship 30 for 30 style essay about why growth loops destroy traditional marketing funnels.",
  },
  {
    icon: FileSpreadsheet,
    category: "Growth Artifact",
    prompt: "Generate a strategic launch plan and growth loop teardown for a B2B SaaS product.",
  },
  {
    icon: HelpCircle,
    category: "Product Leadership",
    prompt: "How does Shreyas Doshi explain the LNO Framework and why does the Impact vs Effort matrix fail?",
  },
];

export function PromptSuggestions({ onSelectPrompt }: PromptSuggestionsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto my-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-surface-raised border border-border shadow-inner mb-3">
          <Sparkles className="w-6 h-6 text-primary-400 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Lenny Growth Intelligence</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Ask grounded questions, produce Ship 30 for 30 essays, and generate interactive strategy artifacts backed by Lenny's Podcast transcripts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group text-left p-3.5 rounded-xl bg-surface-raised hover:bg-surface-card border border-border hover:border-primary-500/40 transition-all shadow-sm hover:shadow-primary-500/5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 text-primary-400 mb-1.5">
                <Icon className="w-4 h-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">{item.category}</span>
              </div>
              <p className="text-xs text-slate-300 group-hover:text-foreground line-clamp-2 leading-snug">
                {item.prompt}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
