-- AlterTable
ALTER TABLE "Operation" ALTER COLUMN "start" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;