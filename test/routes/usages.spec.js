/**
 * Module dependencies.
 */
var rfr = require('rfr'),
    request = require('supertest'),
    express = require('express'),
    nock = require('nock'),
    bodyParser = require('body-parser'),
    should = require('should'),
    url = require('url'),
    sinon = require('sinon'),
    moment = require('moment');

var models = rfr('models'),
    usages = rfr('routes/api/usages'),
    auth = rfr('lib/auth'),
    elasticsearch = rfr('lib/elasticsearch');

var reqHeaders = function(obj) {
  if (typeof obj === 'undefined') { obj = {}; }
  return {
    'Content-Type': obj['Content-Type'] || 'application/json',
    'Accept': obj['application/json'] || 'application/json',
    'Authorization': obj['Authorization'] || 'Token token=valid'
  }
};

function buildAuthURL(path, token) {
  var urlObj = url.parse(auth.authURL(path));
  if (urlObj.query == null) {
    urlObj.query = {};
  }
  urlObj.query.token = token;
  return url.parse(url.format(urlObj));
}

describe('POST /api/usages', function() {
  var app = express(),
      validateURL = buildAuthURL('/auth/validate', 'valid'),
      customersURL = buildAuthURL('/customers', 'valid');

  app.use(bodyParser.json());
  app.use(auth.authenticate);
  app.use('/', usages);
  beforeEach(function(done) {
    nock(validateURL.protocol + '//' + validateURL.host)
      .get(validateURL.path)
      .reply(200, '{}');
    nock(customersURL.protocol + '//' + customersURL.host)
      .get(customersURL.path)
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

describe('GET /api/usages/summary', function() {
  var app = express(),
      validateURL = buildAuthURL('/auth/validate', 'valid');

  app.use(bodyParser.json());
  app.use(auth.authenticate);
  app.use('/', usages);
  var sandbox = null;
  beforeEach(function(done) {
    nock(validateURL.protocol + '//' + validateURL.host)
      .get(validateURL.path)
      .reply(200, '{}');
    sandbox = sinon.sandbox.create();
    sandbox.stub(models.Usage, 'summary').callsArgWith(1, null, {
      start_date: moment().startOf('month').format(),
      end_date: moment().format(),
      usages: [
        { customer_id: '12345', requests: 2, token_count: 4 }
      ]
    });
    done();
  });
  afterEach(function(done) {
    sandbox.restore();
    done();
  });

  it('returns usage statistics by customer', function(done) {
    request(app)
      .get('/summary')
      .set(reqHeaders())
      .expect(200)
      .end(function(err, res) {
        var summary = res.body;
        summary.should.have.property('start_date', moment().startOf('month').format());
        summary.should.have.property('end_date', moment().format());
        summary.should.have.property('usages', [
          { 'customer_id': '12345', 'requests': 2, 'token_count': 4 }
        ]);
        done();
      });
  });
});
