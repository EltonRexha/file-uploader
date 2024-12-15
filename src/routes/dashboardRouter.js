const { Router } = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { getWorkspaces } = require('../middlewares/workspaceMiddleware.js');
const { getAllFilesPage } = require('../controllers/dashboardController');
const router = Router();

router.get('/home/allFiles', isAuth, getWorkspaces, getAllFilesPage);

module.exports = router;
