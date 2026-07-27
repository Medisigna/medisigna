CREATE TYPE "EducationalVideoPublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REJECTED');

CREATE TABLE "EducationalVideo" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "youtubeUrl" TEXT NOT NULL,
  "youtubeVideoId" TEXT NOT NULL,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "status" "EducationalVideoPublicationStatus" NOT NULL DEFAULT 'DRAFT',
  "adminNote" TEXT,
  "authorId" TEXT NOT NULL,
  "reviewedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EducationalVideo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EducationalVideo_slug_key" ON "EducationalVideo"("slug");
CREATE INDEX "EducationalVideo_status_idx" ON "EducationalVideo"("status");
CREATE INDEX "EducationalVideo_category_idx" ON "EducationalVideo"("category");
CREATE INDEX "EducationalVideo_authorId_idx" ON "EducationalVideo"("authorId");
CREATE INDEX "EducationalVideo_publishedAt_idx" ON "EducationalVideo"("publishedAt");

ALTER TABLE "EducationalVideo"
  ADD CONSTRAINT "EducationalVideo_authorId_fkey"
  FOREIGN KEY ("authorId")
  REFERENCES "user"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
