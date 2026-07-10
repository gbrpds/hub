import { prisma } from "@/lib/prisma";
import { mediaKind } from "@/lib/media";
import type { DemandStatus } from "@/app/generated/prisma/client";
import type { DeliveryItem } from "./[id]/DeliveryCarousel";

export type PortalDemandData = {
  id: string;
  title: string;
  status: DemandStatus;
  caption: string | null;
  createdAt: string;
  delivery: DeliveryItem[];
};

// Carrega o detalhe da demanda para o portal, sempre escopado ao clientId
// logado (nunca expõe demanda de outro cliente). Usado pela página e pelo modal.
export async function loadPortalDemand(
  id: string,
  clientId: string | null,
): Promise<PortalDemandData | null> {
  if (!clientId) return null;

  const demand = await prisma.demand.findFirst({
    where: { id, clientId },
    select: {
      id: true,
      title: true,
      status: true,
      caption: true,
      createdAt: true,
      attachments: {
        where: { type: "ENTREGA" },
        orderBy: { createdAt: "asc" },
        select: { url: true, fileName: true },
      },
    },
  });

  if (!demand) return null;

  return {
    id: demand.id,
    title: demand.title,
    status: demand.status,
    caption: demand.caption,
    createdAt: demand.createdAt.toISOString(),
    delivery: demand.attachments.map((attachment) => ({
      url: attachment.url,
      fileName: attachment.fileName,
      kind: mediaKind(attachment.url, attachment.fileName),
    })),
  };
}
