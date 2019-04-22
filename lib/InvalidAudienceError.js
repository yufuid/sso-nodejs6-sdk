var SDKError = require('./SDKError');

var InvalidAudienceError = function (message) {
    SDKError.call(this, message);
    this.name = 'InvalidAudienceError';
};

InvalidAudienceError.prototype = Object.create(SDKError.prototype);
InvalidAudienceError.prototype.constructor = InvalidAudienceError;

module.exports = InvalidAudienceError;
