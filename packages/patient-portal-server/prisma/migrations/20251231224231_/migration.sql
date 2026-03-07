-- CreateEnum
CREATE TYPE "PortalUserRole" AS ENUM ('PATIENT', 'EXTERNAL_CONSULTANT', 'INTERNAL');

-- CreateEnum
CREATE TYPE "PortalUserStatus" AS ENUM ('INVITED', 'ACTIVE', 'DISABLED');

-- CreateTable
CREATE TABLE "PortalUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "PortalUserRole" NOT NULL,
    "status" "PortalUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "inviteToken" TEXT,
    "inviteExpiresAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "corePatientId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT,
    "communicationPreferences" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalConsultant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialty" TEXT,
    "organization" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalConsultant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationReferral" (
    "id" TEXT NOT NULL,
    "coreReferralId" TEXT,
    "corePatientId" TEXT,
    "patientProfileId" TEXT,
    "requestedSpecialty" TEXT,
    "priority" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationCase" (
    "id" TEXT NOT NULL,
    "referralId" TEXT,
    "patientProfileId" TEXT NOT NULL,
    "consultantId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "title" TEXT,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentSlot" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "subject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "filename" TEXT,
    "storageKey" TEXT,
    "contentType" TEXT,
    "size" INTEGER,
    "uploadedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_email_key" ON "PortalUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_inviteToken_key" ON "PortalUser"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_resetToken_key" ON "PortalUser"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "PatientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_corePatientId_key" ON "PatientProfile"("corePatientId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalConsultant_userId_key" ON "ExternalConsultant"("userId");

-- CreateIndex
CREATE INDEX "ConsultationReferral_coreReferralId_idx" ON "ConsultationReferral"("coreReferralId");

-- CreateIndex
CREATE INDEX "ConsultationReferral_corePatientId_idx" ON "ConsultationReferral"("corePatientId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationCase_referralId_key" ON "ConsultationCase"("referralId");

-- CreateIndex
CREATE INDEX "ConsultationCase_patientProfileId_idx" ON "ConsultationCase"("patientProfileId");

-- CreateIndex
CREATE INDEX "ConsultationCase_consultantId_idx" ON "ConsultationCase"("consultantId");

-- CreateIndex
CREATE INDEX "ConsultationCase_status_idx" ON "ConsultationCase"("status");

-- CreateIndex
CREATE INDEX "AppointmentSlot_caseId_idx" ON "AppointmentSlot"("caseId");

-- CreateIndex
CREATE INDEX "AppointmentSlot_status_idx" ON "AppointmentSlot"("status");

-- CreateIndex
CREATE INDEX "AppointmentSlot_start_idx" ON "AppointmentSlot"("start");

-- CreateIndex
CREATE INDEX "MessageThread_caseId_idx" ON "MessageThread"("caseId");

-- CreateIndex
CREATE INDEX "Message_threadId_idx" ON "Message"("threadId");

-- CreateIndex
CREATE INDEX "Message_senderUserId_idx" ON "Message"("senderUserId");

-- CreateIndex
CREATE INDEX "ConsultationDocument_caseId_idx" ON "ConsultationDocument"("caseId");

-- CreateIndex
CREATE INDEX "ConsultationDocument_type_idx" ON "ConsultationDocument"("type");

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalConsultant" ADD CONSTRAINT "ExternalConsultant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationReferral" ADD CONSTRAINT "ConsultationReferral_patientProfileId_fkey" FOREIGN KEY ("patientProfileId") REFERENCES "PatientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationCase" ADD CONSTRAINT "ConsultationCase_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "ConsultationReferral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationCase" ADD CONSTRAINT "ConsultationCase_patientProfileId_fkey" FOREIGN KEY ("patientProfileId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationCase" ADD CONSTRAINT "ConsultationCase_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "ExternalConsultant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentSlot" ADD CONSTRAINT "AppointmentSlot_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ConsultationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ConsultationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationDocument" ADD CONSTRAINT "ConsultationDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ConsultationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
