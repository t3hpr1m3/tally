/**
 * Module dependencies
 */
var express		= require('express'),
	morgan		= require('morgan'),
	bodyParser	= require('body-parser'),
	config		= require('./config'),
	auth		= require('./lib/auth'),
	app			= module.exports = express();


// Setup middleware
app.use(morgan('combined'));
app.use(bodyParser.json());

// Load up routes
var routes = require('./routes');
app.use('/api', routes.api);

// Crank up the server
app.listen(config.port);
console.log('Now listening on port ' + config.port);

