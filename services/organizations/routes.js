var express = require('express');

var code = require('./organizations.js'),
		authorize = require('./authorize.js');


var router = express.Router();

router.get('/organizations', code.organizations.read);
router.get('/organizations/:id', code.organizations.get);
router.post('/organizations', code.organizations.create);
router.put('/organizations/:id', authorize.organizations.update, code.organizations.update);
router.delete('/organizations/:id', authorize.organizations.delete, code.organizations.delete);

router.get('/organizations/:id/users', code.organizations.readusers);
router.post('/organizations/:id/users/:user', code.organizations.updateuser);
router.delete('/organizations/:id/users/:user', code.organizations.deleteuser);

module.exports = router;
