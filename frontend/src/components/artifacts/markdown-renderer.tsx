import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-editorial max-w-none text-slate-800 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="font-serif text-2xl font-bold text-slate-900 border-b border-border pb-2.5 mt-5 mb-3.5 tracking-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="font-serif text-xl font-bold text-slate-900 mt-5 mb-2.5 tracking-tight" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="font-serif text-base font-bold text-slate-800 mt-4 mb-1.5" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-slate-700 font-normal" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1.5 mb-3 text-slate-700" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-slate-700" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-[3px] border-brand pl-3.5 py-1.5 my-3 bg-orange-50/40 rounded-r-lg text-slate-700 italic font-normal" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-slate-100 border border-border text-brand font-mono text-xs font-semibold" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3.5 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-card">
                <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>code</span>
                </div>
                <pre className="p-4 font-mono text-xs overflow-x-auto text-slate-200 leading-relaxed scrollbar-thin">
                  <code {...props}>{children}</code>
                </pre>
              </div>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 border border-border rounded-xl shadow-subtle">
              <table className="w-full text-left text-xs text-slate-700" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-900 border-b border-border uppercase tracking-wider text-[11px]" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2.5 border-b border-border-subtle text-slate-700 font-normal" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="border-border my-5" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
