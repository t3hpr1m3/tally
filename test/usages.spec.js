var request = require('supertest'),
	express = require('express'),
	config = require('../config'),
	nock = require('nock'),
	usages = require('../routes/api/usages'),
	bodyParser = require('body-parser'),
	should = require('should');

var reqHeaders = function(obj) {
	return {
		'Content-Type': obj['Content-Type'] || 'application/json',
		'Accept': obj['application/json'] || 'application/json',
		'Authorization': obj['Authorization'] || 'Token token=valid'
	}
};

describe('POST /api/usages', function() {
	var app = express();
	app.use(bodyParser.json());
	app.use('/', usages);
	beforeEach(function() {
		nock('https://' + config.auth_host)
			.get('/customers?token=valid')
			.reply(200, '[{"id": "12345"}]');
	});

	it('validates input', function(done) {
		request(app)
			.post('/')
			.set(reqHeaders({'Authorization': 'foobar'}))
			.send('{}')
			.expect(400)
			.end(function(err, res) {
				res.body.errors.indexOf('customer_id is required').should.be.greaterThan(-1);
				res.body.errors.indexOf('from is required').should.be.greaterThan(-1);
				res.body.errors.indexOf('to is required').should.be.greaterThan(-1);
				res.body.errors.indexOf('text is required').should.be.greaterThan(-1);
				done();
			});
	});

	it('requires a valid customer_id', function(done) {
		request(app)
			.post('/')
			.set(reqHeaders({}))
			.send('{"customer_id": "54321", "from": "en", "to": "es", "text": "Hello World"}')
			.expect(400, { error: 'Invalid customer_id' }, done);
	});

	it('responds with the correct message', function(done) {
		request(app)
			.post('/')
			.set(reqHeaders({}))
			.send('{"customer_id": "12345", "from": "en", "to": "es", "text": "Hello World"}')
			.expect(200)
			.end(function (err, res) {
				should.not.exist(err);
				res.body.status.should.equal(0);
				res.body.message.should.equal('You Posted!');
				done();
			});
	});
});
