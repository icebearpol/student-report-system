-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "anonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "upvotes" INTEGER NOT NULL DEFAULT 0;
