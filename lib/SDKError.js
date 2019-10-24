var SDKError = function(message, error) {
	Error.call(this, message);
	Error.captureStackTrace(this, this.constructor);
	this.name = 'SDKError';
	this.message = message;
	if (error) this.inner = error;
};

SDKError.prototype = Object.create(Error.prototype);
SDKError.prototype.constructor = SDKError;

module.exports = SDKError;
