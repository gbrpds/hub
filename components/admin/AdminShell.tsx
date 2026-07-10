"use client";

import { ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AdminSidebar } from "./AdminSidebar";

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <span className="flex h-8 w-8 items-center justify-center rounded bg-gradient-accent text-sm font-extrabold text-accent-foreground shadow-[0_4px_14px_-4px_rgba(255,122,61,0.7)]">
        H
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Hub <span className="text-gradient-accent">Admin</span>
      </span>
    </div>
  );
}

// Casca do admin com sidebar fixa no desktop e drawer (menu hambúrguer)
// no celular. footer = bloco de sessão/logout renderizado no servidor.
export function AdminShell({
  footer,
  children,
}: {
  footer: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa — só desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border bg-surface/70 px-4 py-6 backdrop-blur-sm md:flex">
        <div className="flex flex-col gap-8">
          <Brand />
          <AdminSidebar />
        </div>
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — só celular */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-accent/50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Brand />
        </header>

        {/* Drawer — celular */}
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-40 md:hidden">
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col justify-between border-r border-border bg-surface px-4 py-6"
              >
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <Brand />
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Fechar menu"
                      className="flex h-8 w-8 items-center justify-center rounded-sm text-muted hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Fecha o drawer ao clicar em qualquer link da navegação. */}
                  <div onClick={() => setOpen(false)}>
                    <AdminSidebar />
                  </div>
                </div>
                {footer}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
