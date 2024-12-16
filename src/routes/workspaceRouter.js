const { Router } = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { createWorkspace, uploadFiles } = require('../controllers/workspaceController');
const router = Router();

router.post('/create', isAuth, createWorkspace);
router.post('/upload', isAuth, uploadFiles);

module.exports = router;
