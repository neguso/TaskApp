var util = require('util');


exports.password = {

	isvalid: function(password)
	{
		return typeof password === 'string' && password.length > 4; 
	},

	encrypt: function(password)
	{
		return password;
	},

	equals: function(clear, encrypted)
	{
		return clear == encrypted;
	}

};


exports.token = {

	generate: function()
	{
		var ary = new Array(16);
		var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		for(var i = 0; i < ary.length; i++)
			ary[i] = chars.charAt(Math.floor(Math.random() * chars.length));
		return ary.join('');
	},

	isvalid: function(token)
	{
		return typeof token === 'string' && /[0-9a-zA-Z]{16}/.test(token);
	}

};


exports.parameter = {

	isvalidfield: function(field, map)
	{
		field = field.toLowerCase();
		return map.findIndex((m) => { return m.startsWith(field + ':'); }) !== -1;
	},

	/// Get invalid fields according to the map.
	getinvalidfields: function(fields, map)
	{
		var ary = [];
		fields.forEach((field, index, array) => { field = field.trim().toLowerCase(); if(ary.indexOf(field) === -1) ary.push(field); });
		return ary.filter((field, index, array) => { return map.findIndex((value) => { return value.startsWith(field + ':'); }) === -1; });
	},

	/// Filter valid fields according to the map and removes duplicates.
	getvalidfields: function(fields, map)
	{
		var ary = [];
		fields.forEach((field, index, array) => { field = field.trim().toLowerCase(); if(ary.indexOf(field) === -1) ary.push(field); });
		return ary.filter((field, index, array) => { return map.findIndex((value) => { return value.startsWith(field + ':'); }) !== -1; });
	},

	/// Copy specified fields[] from source{} to target{} according to the map[], returns the target object.
	/// Used to copy values from database objects to result.
	exportfields: function(source, fields, map, target)
	{
		// fields = array of public fields names
		// map = ['public:internal', ...];
		var result = target || {};
		fields.forEach((item) => {
			var field = item.trim().toLowerCase();
			for(var i = 0; i < map.length; i++)
			{
				var m = map[i].split(':');
				if(field == m[0])
				{
					result[field] = source[m[1]];
					break;
				}	
			}
		});
		return result;
	},

	/// Copy specified fields[] from source{} to target{} according to the map[], returns the target object.
	/// Used to copy values from request object to database objects.
	importfields: function(source, fields, map, target)
	{
		// fields = array of internal fields names
		// map = ['public:internal', ...];
		var result = target || {};
		fields.forEach((field) => {
			for(var i = 0; i < map.length; i++)
			{
				var m = map[i].split(':');
				if(field == m[1])
				{
					if(source.hasOwnProperty(m[0]))
						result[field] = source[m[0]];
					break;
				}	
			}
		});
		return result;
	}

};


exports.validator = {

	// validators //

	isBoolean: function(value)
	{
		if(typeof value === 'boolean')
			return true;
		if(typeof value === 'string' && ['false', 'true', '0', '1'].indexOf(value.trim().toLowerCase()) !== -1)
			return true;
		return false;
	},

	isString: function(value)
	{
		return typeof value === 'string';
	},

	isEmail: function(value)
	{
		return typeof value === 'string' && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
	},

	isAlphanumeric: function isAlphanumeric(value)
	{
		return typeof value === 'string' && /[a-zA-Z0-9]/.test(value);
	},

	isInt: function(value, options)
	{
		options = options || {};
		var n = Number.parseInt(value, 10);
		return n.toString() == value
			&& ((options.hasOwnProperty('min') && n >= options.min) || !options.hasOwnProperty('min'))
			&& ((options.hasOwnProperty('max') && n <= options.max) || !options.hasOwnProperty('max')); 
	},


	// sanitizers //
	toBoolean: function toBoolean(value)
	{
		if(typeof value === 'boolean') return value;
		if(typeof value === 'string') return ['true', '1'].indexOf(value.trim().toLowerCase()) !== -1;
		return false;
	},

	toString: function toString(value)
	{
		if(typeof value === 'string') return value;
		if(typeof value === 'undefined' || value === null || isNaN(value)) return '';
		if(typeof value.toString === 'function') return value.toString();
		return value + '';
	},

	toInt: function(value)
	{
		if(typeof value === 'number') return Math.trunc(value);
		return Number.parseInt(value, 10);
	},


	//

	create: function()
	{
		return new PresenceValidator(new ParametersValidator());
	}

};


function ParametersValidator()
{
	this.errors = [];
}
ParametersValidator.prototype.errors = null;
ParametersValidator.prototype.add = function(name)
{
	if(this.errors.indexOf(name) === -1)
		this.errors.push(name);
}


function PresenceValidator(validator)
{
	this.validator = validator;
}
PresenceValidator.prototype.optional = function(value, name) {
	return new TypeValidator(this.validator, value, name, typeof value === 'undefined');
};
PresenceValidator.prototype.required = function(value, name) {
	if(typeof value === 'undefined')
		this.validator.add(name);
	return new TypeValidator(this.validator, value, name, false);
};
PresenceValidator.prototype.errors = function()
{
	return this.validator.errors;
}

function BaseValidator(validator, value, name, ignore)
{
	this.validator = validator;
	this.value = value;
	this.name = name;
	this.ignore = ignore;
	this.valid = (validator.errors.length === 0);
}
BaseValidator.prototype.invalid = function()
{
	if(!this.valid) return;
	this.valid = false;
	this.validator.add(this.name);
};


function TypeValidator(validator, value, name, ignore)
{
	BaseValidator.call(this, validator, value, name, ignore);
}
util.inherits(TypeValidator, BaseValidator);
TypeValidator.prototype.int = function()
{
	if(!this.ignore && this.valid)
	{
		if(!exports.validator.isInt(this.value))
			this.invalid();
	}
	return new IntValidator(this.validator, this.value, this.name, this.ignore);
};
TypeValidator.prototype.string = function()
{
	if(!this.ignore && this.valid)
	{
		if(!exports.validator.isString(this.value))
			this.invalid();
	}
	return new StringValidator(this.validator, this.value, this.name, this.ignore);
};
TypeValidator.prototype.fields = function(separator)
{
	if(!this.ignore && this.valid)
	{
		if(!exports.validator.isString(this.value))
			this.invalid();
	}
	return new FieldsValidator(this.validator, this.value, this.name, this.ignore, separator);
};
TypeValidator.prototype.val = function()
{
	return this.value;
};


function IntValidator(validator, value, name, ignore)
{
	BaseValidator.call(this, validator, value, name, ignore);
}
util.inherits(IntValidator, BaseValidator);
IntValidator.prototype.val = function()
{
	return exports.validator.toInt(this.value);
};
IntValidator.prototype.min = function(min)
{
	if(!this.ignore && this.valid)
	{
		if(exports.validator.isInt(this.value))
		{
			var v = exports.validator.toInt(this.value);
			if(v < min)
				this.invalid();
		}
		else
			this.invalid();
	}
	return this;
};
IntValidator.prototype.max = function(max)
{
	if(!this.ignore && this.valid)
	{
		if(exports.validator.isInt(this.value))
		{
			var v = exports.validator.toInt(this.value);
			if(v > max)
				this.invalid();
		}
		else
			this.invalid();
	}
	return this;
};
IntValidator.prototype.range = function(min, max)
{
	if(!this.ignore && this.valid)
	{
		if(exports.validator.isInt(this.value))
		{
			var v = exports.validator.toInt(this.value);
			if(v < min || v > max)
				this.invalid();
		}
		else
			this.invalid();
	}
	return this;
};


function StringValidator(validator, value, name, ignore)
{
	BaseValidator.call(this, validator, value, name, ignore);
}
util.inherits(StringValidator, BaseValidator);
StringValidator.prototype.val = function()
{
	return exports.validator.toString(this.value);
};
StringValidator.prototype.trim = function()
{
	if(exports.validator.isString(this.value))
		this.value = this.value.trim();
	return this;
};
StringValidator.prototype.toLower = function()
{
	if(exports.validator.isString(this.value))
		this.value = this.value.toLowerCase();
	return this;
};
StringValidator.prototype.toUpper = function()
{
	if(exports.validator.isString(this.value))
		this.value = this.value.toUpperCase();
	return this;
};
StringValidator.prototype.minlength = function(min)
{
	if(!this.ignore && this.valid)
	{
		if(exports.validator.isString(this.value))
		{
			var v = exports.validator.toString(this.value);
			if(v.length < min)
				this.invalid();
		}
		else
			this.invalid();
	}
	return this;
};
StringValidator.prototype.maxlength = function(max)
{
	if(!this.ignore && this.valid)
	{
		if(exports.validator.isString(this.value))
		{
			var v = exports.validator.toString(this.value);
			if(v.length > max)
				this.invalid();
		}
		else
			this.invalid();
	}
	return this;
};
StringValidator.prototype.length = function(min, max)
{
	if(!this.ignore && this.valid)
	{
		if(exports.validator.isString(this.value))
		{
			var v = exports.validator.toString(this.value);
			if(arguments.length === 2)
			{
				if(v.length < min || v.length > max)
					this.invalid();
			}
			else if(arguments.length === 1)
			{
				if(v.length !== min)
					this.invalid();
			}
		}
		else
			this.invalid();
	}
	return this;
};
StringValidator.prototype.match = function(regexp)
{
	if(!this.ignore && this.valid)
	{
		if(exports.validator.isString(this.value))
		{
			var v = exports.validator.toString(this.value);
			if(!regexp.test(v))
				this.invalid();
		}
		else
			this.invalid();
	}
	return this;
};
StringValidator.prototype.values = function(ary)
{
	if(!this.ignore && this.valid)
	{
		if(exports.validator.isString(this.value))
		{
			var v = exports.validator.toString(this.value);
			if(ary.indexOf(v) === -1)
				this.invalid();
		}
		else
			this.invalid();
	}
	return this;
};
StringValidator.prototype.isEmail = function(ary)
{
	if(!this.ignore && this.valid)
	{
		if(exports.validator.isString(this.value))
		{
			var v = exports.validator.toString(this.value);
			if(!exports.validator.isEmail(v))
				this.invalid();
		}
		else
			this.invalid();
	}
	return this;
};


function FieldsValidator(validator, value, name, ignore, separator)
{
	BaseValidator.call(this, validator, value, name, ignore);
	this.separator = separator || ',';
}
util.inherits(FieldsValidator, BaseValidator);
FieldsValidator.prototype.val = function()
{
	var val = exports.validator.toString(this.value).trim();
	if(val.length === 0) return [];
	return val.split(new RegExp('\\s*' + this.separator + '\\s*'));
};
FieldsValidator.prototype.toLower = function()
{
	if(exports.validator.isString(this.value))
		this.value = this.value.toLowerCase();
	return this;
};
FieldsValidator.prototype.toUpper = function()
{
	if(exports.validator.isString(this.value))
		this.value = this.value.toUpperCase();
	return this;
};
FieldsValidator.prototype.values = function(ary)
{
	if(!this.ignore && this.valid)
	{
		if(this.val().findIndex((field) => { return ary.indexOf(field) === -1; }) !== -1)
			this.invalid();
	}
	return this;
};

