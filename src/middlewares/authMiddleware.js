const HttpError = require('../errors/httpError');

function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  next(new HttpError('Forbidden: User is not logged in', 403));
}

module.exports = {isAuth};
