/*
  Warnings:

  - You are about to drop the column `severity` on the `Scan` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Scan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Scan" DROP COLUMN "severity",
ADD COLUMN     "progressLog" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "reportPath" DROP NOT NULL;
