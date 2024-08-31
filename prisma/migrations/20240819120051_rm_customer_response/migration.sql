/*
  Warnings:

  - You are about to drop the `CustomerResponses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomerResponses" DROP CONSTRAINT "CustomerResponses_customerId_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "name" TEXT;

-- DropTable
DROP TABLE "CustomerResponses";
