-- DropForeignKey
ALTER TABLE "report_comments" DROP CONSTRAINT "report_comments_author_id_fkey";

-- AlterTable
ALTER TABLE "report_comments" ALTER COLUMN "author_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
