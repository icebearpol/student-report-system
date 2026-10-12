/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `edited_at` on the `reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "report_comments" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "edited_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "deleted_at",
DROP COLUMN "edited_at";
