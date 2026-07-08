export type MediaKind = "image" | "video" | "other";

// Detecta o tipo de mídia a partir do data URL (que carrega o mime)
// ou da extensão do nome do arquivo.
export function mediaKind(url: string, fileName: string | null): MediaKind {
  if (url.startsWith("data:image/")) return "image";
  if (url.startsWith("data:video/")) return "video";
  const name = (fileName ?? url).toLowerCase();
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(name)) return "image";
  if (/\.(mp4|webm|mov|m4v|ogg)$/.test(name)) return "video";
  return "other";
}
