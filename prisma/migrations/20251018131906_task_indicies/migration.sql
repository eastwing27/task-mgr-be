-- DropIndex
DROP INDEX "public"."tasks_title_idx";

-- CreateIndex
CREATE INDEX "tasks_deadline_idx" ON "tasks"("deadline");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
