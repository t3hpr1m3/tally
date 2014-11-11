/**
 * Module dependencies
 */
var rfr = require('rfr'),
    util = require('util'),
    moment = require('moment');

var ValidationError = rfr('lib/errors').ValidationError,
    elasticsearch = rfr('lib/elasticsearch');

/**
 * Constructor
 *
 * @param {Object} data
 */
function Usage(data) {
  this._id = null;
  this.customer_id = data.customer_id;
  this.from = data.from;
  this.to = data.to;
  this.text = data.text;
  this.token_count = 0;
  this.created_at = null;
  this.errors = {};
}

/**
 * Ensures that this usage contains all the required
 * attributes.
 *
 * @param {function} cb
 */
Usage.prototype.validate = function(cb) {
  function addError(obj, attr, type, message, value) {
    obj.errors[attr] = {
      type: type,
      message: message,
      value: value
    };
  }
  this.errors = {};
  if (this.customer_id == null) {
    addError(this, 'customer_id', 'required', 'customer_id is required', this.customer_id);
  }
  if (this.from == null) {
    addError(this, 'from', 'required', 'from is required', this.from);
  }
  if (this.to == null) {
    addError(this, 'to', 'required', 'to is required', this.to);
  }
  if (this.text == null) {
    addError(this, 'text', 'required', 'text is required', this.text);
  }

  if (Object.getOwnPropertyNames(this.errors).length === 0) {
    cb(null);
  } else {
    cb(new ValidationError(this));
  }
};

/**
 * Persists this usage to ElasticSearch.
 *
 * @param {function} cb
 */
Usage.prototype.save = function save(cb) {
  var self = this;

  // validate before trying to save
  this.validate(function(err) {
    if (err) {
      cb(err);
    } else {
      self.created_at = (new Date()).toISOString();
      
      // before we can persist, we have to generate the token count
      elasticsearch.countTokens(self.text, function(err, tokenCount) {
        self.token_count = tokenCount;
        elasticsearch.addUsage(self, function(err) {
          cb(err);
        });
      });
    }
  });
};

Usage.prototype.toJSON = function() {
  return {
    id: this._id,
    customer_id: this.customer_id,
    text: this.text,
    from: this.from,
    to: this.to,
    token_count: this.token_count,
    created_at: this.created_at
  };
};

Usage.search = function search(options, cb) {
  elasticsearch.client().search({
    index: 'usages',
    type: 'usage',
    body: {
      sort: [
        { _id: { 'order': 'asc' } }
      ]
    }
  }, function(err, records) {
    if (err) {
      cb(err);
    } else {
      var usages = [];
      var u = null;
      records.hits.hits.forEach(function(r) {
        u = new Usage({});
        u._id = r._id;
        u.customer_id = r._source.customer_id;
        u.from = r._source.from;
        u.to = r._source.to;
        u.text = r._source.text;
        u.token_count = r._source.token_count;
        usages.push(u);
      });
      cb(null, usages);
    }
  });
};

Usage.summary = function summary(options, cb) {
  elasticsearch.client().search(
    {
      index: 'usages',
      body: {
        query: {
          filtered: {
            filter: {
              range: {
                created_at: {
                  from: moment().startOf('month').format()
                }
              }
            }
          }
        },
        aggs: {
          group_by_customer_id: {
            sort: [ { customer_id: { order: 'asc' } } ],
            terms: { field: 'customer_id' },
            aggs: { total_tokens: { sum: { field: 'token_count' } } }
          }
        }
      }
    }, function(err, records) {
      if (err) {
        cb(err);
      } else {
        var summary = {};
        summary.start_date = moment().startOf('month').format(),
        summary.end_date = moment().format(),
        summary.usages = [];
        records.aggregations.group_by_customer_id.buckets.forEach(function(r) {
          summary.usages.push({
            customer_id: r.key,
            requests: parseInt(r.doc_count),
            token_count: parseInt(r.total_tokens.value)
          });
        });

        cb(null, summary);
      }
  });
}

module.exports = Usage;

/*
var mongoose = require('mongoose');

var usageSchema = new mongoose.Schema({
  customer_id: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usage', usageSchema);
*/

