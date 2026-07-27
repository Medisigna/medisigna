CREATE TYPE "ArticlePublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REJECTED');

CREATE TABLE "Article" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "contentMarkdown" TEXT NOT NULL,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "coverImageUrl" TEXT,
  "status" "ArticlePublicationStatus" NOT NULL DEFAULT 'DRAFT',
  "adminNote" TEXT,
  "authorId" TEXT NOT NULL,
  "reviewedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE INDEX "Article_status_idx" ON "Article"("status");
CREATE INDEX "Article_category_idx" ON "Article"("category");
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

ALTER TABLE "Article"
  ADD CONSTRAINT "Article_authorId_fkey"
  FOREIGN KEY ("authorId")
  REFERENCES "user"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
