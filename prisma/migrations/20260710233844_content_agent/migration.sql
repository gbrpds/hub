-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "AgentConfig" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "instructions" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentChat" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Nova conversa',
    "ownerId" TEXT NOT NULL,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentMessage" (
    "id" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentConfig_ownerId_key" ON "AgentConfig"("ownerId");

-- CreateIndex
CREATE INDEX "ContentChat_ownerId_idx" ON "ContentChat"("ownerId");

-- CreateIndex
CREATE INDEX "ContentChat_clientId_idx" ON "ContentChat"("clientId");

-- CreateIndex
CREATE INDEX "ContentChat_updatedAt_idx" ON "ContentChat"("updatedAt");

-- CreateIndex
CREATE INDEX "ContentMessage_chatId_idx" ON "ContentMessage"("chatId");

-- AddForeignKey
ALTER TABLE "AgentConfig" ADD CONSTRAINT "AgentConfig_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentChat" ADD CONSTRAINT "ContentChat_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentChat" ADD CONSTRAINT "ContentChat_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentMessage" ADD CONSTRAINT "ContentMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "ContentChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
