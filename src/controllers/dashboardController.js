const prisma = require('../db/client');

async function getAllFilesPage(req, res) {
  const query = req.query;
  const showCreateWorkspaceModal = query.workspaceModal;

  const folders = await prisma.folder.findMany({
    where: {
      NOT: {
        path: '/',
      },
      workspace: {
        user: {
          id: req.user.id,
        },
      },
    },
    include: {
      workspace: true,
    },
  });

  const files = await prisma.file.findMany({
    where: {
      folder: {
        workspace: {
          user: {
            id: req.user.id,
          },
        },
      },
    },
    include: {
      folder: {
        include: {
          workspace: true,
        },
      },
    },
  });

  res.locals.folders = folders;
  res.locals.files = files;

  if (showCreateWorkspaceModal) {
    const errors = req.flash('createWorkspaceErrors');

    res.render('allFiles', {
      showCreateWorkspaceModal,
      errors,
    });
    return;
  }
  res.render('allFiles');
}

async function getSharedWorksapcesPage(req, res) {
  const confirmationMessages = req.flash('confirmationMessages');
  const workspacesLinks = await prisma.workspaceLink.findMany({
    where: {
      userAdmin: {
        id: req.user.id,
      },
    },

    include: {
      workspace: true,
    },
  });

  res.render('sharedWorkspaces', {
    workspacesLinks,
    confirmationMessages,
  });
}


module.exports = {
  getAllFilesPage,
  getSharedWorksapcesPage,
};
