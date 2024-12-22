-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_folder_id_fkey";

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
