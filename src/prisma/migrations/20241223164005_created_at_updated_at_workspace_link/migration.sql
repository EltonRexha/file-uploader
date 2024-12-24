/*
  Warnings:

  - You are about to drop the column `views` on the `workspaces` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `workspace_links` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workspace_links" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "views";
