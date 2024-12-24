const { Router } = require('express');
const {
  createLink,
  viewWorkspaceContentByLink,
  downloadWorkspace,
  deleteWorkspaceLink,
} = require('../controllers/linkController');
const { isAuth } = require('../middlewares/authMiddleware');
const router = Router();

router.post('/create/:workspaceName', isAuth, createLink);
router.post('/delete/:code', isAuth, deleteWorkspaceLink);
router.get('/:code', viewWorkspaceContentByLink);
router.get('/download/:code', downloadWorkspace);

module.exports = router;
