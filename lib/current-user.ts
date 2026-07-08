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
