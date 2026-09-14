import React from "react";
import { MessageSquare, Trash2, Clock } from "lucide-react";
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
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 border ${
        isActive
          ? "bg-white border-brand/40 text-slate-900 shadow-sm shadow-brand/5"
          : "hover:bg-slate-100/70 border-transparent text-slate-600 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
            isActive
              ? "bg-brand text-white shadow-sm shadow-brand/20"
              : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-xs truncate font-medium ${isActive ? "font-semibold text-slate-900" : "text-slate-700"}`}>
            {session.title || "New Discussion"}
          </span>
          <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 inline opacity-70" />
            {formatDate(session.updated_at)}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => onDelete(session.id, e)}
        title="Delete conversation"
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all ml-1 flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
