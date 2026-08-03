CREATE TABLE "ForumPostAttachment" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "altText" TEXT,
  "isInline" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ForumPostAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ForumPostAttachment_postId_idx" ON "ForumPostAttachment"("postId");
CREATE INDEX "ForumPostAttachment_uploadedById_idx" ON "ForumPostAttachment"("uploadedById");
CREATE INDEX "ForumPostAttachment_isInline_idx" ON "ForumPostAttachment"("isInline");

ALTER TABLE "ForumPostAttachment"
  ADD CONSTRAINT "ForumPostAttachment_postId_fkey"
  FOREIGN KEY ("postId")
  REFERENCES "ForumPost"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "ForumPostAttachment"
  ADD CONSTRAINT "ForumPostAttachment_uploadedById_fkey"
  FOREIGN KEY ("uploadedById")
  REFERENCES "user"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
