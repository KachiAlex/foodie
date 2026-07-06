-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'converted', 'cancelled');

-- CreateTable
CREATE TABLE "vendor_market_offers" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "servings" INTEGER,
    "deliveryDate" TIMESTAMP(3),
    "note" TEXT,
    "proposedPrice" DECIMAL(10,2) NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_market_offers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vendor_market_offers" ADD CONSTRAINT "vendor_market_offers_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_market_offers" ADD CONSTRAINT "vendor_market_offers_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_market_offers" ADD CONSTRAINT "vendor_market_offers_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
