/* Safe, local source-formatting slices. Ordinary synchronous script for file://.
   No business rules, global text matching, DOM mutation, or source-data changes. */
(() => {
  "use strict";
  const escape = (text) => String(text ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
  const color = (value) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : "";
  const boundary = (text, offset) => !(offset > 0 && offset < text.length
    && /[\uD800-\uDBFF]/.test(text[offset - 1]) && /[\uDC00-\uDFFF]/.test(text[offset]));

  function valid(text, spans) {
    if (typeof text !== "string" || !Array.isArray(spans)) return false;
    let end = 0;
    return spans.every((span) => {
      if (!span || !Number.isInteger(span.start) || !Number.isInteger(span.end)
        || span.start < end || span.end <= span.start || span.end > text.length
        || !boundary(text, span.start) || !boundary(text, span.end)) return false;
      end = span.end;
      return true;
    });
  }

  function render(text, spans) {
    const source = String(text ?? "");
    if (!valid(source, spans)) return escape(source);
    let cursor = 0;
    let html = "";
    spans.forEach((span) => {
      html += escape(source.slice(cursor, span.start));
      const foreground = color(span.color);
      const highlight = color(span.highlight);
      const background = highlight || color(span.shading);
      const style = [];
      if (foreground) style.push(`color:${foreground}`);
      if (background) style.push(`background-color:${background}`);
      if (typeof span.bold === "boolean") style.push(`font-weight:${span.bold ? "700" : "400"}`);
      const decorations = [];
      if (span.underline === true) decorations.push("underline");
      if (span.strike === true) decorations.push("line-through");
      if (decorations.length || typeof span.underline === "boolean" || typeof span.strike === "boolean")
        style.push(`text-decoration:${decorations.join(" ") || "none"}`);
      const content = escape(source.slice(span.start, span.end));
      const tag = highlight ? "mark" : "span";
      html += style.length ? `<${tag} class="source-format${highlight ? " source-highlight" : ""}" style="${style.join(";")}">${content}</${tag}>` : content;
      cursor = span.end;
    });
    return html + escape(source.slice(cursor));
  }

  function slice(text, spans, start, end) {
    const source = String(text ?? "");
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || end > source.length
      || !boundary(source, start) || !boundary(source, end)) throw new RangeError("Invalid UTF-16 source slice");
    return {
      text: source.slice(start, end),
      spans: valid(source, spans) ? spans.filter((span) => span.end > start && span.start < end)
        .map((span) => ({ ...span, start: Math.max(start, span.start) - start, end: Math.min(end, span.end) - start })) : [],
    };
  }

  window.HandbookSourceFormatting = Object.freeze({ render, slice, valid });
})();
