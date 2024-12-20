const { Router } = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { createWorkspace, uploadFiles, getWorkspaceContent, createFolder, downloadWorkspace } = require('../controllers/workspaceController');
const { getWorkspaces } = require('../middlewares/workspaceMiddleware');
const router = Router();

router.post('/create', isAuth, createWorkspace);
router.post('/upload', isAuth, uploadFiles);
router.get('/:workspaceName', isAuth, getWorkspaces, getWorkspaceContent);
router.post('/folder/create', createFolder);
router.get('/download/:workspaceName', isAuth, downloadWorkspace);

module.exports = router;
