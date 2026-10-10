ALTER TABLE "DamageReport" ADD COLUMN "reviewNote" TEXT;
ALTER TABLE "PriceChangeRequest" ADD COLUMN "reviewNote" TEXT;

CREATE TABLE "StoredFile" (
    "id" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoredFile_pkey" PRIMARY KEY ("id")
);
