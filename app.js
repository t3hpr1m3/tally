/**
 * Module dependencies
 */
var express		= require('express'),
	bodyParser	= require('body-parser'),
	config		= require('./config'),
	auth		= require('./lib/auth'),
	app			= module.exports = express();


// Setup middleware
app.use(bodyParser.json());

// Load up routes
var routes = require('./routes');
app.use('/api', routes.api);

// Crank up the server
app.listen(config.port);
console.log('Now listening on port ' + config.port);

