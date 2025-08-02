-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ORDERED', 'PENDING', 'RECEIVED', 'FINISHED', 'AVOIR', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'NORMAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'NORMAL',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sellingPrice" INTEGER NOT NULL,
    "costPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "real" INTEGER NOT NULL,
    "nomenclature" TEXT,
    "location" TEXT NOT NULL,
    "dci" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Standard',
    "family" TEXT NOT NULL,
    "isTaxed" BOOLEAN NOT NULL DEFAULT true,
    "min" INTEGER NOT NULL,
    "alert" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "expirationDate" DATE,
    "manufacturationDate" DATE,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicineFromProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceWithTax" INTEGER NOT NULL,
    "priceWithoutTax" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dci" TEXT,
    "providerId" TEXT NOT NULL,
    "expirationDate" DATE NOT NULL,

    CONSTRAINT "MedicineFromProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "abridgment" TEXT NOT NULL,
    "commonAccountNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "complementAdress" TEXT,
    "postalCode" INTEGER,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "telephone" TEXT[],
    "telecopie" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "rc" TEXT,
    "stat" TEXT,
    "nif" TEXT,
    "cif" TEXT,
    "collector" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min" INTEGER,
    "minQuantity" INTEGER,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderMedicine" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "medicineFromProviderId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "OrderMedicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "OrderStatus" NOT NULL DEFAULT 'ORDERED',

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "orderId" TEXT,
    "archivedOrderId" TEXT,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerName" TEXT NOT NULL,
    "orderCreationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchivedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MedicineToMedicineFromProvider" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_reference_key" ON "Medicine"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_MedicineToMedicineFromProvider_AB_unique" ON "_MedicineToMedicineFromProvider"("A", "B");

-- CreateIndex
CREATE INDEX "_MedicineToMedicineFromProvider_B_index" ON "_MedicineToMedicineFromProvider"("B");

-- AddForeignKey
ALTER TABLE "MedicineFromProvider" ADD CONSTRAINT "MedicineFromProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderMedicine" ADD CONSTRAINT "OrderMedicine_medicineFromProviderId_fkey" FOREIGN KEY ("medicineFromProviderId") REFERENCES "MedicineFromProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderMedicine" ADD CONSTRAINT "OrderMedicine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_providerName_fkey" FOREIGN KEY ("providerName") REFERENCES "Provider"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_archivedOrderId_fkey" FOREIGN KEY ("archivedOrderId") REFERENCES "ArchivedOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MedicineToMedicineFromProvider" ADD CONSTRAINT "_MedicineToMedicineFromProvider_A_fkey" FOREIGN KEY ("A") REFERENCES "Medicine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MedicineToMedicineFromProvider" ADD CONSTRAINT "_MedicineToMedicineFromProvider_B_fkey" FOREIGN KEY ("B") REFERENCES "MedicineFromProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

