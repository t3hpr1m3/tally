/**
 * Module dependencies.
 */
var should = require('should'),
	nock = require('nock'),
	express = require('express'),
	request = require('supertest'),
	config = require('../../config'),
	auth = require('../../lib/auth');

describe('auth', function() {
	describe('authentication', function() {
		var app = express();
		app.use(auth.authenticate);
		app.use(function(err, res) {
			res.end();
		});

		beforeEach(function() {
			nock('https://' + config.auth_host)
				.get('/auth/validate?token=error')
				.reply(500, '{}');
			nock('https://' + config.auth_host)
				.get('/auth/validate?token=invalid')
				.reply(200, '{"error": "bad token"}');
			nock('https://' + config.auth_host)
				.get('/auth/validate?token=valid')
				.reply(200, '{}');

		});

		it('should return 401 when the token is missing', function(done) {
			request(app)
				.get('/')
				.expect(401, done);
		});

		it('should return 401 when auth returns an error', function(done) {
			request(app)
				.get('/')
				.set('Authorization', 'Token token=error')
				.expect(401, done);
		});

		it('should return 401 when the token is invalid', function(done) {
			request(app)
				.get('/')
				.set('Authorization', 'Token token=invalid')
				.expect(401, done);
		});

		it('should succeed when the token is valid', function(done) {
			request(app)
				.get('/')
				.set('Authorization', 'Token token=valid')
				.expect(200, done);
		});
	});

	describe('getCustomer', function() {
		it('should return a customer', function(done) {
			nock('https://' + config.auth_host)
				.get('/customers?token=valid')
				.reply(200, '[{"id": "12345"}]');
			auth.getCustomer('valid', '12345', function(err, customer) {
				customer.should.eql({'id': '12345'});
				done();
			});
			
		});
	});
});

