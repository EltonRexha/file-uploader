const prisma = require('../db/client');

async function getUsersPage(req, res) {
  const users = await prisma.user.findMany();
  const messages = req.flash('messages');
  res.render('users', { users, messages });
}

async function setRole(req, res, next) {
  const { userId, role } = req.body;
  const upperCaseRole = role.toUpperCase();

  if (upperCaseRole !== 'ADMIN' && upperCaseRole !== 'USER') {
    req.flash('messages', [{ msg: 'Invalid role given', error: true }]);
    res.redirect('/admin/users');

    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    req.flash('messages', [{ msg: 'User does not exist', error: true }]);
    res.redirect('/admin/users');
    return;
  }

  if (user.role === 'ADMIN') {
    req.flash('messages', [
      { msg: 'Cannot change the role of a admin', error: true },
    ]);
    res.redirect('/admin/users');
    return;
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: upperCaseRole,
    },
  });

  req.flash('messages', [{ msg: 'Successfuly changed the role' }]);
  res.redirect('/admin/users');
}

async function setStatus(req, res, next) {
  const { userId, status } = req.body;
  const upperCaseStatus = status.toUpperCase();

  if (upperCaseStatus !== 'BANNED' && upperCaseStatus !== 'ACTIVE') {
    req.flash('messages', [{ msg: 'Invalid status given', error: true }]);
    res.redirect('/admin/users');
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    req.flash('messages', [{ msg: 'User does not exist', error: true }]);
    res.redirect('/admin/users');
    return;
  }

  if (user.role === 'ADMIN') {
    req.flash('messages', [
      { msg: 'Cannot change the status of a admin', error: true },
    ]);
    res.redirect('/admin/users');
    return;
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: upperCaseStatus,
    },
  });

  req.flash('messages', [{ msg: 'Successfuly changed the status' }]);
  res.redirect('/admin/users');
}

module.exports = {
  getUsersPage,
  setRole,
  setStatus,
};
