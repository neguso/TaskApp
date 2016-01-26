
var util = require('./index.js'),
		assert = require('assert');

var p_undefined,
		p_text = 'teXt',
		p_alphanumeric = '123abc',
		p_email = 'name@domain.com',
		p_text_int = '123',
		p_int = 123,
		p_fields = ' a, B , c';

var v, res;

v = util.validator.create();

v.optional(p_undefined, 'p_undefined');
assert(v.errors().length === 0);

res = v.optional(p_undefined, 'p_undefined').val();
assert(v.errors().length === 0);
assert(typeof res === 'undefined');

res = v.optional(p_undefined, 'p_undefined').string().val();
assert(v.errors().length === 0);
assert(typeof res === 'undefined');


v = util.validator.create();
v.required(p_undefined, 'p_undefined');
assert(v.errors().length === 1 && v.errors()[0] === 'p_undefined');

v = util.validator.create();
res = v.required(p_undefined, 'p_undefined').string().val();
assert(v.errors().length === 1);
assert(typeof res === 'undefined');

v = util.validator.create();
res = v.required(p_undefined, 'p_undefined').string().trim().minlength().val();
assert(v.errors().length === 1);
assert(typeof res === 'undefined');

v = util.validator.create();
res = v.required(p_text, 'p_text').string().minlength(3).maxlength(5).toLower().length(4, 4).val();
assert(v.errors().length === 0);
assert(res === 'text');


v = util.validator.create();
v.required(p_fields, 'p_fields').fields();
assert(v.errors().length === 0);

res = v.required(p_fields, 'p_fields').fields().val();
assert(v.errors().length === 0);
assert(Array.isArray(res));
assert(res.length === 3);
assert(res[0] === 'a' && res[1] === 'B' && res[2] === 'c');

res = v.required(p_fields, 'p_fields').fields().toLower().values(['a', 'b', 'c', 'd']).val();
assert(v.errors().length === 0);

res = v.required(p_fields, 'p_fields').fields().toLower().values(['a', 'b', 'x', 'd']).val();
assert(v.errors().length === 1);


var end = 1;






//validator.required(req.query.offset).val();

//int().range(0, 100).min(0).max(100).val()
//string().trim().toLowerCase().toUpperCase().length(0, 100).values([]).match(regexp).isEmail().val()
//fields().toLower().toUpper().values([]).val()

