/*
  Warnings:

  - You are about to drop the column `country_name` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "country_name",
ADD COLUMN     "country" TEXT;
