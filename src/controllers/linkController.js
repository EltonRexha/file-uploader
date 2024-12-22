const { v4: uuid } = require('uuid');
const prisma = require('../db/client');
const HttpError = require('../errors/httpError');

async function createLink(req, res, next) {
  const { workspaceName } = req.params;

  const workspaceExist = await workspaceExists(workspaceName, req.user.id);
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

async function workspaceExists(workspaceName, userId) {
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
  createLink,
};
