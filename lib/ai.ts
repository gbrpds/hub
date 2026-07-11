import "server-only";
import { GoogleGenAI } from "@google/genai";

// Motor do agente de conteúdo: Google Gemini (tier gratuito do AI Studio).
// gemini-2.5-flash tem ótima qualidade em PT-BR e roda no plano grátis.
export const CONTENT_MODEL = "gemini-2.5-flash";

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
