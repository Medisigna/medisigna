CREATE TABLE "ContentCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContentCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentCategory_name_key" ON "ContentCategory"("name");
CREATE UNIQUE INDEX "ContentCategory_slug_key" ON "ContentCategory"("slug");
CREATE INDEX "ContentCategory_isActive_idx" ON "ContentCategory"("isActive");
CREATE INDEX "ContentCategory_name_idx" ON "ContentCategory"("name");

INSERT INTO "ContentCategory" ("id", "name", "slug", "isActive", "createdAt", "updatedAt")
SELECT
  'category-' || MD5(category) AS id,
  category AS name,
  LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(category, '[^a-zA-Z0-9]+', '-', 'g'),
      '(^-|-$)',
      '',
      'g'
    )
  ) || '-' || SUBSTRING(MD5(category), 1, 8) AS slug,
  true AS "isActive",
  NOW() AS "createdAt",
  NOW() AS "updatedAt"
FROM (
  SELECT DISTINCT category FROM "Article" WHERE category <> ''
  UNION
  SELECT DISTINCT category FROM "EducationalVideo" WHERE category <> ''
) categories
ON CONFLICT ("name") DO NOTHING;
