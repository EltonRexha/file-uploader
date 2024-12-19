/*
  Warnings:

  - A unique constraint covering the columns `[name,user_id]` on the table `workspaces` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "workspaces_name_user_id_key" ON "workspaces"("name", "user_id");
