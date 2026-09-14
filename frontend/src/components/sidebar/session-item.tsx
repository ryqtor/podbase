import React from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { Session } from "@/types";
import { formatDate } from "@/lib/utils";

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function SessionItem({ session, isActive, onSelect, onDelete }: SessionItemProps) {
  return (
    <div
      onClick={() => onSelect(session.id)}
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
        isActive
          ? "bg-surface-raised border-primary-500/40 text-foreground shadow-sm shadow-primary-500/10"
          : "hover:bg-surface-raised/60 border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <MessageSquare
          className={`w-4 h-4 flex-shrink-0 transition-colors ${
            isActive ? "text-primary-400" : "text-slate-500 group-hover:text-slate-400"
          }`}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{session.title || "New Chat"}</span>
          <span className="text-[11px] text-slate-500 truncate">{formatDate(session.updated_at)}</span>
        </div>
      </div>

      <button
        onClick={(e) => onDelete(session.id, e)}
        title="Delete session"
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-1 flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
