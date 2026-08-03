CREATE TYPE "ForumThreadStatus" AS ENUM ('ACTIVE', 'LOCKED', 'HIDDEN');
CREATE TYPE "ForumPostStatus" AS ENUM ('VISIBLE', 'HIDDEN');
CREATE TYPE "ForumReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');
CREATE TYPE "ForumReportTargetType" AS ENUM ('THREAD', 'POST');

CREATE TABLE "ForumCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ForumCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumThread" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "status" "ForumThreadStatus" NOT NULL DEFAULT 'ACTIVE',
  "isPinned" BOOLEAN NOT NULL DEFAULT false,
  "lockedAt" TIMESTAMP(3),
  "lockedById" TEXT,
  "hiddenAt" TIMESTAMP(3),
  "hiddenById" TEXT,
  "hiddenReason" TEXT,
  "lastPostAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ForumThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumPost" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "bodyMarkdown" TEXT NOT NULL,
  "status" "ForumPostStatus" NOT NULL DEFAULT 'VISIBLE',
  "hiddenAt" TIMESTAMP(3),
  "hiddenById" TEXT,
  "hiddenReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumReport" (
  "id" TEXT NOT NULL,
  "targetType" "ForumReportTargetType" NOT NULL,
  "threadId" TEXT,
  "postId" TEXT,
  "reporterId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "ForumReportStatus" NOT NULL DEFAULT 'OPEN',
  "resolvedAt" TIMESTAMP(3),
  "resolvedById" TEXT,
  "resolutionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ForumReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumSubscription" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ForumSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ForumCategory_name_key" ON "ForumCategory"("name");
CREATE UNIQUE INDEX "ForumCategory_slug_key" ON "ForumCategory"("slug");
CREATE INDEX "ForumCategory_isActive_idx" ON "ForumCategory"("isActive");
CREATE INDEX "ForumCategory_name_idx" ON "ForumCategory"("name");

CREATE UNIQUE INDEX "ForumThread_slug_key" ON "ForumThread"("slug");
CREATE INDEX "ForumThread_categoryId_idx" ON "ForumThread"("categoryId");
CREATE INDEX "ForumThread_authorId_idx" ON "ForumThread"("authorId");
CREATE INDEX "ForumThread_status_idx" ON "ForumThread"("status");
CREATE INDEX "ForumThread_isPinned_lastPostAt_idx" ON "ForumThread"("isPinned", "lastPostAt");
CREATE INDEX "ForumThread_lastPostAt_idx" ON "ForumThread"("lastPostAt");
CREATE INDEX "ForumThread_lockedById_idx" ON "ForumThread"("lockedById");
CREATE INDEX "ForumThread_hiddenById_idx" ON "ForumThread"("hiddenById");

CREATE INDEX "ForumPost_threadId_idx" ON "ForumPost"("threadId");
CREATE INDEX "ForumPost_authorId_idx" ON "ForumPost"("authorId");
CREATE INDEX "ForumPost_status_idx" ON "ForumPost"("status");
CREATE INDEX "ForumPost_createdAt_idx" ON "ForumPost"("createdAt");
CREATE INDEX "ForumPost_hiddenById_idx" ON "ForumPost"("hiddenById");

CREATE INDEX "ForumReport_targetType_idx" ON "ForumReport"("targetType");
CREATE INDEX "ForumReport_threadId_idx" ON "ForumReport"("threadId");
CREATE INDEX "ForumReport_postId_idx" ON "ForumReport"("postId");
CREATE INDEX "ForumReport_reporterId_idx" ON "ForumReport"("reporterId");
CREATE INDEX "ForumReport_status_idx" ON "ForumReport"("status");
CREATE INDEX "ForumReport_resolvedById_idx" ON "ForumReport"("resolvedById");

CREATE UNIQUE INDEX "ForumSubscription_threadId_userId_key" ON "ForumSubscription"("threadId", "userId");
CREATE INDEX "ForumSubscription_userId_idx" ON "ForumSubscription"("userId");
CREATE INDEX "ForumSubscription_threadId_idx" ON "ForumSubscription"("threadId");

ALTER TABLE "ForumThread"
  ADD CONSTRAINT "ForumThread_categoryId_fkey"
  FOREIGN KEY ("categoryId")
  REFERENCES "ForumCategory"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "ForumThread"
  ADD CONSTRAINT "ForumThread_authorId_fkey"
  FOREIGN KEY ("authorId")
  REFERENCES "user"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "ForumThread"
  ADD CONSTRAINT "ForumThread_lockedById_fkey"
  FOREIGN KEY ("lockedById")
  REFERENCES "user"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "ForumThread"
  ADD CONSTRAINT "ForumThread_hiddenById_fkey"
  FOREIGN KEY ("hiddenById")
  REFERENCES "user"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_threadId_fkey"
  FOREIGN KEY ("threadId")
  REFERENCES "ForumThread"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_authorId_fkey"
  FOREIGN KEY ("authorId")
  REFERENCES "user"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "ForumPost"
  ADD CONSTRAINT "ForumPost_hiddenById_fkey"
  FOREIGN KEY ("hiddenById")
  REFERENCES "user"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "ForumReport"
  ADD CONSTRAINT "ForumReport_threadId_fkey"
  FOREIGN KEY ("threadId")
  REFERENCES "ForumThread"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "ForumReport"
  ADD CONSTRAINT "ForumReport_postId_fkey"
  FOREIGN KEY ("postId")
  REFERENCES "ForumPost"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "ForumReport"
  ADD CONSTRAINT "ForumReport_reporterId_fkey"
  FOREIGN KEY ("reporterId")
  REFERENCES "user"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "ForumReport"
  ADD CONSTRAINT "ForumReport_resolvedById_fkey"
  FOREIGN KEY ("resolvedById")
  REFERENCES "user"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "ForumSubscription"
  ADD CONSTRAINT "ForumSubscription_threadId_fkey"
  FOREIGN KEY ("threadId")
  REFERENCES "ForumThread"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "ForumSubscription"
  ADD CONSTRAINT "ForumSubscription_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "user"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

INSERT INTO "ForumCategory" ("id", "name", "slug", "description", "isActive", "createdAt", "updatedAt")
VALUES
  ('forum-category-umum', 'Umum', 'umum', 'Diskusi umum seputar penggunaan obat dan kesehatan sehari-hari.', true, NOW(), NOW()),
  ('forum-category-tanya-apoteker', 'Tanya Apoteker', 'tanya-apoteker', 'Pertanyaan yang membutuhkan perspektif apoteker.', true, NOW(), NOW()),
  ('forum-category-edukasi-obat', 'Edukasi Obat', 'edukasi-obat', 'Diskusi lanjutan dari artikel, video, dan informasi obat.', true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;
