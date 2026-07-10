-- AlterTable
ALTER TABLE "FinanceEntry" ADD COLUMN     "dueDay" INTEGER,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "paymentId" TEXT;

-- CreateIndex
CREATE INDEX "FinanceEntry_paymentId_idx" ON "FinanceEntry"("paymentId");

-- AddForeignKey
ALTER TABLE "FinanceEntry" ADD CONSTRAINT "FinanceEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
