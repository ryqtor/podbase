import React, { useMemo } from "react";
import { sanitizeHtml } from "@/lib/sanitizer";

interface HtmlRendererProps {
  content: string;
}

export function HtmlRenderer({ content }: HtmlRendererProps) {
  const sanitizedDoc = useMemo(() => {
    const clean = sanitizeHtml(content);

    // Wrap in standard dark-themed responsive container with sleek typography
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme: dark;
      --bg: #0f172a;
      --card: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --primary: #22c55e;
      --accent: #38bdf8;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      padding: 24px;
      line-height: 1.6;
      font-size: 14px;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #ffffff;
      margin-top: 1.2em;
      margin-bottom: 0.6em;
      font-weight: 700;
    }
    h1 { font-size: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    h2 { font-size: 1.25rem; color: #86efac; }
    h3 { font-size: 1.1rem; }
    p { margin-bottom: 1em; color: #cbd5e1; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { border: 1px solid var(--border); padding: 10px 14px; text-align: left; }
    th { background-color: var(--card); color: #f1f5f9; font-weight: 600; }
    tr:nth-child(even) { background-color: rgba(255, 255, 255, 0.02); }
    ul, ol { padding-left: 20px; margin-bottom: 1em; color: #cbd5e1; }
    li { margin-bottom: 4px; }
    code { font-family: monospace; background: var(--card); padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #86efac; }
    pre { background: var(--card); padding: 14px; border-radius: 8px; border: 1px solid var(--border); overflow-x: auto; margin: 12px 0; }
    .card, .container { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin: 12px 0; }
  </style>
</head>
<body>
  ${clean}
</body>
</html>`;
  }, [content]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-border bg-surface">
      <iframe
        title="Sandboxed Artifact Preview"
        srcDoc={sanitizedDoc}
        sandbox="allow-same-origin allow-scripts"
        className="w-full h-full min-h-[600px] border-0"
      />
    </div>
  );
}
