import React from "react";
import { MessageSquare, PenTool, FileSpreadsheet, Sparkles, ArrowRight, Zap, BookOpen } from "lucide-react";

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const CARDS = [
  {
    icon: MessageSquare,
    badge: "Q&A Intelligence",
    badgeColor: "bg-orange-50 text-brand border-orange-200/60",
    title: "What is Founder Mode according to Brian Chesky?",
    description: "Explore why Chesky advises against conventional executive delegation and how Airbnb runs unified biannual releases.",
    prompt: "What is Founder Mode according to Brian Chesky and why does he advise against traditional delegating?",
    actionText: "Ask question",
  },
  {
    icon: PenTool,
    badge: "Ship 30 for 30 Essay",
    badgeColor: "bg-blue-50 text-secondary border-blue-200/60",
    title: "Why growth loops destroy traditional marketing funnels",
    description: "Produce a high-voltage, atomic essay breaking down Elena Verna's B2B product-led growth loops and compounding cycles.",
    prompt: "Write a Ship 30 for 30 style essay about why growth loops destroy traditional marketing funnels.",
    actionText: "Generate essay",
  },
  {
    icon: FileSpreadsheet,
    badge: "Strategy Artifact",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    title: "Strategic launch plan & growth loop teardown",
    description: "Generate an interactive strategy memo, loop architecture diagram, and decision framework for high-agency execution.",
    prompt: "Generate a strategic launch plan and growth loop teardown for a B2B SaaS product.",
    actionText: "Create artifact",
  },
];

export function PromptSuggestions({ onSelectPrompt }: PromptSuggestionsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto my-auto px-6 py-10">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wider mb-4 shadow-subtle">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          <span>Podcast Intelligence Engine</span>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-[42px] font-serif font-bold text-slate-900 tracking-tight leading-[1.15] mb-3">
          Turn conversations into <span className="text-brand italic font-normal">compounding growth.</span>
        </h1>

        <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto leading-relaxed font-normal">
          Ask questions, explore insights, and generate content from Lenny&apos;s podcast transcripts.
        </p>
      </div>

      {/* Suggested Prompt Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(card.prompt)}
              className="group text-left p-5 rounded-2xl bg-white border border-border hover:border-brand/40 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between relative overflow-hidden shadow-card hover:-translate-y-0.5 active:translate-y-0"
            >
              {/* Top Row: Badge & Icon */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-slate-50 border border-border group-hover:border-brand/30 group-hover:bg-brand-light text-slate-500 group-hover:text-brand flex items-center justify-center transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-slate-900 text-sm mb-2 group-hover:text-brand transition-colors leading-snug">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4 font-normal">
                  {card.description}
                </p>
              </div>

              {/* Action Link Footer */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 group-hover:text-brand transition-colors pt-2 border-t border-border-subtle">
                <span>{card.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Trust Quote / Badge */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-surface-subtle px-3 py-1.5 rounded-full border border-border-subtle">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Grounded in transcripts from Brian Chesky, Elena Verna, and Shreyas Doshi</span>
        </div>
      </div>
    </div>
  );
}
