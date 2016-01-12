
module.exports = {

	// validators //

	isBoolean: isBoolean,
	isString: isString,
	isEmail: isEmail,

	// sanitizers //
	toString: toString

};


function isBoolean(value)
{
	if(typeof value === 'boolean')
		return true;
	if(isString(value) && ['false', 'true', '0', '1'].indexOf(value.trim().toLowerCase()) !== -1)
		return true;
	return false;
}

function isString(value)
{
	return typeof value === 'string';
}

function isEmail(value)
{
	return isString(value) && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
}


function toBoolean(value)
{
	if(typeof value === 'boolean') return value;
	if(isString(value)) return ['true', '1'].indexOf(value.trim().toLowerCase()) !== -1;
	return false;
}

function toString(value)
{
	if(isString(value)) return value;
	if(typeof value === 'undefined' || value === null || isNaN(value)) return '';
	if(typeof value.toString === 'function') return value.toString();
	return value + '';
}
