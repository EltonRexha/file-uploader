const { Router } = require('express');
const { renderGetStarted } = require('../controllers/indexController');
const router = Router();

router.get('/', renderGetStarted);

module.exports = router;
