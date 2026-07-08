-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('URGENTE', 'ALTA', 'MEDIA', 'BAIXA');

-- CreateEnum
CREATE TYPE "DemandStatus" AS ENUM ('RECEBIDA', 'EM_PRODUCAO', 'APROVACAO', 'PROGRAMAR', 'CONCLUIDO', 'REPROVADO', 'INTERNO');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('POST', 'CARROSSEL', 'REELS', 'STORY', 'VIDEO_LONGO');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('CLIENTE', 'ENTREGA');

-- CreateEnum
CREATE TYPE "FinanceStatus" AS ENUM ('PAGO', 'PENDENTE');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactInstagram" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "contactWebsite" TEXT,
ADD COLUMN     "context" TEXT,
ADD COLUMN     "contractStartDate" TIMESTAMP(3),
ADD COLUMN     "contractUrl" TEXT,
ADD COLUMN     "driveUrl" TEXT,
ADD COLUMN     "monthlyValue" DECIMAL(10,2),
ADD COLUMN     "paymentDay" INTEGER,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'ATIVO',
ADD COLUMN     "whatsappGroupUrl" TEXT;

-- CreateTable
CREATE TABLE "Demand" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "caption" TEXT,
    "status" "DemandStatus" NOT NULL DEFAULT 'RECEBIDA',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIA',
    "contentType" "ContentType",
    "clientId" TEXT,
    "assigneeId" TEXT,
    "dueDate" TIMESTAMP(3),
    "publishDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Demand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "demandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "demandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "type" "AttachmentType" NOT NULL,
    "demandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "priority" "Priority" NOT NULL DEFAULT 'MEDIA',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceEntry" (
    "id" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "referenceMonth" TIMESTAMP(3) NOT NULL,
    "status" "FinanceStatus" NOT NULL DEFAULT 'PENDENTE',
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Demand_clientId_idx" ON "Demand"("clientId");

-- CreateIndex
CREATE INDEX "Demand_assigneeId_idx" ON "Demand"("assigneeId");

-- CreateIndex
CREATE INDEX "Demand_status_idx" ON "Demand"("status");

-- CreateIndex
CREATE INDEX "Subtask_demandId_idx" ON "Subtask"("demandId");

-- CreateIndex
CREATE INDEX "Comment_demandId_idx" ON "Comment"("demandId");

-- CreateIndex
CREATE INDEX "Attachment_demandId_idx" ON "Attachment"("demandId");

-- CreateIndex
CREATE INDEX "Attachment_type_idx" ON "Attachment"("type");

-- CreateIndex
CREATE INDEX "Task_ownerId_idx" ON "Task"("ownerId");

-- CreateIndex
CREATE INDEX "FinanceEntry_clientId_idx" ON "FinanceEntry"("clientId");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceEntry" ADD CONSTRAINT "FinanceEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
