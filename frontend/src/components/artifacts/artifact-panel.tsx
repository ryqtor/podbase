import React, { useState } from "react";
import { X, Copy, Check, Download, Code, Eye, FileText, Globe, Maximize2, Minimize2, BookOpen, Quote } from "lucide-react";
import { Artifact, SourceReference } from "@/types";
import { MarkdownRenderer } from "./markdown-renderer";
import { HtmlRenderer } from "./html-renderer";

interface ArtifactPanelProps {
  artifact: Artifact | null;
  onClose: () => void;
  sources?: SourceReference[];
}

export function ArtifactPanel({ artifact, onClose, sources = [] }: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "sources">("document");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [isExpanded, setIsExpanded] = useState(false);

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
    <aside
      className={`bg-surface-subtle border-l border-border flex flex-col h-full flex-shrink-0 animate-slide-in-right z-20 transition-all duration-300 ${
        isExpanded ? "w-[850px]" : "w-[540px] lg:w-[620px]"
      }`}
    >
      {/* Document Panel Header */}
      <div className="p-4 border-b border-border bg-white flex items-center justify-between gap-3 shadow-subtle flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/70 text-brand flex items-center justify-center flex-shrink-0">
            {artifact.artifact_type === "html" ? (
              <Globe className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-serif font-bold text-slate-900 text-sm truncate leading-tight">
              {artifact.title}
            </h3>
            <span className="text-[11px] font-sans font-medium text-slate-500 uppercase tracking-wider">
              {artifact.artifact_type === "html" ? "Interactive HTML Artifact" : "Markdown Strategy Document"}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleCopy}
            title="Copy document to clipboard"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            title="Download document file"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Restore panel size" : "Expand panel"}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            title="Close document viewer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Row: Document vs Grounding Sources */}
      <div className="px-5 pt-3 pb-2 bg-white border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 border-b-2 border-transparent">
          <button
            onClick={() => setActiveTab("document")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "document"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document Editor</span>
          </button>

          <button
            onClick={() => setActiveTab("sources")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "sources"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Grounding Sources ({sources.length})</span>
          </button>
        </div>

        {/* View Mode Switcher for Document */}
        {activeTab === "document" && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-border text-[11px]">
            <button
              onClick={() => setViewMode("preview")}
              className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                viewMode === "preview"
                  ? "bg-white text-slate-900 shadow-subtle"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Formatted</span>
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                viewMode === "code"
                  ? "bg-white text-slate-900 shadow-subtle"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Raw</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {activeTab === "document" ? (
          viewMode === "code" ? (
            <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-border p-5 font-mono text-xs text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-card">
              {artifact.content}
            </div>
          ) : (
            /* Document Editor Paper Container */
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-border p-8 sm:p-10 shadow-card min-h-[500px]">
              {/* Document Header Tag */}
              <div className="border-b border-border-subtle pb-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
                  <span className="w-2 h-2 rounded-full bg-brand"></span>
                  <span>Lenny Growth Intelligence Publication</span>
                </div>
                <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">
                  {artifact.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
                  <span>FORMAT: {artifact.artifact_type.toUpperCase()}</span>
                  <span>•</span>
                  <span>EST. READING: ~2 MIN</span>
                </div>
              </div>

              {/* Rendered Body */}
              {artifact.artifact_type === "html" ? (
                <HtmlRenderer content={artifact.content} />
              ) : (
                <MarkdownRenderer content={artifact.content} />
              )}
            </div>
          )
        ) : (
          /* Sources Tab Content */
          <div className="max-w-2xl mx-auto space-y-3">
            {sources.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border p-8 text-center shadow-card">
                <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <h4 className="font-serif font-bold text-slate-800 text-sm">No Dedicated Citations Stored</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Grounding citations are linked directly to chat responses in the conversation stream.
                </p>
              </div>
            ) : (
              sources.map((src, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-border p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif font-bold text-slate-900 text-sm">
                      {src.guest_name ? `${src.guest_name} — ` : ""}
                      {src.episode_title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-brand border border-orange-200">
                      {Math.round(src.similarity_score * 100)}% match
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed border-l-2 border-brand/60 pl-3 py-1 bg-orange-50/30 rounded-r font-normal">
                    <Quote className="w-3.5 h-3.5 inline mr-1 text-brand opacity-75" />
                    {src.chunk_content}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
