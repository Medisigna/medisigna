ALTER TYPE "DrugPublicationStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

ALTER TABLE "DrugInformation"
ADD COLUMN "adminNote" TEXT;
