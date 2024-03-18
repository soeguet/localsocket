/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Client" (
    "clientDbId" TEXT NOT NULL,
    "clientUsername" TEXT NOT NULL,
    "clientColor" TEXT,
    "clientProfileImage" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("clientDbId")
);

-- CreateTable
CREATE TABLE "QuoteType" (
    "quoteDbId" SERIAL NOT NULL,
    "quoteMessageId" TEXT,
    "quoteClientId" TEXT,
    "quoteMessageContext" TEXT,
    "quoteTime" TEXT,
    "quoteDate" TEXT,
    "payloadId" INTEGER NOT NULL,

    CONSTRAINT "QuoteType_pkey" PRIMARY KEY ("quoteDbId")
);

-- CreateTable
CREATE TABLE "ReactionType" (
    "reactionDbId" SERIAL NOT NULL,
    "reactionMessageId" TEXT NOT NULL,
    "reactionContext" TEXT NOT NULL,
    "reactionClientId" TEXT NOT NULL,
    "payloadId" INTEGER NOT NULL,

    CONSTRAINT "ReactionType_pkey" PRIMARY KEY ("reactionDbId")
);

-- CreateTable
CREATE TABLE "MessageType" (
    "messageDbId" SERIAL NOT NULL,
    "messageId" TEXT NOT NULL,
    "messageContext" TEXT NOT NULL,
    "messageTime" TEXT NOT NULL,
    "messageDate" TEXT NOT NULL,
    "messagePayloadId" INTEGER NOT NULL,

    CONSTRAINT "MessageType_pkey" PRIMARY KEY ("messageDbId")
);

-- CreateTable
CREATE TABLE "MessagePayload" (
    "messagePayloadDbId" SERIAL NOT NULL,
    "clientDbId" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,

    CONSTRAINT "MessagePayload_pkey" PRIMARY KEY ("messagePayloadDbId")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageType_messagePayloadId_key" ON "MessageType"("messagePayloadId");

-- CreateIndex
CREATE UNIQUE INDEX "MessagePayload_messageId_key" ON "MessagePayload"("messageId");

-- AddForeignKey
ALTER TABLE "QuoteType" ADD CONSTRAINT "QuoteType_payloadId_fkey" FOREIGN KEY ("payloadId") REFERENCES "MessagePayload"("messagePayloadDbId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReactionType" ADD CONSTRAINT "ReactionType_payloadId_fkey" FOREIGN KEY ("payloadId") REFERENCES "MessagePayload"("messagePayloadDbId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageType" ADD CONSTRAINT "MessageType_messagePayloadId_fkey" FOREIGN KEY ("messagePayloadId") REFERENCES "MessagePayload"("messagePayloadDbId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagePayload" ADD CONSTRAINT "MessagePayload_clientDbId_fkey" FOREIGN KEY ("clientDbId") REFERENCES "Client"("clientDbId") ON DELETE RESTRICT ON UPDATE CASCADE;
