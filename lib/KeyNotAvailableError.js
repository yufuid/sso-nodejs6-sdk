var SDKError = require('./SDKError');

var KeyNotAvailableError = function (message) {
    SDKError.call(this, message);
    this.name = 'KeyNotAvailableError';
};

KeyNotAvailableError.prototype = Object.create(SDKError.prototype);
KeyNotAvailableError.prototype.constructor = KeyNotAvailableError;

module.exports = KeyNotAvailableError;
