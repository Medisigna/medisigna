ALTER TABLE "DrugInformation"
  ADD COLUMN "drugClass" TEXT,
  ADD COLUMN "dosageForm" TEXT,
  ADD COLUMN "pharmacistIndications" TEXT,
  ADD COLUMN "counselingPoints" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "screeningQuestions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "contraindications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "majorInteractions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "seriousSideEffects" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "monitoringParameters" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "referralCriteria" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "internalNotes" TEXT,
  ADD COLUMN "references" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "reviewDueAt" TIMESTAMP(3);
