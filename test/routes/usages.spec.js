var request = require('supertest'),
    express = require('express'),
    config = require('../config'),
    nock = require('nock'),
    usages = require('../routes/api/usages'),
    bodyParser = require('body-parser'),
    should = require('should'),
    auth = require('../lib/auth');

var reqHeaders = function(obj) {
  if (typeof obj === 'undefined') { obj = {}; }
  return {
    'Content-Type': obj['Content-Type'] || 'application/json',
    'Accept': obj['application/json'] || 'application/json',
    'Authorization': obj['Authorization'] || 'Token token=valid'
  }
};

describe('POST /api/usages', function() {
  var app = express();
  app.use(bodyParser.json());
  app.use(auth.authenticate);
  app.use('/', usages);
  beforeEach(function(done) {
    nock(auth.authURL('/auth/validate'https://' + config.authHost)
      .get('/auth/validate?token=valid')
      .reply(200, '{}');
    nock('https://' + config.authHost)
      .get('/customers?token=valid')
      .reply(200, '[{"id": "12345"}]');
    done();
  });

  it('requires a customer id', function(done) {
    request(app)
      .post('/')
      .set(reqHeaders())
      .send('{}')
      .expect(422)
      .end(function(err, res) {
        res.body.error.should.have.property('message', 'Invalid customer id');
        done();
      });
  });

  it('requires a valid customer_id', function(done) {
    request(app)
      .post('/')
      .set(reqHeaders())
      .send('{ "customer_id": "54321", "from": "en", "to": "es", "text": "Hello World" }')
      .expect(422)
      .end(function(err, res) {
        res.body.error.should.have.property('message', 'Invalid customer id');
        done();
      });
  });

  it('validates input', function(done) {
    request(app)
      .post('/')
      .set(reqHeaders())
      .send('{ "customer_id": "12345" }')
      .expect(422)
      .end(function(err, res) {
        res.body.error.should.have.property('message', 'Validation failed');
        done();
      });
  });

  it('responds correctly', function(done) {
    request(app)
      .post('/')
      .set(reqHeaders({}))
      .send('{ "customer_id": "12345", "from": "en", "to": "es", "text": "Hello World" }')
      .expect(201)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('id');
        done();
      });
  });
});
