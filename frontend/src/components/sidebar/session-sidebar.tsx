"use client";

import React, { useState, useMemo } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Plus,
  Search,
  Settings,
  LogOut,
  Home,
  Library,
  Bookmark,
  ListMusic,
  LayoutTemplate,
  MessageSquare,
} from "lucide-react";
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

const NAV_ITEMS = [
  { icon: Home, label: "Home", active: true },
  { icon: Library, label: "My Library", active: false },
  { icon: Bookmark, label: "Bookmarks", active: false },
  { icon: ListMusic, label: "Playlists", active: false },
  { icon: LayoutTemplate, label: "Growth Templates", active: false },
];

export function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isLoading,
  onTranscriptUploaded,
}: SessionSidebarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) => (s.title || "").toLowerCase().includes(q));
  }, [sessions, searchQuery]);

  return (
    <aside className="w-[280px] bg-sidebar flex flex-col h-full select-none flex-shrink-0">
      {/* ── Logo Area ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <h1 className="font-serif text-[17px] text-white tracking-tight leading-none">
            Lenny Growth
          </h1>
          <span className="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-[2px] rounded bg-brand/20 text-brand border border-brand/30">
            BETA
          </span>
        </div>
        <p className="text-[11px] text-sidebar-text mt-1 font-sans">
          Your podcast co-pilot
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-sidebar-text absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-9 pr-3 py-[7px] text-[12px] text-white/80 placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.15] transition-colors"
          />
        </div>
      </div>

      {/* ── New Chat Button ── */}
      <div className="px-4 pb-3">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-[9px] rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-white/80 hover:text-white text-[12px] font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2]" />
          <span>New Chat</span>
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="px-3 pb-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[12.5px] font-medium transition-colors ${
                item.active
                  ? "text-white bg-white/[0.08]"
                  : "text-white/45 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-[15px] h-[15px]" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-5 border-t border-white/[0.06]" />

      {/* ── Recent Chats ── */}
      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
          Recent Chats
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5 scrollbar-dark">
        {isLoading && sessions.length === 0 ? (
          <div className="p-6 text-center text-[11px] text-white/25 animate-pulse">
            Loading conversations...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-[11px] text-white/25">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-white/15" />
            {searchQuery
              ? "No matches found."
              : "No conversations yet. Start a new chat!"}
          </div>
        ) : (
          filteredSessions.map((session) => (
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

      {/* ── Workspace Switcher (Fixed Bottom) ── */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg bg-brand/20 text-brand flex items-center justify-center font-semibold text-[11px] flex-shrink-0">
              LG
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-medium text-white/85 truncate">
                Product &amp; Growth Lead
              </span>
              <span className="text-[10px] text-white/35 truncate">
                Lenny Workspace
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-colors flex-shrink-0"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
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
