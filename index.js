var fs = require('fs');
var https = require('https');
var verify = require('./verify');
var sign = require('./sign');
var timer = require('timers');

/**
 * SDK Errors
 **/
var InvalidIDPIDError = require('./lib/InvalidIDPIDError');
var KeyNotAvailableError = require('./lib/KeyNotAvailableError');
var SDKError = require('./lib/SDKError');

/**
 * SDK Constants
 **/
var YUFU_AUTHORIZE_URL = 'https://idp.yufuid.com/sso/v1/authorize';
var YUFU_CONSUME_URL = 'https://portal.yufuid.com/api/v1/external/sso';
var YUFU_KEY_SERVICE_URL = 'https://idp.yufuid.com/api/v1/public/keys';
var DEFAULT_EXPIRES_IN = 300;
var DEFAULT_KEY_RENEW_INTERVAL = 86400000;
var MAX_RETRY_TIMES = 10;
var RETRY_INTERVAL = 300000;

/**
 * global vars
 **/
var yufuPublicKeys;
var retryTimes;

/**
 *
 **/
function init(options) {
	var yufuIssuer = 'cidp.sso';
	var state = '';
	var idpId;
	var audience = 'cidp.sso';
	var expiresIn;
	var myPrivateKey;
	var myPublicKey;

	if (!options) {
		throw new SDKError('options cannot be null or undefined');
	}

	var type = checkType(options.type);

	idpId = options.idpId;
	audience = options.audience;
	expiresIn = options.expiresIn || DEFAULT_EXPIRES_IN;
	tnt = options.tenant;

	if (type === 'idp' && !idpId) {
		throw new InvalidIDPIDError('IDP ID cannot be empty or null as IDP');
	}

	if (options.myPrivateKey) {
		myPrivateKey = {
			key: fs.readFileSync(options.myPrivateKey.path),
			kid: options.myPrivateKey.kid
		};
	}

	if (options.myPublicKey) {
		yufuPublicKeys = {
			key: fs.readFileSync(options.myPublicKey.path),
			kid: options.myPublicKey.kid
		};
	} else {
		renewKeys();
		timer.setInterval(
			renewKeys,
			options.interval || DEFAULT_KEY_RENEW_INTERVAL // Default to 24 hrs
		);
	}

	retryTimes = 0;

	var generateSignedJwt = function(payload) {
		if (!myPrivateKey) {
			throw new KeyNotAvailableError('My private key is not available.');
		}
		var payloadClone = JSON.parse(JSON.stringify(payload));
		payloadClone.expiresIn = payloadClone.expiresIn || expiresIn;
		payloadClone.issuer = payloadClone.issuer || idpId;
		payloadClone.audience = payloadClone.audience || audience;
		payloadClone.tnt = payload.tenant || tnt;
		payloadClone.state = payload.state || state;

		return sign(payloadClone, myPrivateKey);
	};

	var verifySignedJwt = function(token, onFinish) {
		var jwt = verify(token, yufuPublicKeys, onFinish);
		return jwt;
	};

	var generateRedirectUrl = function(payload) {
		var token = generateSignedJwt(payload);
		var redirectUrl =
			type == 'idp'
				? YUFU_CONSUME_URL + '?idp_token='
				: YUFU_AUTHORIZE_URL + '?sp_token=';
		var tenant = payload.tenant || tnt;
		return redirectUrl + token + '&tnt=' + tenant;
	};

	return {
		sign: generateSignedJwt,
		verify: verifySignedJwt,
		generateRedirectUrl: generateRedirectUrl
	};
}

function renewKeys() {
	https
		.get(YUFU_KEY_SERVICE_URL, res => {
			var rawData = '';
			res.on('data', chunk => {
				rawData += chunk;
			});
			res.on('end', () => {
				yufuPublicKeys = {}; // Reset all keys
				try {
					if (res.statusCode !== 200) {
						throw new KeyNotAvailableError(
							`Request Failed. Status Code: ${res.statusCode}`
						);
					}
					yufuPublicKeys = JSON.parse(rawData);
					retryTimes = 0;
				} catch (e) {
					if (retryTimes < MAX_RETRY_TIMES) {
						retryTimes++;
						console.error('retry to get public keys' + e.message);
						timer.setTimeout(renewKeys, RETRY_INTERVAL);
					} else {
						retryTimes = 0;
						throw e;
					}
				}
			});
		})
		.end();
}

function checkType(type) {
	try {
		if (type.toLowerCase() == 'idp') {
			return 'idp';
		} else if (type.toLowerCase() == 'sp') {
			return 'sp';
		} else {
			throw new SDKError('Invalid type: it should be either IDP or SP.');
		}
	} catch (ex) {
		throw new SDKError('Invalid type: it should be either IDP or SP.');
	}
}

module.exports = {
	init: init
};
