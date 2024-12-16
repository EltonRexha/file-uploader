/*
  Warnings:

  - You are about to drop the column `fileId` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `folderId` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `activities` table. All the data in the column will be lost.
  - Added the required column `folder_id` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspace_id` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_fileId_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_folderId_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_workspaceId_fkey";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "fileId",
DROP COLUMN "folderId",
DROP COLUMN "workspaceId",
ADD COLUMN     "file_id" TEXT,
ADD COLUMN     "folder_id" TEXT NOT NULL,
ADD COLUMN     "workspace_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "full_name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
