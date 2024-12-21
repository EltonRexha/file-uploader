-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_folder_id_fkey";

-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "folder_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
