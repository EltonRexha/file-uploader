/*
  Warnings:

  - A unique constraint covering the columns `[workspace_id,path]` on the table `folders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "folders_workspace_id_path_key" ON "folders"("workspace_id", "path");
