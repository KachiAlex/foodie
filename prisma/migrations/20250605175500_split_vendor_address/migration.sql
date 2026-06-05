-- Drop old single address column and add structured address columns
ALTER TABLE "vendor_profiles" DROP COLUMN "address";
ALTER TABLE "vendor_profiles" ADD COLUMN "streetAddress" TEXT NOT NULL DEFAULT '';
ALTER TABLE "vendor_profiles" ADD COLUMN "city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "vendor_profiles" ADD COLUMN "state" TEXT NOT NULL DEFAULT '';
