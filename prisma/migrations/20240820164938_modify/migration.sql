/*
  Warnings:

  - You are about to drop the column `characteristic` on the `Source` table. All the data in the column will be lost.
  - You are about to drop the column `file` on the `Source` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Source" DROP COLUMN "characteristic",
DROP COLUMN "file";

-- CreateTable
CREATE TABLE "Characteristic" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "characteristic" TEXT NOT NULL,
    "sourceId" UUID,

    CONSTRAINT "Characteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfFile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fileName" TEXT NOT NULL,
    "file" BYTEA NOT NULL,
    "sourceId" UUID,

    CONSTRAINT "PdfFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Characteristic" ADD CONSTRAINT "Characteristic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdfFile" ADD CONSTRAINT "PdfFile_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
