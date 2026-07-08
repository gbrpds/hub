"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canActAsAdmin } from "@/lib/guards";

export async function markEntryPaid(id: string) {
  if (!(await canActAsAdmin())) return;
  await prisma.financeEntry.update({ where: { id }, data: { status: "PAGO" } });
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/dashboard");
}

export async function markEntryPending(id: string) {
  if (!(await canActAsAdmin())) return;
  await prisma.financeEntry.update({
    where: { id },
    data: { status: "PENDENTE" },
  });
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/dashboard");
}
