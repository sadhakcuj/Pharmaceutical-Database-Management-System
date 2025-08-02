-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_medicineFromProviderId_fkey";

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "medicineFromProviderId";

-- CreateTable
CREATE TABLE "_MedicineToMedicineFromProvider" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MedicineToMedicineFromProvider_AB_unique" ON "_MedicineToMedicineFromProvider"("A", "B");

-- CreateIndex
CREATE INDEX "_MedicineToMedicineFromProvider_B_index" ON "_MedicineToMedicineFromProvider"("B");

-- AddForeignKey
ALTER TABLE "_MedicineToMedicineFromProvider" ADD CONSTRAINT "_MedicineToMedicineFromProvider_A_fkey" FOREIGN KEY ("A") REFERENCES "Medicine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MedicineToMedicineFromProvider" ADD CONSTRAINT "_MedicineToMedicineFromProvider_B_fkey" FOREIGN KEY ("B") REFERENCES "MedicineFromProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

