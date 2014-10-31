var Usage = require('../../models/usage'),
	should = require('should'),
	util = require('util');

var validParams = {
	customer_id: 'testing',
	from: 'en',
	to: 'es',
	text: 'Hello World'
}

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
