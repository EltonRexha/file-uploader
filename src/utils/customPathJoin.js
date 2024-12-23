const path = require('path');

function customPathJoin(...segments) {
  const joinedPath = path.join(...segments);
  return joinedPath.replace(/\\/g, '/'); // Replaces backslashes with forward slashes on Windows
}

module.exports = customPathJoin;