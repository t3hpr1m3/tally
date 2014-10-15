/**
 * Module dependencies
 */
var request = require('request'),
	config = require('../config'),
	url = require('url');

/**
 * Builds an Auth url based on the given path.
 *
 * @param {string} path
 */
var authURL = function(path) {
	return url.format({
		protocol: 'https',
		hostname: config.auth_host,
		pathname: path
	});
}

/**
 * Exracts an auth token from the request headers.
 *
 * @param {object} req
 */
var extractToken = function(req) {
	var authorization_header = req.headers['authorization'];
	if (typeof authorization_header === 'undefined') {
		// token not provided
		return null;
	} else {
		console.log("authorization_header: " + authorization_header);
		var re = /^Token token=([a-zA-Z0-9]*)$/g
		var match = re.exec(authorization_header);
		var token = (match != null) ? match[1] : '';
		if (token === '') return null;
		return token;
	}
};

/**
 * Sends a token to the auth validate endpoint for validation.
 *
 * @param {string} token
 * @param {function} callback
 */
var checkToken = function(token, callback) {
	var options = {
		url: authURL('/auth/validate'),
		qs: { token: token },
		headers: { 'Accept': 'application/json' }
	};

	request.get(options, function(err, res, body) {
		if (!err && res.statusCode === 200) {
			var auth_response = JSON.parse(body);
			callback(null, typeof auth_response.error === 'undefined');
		} else {
			callback(new Error("Non-Success returned from auth: " + res.statusCode), null);
		}
	});
};

/**
 * Middleware to validate API requests.
 *
 * Extracts the auth token from the authorization header and validates
 * it with the Auth app.
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
var authenticate = function(req, res, next) {
	var token = extractToken(req);
	if (token == null) {
		res.status(401).send({ error: 'Invalid/Missing token' });
	} else {
		// validate the token with Auth
		checkToken(token, function(err, resp) {
			if (err || resp !== true) {
				res.status(401).send({ error: 'Invalid/Missing token' });
			} else {
				req.token = token;
				next();
			}
		});
	}
};

/**
 * Retrieves a particular customer's data from Auth.
 *
 * @param {string} token
 * @param {string} customer_id
 * @param {function} callback
 */
var getCustomer = function(token, customer_id, callback) {
	var options = {
		url: authURL('/customers'),
		qs: {token: token},
		headers: {'Accept': 'application/json'}
	};

	request.get(options, function(err, res, body) {
		if (!err && res.statusCode === 200) {
			findCustomer(customer_id, body, callback);
		} else {
			callback(err);
		}
	});

};

/**
 * Locates a particular customer's record in the Auth response.
 *
 * @param {string} customer_id
 * @param {string} body
 * @param {function} callback
 */
var findCustomer = function(customer_id, body, callback) {
	var customers = JSON.parse(body),
		customer = null;
	for (var i = 0; i < customers.length; i++) {
		if (customers[i].id === customer_id) {
			customer = customers[i];
			break;
		}
	}
	callback(null, customer);
};

module.exports = {
	authenticate: authenticate,
	getCustomer: getCustomer,
	checkToken: checkToken,
	extractToken: extractToken
};
