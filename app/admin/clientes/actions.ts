"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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

function parseDecimal(value: FormDataEntryValue | string | null): string | null {
  const raw = String(value ?? "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num.toFixed(2) : null;
}

function parseDay(value: FormDataEntryValue | string | null): number | null {
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

export async function createClient(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

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
      contactInstagram: str(formData.get("contactInstagram")),
      contractStartDate: parseDate(formData.get("contractStartDate")),
      monthlyValue: parseDecimal(formData.get("monthlyValue")),
      paymentDay: parseDay(formData.get("paymentDay")),
      contractUrl: str(formData.get("contractUrl")),
      driveUrl: str(formData.get("driveUrl")),
      whatsappGroupUrl: str(formData.get("whatsappGroupUrl")),
    },
  });

  revalidatePath("/admin/clientes");
}

export async function updateClientField(
  id: string,
  field: string,
  value: string,
) {
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
    case "contactInstagram":
    case "contractUrl":
    case "driveUrl":
    case "whatsappGroupUrl":
      data[field] = value.trim() || null;
      break;
    case "monthlyValue":
      data.monthlyValue = parseDecimal(value);
      break;
    case "paymentDay":
      data.paymentDay = parseDay(value);
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

// Dá ou revoga o acesso do cliente ao portal, criando ou removendo o
// User (role CLIENT) vinculado ao registro do cliente.
export async function toggleClientPortalAccess(clientId: string) {
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
    // Não sobrescreve um usuário já existente com esse e-mail.
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
