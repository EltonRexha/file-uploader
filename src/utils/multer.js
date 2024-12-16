const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ dest: storage });

module.exports = upload;