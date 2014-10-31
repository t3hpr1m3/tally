/**
 * Module dependencies.
 */
var express = require('express'),
	router = module.exports = express.Router(),
	usages = require('./usages'),
	auth = require('../../lib/auth');

/**
 * Middleware for validating auth tokens
 */
router.use('/*', auth.authenticate);

router.use('/usages', usages);

