export type MediaKind = "image" | "video" | "other";

// Placeholder cinza (1x1) usado no `placeholder="blur"` do next/image — as
// fontes são dinâmicas/base64, então não há blurDataURL por imagem.
export const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgaGgAAAEEAIHdd9wAAAAASUVORK5CYII=";

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
