import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Search, FileText, Target } from "lucide-react";
import { ModelInfo } from "@/types";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  selectedProvider: string;
  selectedModel: string;
  onSelectModel: (provider: string, model: string) => void;
  availableModels: ModelInfo[];
}

export function ChatInput({
  onSend,
  disabled,
  selectedProvider,
  selectedModel,
  onSelectModel,
  availableModels,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleTagClick = (prefix: string) => {
    setInput((prev) => `${prefix} ${prev}`.trim());
    textareaRef.current?.focus();
  };

  return (
    <div className="max-w-[680px] mx-auto w-full px-4 pb-5 pt-1">
      {/* ── Composer Card ── */}
      <div className="relative bg-white border border-border rounded-3xl p-4 shadow-card focus-within:shadow-float transition-shadow min-h-[130px] flex flex-col">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question, request an essay, or generate a growth strategy..."
          rows={2}
          disabled={disabled}
          className="w-full bg-transparent text-foreground placeholder-slate-400 text-[14px] resize-none focus:outline-none px-1 py-1 max-h-44 min-h-[60px] leading-relaxed scrollbar-thin font-normal flex-1"
        />

        {/* ── Bottom Toolbar ── */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          {/* Pill Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleTagClick("Deep search:")}
              className="flex items-center gap-1.5 px-3 py-[5px] rounded-full bg-slate-50 hover:bg-slate-100 border border-border text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <Search className="w-3 h-3" />
              <span>Deep Search</span>
            </button>

            <button
              type="button"
              onClick={() => handleTagClick("Generate a strategic artifact for")}
              className="flex items-center gap-1.5 px-3 py-[5px] rounded-full bg-slate-50 hover:bg-slate-100 border border-border text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>Create Artifact</span>
            </button>

            <button
              type="button"
              onClick={() => handleTagClick("Focus on key insights about")}
              className="flex items-center gap-1.5 px-3 py-[5px] rounded-full bg-slate-50 hover:bg-slate-100 border border-border text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <Target className="w-3 h-3" />
              <span>Focus</span>
            </button>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="w-9 h-9 rounded-full bg-navy hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white flex items-center justify-center transition-all active:scale-95 disabled:active:scale-100"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
