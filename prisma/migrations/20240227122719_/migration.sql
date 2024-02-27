-- AlterTable
ALTER TABLE "Operation" ALTER COLUMN "start" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "createdAt" DROP DEFAULT;
