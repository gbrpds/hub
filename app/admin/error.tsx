"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

// Boundary de erro do admin: em vez da tela genérica "This page couldn't
// load", mostra uma mensagem amigável com opção de tentar de novo e expõe
// o digest do erro (útil pra diagnosticar nos logs).
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Algo deu errado ao carregar
      </h2>
      <p className="max-w-md text-sm text-muted">
        Tente de novo. Se continuar, recarregue a página.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted/70">ref: {error.digest}</p>
      )}
      <Button type="button" onClick={() => reset()}>
        Tentar de novo
      </Button>
    </div>
  );
}
