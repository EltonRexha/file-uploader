/*
  Warnings:

  - You are about to drop the column `extension` on the `files` table. All the data in the column will be lost.
  - Added the required column `mime_type` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" DROP COLUMN "extension",
ADD COLUMN     "mime_type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Extension";
