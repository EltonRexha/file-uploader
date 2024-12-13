const { Router } = require('express');
const { getSignUpPage } = require('../controllers/authController');
const router = Router();

router.get('/sign-up', getSignUpPage);

module.exports = router;
