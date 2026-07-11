import "server-only";
import { GoogleGenAI } from "@google/genai";

// Motor do agente de conteúdo: Google Gemini (tier gratuito do AI Studio).
// Usa o alias "-latest", que sempre aponta pro flash mais recente disponível
// (modelos com número fixo, como gemini-2.5-flash, vão sendo aposentados pra
// novas contas). Dá pra fixar outro via env GEMINI_MODEL — veja os modelos
// disponíveis pra sua chave em /api/admin/content-agent/models.
export const CONTENT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

// A chave vem de GEMINI_API_KEY (server-only) — nunca exponha no client.
// Retorna null se não estiver configurada, pra a UI avisar em vez de estourar.
let cached: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  cached ??= new GoogleGenAI({ apiKey });
  return cached;
}

export function isAgentConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}
