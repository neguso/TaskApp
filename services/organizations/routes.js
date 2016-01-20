var express = require('express');

var code = require('./organizations.js'),
		authorize = require('./authorize.js');


var router = express.Router();

router.get('/organizations', code.organizations.read);
router.get('/organizations/:id', code.organizations.get, code.organizations.get);
router.post('/organizations', code.organizations.create);
router.put('/organizations/:id', code.organizations.update, code.organizations.update);
router.delete('/organizations/:id', code.organizations.delete, code.organizations.delete);


module.exports = router;
