/*
  Warnings:

  - You are about to drop the column `name` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `services` table. All the data in the column will be lost.
  - Added the required column `categoryName` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceName` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "name",
ADD COLUMN     "categoryName" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "name",
ADD COLUMN     "serviceName" VARCHAR(255) NOT NULL;
