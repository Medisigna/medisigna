CREATE TYPE "DrugPublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "DrugInformation" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "genericName" TEXT NOT NULL,
    "brandNames" TEXT[],
    "aliases" TEXT[],
    "uses" TEXT NOT NULL,
    "generalUsage" TEXT NOT NULL,
    "foodGuidance" TEXT,
    "commonSideEffects" TEXT[],
    "warnings" TEXT[],
    "seekHelpWhen" TEXT[],
    "reviewerId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL,
    "status" "DrugPublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugInformation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DrugInformation_slug_key" ON "DrugInformation"("slug");
CREATE INDEX "DrugInformation_status_idx" ON "DrugInformation"("status");
CREATE INDEX "DrugInformation_genericName_idx" ON "DrugInformation"("genericName");

ALTER TABLE "DrugInformation"
ADD CONSTRAINT "DrugInformation_reviewerId_fkey"
FOREIGN KEY ("reviewerId") REFERENCES "user"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
