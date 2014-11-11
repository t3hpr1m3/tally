/**
 * Module dependencies
 */
var rfr = require('rfr'),
    request = require('request'),
    config = rfr('config'),
    errors = rfr('lib/errors'),
    url = require('url');

var auth = module.exports;

function sendError(res, code, message, errors) {
  var resp = { error: { message: message } };
  if (typeof errors !== 'undefined') {
    resp.error.errors = errors;
  }
  res.status(code).send(resp);
}

/**
 * Builds an Auth url based on the given path.
 *
 * @param {string} path
 */
auth.authURL = function(path) {
  return url.format({
    protocol: 'https',
    hostname: config.authHost,
    pathname: path
  });
}

/**
 * Exracts an auth token from the request headers.
 *
 * @param {object} req
 */
auth.extractToken = function(req) {
  var authorizationHeader = req.headers['authorization'];
  if (typeof authorizationHeader === 'undefined') {
    // token not provided
    return null;
  } else {
    var re = /^Token token=([a-zA-Z0-9]*)$/g
    var match = re.exec(authorizationHeader);
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
auth.checkToken = function(token, callback) {
  var options = {
    url: auth.authURL('/auth/validate'),
    qs: { 'token': token },
    headers: { 'Accept': 'application/json' }
  };

  request.get(options, function(err, res, body) {
    if (err) {
      callback(new Error('Error communicating with auth: ', err.message), null);
    } else if (res.statusCode != 200) {
      callback(new Error('Non-Success returned from auth: ' + res.statusCode), null);
    } else {
      var authResponse = JSON.parse(body);
      callback(null, typeof authResponse.error === 'undefined');
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
auth.authenticate = function(req, res, next) {
  var token = auth.extractToken(req);
  if (token == null) {
    sendError(res, 401, errors.api.invalid_auth_token);
  } else {
    // validate the token with Auth
    auth.checkToken(token, function(err, resp) {
      if (err) {
        sendError(res, 500, errors.api.communication_error);
      } else if (resp !== true) {
        sendError(res, 401, errors.api.invalid_auth_token);
      } else {
        req.authToken = token;
        next();
      }
    });
  }
};

/**
 * Retrieves a particular customer's data from Auth.
 *
 * @param {string} token
 * @param {string} customerId
 * @param {function} callback
 */
auth.getCustomer = function(token, customerId, callback) {
  if (customerId == null || customerId === '') {
    callback(null, null);
  } else {
    var options = {
      url: auth.authURL('/customers'),
      qs: {token: token},
      headers: {'Accept': 'application/json'}
    };

    request.get(options, function(err, res, body) {
      if (!err && res.statusCode === 200) {
        auth.findCustomer(customerId, body, callback);
      } else {
        callback(err);
      }
    });
  }
};

/**
 * Locates a particular customer's record in the Auth response.
 *
 * @param {string} customerId
 * @param {string} body
 * @param {function} callback
 */
auth.findCustomer = function(customerId, body, callback) {
  var customers = JSON.parse(body),
      customer = null;
  for (var i = 0; i < customers.length; i++) {
    if (customers[i].id === customerId) {
      customer = customers[i];
      break;
    }
  }
  callback(null, customer);
};
