/**
 * Module dependencies.
 */
var rfr = require('rfr'),
    express = require('express'),
    moment = require('moment');
    router = module.exports = express.Router();

var auth = rfr('lib/auth'),
    models = rfr('models'),
    errors = rfr('lib/errors');

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
              res.status(400).json({
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
  var options = {
  };
  models.Usage.search({}, function(err, usages) {
    if (err) {
      next(err);
    } else {
      res.status(200).json(usages);
    }
  });
});

router.get('/summary', function(req, res) {
  var authToken = auth.extractToken(req);
  var options = {};
  models.Usage.summary(options, function(err, s) {
    if (err) {
      next(err);
    } else {
      res.status(200).json(s);
    }
  });
});
