const { Router } = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { createWorkspace } = require('../controllers/workspaceController');
const router = Router();

router.post('/create', isAuth, createWorkspace);

module.exports = router;
