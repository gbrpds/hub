import { auth } from "@/auth";

const AUTH_GATE_ENABLED = process.env.AUTH_GATE_ENABLED === "true";

// Defesa em profundidade para Server Actions do admin: mesmo o proxy já
// bloqueando /admin para não-ADMIN, cada mutação confirma o papel aqui
// (o Next.js recomenda checar perto dos dados, não só no proxy/layout).
// Com o gate desligado (dev) libera, pois não há sessão real.
export async function canActAsAdmin() {
  if (!AUTH_GATE_ENABLED) return true;
  const session = await auth();
  return session?.user.role === "ADMIN";
}
