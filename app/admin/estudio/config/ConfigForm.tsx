"use client";

import { useState } from "react";
import { saveAgentConfig } from "../actions";

const PLACEHOLDER = `Ex.: Descreva como você cria conteúdo.

• Pilares de conteúdo (ex: bastidores, autoridade, vendas, conexão)
• Como você estrutura um gancho de Reels
• Estrutura de carrossel (capa → desenvolvimento → CTA)
• Tom de voz padrão e o que evitar
• Frequência ideal por formato
• Referências e benchmarks que você gosta`;

export function ConfigForm({ initialValue }: { initialValue: string }) {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setSaved(false);
    await saveAgentConfig(formData);
    setPending(false);
    setSaved(true);
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <textarea
        name="instructions"
        defaultValue={initialValue}
        onInput={() => setSaved(false)}
        rows={16}
        placeholder={PLACEHOLDER}
        className="w-full resize-y rounded border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-gradient-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-[0_4px_14px_-4px_rgba(255,122,61,0.7)] transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar metodologia"}
        </button>
        {saved && <span className="text-sm text-emerald-400">Salvo ✓</span>}
      </div>
    </form>
  );
}
