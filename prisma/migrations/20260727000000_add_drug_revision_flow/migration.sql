ALTER TYPE "DrugPublicationStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

ALTER TABLE "DrugInformation"
  ADD COLUMN "revisesDrugId" TEXT;

ALTER TABLE "DrugInformation"
  ADD CONSTRAINT "DrugInformation_revisesDrugId_fkey"
  FOREIGN KEY ("revisesDrugId")
  REFERENCES "DrugInformation"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

CREATE INDEX "DrugInformation_revisesDrugId_idx"
  ON "DrugInformation"("revisesDrugId");

CREATE UNIQUE INDEX "DrugInformation_active_revision_unique_idx"
  ON "DrugInformation"("revisesDrugId")
  WHERE "revisesDrugId" IS NOT NULL
    AND "status" IN ('DRAFT', 'REJECTED');
