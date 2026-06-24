ALTER TABLE "ConsultationSession"
ADD COLUMN "patientUnreadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "pharmacistUnreadCount" INTEGER NOT NULL DEFAULT 0;
