/*
  Warnings:

  - You are about to drop the column `userId` on the `Source` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_userId_fkey";

-- DropForeignKey
ALTER TABLE "Source" DROP CONSTRAINT "Source_userId_fkey";

-- AlterTable
ALTER TABLE "Campaign" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Source" DROP COLUMN "userId";
