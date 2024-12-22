-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_parent_folder_id_fkey";

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
