
var util = require('./index.js'),
		assert = require('assert');

var p_undefined,
		p_text = 'text',
		p_alphanumeric = '123abc',
		p_email = 'name@domain.com',
		p_text_int = '123',
		p_int = 123;

var v1 = util.validator.create(),
		res;

v1.optional(p_undefined, 'p_undefined');
assert(v1.errors().length === 0);

res = v1.optional(p_undefined, 'p_undefined').val();
assert(v1.errors().length === 0);

v1.optional(p_undefined, 'p_undefined').string();




var end = 1;






//validator.required(req.query.offset).number({ min: 0, max: 100 });
//validator.optional(req.query.sort).field(map);

//int().range(0, 100).min(0).max(100).val()
//string().trim().toLowerCase().toUpperCase().length(0, 100).values([]).match(regexp).isEmail().val()
//fields().values([]).val()

