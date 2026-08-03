ALTER TABLE "ForumPost"
ADD COLUMN "parentPostId" TEXT;

ALTER TABLE "ForumPost"
ADD CONSTRAINT "ForumPost_parentPostId_fkey"
FOREIGN KEY ("parentPostId") REFERENCES "ForumPost"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ForumPost_parentPostId_idx" ON "ForumPost"("parentPostId");
