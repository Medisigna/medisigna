UPDATE "DrugInformation"
SET
  "brandNames" = COALESCE("brandNames", ARRAY[]::TEXT[]),
  "aliases" = COALESCE("aliases", ARRAY[]::TEXT[]),
  "commonSideEffects" = COALESCE("commonSideEffects", ARRAY[]::TEXT[]),
  "warnings" = COALESCE("warnings", ARRAY[]::TEXT[]),
  "seekHelpWhen" = COALESCE("seekHelpWhen", ARRAY[]::TEXT[]);

ALTER TABLE "DrugInformation"
  ALTER COLUMN "brandNames" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "brandNames" SET NOT NULL,
  ALTER COLUMN "aliases" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "aliases" SET NOT NULL,
  ALTER COLUMN "commonSideEffects" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "commonSideEffects" SET NOT NULL,
  ALTER COLUMN "warnings" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "warnings" SET NOT NULL,
  ALTER COLUMN "seekHelpWhen" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "seekHelpWhen" SET NOT NULL;
