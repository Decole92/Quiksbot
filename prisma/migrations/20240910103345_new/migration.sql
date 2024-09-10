-- CreateEnum
CREATE TYPE "botType" AS ENUM ('SalesBot', 'ChatPdf', 'Custom');

-- AlterTable
ALTER TABLE "ChatBot" ADD COLUMN     "botType" "botType" NOT NULL DEFAULT 'SalesBot',
ADD COLUMN     "getDetails" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "openAIkey" TEXT;
