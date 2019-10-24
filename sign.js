var jwt = require('jsonwebtoken');

module.exports = function(payload, privateKey) {
	var options = {
		algorithm: 'RS256',
		expiresIn: payload.expiresIn,
		audience: payload.audience,
		subject: payload.subject,
		issuer: payload.issuer,
		//state: payload.state || '',
		headers: {
			kid: privateKey.kid || payload.issuer
		}
	};

	delete payload.subject;
	delete payload.expiresIn;
	delete payload.issuer;
	delete payload.audience;
	delete payload.issuer;
	delete payload.tenant;

	return jwt.sign(payload, privateKey.key, options);
};
