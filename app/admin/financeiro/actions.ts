"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function markEntryPaid(id: string) {
  await prisma.financeEntry.update({ where: { id }, data: { status: "PAGO" } });
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/dashboard");
}

export async function markEntryPending(id: string) {
  await prisma.financeEntry.update({
    where: { id },
    data: { status: "PENDENTE" },
  });
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/dashboard");
}
