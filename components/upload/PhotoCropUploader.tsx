"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { uploadFile } from "@/lib/upload-client";

const VIEWPORT = 320; // tamanho do quadrado de recorte (px na tela)
const OUTPUT = 480; // tamanho final da imagem enviada (px)

// Botão de foto com editor de recorte: o usuário sobe uma imagem, ajusta
// zoom (slider) e reposiciona (arrastando), e o recorte quadrado é enviado.
export function PhotoCropUploader({
  name,
  photoUrl,
  onUploaded,
  size = 80,
  label = "Enviar foto",
}: {
  name: string;
  photoUrl: string | null;
  onUploaded: (url: string) => void;
  size?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // Escala base que faz a imagem "cobrir" o quadrado.
  const baseScale = natural.w
    ? VIEWPORT / Math.min(natural.w, natural.h)
    : 1;
  const dispScale = baseScale * zoom;
  const dispW = natural.w * dispScale;
  const dispH = natural.h * dispScale;

  function clamp(x: number, y: number) {
    const minX = VIEWPORT - dispW;
    const minY = VIEWPORT - dispH;
    return {
      x: Math.min(0, Math.max(minX, x)),
      y: Math.min(0, Math.max(minY, y)),
    };
  }

  function onPick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(String(reader.result));
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  }

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const el = e.currentTarget;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    const bScale = VIEWPORT / Math.min(w, h);
    setNatural({ w, h });
    // Centraliza
    setOffset({
      x: (VIEWPORT - w * bScale) / 2,
      y: (VIEWPORT - h * bScale) / 2,
    });
  }

  function onZoomChange(next: number) {
    setZoom(next);
    // Reclampa em torno do centro depois do resize
    setOffset((prev) => {
      const centerX = VIEWPORT / 2 - (VIEWPORT / 2 - prev.x) * (next / zoom);
      const centerY = VIEWPORT / 2 - (VIEWPORT / 2 - prev.y) * (next / zoom);
      const nextDispW = natural.w * baseScale * next;
      const nextDispH = natural.h * baseScale * next;
      const minX = VIEWPORT - nextDispW;
      const minY = VIEWPORT - nextDispH;
      return {
        x: Math.min(0, Math.max(minX, centerX)),
        y: Math.min(0, Math.max(minY, centerY)),
      };
    });
  }

  async function save() {
    if (!imgRef.current || !natural.w) return;
    setSaving(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponível.");

      // Região visível (VIEWPORT×VIEWPORT) mapeada para pixels da imagem original.
      const sx = -offset.x / dispScale;
      const sy = -offset.y / dispScale;
      const sSize = VIEWPORT / dispScale;
      ctx.drawImage(imgRef.current, sx, sy, sSize, sSize, 0, 0, OUTPUT, OUTPUT);

      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar imagem."))),
          "image/jpeg",
          0.9,
        ),
      );
      const file = new File([blob], `foto-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const { url } = await uploadFile(file);
      onUploaded(url);
      setSrc(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a foto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar name={name} photoUrl={photoUrl} size={size} />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onPick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && !src && <p className="text-xs text-danger">{error}</p>}

      <Modal
        open={Boolean(src)}
        onClose={() => setSrc(null)}
        title="Ajustar foto"
        description="Arraste para reposicionar e use o zoom."
      >
        {src && (
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative overflow-hidden rounded-full border border-border bg-background"
              style={{ width: VIEWPORT, height: VIEWPORT, touchAction: "none" }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = {
                  x: e.clientX,
                  y: e.clientY,
                  ox: offset.x,
                  oy: offset.y,
                };
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                const nx = drag.current.ox + (e.clientX - drag.current.x);
                const ny = drag.current.oy + (e.clientY - drag.current.y);
                setOffset(clamp(nx, ny));
              }}
              onPointerUp={() => (drag.current = null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={src}
                alt="Recorte"
                onLoad={onImgLoad}
                draggable={false}
                className="max-w-none select-none"
                style={{
                  width: dispW,
                  height: dispH,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                  transformOrigin: "top left",
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_2px_rgba(255,122,61,0.5)]" />
            </div>

            <div className="flex w-full items-center gap-3">
              <span className="text-xs text-muted">Zoom</span>
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <div className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSrc(null)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={save} disabled={saving}>
                {saving ? "Enviando..." : "Salvar foto"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
