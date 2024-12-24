/*
  Warnings:

  - A unique constraint covering the columns `[join_code]` on the table `workspace_links` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "workspace_links_join_code_key" ON "workspace_links"("join_code");
