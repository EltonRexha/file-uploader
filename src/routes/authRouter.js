const { Router } = require('express');
const {
  getSignUpPage,
  createAccount,
  getLoginPage,
  postLogin,
  logout,
} = require('../controllers/authController');
const router = Router();

router.get('/sign-up', getSignUpPage);
router.post('/sign-up', createAccount);

router.get('/log-in', getLoginPage);
router.post('/log-in', postLogin);

router.post('/log-out', logout);
router.get('/log-out', logout);

module.exports = router;
