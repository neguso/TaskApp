var util = require("util");


module.exports = {

	HttpError: HttpError, // base class
	//
	BadRequest: BadRequestError, // 400
	Unauthorized: UnauthorizedError, // 401
	Forbidden: ForbiddenError, // 403
	NotFound: NotFoundError, // 404
	InvalidArgument: InvalidArgumentError, // 409
	//...
	Internal: InternalError // 500
};


function HttpError() { }
HttpError.prototype.status = null;
HttpError.prototype.code = null;
HttpError.prototype.data = null;
HttpError.prototype.toString = function()
{
	return 'Error: ' + this.code + ', Status: ' + this.status + (this.data === null ? '' : ', Data: ' + this.data);
};
HttpError.prototype.json = function()
{
	var result = { error: this.code };
	if(this.data)
		result.data = this.data;
	return result;
};


function BadRequestError()
{
	this.status = 400;
	this.code = 'BadRequest';
}
util.inherits(BadRequestError, HttpError);


function UnauthorizedError()
{
	this.status = 401;
	this.code = 'Unauthorized';
}
util.inherits(UnauthorizedError, HttpError);


function ForbiddenError()
{
	this.status = 403;
	this.code = 'Forbidden';
}
util.inherits(ForbiddenError, HttpError);


function NotFoundError()
{
	this.status = 404;
	this.code = 'NotFound';
}
util.inherits(NotFoundError, HttpError);


function InvalidArgumentError(fields)
{
	this.status = 409;
	this.code = 'InvalidArgument';
	this.data = fields;
}
util.inherits(InvalidArgumentError, HttpError);


function InternalError()
{
	this.status = 500;
	this.code = 'InternalServerError';
}
util.inherits(InternalError, HttpError);
