var SDKError = require('./SDKError');

var InvalidIDPIDError = function(message) {
	SDKError.call(this, message);
	this.name = 'InvalidIDPIDError';
};

InvalidIDPIDError.prototype = Object.create(SDKError.prototype);
InvalidIDPIDError.prototype.constructor = InvalidIDPIDError;

module.exports = InvalidIDPIDError;
