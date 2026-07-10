// Helpers puros (sem JSX/estado) para links clicáveis — podem ser usados
// tanto em Server quanto em Client Components.

export function toHref(kind: "instagram" | "url" | "phone", value: string) {
  const v = value.trim();
  if (kind === "instagram") {
    const handle = v
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/\/$/, "");
    return `https://instagram.com/${handle}`;
  }
  if (kind === "phone") return `tel:${v.replace(/[^0-9+]/g, "")}`;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export function shortLabel(kind: "instagram" | "url" | "phone", value: string) {
  const v = value.trim();
  if (kind === "instagram")
    return `@${v
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/\/$/, "")}`;
  if (kind === "phone") return v;
  try {
    return new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`).host.replace(
      /^www\./,
      "",
    );
  } catch {
    return v;
  }
}
