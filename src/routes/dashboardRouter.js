const { Router } = require('express');
const {isAuth} = require('../middlewares/authMiddleware');
const {getHomePage} = require('../controllers/dashboardController');
const router = Router();

router.get('/home', isAuth, getHomePage);

module.exports = router;
