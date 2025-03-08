/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Expense` table. All the data in the column will be lost.
  - Added the required column `title` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "paymentMethod",
DROP COLUMN "type",
ADD COLUMN     "title" TEXT NOT NULL;
