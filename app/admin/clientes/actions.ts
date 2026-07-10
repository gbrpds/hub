"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canActAsAdmin } from "@/lib/guards";
import type { ClientStatus } from "@/app/generated/prisma/client";

function str(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim();
  return raw || null;
}

function parseServices(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((service) => service.trim())
    .filter(Boolean);
}

function parseJsonArray<T>(value: FormDataEntryValue | null): T[] {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function parseDecimal(value: string | null): string | null {
  const raw = String(value ?? "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num.toFixed(2) : null;
}

function parseDay(value: string | number | null): number | null {
  const num = parseInt(String(value ?? ""), 10);
  if (Number.isNaN(num)) return null;
  return Math.min(Math.max(num, 1), 31);
}

function parseDate(value: FormDataEntryValue | string | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

type PaymentInput = { label?: string; value: string; dueDay?: string | number };

function normalizeInstagrams(list: string[]): string[] {
  return Array.from(
    new Set(
      list
        .map((v) => v.trim().replace(/^@/, "").replace(/\/$/, ""))
        .filter(Boolean),
    ),
  );
}

function paymentsData(list: PaymentInput[]) {
  return list
    .map((p, index) => {
      const value = parseDecimal(p.value);
      if (!value) return null;
      return {
        value,
        dueDay: parseDay(p.dueDay ?? null),
        label: p.label?.trim() || null,
        order: index + 1,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export async function createClient(formData: FormData) {
  if (!(await canActAsAdmin())) return { ok: false as const, error: "Sem permissão." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false as const, error: "Digite o nome do cliente." };

  const instagrams = normalizeInstagrams(
    parseJsonArray<string>(formData.get("instagrams")),
  );
  const payments = paymentsData(parseJsonArray<PaymentInput>(formData.get("payments")));

  await prisma.client.create({
    data: {
      name,
      photoUrl: str(formData.get("photoUrl")),
      status: formData.get("status") === "INATIVO" ? "INATIVO" : "ATIVO",
      services: parseServices(formData.get("services")),
      context: str(formData.get("context")),
      contactPhone: str(formData.get("contactPhone")),
      contactEmail: str(formData.get("contactEmail")),
      contactWebsite: str(formData.get("contactWebsite")),
      instagrams,
      contractStartDate: parseDate(formData.get("contractStartDate")),
      contractUrl: str(formData.get("contractUrl")),
      noContract: formData.get("noContract") === "true",
      driveUrl: str(formData.get("driveUrl")),
      payments: { create: payments },
    },
  });

  revalidatePath("/admin/clientes");
  return { ok: true as const };
}

export async function updateClientField(
  id: string,
  field: string,
  value: string,
) {
  if (!(await canActAsAdmin())) return;
  const data: Record<string, unknown> = {};

  switch (field) {
    case "name":
      if (!value.trim()) return;
      data.name = value.trim();
      break;
    case "status":
      data.status = (value === "INATIVO" ? "INATIVO" : "ATIVO") as ClientStatus;
      break;
    case "photoUrl":
      data.photoUrl = value.trim() || null;
      break;
    case "services":
      data.services = value
        .split(",")
        .map((service) => service.trim())
        .filter(Boolean);
      break;
    case "context":
      data.context = value.trim() || null;
      break;
    case "contactPhone":
    case "contactEmail":
    case "contactWebsite":
    case "contractUrl":
    case "driveUrl":
      data[field] = value.trim() || null;
      break;
    case "noContract":
      data.noContract = value === "true";
      if (value === "true") data.contractUrl = null;
      break;
    case "instagrams":
      data.instagrams = normalizeInstagrams(
        (() => {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })(),
      );
      break;
    case "contractStartDate":
      data.contractStartDate = parseDate(value);
      break;
    default:
      return;
  }

  await prisma.client.update({ where: { id }, data });
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/clientes");
}

// Substitui todos os pagamentos do cliente pela nova lista.
export async function updateClientPayments(
  clientId: string,
  payments: PaymentInput[],
) {
  if (!(await canActAsAdmin())) return;
  const data = paymentsData(payments);
  await prisma.$transaction([
    prisma.payment.deleteMany({ where: { clientId } }),
    prisma.payment.createMany({
      data: data.map((p) => ({ ...p, clientId })),
    }),
  ]);
  revalidatePath(`/admin/clientes/${clientId}`);
  revalidatePath("/admin/financeiro");
}

export async function deleteClient(clientId: string) {
  if (!(await canActAsAdmin())) return { ok: false as const };
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/admin/clientes");
  return { ok: true as const };
}

// Dá ou revoga o acesso do cliente ao portal, criando ou removendo o
// User (role CLIENT) vinculado ao registro do cliente.
export async function toggleClientPortalAccess(clientId: string) {
  if (!(await canActAsAdmin())) return;
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { contactEmail: true },
  });
  if (!client) return;

  const linked = await prisma.user.findFirst({
    where: { clientId, role: "CLIENT" },
    select: { id: true },
  });

  if (linked) {
    await prisma.user.delete({ where: { id: linked.id } });
  } else {
    if (!client.contactEmail) return;
    const emailTaken = await prisma.user.findUnique({
      where: { email: client.contactEmail },
      select: { id: true },
    });
    if (emailTaken) return;
    await prisma.user.create({
      data: { email: client.contactEmail, role: "CLIENT", clientId },
    });
  }

  revalidatePath(`/admin/clientes/${clientId}`);
}
