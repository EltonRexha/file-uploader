const { v4: uuid } = require('uuid');
const prisma = require('../db/client');
const HttpError = require('../errors/httpError');
const downloadFolderHelper = require('../utils/downloadFolderHelper');
const archiver = require('archiver');

async function createLink(req, res, next) {
  const { workspaceName } = req.params;

  const workspaceExist = await workspaceExistsForUser(
    workspaceName,
    req.user.id
  );
  if (!workspaceExist) {
    next(new HttpError('Workspace not found', 404));
    return;
  }

  const joinCode = uuid();

  await prisma.workspaceLink.create({
    data: {
      join_code: joinCode,
      workspace: {
        connect: {
          name_userId: {
            name: workspaceName,
            userId: req.user.id,
          },
        },
      },
      userAdmin: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });

  req.flash('joinLink', joinCode);
  res.redirect(`/workspace/${workspaceName}`);
}

async function viewWorkspaceContentByLink(req, res, next) {
  const { code } = req.params;

  if (!req.query.path) {
    res.redirect(`?path=/`);
  }

  const contentPath = req.query.path;

  const workspace = await prisma.workspace.findFirst({
    where: {
      workspaceLink: {
        some: {
          join_code: code,
        },
      },
    },
  });

  if (!workspace) {
    next(new HttpError('Invalid link', 401));
    return;
  }

  const folders = await prisma.folder.findMany({
    where: {
      parentFolder: {
        path: contentPath,
      },
      workspace: {
        id: workspace.id,
      },
    },
  });

  const files = await prisma.file.findMany({
    where: {
      folder: {
        path: contentPath,
        workspace: {
          id: workspace.id,
        },
      },
    },
  });

  res.render('viewWorkspace.ejs', {
    code,
    folders,
    files,
    workspace,
  });
}

async function downloadWorkspace(req, res, next) {
  const { code } = req.params;

  const workspace = await prisma.workspace.findFirst({
    where: {
      workspaceLink: {
        some: {
          join_code: code,
        },
      },
    },
  });

  if (!workspace) {
    next(new HttpError('Invalid share url', 403));
    return;
  }

  const archive = archiver('zip', { zlib: { level: 9 } });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${workspace.name}.zip"`
  );

  archive.pipe(res);

  await downloadFolderHelper('/', workspace, archive);

  await prisma.activity.create({
    data: {
      activity: 'DOWNLOAD',
      workspace: {
        connect: {
          id: workspace.id,
        },
      },
    },
  });

  archive.finalize();
}

async function deleteWorkspaceLink(req, res) {
  const { code } = req.params;

  try {
    await prisma.workspaceLink.delete({
      where: {
        join_code: code,
      },
    });

    req.flash('confirmationMessages', [
      { msg: 'Successfuly deleted workspace link', error: false },
    ]);
  } catch (e) {
    req.flash('confirmationMessages', [
      { msg: 'Failed to delete workspace link', error: true },
    ]);
  }

  res.redirect(`/dashboard/sharedWorkspaces/?`);
}

async function workspaceExistsForUser(workspaceName, userId) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      name: workspaceName,
      user: {
        id: userId,
      },
    },
  });

  return !!workspace;
}

module.exports = {
  deleteWorkspaceLink,
  createLink,
  viewWorkspaceContentByLink,
  downloadWorkspace,
};
