const { Router } = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { getWorkspaces } = require('../middlewares/workspaceMiddleware.js');
const { getAllFilesPage, getSharedWorksapcesPage } = require('../controllers/dashboardController');
const router = Router();

router.get('/home/allFiles', isAuth, getWorkspaces, getAllFilesPage);
router.get('/sharedWorkspaces', isAuth, getWorkspaces, getSharedWorksapcesPage);

module.exports = router;
