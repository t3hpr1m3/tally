/**
 * Module dependencies.
 */
var rfr = require('rfr'),
    express = require('express'),
    router = module.exports = express.Router(),
    usages = rfr('routes/api/usages'),
    auth = rfr('lib/auth');

/**
 * Middleware for validating auth tokens
 */
router.use('/*', auth.authenticate);

router.use('/usages', usages);

