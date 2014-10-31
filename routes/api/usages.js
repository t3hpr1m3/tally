/**
 * Module dependencies.
 */
var express = require('express'),
  router = module.exports = express.Router(),
  auth = require('../../lib/auth'),
  models = require('../../models'),
  errors = require('../../lib/errors');

router.post('/', function(req, res, next) {
  var usage = new models.Usage(req.body);

  auth.getCustomer(req.authToken, usage.customer_id, function(err, customer) {
    if (err) {
      res.status(500).send({ error: 'Unable to authenticate.' });
    } else {
      if (customer == null) {
        res.status(422).send({
          error: {
            message: errors.api.invalid_customer
          }
        });
      } else {
        usage.save(function(err) {
          if (err) {
            if (err.name === 'ValidationError') {
              res.status(400).send({
                error: {
                  message: errors.api.validation_failed,
                  errors: err.errors
                }
              });
            } else {
              next(err);
            }
          } else {
            res.status(201).send( usage );
          }
        });
      }
    }
  });
});

router.get('/', function(req, res) {
  var authToken = auth.extractToken(req);
  res.json({ status: 0, message: "Data!" });
});
