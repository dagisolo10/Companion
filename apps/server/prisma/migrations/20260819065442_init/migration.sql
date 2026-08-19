/*
  Warnings:

  - Added the required column `name` to the `Party` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "name" TEXT NOT NULL;
