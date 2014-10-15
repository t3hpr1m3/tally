var config = module.exports = {};

config.env = 'development';
config.port = process.env.PORT || 3003;

config.auth_host = process.env.AUTH_HOST || 'auth.sovee.com';
