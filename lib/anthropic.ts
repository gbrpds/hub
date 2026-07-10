import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Modelo padrão do agente de conteúdo. Opus 4.8 usa thinking adaptativo
// (budget_tokens é rejeitado nesse modelo).
export const CONTENT_MODEL = "claude-opus-4-8";

// Cliente único por processo. A chave vem de ANTHROPIC_API_KEY (server-only) —
// nunca exponha no client. Retorna null se a chave não estiver configurada,
// pra a UI conseguir mostrar um aviso amigável em vez de estourar.
let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  cached ??= new Anthropic();
  return cached;
}

export function isAgentConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
