-- Novas colunas do Client
ALTER TABLE "Client"
  ADD COLUMN "instagrams" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "noContract" BOOLEAN NOT NULL DEFAULT false;

-- Preserva o @ atual: contactInstagram -> instagrams (array de 1 item)
UPDATE "Client"
SET "instagrams" = ARRAY["contactInstagram"]
WHERE "contactInstagram" IS NOT NULL AND "contactInstagram" <> '';

-- Tabela de pagamentos
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "label" TEXT,
    "value" DECIMAL(10,2) NOT NULL,
    "dueDay" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Payment_clientId_idx" ON "Payment"("clientId");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserva o valor mensal atual como um pagamento (ordem 1)
INSERT INTO "Payment" ("id", "clientId", "value", "dueDay", "order")
SELECT gen_random_uuid()::text, "id", "monthlyValue", "paymentDay", 1
FROM "Client"
WHERE "monthlyValue" IS NOT NULL;

-- Remove as colunas antigas do Client
ALTER TABLE "Client"
  DROP COLUMN "contactInstagram",
  DROP COLUMN "monthlyValue",
  DROP COLUMN "paymentDay",
  DROP COLUMN "whatsappGroupUrl";
