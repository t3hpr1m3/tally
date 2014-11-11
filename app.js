/**
 * Module dependencies
 */
var rfr = require('rfr'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    config = rfr('config'),
    auth = rfr('lib/auth'),
    app = module.exports = express();


// Setup middleware
app.use(morgan('combined'));
app.use(bodyParser.json());

// Load up routes
var routes = require('./routes');
app.use('/api', routes.api);

// Crank up the server
app.listen(config.port);
console.log('Now listening on port ' + config.port);

