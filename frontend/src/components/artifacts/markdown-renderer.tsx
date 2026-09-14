import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold text-foreground border-b border-border pb-2 mt-4 mb-3" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-bold text-foreground mt-4 mb-2 text-primary-300" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-semibold text-slate-100 mt-3 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-2 leading-relaxed text-slate-300" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 mb-2 text-slate-300" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 mb-2 text-slate-300" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary-500/60 pl-3 py-1 my-2 bg-surface-raised/50 rounded-r text-slate-300 italic" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-surface-raised border border-border text-primary-300 font-mono text-xs" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3 rounded-xl bg-surface border border-border overflow-hidden">
                <pre className="p-4 font-mono text-xs overflow-x-auto text-slate-300">
                  <code {...props}>{children}</code>
                </pre>
              </div>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 border border-border rounded-xl">
              <table className="w-full text-left text-xs text-slate-300" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="bg-surface-raised px-3 py-2 font-semibold text-foreground border-b border-border" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 border-b border-border/50 text-slate-300" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="border-border my-4" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
