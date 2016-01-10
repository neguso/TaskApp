var express = require('express');

var accounts = require('./accounts.js'),
		authorize = require('./authorize.js');


var router = express.Router();

router.post('/register', accounts.register);
router.post('/login', accounts.login);
router.post('/logout', accounts.logout);
router.get('/status', accounts.getStatus);

router.get('/profile', accounts.getProfile);
router.post('/profile', accounts.updateProfile);
router.post('/invite', accounts.invite);


module.exports = router;
