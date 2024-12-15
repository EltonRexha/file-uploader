const prisma = require('../db/client');

async function getWorkspaces(req, res, next) {
  const user = req.user;
  const workspaces = await prisma.workspace.findMany({
    where: {
      user: {
        id: user.id,
      },
    },
  });

  res.locals.workspaces = workspaces;
  next();
}

module.exports = {
  getWorkspaces,
};
