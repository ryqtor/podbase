import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, Cpu, Zap, PenTool, FileText, ChevronDown, Compass } from "lucide-react";
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
    <div className="max-w-3xl mx-auto w-full px-4 pb-5 pt-1">
      {/* Mode Selector Pills */}
      <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Modes:</span>
        <button
          type="button"
          onClick={() => handleTagClick("Write a Ship 30 for 30 style essay about")}
          className="px-3 py-1 rounded-full bg-white hover:bg-orange-50 border border-border hover:border-brand/40 text-slate-600 hover:text-brand transition-all flex items-center gap-1.5 flex-shrink-0 shadow-subtle text-xs font-medium"
        >
          <PenTool className="w-3.5 h-3.5 text-brand" />
          <span>Ship 30 Essay</span>
        </button>
        <button
          type="button"
          onClick={() => handleTagClick("Generate a strategic artifact for")}
          className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 border border-border hover:border-secondary/40 text-slate-600 hover:text-secondary transition-all flex items-center gap-1.5 flex-shrink-0 shadow-subtle text-xs font-medium"
        >
          <FileText className="w-3.5 h-3.5 text-secondary" />
          <span>Strategy Artifact</span>
        </button>
      </div>

      {/* Floating Main Input Card */}
      <div className="relative bg-white border border-border rounded-2xl p-3 shadow-float focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question, request an essay, or generate a growth strategy artifact..."
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm resize-none focus:outline-none px-2 py-1 max-h-44 min-h-[44px] leading-relaxed scrollbar-thin font-normal"
        />

        {/* Bottom Toolbar inside input */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle px-1 mt-1">
          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <div className="relative inline-flex items-center">
              <select
                value={`${selectedProvider}::${selectedModel}`}
                onChange={(e) => {
                  const [p, m] = e.target.value.split("::");
                  onSelectModel(p, m);
                }}
                className="appearance-none bg-slate-50 border border-border hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-medium rounded-lg pl-7 pr-8 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand/20 transition-colors shadow-subtle"
              >
                <option value="openai::gpt-4o-mini">OpenAI gpt-4o-mini (Primary)</option>
                <option value="demo::lenny-growth-engine">Lenny Growth Engine (Built-in)</option>
                <option value="openai::gpt-4o">OpenAI gpt-4o (High Reasoning)</option>
                <option value="ollama::llama3.1:8b">Ollama llama3.1:8b (Local)</option>
                {availableModels
                  .filter((m) => !["gpt-4o-mini", "gpt-4o", "llama3.1:8b", "lenny-growth-engine"].includes(m.model))
                  .map((m, idx) => (
                    <option key={idx} value={`${m.provider}::${m.model}`}>
                      {m.provider} — {m.model}
                    </option>
                  ))}
              </select>
              <div className="absolute left-2.5 pointer-events-none text-brand">
                {selectedProvider === "ollama" ? (
                  <Cpu className="w-3.5 h-3.5 text-secondary" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-brand" />
                )}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="w-9 h-9 rounded-xl bg-brand hover:bg-brand-hover disabled:bg-slate-100 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-md shadow-brand/20 active:scale-95 disabled:active:scale-100 disabled:shadow-none"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="text-center mt-2.5">
        <span className="text-[11px] text-slate-400 font-normal">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-border text-slate-500 font-mono text-[10px] shadow-subtle">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-white border border-border text-slate-500 font-mono text-[10px] shadow-subtle">Shift + Enter</kbd> for new line
        </span>
      </div>
    </div>
  );
}
