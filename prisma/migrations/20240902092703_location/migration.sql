/*
  Warnings:

  - You are about to drop the column `countryCode` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "countryCode",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country_name" TEXT;
