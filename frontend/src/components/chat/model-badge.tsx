import React from "react";
import { Cpu, Zap } from "lucide-react";

interface ModelBadgeProps {
  provider: string;
  model: string;
  retrievalLatency?: number | null;
  generationLatency?: number | null;
}

export function ModelBadge({
  provider,
  model,
  retrievalLatency,
  generationLatency,
}: ModelBadgeProps) {
  const isOllama = provider.toLowerCase() === "ollama";

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-card border border-border text-[11px] text-slate-300 font-mono">
      <div className="flex items-center gap-1">
        {isOllama ? (
          <Cpu className="w-3 h-3 text-accent-purple" />
        ) : (
          <Zap className="w-3 h-3 text-primary-400" />
        )}
        <span className="font-semibold text-foreground capitalize">{provider}</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-300">{model}</span>
      </div>

      {(retrievalLatency || generationLatency) && (
        <div className="flex items-center gap-1.5 border-l border-border/80 pl-2 text-slate-400 text-[10px]">
          {retrievalLatency !== undefined && retrievalLatency !== null && (
            <span>rag: {retrievalLatency}ms</span>
          )}
          {generationLatency !== undefined && generationLatency !== null && (
            <span>gen: {(generationLatency / 1000).toFixed(1)}s</span>
          )}
        </div>
      )}
    </div>
  );
}
