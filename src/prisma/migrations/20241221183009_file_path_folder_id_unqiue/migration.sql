/*
  Warnings:

  - A unique constraint covering the columns `[path,folder_id]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "files_path_folder_id_key" ON "files"("path", "folder_id");
