import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content for secure sandboxed iframe rendering.
 *
 * Allowed tags: structural + styling tags (h1-h6, p, div, span, table, etc., style)
 * Blocked: script, iframe, object, embed, form, input, button, meta, link, base
 */
export function sanitizeHtml(rawHtml: string): string {
  if (typeof window === "undefined") {
    // Server-side fallback (basic strip of dangerous tags)
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  }

  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "div", "span", "a", "ul", "ol", "li",
      "table", "thead", "tbody", "tr", "th", "td",
      "strong", "b", "em", "i", "code", "pre", "blockquote",
      "img", "br", "hr", "section", "article", "header",
      "footer", "nav", "style", "main", "aside", "mark",
    ],
    ALLOWED_ATTR: [
      "class", "id", "style", "href", "src", "alt", "title",
      "width", "height", "target", "rel", "colspan", "rowspan",
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  });
}
