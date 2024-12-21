const { Router } = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const {
  createWorkspace,
  uploadFiles,
  getWorkspaceContent,
  createFolder,
  downloadWorkspace,
  deleteFile,
  deleteFolder,
} = require('../controllers/workspaceController');
const { getWorkspaces } = require('../middlewares/workspaceMiddleware');
const router = Router();

router.post('/create', isAuth, createWorkspace);
router.post('/upload', isAuth, uploadFiles);
router.get('/:workspaceName', isAuth, getWorkspaces, getWorkspaceContent);
router.post('/folder/create', isAuth, createFolder);
router.get('/download/:workspaceName', isAuth, downloadWorkspace);
router.post('/delete/folder', isAuth, deleteFolder);
router.post('/delete/file', isAuth, deleteFile);

module.exports = router;
