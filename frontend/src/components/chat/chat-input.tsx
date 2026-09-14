import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, Cpu, Zap, PenTool, FileText } from "lucide-react";
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
    <div className="max-w-4xl mx-auto w-full px-4 pb-4 pt-1">
      {/* Quick Tag Pills */}
      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 text-[11px] text-slate-400">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mr-1">Modes:</span>
        <button
          type="button"
          onClick={() => handleTagClick("Write a Ship 30 for 30 style essay about")}
          className="px-2.5 py-1 rounded-full bg-surface-raised hover:bg-surface-card border border-border hover:border-primary-500/40 text-slate-300 hover:text-foreground transition-all flex items-center gap-1 flex-shrink-0"
        >
          <PenTool className="w-3 h-3 text-primary-400" />
          <span>Ship 30 Essay</span>
        </button>
        <button
          type="button"
          onClick={() => handleTagClick("Generate a strategic artifact for")}
          className="px-2.5 py-1 rounded-full bg-surface-raised hover:bg-surface-card border border-border hover:border-primary-500/40 text-slate-300 hover:text-foreground transition-all flex items-center gap-1 flex-shrink-0"
        >
          <FileText className="w-3 h-3 text-accent-blue" />
          <span>Strategy Artifact</span>
        </button>
      </div>

      {/* Main Input Box */}
      <div className="relative bg-surface-raised border border-border rounded-2xl p-2.5 shadow-lg focus-within:border-primary-500/60 focus-within:ring-1 focus-within:ring-primary-500/20 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question, request an essay, or generate a growth strategy artifact..."
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent text-foreground placeholder-slate-500 text-sm resize-none focus:outline-none px-2 py-1 max-h-44 min-h-[44px] leading-relaxed scrollbar-thin"
        />

        {/* Bottom Toolbar inside input */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 px-1 mt-1">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5">
            <div className="relative inline-flex items-center">
              <select
                value={`${selectedProvider}::${selectedModel}`}
                onChange={(e) => {
                  const [p, m] = e.target.value.split("::");
                  onSelectModel(p, m);
                }}
                className="appearance-none bg-surface border border-border hover:border-primary-500/40 text-slate-300 hover:text-foreground text-[11px] font-medium rounded-lg pl-6 pr-7 py-1 cursor-pointer focus:outline-none transition-colors"
              >
                <option value="openai::gpt-4o-mini">OpenAI gpt-4o-mini (Default)</option>
                <option value="openai::gpt-4o">OpenAI gpt-4o (High Reasoning)</option>
                <option value="ollama::llama3.1:8b">Ollama llama3.1:8b (Local)</option>
                {availableModels
                  .filter((m) => m.model !== "gpt-4o-mini" && m.model !== "gpt-4o" && m.model !== "llama3.1:8b")
                  .map((m, idx) => (
                    <option key={idx} value={`${m.provider}::${m.model}`}>
                      {m.provider} — {m.model}
                    </option>
                  ))}
              </select>
              <div className="absolute left-2 pointer-events-none text-primary-400">
                {selectedProvider === "ollama" ? (
                  <Cpu className="w-3 h-3 text-accent-purple" />
                ) : (
                  <Zap className="w-3 h-3 text-primary-400" />
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="w-8 h-8 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 disabled:text-slate-600 text-white flex items-center justify-center transition-all shadow-md shadow-primary-600/20 active:scale-95 disabled:active:scale-100 disabled:shadow-none"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center mt-2">
        <span className="text-[10px] text-slate-500">
          Press <kbd className="px-1 py-0.5 rounded bg-surface border border-border text-slate-400">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-surface border border-border text-slate-400">Shift + Enter</kbd> for new line
        </span>
      </div>
    </div>
  );
}
