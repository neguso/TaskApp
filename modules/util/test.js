
var util = require('./index.js'),
		assert = require('assert');

var p_undefined,
		p_text = ' teXt ',
		p_alphanumeric = ' 123abc ',
		p_email = ' name@domain.com ',
		p_text_int = ' 123 ',
		p_int = 123,
		p_fields = ' a, B , c ';

var v, res;

v = util.validator.create();
v.optional(p_undefined, 'p_undefined');
assert(v.errors().length === 0);
//
v = util.validator.create();
v.optional(p_text, 'p_text');
assert(v.errors().length === 0);

v = util.validator.create();
v.required(p_undefined, 'p_undefined');
assert(v.errors().length === 1);
//
v = util.validator.create();
v.required(p_text, 'p_text');
assert(v.errors().length === 0);


v = util.validator.create();
res = v.optional(p_undefined, 'p_undefined').val();
assert(typeof res === 'undefined');
//
v = util.validator.create();
res = v.optional(p_text, 'p_text').val();
assert(res == p_text);

v = util.validator.create();
res = v.required(p_undefined, 'p_undefined').val();
assert(typeof res === 'undefined');
//
v = util.validator.create();
res = v.required(p_text, 'p_text').val();
assert(res == p_text);


v = util.validator.create();
res = v.optional(p_undefined, 'p_undefined').string().val();
assert(v.errors().length === 0);
assert(typeof res === 'undefined');
//
v = util.validator.create();
res = v.optional(p_text, 'p_text').string().val();
assert(v.errors().length === 0);
assert(res == p_text);
//
v = util.validator.create();
res = v.optional(p_int, 'p_int').string().val();
assert(v.errors().length === 1);
assert(res == p_int.toString());
//
v = util.validator.create();
res = v.optional(p_int, 'p_int').int().val();
assert(v.errors().length === 0);
assert(res == p_int);
//
v = util.validator.create();
res = v.optional(p_text_int, 'p_text_int').int().val();
assert(v.errors().length === 0);
assert(res == parseInt(p_text_int));

v = util.validator.create();
res = v.required(p_undefined, 'p_undefined').string().val();
assert(v.errors().length === 1);
assert(typeof res === 'undefined');
//
v = util.validator.create();
res = v.required(p_text, 'p_text').string().val();
assert(v.errors().length === 0);
assert(res == p_text);
//
v = util.validator.create();
res = v.required(p_int, 'p_int').string().val();
assert(v.errors().length === 1);
assert(res == p_int.toString());
//
v = util.validator.create();
res = v.required(p_int, 'p_int').int().val();
assert(v.errors().length === 0);
assert(res == p_int);


v = util.validator.create();
res = v.optional(p_undefined, 'p_undefined').string().trim().val();
assert(v.errors().length === 0);
assert(typeof res === 'undefined');
//
v = util.validator.create();
res = v.optional(p_text, 'p_text').string().trim().val();
assert(v.errors().length === 0);
assert(res == p_text.trim());

v = util.validator.create();
res = v.required(p_undefined, 'p_undefined').string().trim().val();
assert(v.errors().length === 1);
assert(typeof res === 'undefined');
//
v = util.validator.create();
res = v.required(p_text, 'p_text').string().trim().val();
assert(v.errors().length === 0);
assert(res == p_text.trim());


v = util.validator.create();
res = v.optional(p_undefined, 'p_undefined').string().trim().minlength(5).val();
assert(v.errors().length === 0);
assert(typeof res === 'undefined');
//
v = util.validator.create();
res = v.optional(p_text, 'p_text').string().trim().minlength(5).val();
assert(v.errors().length === 1);
assert(res == p_text.trim());

v = util.validator.create();
res = v.required(p_undefined, 'p_undefined').string().trim().minlength(5).val();
assert(v.errors().length === 1);
assert(typeof res === 'undefined');
//
v = util.validator.create();
res = v.required(p_text, 'p_text').string().trim().minlength(5).val();
assert(v.errors().length === 1);
assert(res == p_text.trim());


v = util.validator.create();
v.optional(p_fields, 'p_fields').fields();
assert(v.errors().length === 0);

v = util.validator.create();
v.required(p_fields, 'p_fields').fields();
assert(v.errors().length === 0);


v = util.validator.create();
res = v.optional(p_fields, 'p_fields').fields().val();
assert(v.errors().length === 0);
assert(Array.isArray(res));
assert(res.length === 3);
assert(res[0] === 'a' && res[1] === 'B' && res[2] === 'c');

v = util.validator.create();
res = v.required(p_fields, 'p_fields').fields().val();
assert(v.errors().length === 0);
assert(Array.isArray(res));
assert(res.length === 3);
assert(res[0] === 'a' && res[1] === 'B' && res[2] === 'c');


v = util.validator.create();
res = v.optional(p_fields, 'p_fields').fields().toLower().values(['a', 'b', 'c', 'd']).val();
assert(v.errors().length === 0);

v = util.validator.create();
res = v.required(p_fields, 'p_fields').fields().toLower().values(['a', 'b', 'c', 'd']).val();
assert(v.errors().length === 0);


v = util.validator.create();
res = v.optional(p_fields, 'p_fields').fields().toLower().values(['a', 'b', 'x', 'd']).val();
assert(v.errors().length === 1);

v = util.validator.create();
res = v.required(p_fields, 'p_fields').fields().toLower().values(['a', 'b', 'x', 'd']).val();
assert(v.errors().length === 1);




var map = util.mapper.create(['id:_id', 'name', 'role:user.role']);
var d1 = map.decode({ _id: 123, name: 'dorel', user: { role: 'admin' } }, map.public);
var e1 = map.encode({ id: 123, name: 'dorel', role: 'admin' }, map.private);

var end;
