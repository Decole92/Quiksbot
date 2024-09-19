/*
  Warnings:

  - You are about to drop the column `texts` on the `Source` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Source" DROP COLUMN "texts",
ADD COLUMN     "characterictic" TEXT;
