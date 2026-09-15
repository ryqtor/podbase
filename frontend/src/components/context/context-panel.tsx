"use client";

import React from "react";
import {
  Play,
  Clock,
  FileText,
  BookOpen,
  Tag,
  ArrowRight,
  Sparkles,
  Twitter,
  Link,
  Quote,
} from "lucide-react";

const TAGS = [
  "Founder Mode",
  "Company Building",
  "Product Intuition",
  "Leadership",
  "AI in Travel",
];

const QUICK_ACTIONS = [
  { label: "Summarize this episode", icon: Sparkles },
  { label: "Extract key takeaways", icon: FileText },
  { label: "Find related episodes", icon: Link },
  { label: "Generate tweet thread", icon: Twitter },
];

interface ContextPanelProps {
  onAction?: (action: string) => void;
}

export function ContextPanel({ onAction }: ContextPanelProps) {
  const handleAction = (label: string) => {
    if (onAction) {
      onAction(label);
    }
  };

  return (
    <aside className="w-[360px] bg-white border-l border-border flex flex-col h-full flex-shrink-0 overflow-y-auto scrollbar-thin">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-3">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Podcast Context
        </span>
      </div>

      {/* ── Episode Card ── */}
      <div className="px-5 pb-4">
        <div className="bg-surface-subtle border border-border rounded-2xl p-4">
          {/* Episode Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
              <Play className="w-4 h-4 text-brand fill-brand" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-[15px] text-foreground leading-tight">
                #142 — Brian Chesky
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Airbnb Founder &amp; CEO
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>1h 12m</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-[12px] text-slate-600 leading-relaxed mb-4 font-normal">
            Brian Chesky on founder mode, product intuition, company culture, and the future of travel.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button className="px-3 py-[5px] rounded-full bg-white border border-border text-[11px] font-medium text-foreground hover:bg-slate-50 transition-colors">
              View Notes
            </button>
            <button className="px-3 py-[5px] rounded-full bg-white border border-border text-[11px] font-medium text-foreground hover:bg-slate-50 transition-colors">
              Full Transcript
            </button>
            <button className="px-3 py-[5px] rounded-full bg-white border border-border text-[11px] font-medium text-foreground hover:bg-slate-50 transition-colors">
              Key Topics
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-[3px] rounded-full bg-slate-100 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="px-5 pb-4">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
          Quick Actions
        </span>
        <div className="space-y-0.5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleAction(action.label)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[12.5px] text-foreground hover:bg-surface-subtle transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-normal">{action.label}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-muted-foreground transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 border-t border-border" />

      {/* ── Quote Card ── */}
      <div className="px-5 py-4">
        <div className="bg-beige rounded-2xl p-4">
          <Quote className="w-4 h-4 text-amber-400 mb-2" />
          <p className="text-[13px] text-foreground leading-relaxed font-serif italic mb-3">
            &ldquo;The best product insights come from talking to users, not from spreadsheets.&rdquo;
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            — Brian Chesky
          </p>
        </div>
      </div>
    </aside>
  );
}
