-- CreateTable
CREATE TABLE "buyer_preferences" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "cuisineAffinities" JSONB NOT NULL DEFAULT '{}',
    "spiceTolerance" INTEGER NOT NULL DEFAULT 3,
    "dietaryTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredPortion" TEXT,
    "avgBudgetMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgBudgetMax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_circles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "radiusKm" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "circle_members" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorProfileId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "circle_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_orders" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "foodName" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "targetServings" INTEGER NOT NULL,
    "filledServings" INTEGER NOT NULL DEFAULT 0,
    "pricePerServing" DECIMAL(10,2) NOT NULL,
    "totalDeliveryFee" DECIMAL(10,2) NOT NULL,
    "deliveryFeePerServing" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deliveryWindow" TIMESTAMP(3) NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_order_slots" (
    "id" TEXT NOT NULL,
    "groupOrderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "servings" INTEGER NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_order_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buyer_preferences_buyerId_key" ON "buyer_preferences"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "circle_members_circleId_userId_key" ON "circle_members"("circleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_order_slots_groupOrderId_buyerId_key" ON "group_order_slots"("groupOrderId", "buyerId");

-- AddForeignKey
ALTER TABLE "buyer_preferences" ADD CONSTRAINT "buyer_preferences_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "food_circles"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profiles"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "group_orders" ADD CONSTRAINT "group_orders_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "food_circles"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "group_orders" ADD CONSTRAINT "group_orders_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "group_orders" ADD CONSTRAINT "group_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "group_order_slots" ADD CONSTRAINT "group_order_slots_groupOrderId_fkey" FOREIGN KEY ("groupOrderId") REFERENCES "group_orders"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "group_order_slots" ADD CONSTRAINT "group_order_slots_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT;
