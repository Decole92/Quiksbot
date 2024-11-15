-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Plans" AS ENUM ('STANDARD', 'PRO', 'ULTIMATE');

-- CreateEnum
CREATE TYPE "botType" AS ENUM ('Defaults', 'Sales', 'Services', 'Support', 'Custom');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'ai');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('message_text', 'contact_form', 'appointment_form');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('light', 'dark', 'system');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullname" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "stripeId" TEXT,
    "openAIkey" TEXT,
    "credits" INTEGER DEFAULT 0,
    "MailId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "host" TEXT NOT NULL DEFAULT 'smtp.hostinger.com',
    "port" INTEGER NOT NULL DEFAULT 465,
    "secure" BOOLEAN NOT NULL DEFAULT true,
    "userEmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID,

    CONSTRAINT "Mail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Website" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "weblinks" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "length" TEXT NOT NULL,
    "sourceId" UUID,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Characteristic" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "characteristic" TEXT NOT NULL,
    "sourceId" UUID,

    CONSTRAINT "Characteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfFile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fileName" TEXT NOT NULL,
    "file" BYTEA NOT NULL,
    "sourceId" UUID,

    CONSTRAINT "PdfFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatBot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "greetings" TEXT,
    "botIcon" TEXT,
    "icon" TEXT,
    "iconPosition" TEXT NOT NULL DEFAULT 'right',
    "theme" "Theme" NOT NULL DEFAULT 'light',
    "watermark" BOOLEAN NOT NULL DEFAULT true,
    "userMessageBgColor" TEXT DEFAULT '#E1B177',
    "chatModel" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
    "botType" "botType" NOT NULL DEFAULT 'Defaults',
    "getDetails" BOOLEAN NOT NULL DEFAULT false,
    "prompt" TEXT,
    "role" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceId" UUID,
    "userId" UUID,

    CONSTRAINT "ChatBot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatbotId" UUID,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessHours" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "appointmentId" UUID,

    CONSTRAINT "BusinessHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentType" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "typeName" TEXT NOT NULL,
    "description" TEXT,
    "appointmentId" UUID,

    CONSTRAINT "AppointmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentClient" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "confirmationToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "tokenUsed" BOOLEAN NOT NULL,
    "selectedDate" TIMESTAMP(3) NOT NULL,
    "appointmentId" UUID,
    "appointmentType" TEXT NOT NULL,
    "selectedTime" TEXT NOT NULL,

    CONSTRAINT "AppointmentClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Billings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan" "Plans" NOT NULL DEFAULT 'STANDARD',
    "userId" UUID,

    CONSTRAINT "Billings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockPages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "address" TEXT NOT NULL,
    "chatbotId" UUID,

    CONSTRAINT "BlockPages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilterQuestions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "answered" TEXT,

    CONSTRAINT "FilterQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirstQuestion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "chatbotId" UUID,

    CONSTRAINT "FirstQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "name" TEXT,
    "country" TEXT,
    "city" TEXT,
    "lat" TEXT,
    "lng" TEXT,
    "chatbotId" UUID,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "live" BOOLEAN NOT NULL DEFAULT false,
    "mailed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message" TEXT NOT NULL,
    "role" "Role",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "Type" DEFAULT 'message_text',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chatRoomId" UUID,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject" TEXT NOT NULL,
    "customers" TEXT[],
    "template" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from" TEXT NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mail_userId_key" ON "Mail"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatBot_sourceId_key" ON "ChatBot"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_chatbotId_key" ON "Appointment"("chatbotId");

-- CreateIndex
CREATE UNIQUE INDEX "Billings_userId_key" ON "Billings"("userId");

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Characteristic" ADD CONSTRAINT "Characteristic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdfFile" ADD CONSTRAINT "PdfFile_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBot" ADD CONSTRAINT "ChatBot_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBot" ADD CONSTRAINT "ChatBot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "ChatBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessHours" ADD CONSTRAINT "BusinessHours_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentType" ADD CONSTRAINT "AppointmentType_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentClient" ADD CONSTRAINT "AppointmentClient_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billings" ADD CONSTRAINT "Billings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockPages" ADD CONSTRAINT "BlockPages_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "ChatBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirstQuestion" ADD CONSTRAINT "FirstQuestion_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "ChatBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "ChatBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
