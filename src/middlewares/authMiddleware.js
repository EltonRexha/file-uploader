const prisma = require('../db/client');
const HttpError = require('../errors/httpError');

async function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    const active = await isActive(req.user.id); 
    if (!active) {
      next(new HttpError('Forbidden: User is banned', 403));
      return;
    }
    const role = await getRole(req.user.id);
    res.locals.role = role;

    next();
    return;
  }

  next(new HttpError('Forbidden: User is not logged in', 403));
}

async function isActive(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user.status === 'ACTIVE';
}

async function getRole(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user.role;
}

async function isAdmin(req, res, next) {
  if (res.locals.role === 'ADMIN') {
    next();
    return;
  }

  next(new HttpError('Unauthenticated', 403));
}

module.exports = { isAuth, isAdmin };
