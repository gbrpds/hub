import { prisma } from "@/lib/prisma";
import type { DemandStatus } from "@/app/generated/prisma/client";

export type ClientDetailData = {
  id: string;
  name: string;
  photoUrl: string | null;
  status: "ATIVO" | "INATIVO";
  services: string[];
  context: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWebsite: string | null;
  instagrams: string[];
  driveUrl: string | null;
  contractUrl: string | null;
  noContract: boolean;
  contractStartDate: string | null;
  payments: { label: string; value: string; dueDay: string }[];
  totalRevenue: number;
  hasPortalAccess: boolean;
  hasEmail: boolean;
  demands: { id: string; title: string; status: DemandStatus }[];
};

export async function loadClientDetail(
  id: string,
): Promise<ClientDetailData | null> {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      demands: {
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true },
      },
      financeEntries: { where: { status: "PAGO" }, select: { value: true } },
      users: { where: { role: "CLIENT" }, select: { id: true } },
      payments: {
        orderBy: { order: "asc" },
        select: { value: true, dueDay: true, label: true },
      },
    },
  });

  if (!client) return null;

  return {
    id: client.id,
    name: client.name,
    photoUrl: client.photoUrl,
    status: client.status,
    services: client.services,
    context: client.context,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    contactWebsite: client.contactWebsite,
    instagrams: client.instagrams,
    driveUrl: client.driveUrl,
    contractUrl: client.contractUrl,
    noContract: client.noContract,
    contractStartDate: client.contractStartDate
      ? client.contractStartDate.toISOString()
      : null,
    payments: client.payments.map((p) => ({
      label: p.label ?? "",
      value: Number(p.value).toFixed(2).replace(".", ","),
      dueDay: p.dueDay != null ? String(p.dueDay) : "",
    })),
    totalRevenue: client.financeEntries.reduce(
      (sum, entry) => sum + Number(entry.value),
      0,
    ),
    hasPortalAccess: client.users.length > 0,
    hasEmail: Boolean(client.contactEmail),
    demands: client.demands,
  };
}
