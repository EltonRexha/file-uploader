const {Router} = require('express');
const { renderGetStarted } = require('../controllers/rootController');
const router = Router();

router.get('/', renderGetStarted);

module.exports = router;
