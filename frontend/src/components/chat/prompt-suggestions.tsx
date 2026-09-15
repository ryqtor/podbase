import React from "react";
import { MessageCircle, FileText, Lightbulb, BookOpen, ArrowRight } from "lucide-react";

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const ACTION_CARDS = [
  {
    icon: MessageCircle,
    title: "Ask Anything",
    subtitle: "Get answers from Lenny's podcast",
    bg: "bg-lavender",
    iconColor: "text-purple-500",
    prompt: "What is Founder Mode according to Brian Chesky and why does he advise against traditional delegating?",
  },
  {
    icon: FileText,
    title: "Generate Content",
    subtitle: "Create essays, tweets, frameworks & more",
    bg: "bg-mint",
    iconColor: "text-emerald-500",
    prompt: "Write a Ship 30 for 30 style essay about why growth loops destroy traditional marketing funnels.",
  },
  {
    icon: Lightbulb,
    title: "Get Actionable Ideas",
    subtitle: "Turn insights into strategies",
    bg: "bg-pink",
    iconColor: "text-pink-500",
    prompt: "Generate a strategic launch plan and growth loop teardown for a B2B SaaS product.",
  },
  {
    icon: BookOpen,
    title: "Explore Episodes",
    subtitle: "Discover relevant conversations",
    bg: "bg-beige",
    iconColor: "text-amber-600",
    prompt: "What are the best Lenny's Podcast episodes on startup hiring and building teams?",
  },
];

const SUGGESTED_PROMPTS = [
  "Summarize Lenny's advice on product-market fit",
  "Create a go-to-market strategy template",
  "What are the best episodes on startup hiring?",
];

export function PromptSuggestions({ onSelectPrompt }: PromptSuggestionsProps) {
  return (
    <div className="w-full max-w-[680px] mx-auto my-auto px-6 py-10">
      {/* ── Hero Heading ── */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-[48px] md:text-[56px] lg:text-[64px] text-foreground tracking-tight leading-[1.05] mb-4">
          Your Growth{"\n"}Assistant
        </h1>
        <p className="text-[15px] text-muted-foreground max-w-md mx-auto leading-relaxed font-normal">
          Ask questions, get insights, create content, and turn podcast wisdom into action.
        </p>
      </div>

      {/* ── Action Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {ACTION_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(card.prompt)}
              className={`group text-left p-4 rounded-3xl ${card.bg} border border-transparent hover:border-border transition-all duration-200 hover:shadow-card-hover`}
            >
              <div className={`w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center mb-3 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-[13px] font-semibold text-foreground mb-0.5 leading-tight">
                {card.title}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-snug font-normal">
                {card.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Suggested Prompts ── */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-border text-[12px] text-muted-foreground hover:text-foreground hover:border-border-strong hover:shadow-card transition-all font-normal"
          >
            <span>{prompt}</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
