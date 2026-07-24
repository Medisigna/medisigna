ALTER TABLE "DrugInformation"
  ADD COLUMN "definition" TEXT,
  ADD COLUMN "pharmacology" TEXT,
  ADD COLUMN "formulation" TEXT,
  ADD COLUMN "indicationsAndDosage" TEXT,
  ADD COLUMN "sideEffectsAndInteractions" TEXT,
  ADD COLUMN "pregnancyUse" TEXT,
  ADD COLUMN "contraindicationsAndWarnings" TEXT,
  ADD COLUMN "clinicalMonitoring" TEXT,
  ADD COLUMN "counselingPointsMarkdown" TEXT,
  ADD COLUMN "referencesMarkdown" TEXT;

ALTER TABLE "DrugInformation"
  ALTER COLUMN "commonSideEffects" DROP DEFAULT,
  ALTER COLUMN "warnings" DROP DEFAULT,
  ALTER COLUMN "seekHelpWhen" DROP DEFAULT;

ALTER TABLE "DrugInformation"
  ALTER COLUMN "commonSideEffects" TYPE TEXT
    USING CASE
      WHEN cardinality("commonSideEffects") > 0
      THEN '- ' || array_to_string("commonSideEffects", E'\n- ')
      ELSE ''
    END,
  ALTER COLUMN "warnings" TYPE TEXT
    USING CASE
      WHEN cardinality("warnings") > 0
      THEN '- ' || array_to_string("warnings", E'\n- ')
      ELSE ''
    END,
  ALTER COLUMN "seekHelpWhen" TYPE TEXT
    USING CASE
      WHEN cardinality("seekHelpWhen") > 0
      THEN '- ' || array_to_string("seekHelpWhen", E'\n- ')
      ELSE ''
    END;
