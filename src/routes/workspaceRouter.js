const { Router } = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { createWorkspace, uploadFiles, getWorkspaceContent } = require('../controllers/workspaceController');
const { getWorkspaces } = require('../middlewares/workspaceMiddleware');
const router = Router();

router.post('/create', isAuth, createWorkspace);
router.post('/upload', isAuth, uploadFiles);
router.get('/:workspaceName', isAuth, getWorkspaces, getWorkspaceContent);

module.exports = router;
