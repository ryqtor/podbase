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
        text: `Successfully ingested "${episodeTitle}" into ${res.chunk_count} vector chunks!`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-foreground">Ingest Podcast Transcript</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-foreground hover:bg-surface-raised transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Transcript File (.txt)</label>
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary-500/50 transition-colors">
              <input
                type="file"
                accept=".txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    if (!episodeTitle) {
                      setEpisodeTitle(e.target.files[0].name.replace(".txt", ""));
                    }
                  }
                }}
                className="hidden"
                id="transcript-file-input"
              />
              <label htmlFor="transcript-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-slate-400" />
                <span className="text-xs text-slate-300">
                  {file ? file.name : "Click to select a .txt transcript file"}
                </span>
                <span className="text-[11px] text-slate-500">Auto-chunked & embedded into pgvector</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Episode Title *</label>
            <input
              type="text"
              value={episodeTitle}
              onChange={(e) => setEpisodeTitle(e.target.value)}
              placeholder="e.g., Brian Chesky on Founder Mode"
              className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Guest Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g., Brian Chesky"
                className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Episode Number</label>
              <input
                type="number"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                placeholder="e.g., 142"
                className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2 text-xs ${
                statusMessage.type === "success"
                  ? "bg-primary-500/10 border border-primary-500/30 text-primary-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-foreground rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all shadow-md shadow-primary-600/20 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ingest Transcript</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
