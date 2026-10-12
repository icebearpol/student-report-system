-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_author_id_fkey";

-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "author_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
