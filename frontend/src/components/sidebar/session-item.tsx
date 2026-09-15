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
      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
        isActive
          ? "bg-white/[0.1] text-white"
          : "text-white/50 hover:text-white/75 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <MessageSquare
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            isActive ? "text-brand" : "text-white/25"
          }`}
        />
        <span
          className={`text-[12px] truncate ${
            isActive ? "font-medium text-white" : "font-normal"
          }`}
        >
          {session.title || "New Discussion"}
        </span>
      </div>

      <button
        onClick={(e) => onDelete(session.id, e)}
        title="Delete conversation"
        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-white/25 hover:text-rose-400 hover:bg-white/[0.06] transition-all ml-1 flex-shrink-0"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
