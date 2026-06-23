-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'PHARMACIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PharmacistVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "PharmacistAvailabilityStatus" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "ConsultationSessionStatus" AS ENUM ('ACTIVE', 'WAITING_USER', 'WAITING_PHARMACIST', 'COMPLETED', 'REFERRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ConsultationMessageType" AS ENUM ('TEXT', 'IMAGE', 'SYSTEM', 'SUMMARY');

-- CreateEnum
CREATE TYPE "ConsultationFinalStatus" AS ENUM ('COMPLETED', 'REFERRED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "age" INTEGER,
    "phone" TEXT,
    "gender" "Gender",
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacistProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "strNumber" TEXT NOT NULL,
    "profilePhotoUrl" TEXT,
    "bio" TEXT NOT NULL,
    "topics" TEXT[],
    "practiceLocation" TEXT NOT NULL,
    "serviceHours" TEXT NOT NULL,
    "experienceSummary" TEXT NOT NULL,
    "strDocumentUrl" TEXT,
    "verificationStatus" "PharmacistVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "availabilityStatus" "PharmacistAvailabilityStatus" NOT NULL DEFAULT 'OFFLINE',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacistProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationSession" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "pharmacistId" TEXT NOT NULL,
    "status" "ConsultationSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" "ConsultationMessageType" NOT NULL DEFAULT 'TEXT',
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationSummary" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "mainProblem" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "warning" TEXT NOT NULL,
    "followUpAdvice" TEXT NOT NULL,
    "finalStatus" "ConsultationFinalStatus" NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "PatientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacistProfile_userId_key" ON "PharmacistProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacistProfile_strNumber_key" ON "PharmacistProfile"("strNumber");

-- CreateIndex
CREATE INDEX "ConsultationSession_patientId_idx" ON "ConsultationSession"("patientId");

-- CreateIndex
CREATE INDEX "ConsultationSession_pharmacistId_idx" ON "ConsultationSession"("pharmacistId");

-- CreateIndex
CREATE INDEX "ConsultationSession_status_idx" ON "ConsultationSession"("status");

-- CreateIndex
CREATE INDEX "ConsultationMessage_sessionId_idx" ON "ConsultationMessage"("sessionId");

-- CreateIndex
CREATE INDEX "ConsultationMessage_senderId_idx" ON "ConsultationMessage"("senderId");

-- CreateIndex
CREATE INDEX "ConsultationAttachment_messageId_idx" ON "ConsultationAttachment"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationSummary_sessionId_key" ON "ConsultationSummary"("sessionId");

-- CreateIndex
CREATE INDEX "ConsultationSummary_createdBy_idx" ON "ConsultationSummary"("createdBy");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacistProfile" ADD CONSTRAINT "PharmacistProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSession" ADD CONSTRAINT "ConsultationSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSession" ADD CONSTRAINT "ConsultationSession_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationMessage" ADD CONSTRAINT "ConsultationMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConsultationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationMessage" ADD CONSTRAINT "ConsultationMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationAttachment" ADD CONSTRAINT "ConsultationAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ConsultationMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSummary" ADD CONSTRAINT "ConsultationSummary_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConsultationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSummary" ADD CONSTRAINT "ConsultationSummary_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
