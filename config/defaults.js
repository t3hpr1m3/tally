var config = module.exports = {};

config.env = 'development';
config.port = process.env.PORT || 3003;
config.esHosts = process.env.ES_HOSTS || 'localhost:9200';

config.authHost = process.env.AUTH_HOST || 'auth.sovee.com';
