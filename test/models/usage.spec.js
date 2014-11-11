var rfr = require('rfr'),
    should = require('should'),
    sinon = require('sinon'),
    util = require('util'),
    moment = require('moment');

var elasticsearch = rfr('lib/elasticsearch'),
    Usage = rfr('models/usage');

var validParams = {
  customer_id: 'testing',
  from: 'en',
  to: 'es',
  text: 'Hello World'
}

describe('User', function() {
  describe('validation', function() {
    it('requires customer_id', function() {
      var usage = new Usage(validParams);
      usage.customer_id = null;
      usage.validate(function(err) {
        err.errors.should.have.property('customer_id');
      });
    });

    it('requires from', function() {
      var usage = new Usage(validParams);
      usage.from = null;
      usage.validate(function(err) {
        err.errors.should.have.property('from');
      });
    });

    it('requires to', function() {
      var usage = new Usage(validParams);
      usage.to = null;
      usage.validate(function(err) {
        err.errors.should.have.property('to');
      });
    });

    it('requires text', function() {
      var usage = new Usage(validParams);
      usage.text = null;
      usage.validate(function(err) {
        err.errors.should.have.property('text');
      });
    });
  });

  describe('search', function() {
    var sandbox = null;
    var fakeSearch = rfr('test/fixtures/usages');
    beforeEach(function(done) {
      sandbox = sinon.sandbox.create();
      sandbox.stub(elasticsearch, 'client', function() {
        return {
          search: function(query, cb) {
            cb(null, fakeSearch);
          }
        };
      });
      done();
    });
    afterEach(function(done) {
      sandbox.restore();
      done();
    });

    it('generates an array of objects from ES results', function(done) {
      Usage.search({}, function(err, data) {
        data.length.should.equal(3);
        data[0]._id.should.equal('1');
        data[1]._id.should.equal('2');
        data[2]._id.should.equal('3');
        done();
      });
    });
  });

  describe('summary', function() {
    var sandbox = null;
    var fakeSearch = rfr('test/fixtures/usages_summary');
    beforeEach(function(done) {
      sandbox = sinon.sandbox.create();
      sandbox.stub(elasticsearch, 'client', function() {
        return {
          search: function(query, cb) {
            cb(null, fakeSearch);
          }
        };
      });
      done();
    });
    afterEach(function(done) {
      sandbox.restore();
      done();
    });

    describe('with no options', function() {
      it('generates a summary for the current month', function(done) {
        Usage.summary({}, function(err, data) {
          data.start_date.should.equal(moment().startOf('month').format());
          data.end_date.should.equal(moment().format());
          data.usages.length.should.equal(2);
          data.usages[0].customer_id.should.equal('12345');
          data.usages[1].customer_id.should.equal('54321');
          done();
        });
      });
    });
  });
});
