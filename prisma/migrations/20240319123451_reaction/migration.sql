/*
  Warnings:

  - You are about to drop the column `payloadId` on the `ReactionType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReactionType" DROP CONSTRAINT "ReactionType_payloadId_fkey";

-- AlterTable
ALTER TABLE "ReactionType" DROP COLUMN "payloadId";

-- AddForeignKey
ALTER TABLE "ReactionType" ADD CONSTRAINT "ReactionType_reactionMessageId_fkey" FOREIGN KEY ("reactionMessageId") REFERENCES "MessagePayload"("messageId") ON DELETE RESTRICT ON UPDATE CASCADE;
