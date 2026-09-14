import React, { useState } from "react";
import { X, Copy, Check, Download, Code, Eye, FileText, Globe } from "lucide-react";
import { Artifact } from "@/types";
import { MarkdownRenderer } from "./markdown-renderer";
import { HtmlRenderer } from "./html-renderer";

interface ArtifactPanelProps {
  artifact: Artifact | null;
  onClose: () => void;
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");

  if (!artifact) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const ext = artifact.artifact_type === "html" ? "html" : "md";
    const blob = new Blob([artifact.content], {
      type: artifact.artifact_type === "html" ? "text/html" : "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="w-[500px] lg:w-[580px] bg-surface-raised/80 backdrop-blur-md border-l border-border flex flex-col h-full flex-shrink-0 animate-slide-in-right z-20">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-surface/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
            {artifact.artifact_type === "html" ? (
              <Globe className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{artifact.title}</h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {artifact.artifact_type} artifact
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 mr-1">
            <button
              onClick={() => setViewMode("preview")}
              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === "preview"
                  ? "bg-surface-raised text-foreground shadow-sm"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === "code"
                  ? "bg-surface-raised text-foreground shadow-sm"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Source</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-surface-raised transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-primary-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            title="Download file"
            className="p-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-surface-raised transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            title="Close artifact panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-surface-raised transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
        {viewMode === "code" ? (
          <div className="rounded-xl bg-surface border border-border p-4 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
            {artifact.content}
          </div>
        ) : artifact.artifact_type === "html" ? (
          <HtmlRenderer content={artifact.content} />
        ) : (
          <MarkdownRenderer content={artifact.content} />
        )}
      </div>
    </aside>
  );
}
