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
    var requestObj = null;
    app.use(function storeRequest(req, res, next) {
      requestObj = req;
      next();
    });
    app.use(auth.authenticate);
    app.use(function(req, res) {
      requestObj = req;
      res.end();
    });

    beforeEach(function() {
      nock('https://' + config.authHost)
        .get('/auth/validate?token=error')
        .reply(500, '{}');
      nock('https://' + config.authHost)
        .get('/auth/validate?token=invalid')
        .reply(200, '{"error": "bad token"}');
      nock('https://' + config.authHost)
        .get('/auth/validate?token=valid')
        .reply(200, '{}');
    });

    it('should return 401 when the token is missing', function(done) {
      request(app)
        .get('/')
        .expect(401)
        .end(function(err, res) {
          res.body.error.should.have.property('message', 'Invalid/missing Auth token')
          done();
        });
    });

    it('should return 500 when auth returns an error', function(done) {
      request(app)
        .get('/')
        .set('Authorization', 'Token token=error')
        .expect(500)
        .end(function(err, res) {
          res.body.error.should.have.property('message', 'Unable to authenticate');
          done();
        });
    });

    it('should return 401 when the token is invalid', function(done) {
      request(app)
        .get('/')
        .set('Authorization', 'Token token=invalid')
        .expect(401)
        .end(function(err, res) {
          res.body.error.should.have.property('message', 'Invalid/missing Auth token');
          done();
        });
    });

    it('should succeed when the token is valid', function(done) {
      request(app)
        .get('/')
        .set('Authorization', 'Token token=valid')
        .expect(200, done);
    });

    it('should assign the token to the request', function(done) {
      request(app)
        .get('/')
        .set('Authorization', 'Token token=valid')
        .expect(200)
        .end(function(err, res) {
          requestObj.authToken.should.equal('valid');
          done();
        });
    });
  });

  describe('getCustomer', function() {
    it('should return a customer', function(done) {
      nock('https://' + config.authHost)
        .get('/customers?token=valid')
        .reply(200, '[{"id": "12345"}]');
      auth.getCustomer('valid', '12345', function(err, customer) {
        customer.should.eql({'id': '12345'});
        done();
      });
    });
  });
});

