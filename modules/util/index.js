
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
		return Number.parseInt(value, 10);
	}

};
