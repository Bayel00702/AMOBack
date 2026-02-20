-- CreateTable
CREATE TABLE "ProductModerationLog" (
    "id" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductModerationLog_productId_idx" ON "ProductModerationLog"("productId");

-- AddForeignKey
ALTER TABLE "ProductModerationLog" ADD CONSTRAINT "ProductModerationLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductModerationLog" ADD CONSTRAINT "ProductModerationLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
