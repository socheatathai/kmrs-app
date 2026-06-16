-- CreateEnum
CREATE TYPE "UserRegisterSource" AS ENUM ('LOCAL', 'GOOGLE');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "registerSource" "UserRegisterSource" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN "passwordResetTokenHash" TEXT,
ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_registerSource_idx" ON "User"("registerSource");
