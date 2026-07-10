"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// Modal genérico para rotas interceptadas (abre sobre a lista via soft-nav).
// Fecha no Escape / clique fora / X / botão Fechar — sempre via router.back(),
// preservando a página por baixo. Refresh/deep link cai na página inteira.
export function RouteModal({
  title,
  children,
  footerNote,
  maxWidthClass = "max-w-5xl",
}: {
  title: string;
  children: ReactNode;
  footerNote?: string;
  maxWidthClass?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") router.back();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => router.back()}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative z-10 my-auto w-full rounded border border-border-strong bg-background shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)]",
          maxWidthClass,
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="text-xs uppercase tracking-wide text-muted">
            {title}
          </span>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto p-6">
          {children}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-3 text-xs text-muted">
          {footerNote && <span>{footerNote}</span>}
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-sm border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
