var rfr = require('rfr');
var env = process.env.NODE_ENV || 'development',
    cfg = module.exports = rfr('config/' + env);
