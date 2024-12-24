const { Router } = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { getWorkspaces } = require('../middlewares/workspaceMiddleware.js');
const { getAllFilesPage, getSharedWorksapcesPage, getWorksapceActivitesPage } = require('../controllers/dashboardController');
const router = Router();

router.get('/home/allFiles', isAuth, getWorkspaces, getAllFilesPage);
router.get('/sharedWorkspaces', isAuth, getWorkspaces, getSharedWorksapcesPage);
router.get('/activities', isAuth, getWorkspaces, getWorksapceActivitesPage);

module.exports = router;
