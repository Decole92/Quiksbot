/*
  Warnings:

  - You are about to drop the column `characterictic` on the `Source` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Source" DROP COLUMN "characterictic",
ADD COLUMN     "characteristic" TEXT;
