-- DropForeignKey
ALTER TABLE "report_comments" DROP CONSTRAINT "report_comments_report_id_fkey";

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "ai_status" TEXT NOT NULL DEFAULT 'unchecked',
ADD COLUMN     "ai_suggested_priority" TEXT,
ADD COLUMN     "ai_summary" TEXT,
ADD COLUMN     "flag_reason" TEXT,
ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority_review" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reported_priority" TEXT,
ADD COLUMN     "urgent_strike_applied" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "urgent_blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "urgent_strikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verify_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verify_code_expires" TIMESTAMP(3),
ADD COLUMN     "verify_code_hash" TEXT,
ADD COLUMN     "verify_code_sent_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "report_id" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
