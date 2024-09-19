/*
  Warnings:

  - You are about to drop the `HelpDesk` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HelpDesk" DROP CONSTRAINT "HelpDesk_chatbotId_fkey";

-- DropTable
DROP TABLE "HelpDesk";

-- CreateTable
CREATE TABLE "BlockPages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "address" TEXT NOT NULL,
    "chatbotId" UUID,

    CONSTRAINT "BlockPages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlockPages" ADD CONSTRAINT "BlockPages_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "ChatBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
