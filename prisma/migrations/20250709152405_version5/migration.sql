/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `Option` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Option" DROP COLUMN "is_deleted",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
