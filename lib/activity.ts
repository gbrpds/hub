import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/current-user";

// Registra uma linha no feed de atividade (aparece no dashboard).
export async function logActivity(description: string, type: string) {
  const userId = await getCurrentAdminId();
  await prisma.activity.create({
    data: { description, type, userId: userId ?? undefined },
  });
}
