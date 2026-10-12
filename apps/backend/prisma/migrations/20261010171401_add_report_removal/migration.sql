-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "removed_at" TIMESTAMP(3),
ADD COLUMN     "removed_reason" TEXT;
