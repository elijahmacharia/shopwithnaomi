-- AlterTable
ALTER TABLE "Sale" ADD COLUMN "clientRequestId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "clientRequestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Sale_clientRequestId_key" ON "Sale"("clientRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_clientRequestId_key" ON "Order"("clientRequestId");
