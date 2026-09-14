import React, { useState } from "react";
import { Plus, Sparkles, Upload, Radio, BookOpen, Layers } from "lucide-react";
import { Session } from "@/types";
import { SessionItem } from "./session-item";
import { TranscriptUploaderModal } from "./transcript-uploader-modal";

interface SessionSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isLoading: boolean;
  onTranscriptUploaded?: () => void;
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isLoading,
  onTranscriptUploaded,
}: SessionSidebarProps) {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  return (
    <aside className="w-72 bg-surface border-r border-border flex flex-col h-full select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
              Lenny Growth
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                AI
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Podcast Intelligence Engine</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setIsUploaderOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised hover:bg-surface-card border border-border text-slate-300 hover:text-foreground text-xs font-medium transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-primary-400" />
            <span>Ingest Transcript</span>
          </button>
        </div>
      </div>

      {/* Session History List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
        <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Conversations</span>
          <span className="text-[10px] bg-surface-raised px-1.5 py-0.5 rounded text-slate-400">
            {sessions.length}
          </span>
        </div>

        {isLoading && sessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 animate-pulse">
            Loading conversations...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
            No conversations yet. Start a new chat to begin!
          </div>
        ) : (
          sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onSelect={onSelectSession}
              onDelete={onDeleteSession}
            />
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-border bg-surface-raised/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>pgvector RAG Active</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
        </div>
      </div>

      <TranscriptUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onSuccess={onTranscriptUploaded}
      />
    </aside>
  );
}
