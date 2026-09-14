import React from "react";
import { Cpu, Zap, Activity } from "lucide-react";

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
  const isDemo = provider.toLowerCase() === "demo";

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-border text-[11px] text-slate-700 shadow-subtle">
      <div className="flex items-center gap-1.5 font-medium">
        {isOllama ? (
          <Cpu className="w-3 h-3 text-secondary" />
        ) : isDemo ? (
          <Activity className="w-3 h-3 text-brand" />
        ) : (
          <Zap className="w-3 h-3 text-brand" />
        )}
        <span className="font-semibold text-slate-900 capitalize">{provider}</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 font-mono text-[10px]">{model}</span>
      </div>

      {(retrievalLatency || generationLatency) && (
        <div className="flex items-center gap-1.5 border-l border-border pl-2 text-slate-500 text-[10px] font-mono">
          {retrievalLatency !== undefined && retrievalLatency !== null && (
            <span>rag {retrievalLatency}ms</span>
          )}
          {generationLatency !== undefined && generationLatency !== null && (
            <span>gen {(generationLatency / 1000).toFixed(1)}s</span>
          )}
        </div>
      )}
    </div>
  );
}
