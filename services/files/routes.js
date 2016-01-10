var express = require('express');

var files = require('./files.js'),
		authorize = require('./authorize.js');


var router = express.Router();

router.get('/:id', authorize.get, files.get);


module.exports = router;
