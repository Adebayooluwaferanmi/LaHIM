-- DropIndex
DROP INDEX IF EXISTS "MessageThread_caseId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_caseId_key" ON "MessageThread"("caseId");
