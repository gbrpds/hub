-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
CREATE INDEX "Demand_dueDate_idx" ON "Demand"("dueDate");

-- CreateIndex
CREATE INDEX "Demand_updatedAt_idx" ON "Demand"("updatedAt");
