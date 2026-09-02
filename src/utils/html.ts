const HTML_ESCAPES: Record<string, string> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&#39;",
  "<": "&lt;",
  ">": "&gt;",
};

type EnrichHtmlOptions = NonNullable<Parameters<(typeof foundry.applications.ux.TextEditor)["enrichHTML"]>[1]>;

/** Escape user-controlled strings interpolated into HTML. Skip i18n labels and numbers. */
export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "").replaceAll(/[&<>"']/gu, (char) => HTML_ESCAPES[char] ?? char);
}

/** HTMLField values are server-sanitized. Enrich them for chat; do not escapeHtml or tags render as text. */
export async function enrichHtml(content: string | null | undefined, options?: EnrichHtmlOptions): Promise<string> {
  const html = content?.trim() ?? "";
  if (!html) {
    return "";
  }
  return await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, options);
}
