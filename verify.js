var jwt = require('jsonwebtoken');
var KeyNotAvailableError = require('./lib/KeyNotAvailableError');

var publicKeys = {};

module.exports = function(token, publicKeys, onFinish) {
	var payload = jwt.decode(token, { complete: true });
	var kid = payload && payload.header && payload.header.kid;
	return jwt.verify(token, publicKeys.key, { algorithm: 'RS256' }, onFinish);
};
