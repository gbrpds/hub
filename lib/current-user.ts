import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const AUTH_GATE_ENABLED = process.env.AUTH_GATE_ENABLED === "true";

// Enquanto AUTH_GATE_ENABLED não é "true" (ver proxy.ts), não há sessão
// real — usa o primeiro ADMIN cadastrado como usuário atual, só pra
// telas que precisam de um "dono" (ex: to-do list) continuarem úteis.
export async function getCurrentAdminId() {
  if (AUTH_GATE_ENABLED) {
    const session = await auth();
    return session?.user.role === "ADMIN" ? session.user.id : null;
  }

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return admin?.id ?? null;
}

// clientId do cliente logado (usado por todo o portal para filtrar dados).
// Em dev (gate desligado) cai no primeiro cliente com usuário CLIENT
// vinculado, ou no primeiro cliente cadastrado.
export async function getCurrentClientId() {
  if (AUTH_GATE_ENABLED) {
    const session = await auth();
    return session?.user.role === "CLIENT" ? session.user.clientId : null;
  }

  const linked = await prisma.user.findFirst({
    where: { role: "CLIENT", clientId: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { clientId: true },
  });
  if (linked?.clientId) return linked.clientId;

  const anyClient = await prisma.client.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return anyClient?.id ?? null;
}

// id do User CLIENT logado (para autoria de comentários no portal).
export async function getCurrentClientUserId() {
  if (AUTH_GATE_ENABLED) {
    const session = await auth();
    return session?.user.role === "CLIENT" ? session.user.id : null;
  }

  const user = await prisma.user.findFirst({
    where: { role: "CLIENT", clientId: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return user?.id ?? null;
}
