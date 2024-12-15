const { Router } = require('express');
const {isAuth} = require('../middlewares/authMiddleware');
const { getAllFilesPage } = require('../controllers/dashboardController');
const router = Router();

router.get('/home/allFiles', isAuth, getAllFilesPage);

module.exports = router;
