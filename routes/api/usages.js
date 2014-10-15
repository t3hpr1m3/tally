/**
 * Module dependencies.
 */
var express = require('express'),
	router = module.exports = express.Router(),
	auth = require('../../lib/auth');

var validateParams = function(req, res, next) {
	var errors = [];
	if (req.body.customer_id == null) {
		errors.push('customer_id is required');
	}
	if (req.body.from == null) {
		errors.push('from is required');
	}
	if (req.body.to == null) {
		errors.push('to is required');
	}
	if (req.body.text == null) {
		errors.push('text is required');
	}
	if (errors.length > 0) {
		res.status(400).send({ errors: errors});
	} else {
		next();
	}
};

router.post('/', validateParams);
router.post('/', function(req, res) {
	var customer_id = req.body.customer_id;
	var from = req.body.from;
	var to = req.body.to;
	var text = req.body.text;
	var auth_token = auth.extractToken(req);

	auth.getCustomer(auth_token, customer_id, function(err, customer) {
		if (customer != null) {
			res.json({ status: 0, message: "You Posted!" });
		} else {
			res.status(400).send({ error: 'Invalid customer_id' });
		}
	});
});
