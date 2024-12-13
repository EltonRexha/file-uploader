const { Router } = require('express');
const { getSignUpPage, createAccount, getLoginPage } = require('../controllers/authController');
const router = Router();

router.get('/sign-up', getSignUpPage);
router.post('/sign-up', createAccount)
router.get('/log-in', getLoginPage);;

module.exports = router;
