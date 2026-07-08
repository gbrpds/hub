"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { markEntryPaid, markEntryPending } from "./actions";

export function PayButton({
  entryId,
  paid,
}: {
  entryId: string;
  paid: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={paid ? "outline" : "primary"}
      disabled={isPending}
      onClick={() =>
        startTransition(() =>
          paid ? markEntryPending(entryId) : markEntryPaid(entryId),
        )
      }
    >
      {paid ? "Desfazer" : "Marcar pago"}
    </Button>
  );
}
