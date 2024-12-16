/*
  Warnings:

  - You are about to drop the column `folder_id` on the `activities` table. All the data in the column will be lost.
  - Added the required column `folderId` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `activities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_folder_id_fkey";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "folder_id",
ADD COLUMN     "fileId" TEXT,
ADD COLUMN     "folderId" TEXT NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
