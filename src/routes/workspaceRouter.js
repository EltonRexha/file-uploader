const { Router } = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { createWorkspace, uploadFiles, getWorkspaceContent, createFolder } = require('../controllers/workspaceController');
const { getWorkspaces } = require('../middlewares/workspaceMiddleware');
const router = Router();

router.post('/create', isAuth, createWorkspace);
router.post('/upload', isAuth, uploadFiles);
router.get('/:workspaceName', isAuth, getWorkspaces, getWorkspaceContent);
router.post('/folder/create', createFolder);

module.exports = router;
