"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { sendToApproval } from "../actions";

export function ApprovalButton({
  demandId,
  disabled,
}: {
  demandId: string;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="w-full"
      disabled={disabled || isPending}
      onClick={() => startTransition(() => sendToApproval(demandId))}
    >
      {disabled ? "Em aprovação" : "Enviar para aprovação"}
    </Button>
  );
}
