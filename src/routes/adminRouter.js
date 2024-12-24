const { Router } = require('express');
const { isAuth, isAdmin } = require('../middlewares/authMiddleware');
const { getUsersPage, setRole, setStatus } = require('../controllers/adminController');
const { getWorkspaces } = require('../middlewares/workspaceMiddleware');
const router = Router();

router.get('/users', isAuth, getWorkspaces, isAdmin, getUsersPage);
router.post('/modifyRole', isAuth, isAdmin, setRole);
router.post('/modifyStatus', isAuth, isAdmin, setStatus);

module.exports = router;
