CREATE TABLE "ForumPostLike" (
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ForumPostLike_pkey" PRIMARY KEY ("postId", "userId")
);

CREATE INDEX "ForumPostLike_postId_idx" ON "ForumPostLike"("postId");
CREATE INDEX "ForumPostLike_userId_idx" ON "ForumPostLike"("userId");

ALTER TABLE "ForumPostLike"
  ADD CONSTRAINT "ForumPostLike_postId_fkey"
  FOREIGN KEY ("postId")
  REFERENCES "ForumPost"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "ForumPostLike"
  ADD CONSTRAINT "ForumPostLike_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "user"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
