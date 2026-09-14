import React, { useState, useMemo } from "react";
import { Plus, Sparkles, Upload, Radio, BookOpen, Search, Settings, User, Headphones, ChevronRight } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) => (s.title || "").toLowerCase().includes(q));
  }, [sessions, searchQuery]);

  // Group sessions into Today, Yesterday, and Older
  const groupedSessions = useMemo(() => {
    const today: Session[] = [];
    const yesterday: Session[] = [];
    const older: Session[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    filteredSessions.forEach((s) => {
      const time = new Date(s.updated_at || s.created_at).getTime();
      if (time >= todayStart) {
        today.push(s);
      } else if (time >= yesterdayStart) {
        yesterday.push(s);
      } else {
        older.push(s);
      }
    });

    return { today, yesterday, older };
  }, [filteredSessions]);

  return (
    <aside className="w-72 bg-surface-subtle border-r border-border flex flex-col h-full select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-border bg-white/60">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white shadow-sm shadow-brand/20 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
              Lenny Growth
              <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-orange-50 text-brand border border-orange-200">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">Podcast Intelligence</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-sm shadow-brand/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setIsUploaderOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-border text-slate-700 hover:text-slate-900 text-xs font-medium transition-all shadow-subtle"
          >
            <Upload className="w-3.5 h-3.5 text-brand" />
            <span>Ingest Transcript</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-white border border-border rounded-xl pl-8 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand transition-colors shadow-subtle"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded border border-border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Conversation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-thin">
        {isLoading && sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
            Loading conversations...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            <BookOpen className="w-7 h-7 mx-auto mb-2 text-slate-300" />
            {searchQuery ? "No matches found." : "No conversations yet. Start a new chat!"}
          </div>
        ) : (
          <>
            {/* Today Group */}
            {groupedSessions.today.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Today
                </div>
                <div className="space-y-0.5 mt-1">
                  {groupedSessions.today.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={onSelectSession}
                      onDelete={onDeleteSession}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday Group */}
            {groupedSessions.yesterday.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Yesterday
                </div>
                <div className="space-y-0.5 mt-1">
                  {groupedSessions.yesterday.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={onSelectSession}
                      onDelete={onDeleteSession}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Older Group */}
            {groupedSessions.older.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Previous Discussions
                </div>
                <div className="space-y-0.5 mt-1">
                  {groupedSessions.older.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={onSelectSession}
                      onDelete={onDeleteSession}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Profile & System Status Footer */}
      <div className="p-3 border-t border-border bg-white/80 space-y-2">
        {/* RAG telemetry status */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">pgvector RAG Active</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">v1.0.0</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between p-1.5 rounded-xl bg-surface-subtle hover:bg-slate-100 transition-colors cursor-pointer border border-border-subtle">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-[11px]">
              LG
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 truncate">Product & Growth Lead</span>
              <span className="text-[10px] text-slate-400 truncate">Lenny Workspace</span>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 transition-colors" />
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
