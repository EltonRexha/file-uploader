const prisma = require('../db/client');
const customPathJoin = require('./customPathJoin');
const supabase = require('./supabase');

async function downloadFolderHelper(path, workspace, archive) {
  const folders = await prisma.folder.findMany({
    where: {
      parentFolder: {
        path: path,
      },
      workspace: {
        id: workspace.id,
      },
    },
  });

  const files = await prisma.file.findMany({
    where: {
      folder: {
        path: path,
        workspace: {
          id: workspace.id,
        },
      },
    },
  });

  for (let file of files) {
    const { data, error } = await supabase.storage
      .from(process.env.BUCKET_NAME)
      .download(customPathJoin(workspace.userId, workspace.name, file.path));

    if (error) {
      throw new HttpError('Error downloading files', 500);
    }

    const buffer = await data.arrayBuffer();
    archive.append(Buffer.from(buffer), {
      name: customPathJoin(path, file.name),
    });
  }

  const promises = [];

  for (let folder of folders) {
    promises.push(downloadFolderHelper(folder.path, workspace, archive));
  }

  await Promise.all(promises);
}

module.exports = downloadFolderHelper;