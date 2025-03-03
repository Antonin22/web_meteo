var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
  // Renvoyer le fichier HTML Vue au lieu du template Pug
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

module.exports = router;