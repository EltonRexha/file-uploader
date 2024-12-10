const {Router} = require('express');
const { renderHomePage } = require('../controllers/rootController');
const router = Router();

router.get('/', renderHomePage);

module.exports = router;
