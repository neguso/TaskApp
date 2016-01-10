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
HttpError.prototype.message = null;
HttpError.prototype.toString = function()
{
	return 'Error: ' + this.code + ', Status: ' + this.status + (this.message === null ? '' : ', Message: ' + this.message);
};


function BadRequestError()
{
	this.status = 400;
	this.code = 'Bad Request';
	this.message = arguments.length > 0 ? arguments[0] : null;
}
util.inherits(BadRequestError, HttpError);


function UnauthorizedError()
{
	this.status = 401;
	this.code = 'Unauthorized';
	this.message = arguments.length > 0 ? arguments[0] : null;
}
util.inherits(UnauthorizedError, HttpError);


function ForbiddenError()
{
	this.status = 403;
	this.code = 'Forbidden';
	this.message = arguments.length > 0 ? arguments[0] : null;
}
util.inherits(ForbiddenError, HttpError);


function NotFoundError()
{
	this.status = 404;
	this.code = 'Not Found';
	this.message = arguments.length > 0 ? arguments[0] : null;
}
util.inherits(NotFoundError, HttpError);


function InvalidArgumentError()
{
	this.status = 409;
	this.code = 'Invalid Argument';
	this.message = arguments.length > 0 ? arguments[0] : null;
}
util.inherits(InvalidArgumentError, HttpError);


function InternalError()
{
	this.status = 500;
	this.code = 'Internal Server Error';
	this.message = arguments.length > 0 ? arguments[0] : null;
}
util.inherits(InternalError, HttpError);
