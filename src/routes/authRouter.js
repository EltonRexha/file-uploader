const { Router } = require('express');
const { getSignUpPage, createAccount } = require('../controllers/authController');
const router = Router();

router.get('/sign-up', getSignUpPage);
router.post('/sign-up', createAccount);

module.exports = router;
