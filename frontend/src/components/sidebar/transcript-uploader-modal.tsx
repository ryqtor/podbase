import React, { useState } from "react";
import { Upload, X, CheckCircle2, AlertCircle, Loader2, FileText } from "lucide-react";
import { ApiClient } from "@/lib/api-client";

interface TranscriptUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TranscriptUploaderModal({ isOpen, onClose, onSuccess }: TranscriptUploaderModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !episodeTitle.trim()) {
      setStatusMessage({ type: "error", text: "Please provide a file and episode title." });
      return;
    }

    try {
      setIsUploading(true);
      setStatusMessage(null);
      const res = await ApiClient.uploadTranscript(
        file,
        episodeTitle,
        episodeNumber ? parseInt(episodeNumber) : undefined,
        guestName || undefined
      );

      setStatusMessage({
        type: "success",
        text: `Successfully ingested "${episodeTitle}" into ${(res as any).chunks_created || res.chunk_count} vector chunks!`,
      });
      setFile(null);
      setEpisodeTitle("");
      setEpisodeNumber("");
      setGuestName("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to ingest transcript." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white border border-border rounded-2xl p-6 shadow-float animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-slate-900">Ingest Podcast Transcript</h2>
              <p className="text-[11px] text-slate-500 font-sans">Embed into pgvector for conversational RAG</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Transcript File (.txt or .md)</label>
            <div className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-brand/60 bg-slate-50/50 transition-colors">
              <input
                type="file"
                accept=".txt,.md"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    if (!episodeTitle) {
                      setEpisodeTitle(e.target.files[0].name.replace(/\.(txt|md)$/, ""));
                    }
                  }
                }}
                className="hidden"
                id="transcript-file-input"
              />
              <label htmlFor="transcript-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-brand/70" />
                <span className="text-xs font-medium text-slate-700">
                  {file ? file.name : "Click to browse or drop transcript file"}
                </span>
                <span className="text-[11px] text-slate-400">Recursive character chunker + vector embedding</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Episode Title *</label>
            <input
              type="text"
              value={episodeTitle}
              onChange={(e) => setEpisodeTitle(e.target.value)}
              placeholder="e.g., Brian Chesky on Founder Mode"
              className="w-full bg-white border border-border rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all shadow-subtle"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g., Brian Chesky"
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all shadow-subtle"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Episode Number</label>
              <input
                type="number"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                placeholder="e.g., 142"
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all shadow-subtle"
              />
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-brand hover:bg-brand-hover text-white rounded-xl transition-all shadow-sm shadow-brand/20 disabled:opacity-50 disabled:shadow-none"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ingest & Embed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
