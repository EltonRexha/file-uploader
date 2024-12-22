const { Router } = require('express');
const { createLink } = require('../controllers/linkController');
const { isAuth } = require('../middlewares/authMiddleware');
const router = Router();

router.get('/create/:workspaceName', isAuth, createLink);

module.exports = router;
