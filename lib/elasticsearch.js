/**
 * Module dependencies.
 */

var express     = require('express'),
  elasticsearch = require('elasticsearch'),
  morgan      = require('morgan'),
  config      = require('../config');

var clientInstance = null;
var indices = [];

var es = module.exports;

es.client = function() {
  if (clientInstance == null) {
    clientInstance = new elasticsearch.Client({
      hosts: config.esHosts.split(','),
      sniffOnStart: true,
      sniffInterval: 300000,
      log: 'debug' //false
    });
  }
  return clientInstance;
};

es.validateIndex = function(indexName, cb) {
  if (indices.indexOf(indexName) != -1) {
    cb(null);
  }
  es.client().indices.exists({ index: indexName }, function(err, value) {
    if (err != null) {
      console.log('err: ', err);
      cb(err);
    } else {
      if (value === false) {
        console.log("index does not exist");
        es.createIndex(indexName, function(err) {
          if (err != null) {
            console.log('error creating index: ', err);
            cb(err);
          } else {
            console.log('created index');
            cb(null);
          }
        });
      } else {
        indices.push(indexName);
        cb(null);
      }
    }
  });
};

es.createIndex = function(indexName, cb) {
  var body = {
    settings: {
      index: {
        number_of_shards: 10,
        number_of_replicas: 1,
      }
    },
    mappings: {
      usage: {
        properties: {
          customer_id: { type: 'string', index: 'not_analyzed' },
          from: { type: 'string', index: 'not_analyzed' },
          to: { type: 'string', index: 'not_analyzed' },
          text: {
            type: 'multi_field',
            fields: {
              text: { type: 'string', index: 'analyzed' },
              untouched: { type: 'string', index: 'not_analyzed' }
            }
          },
          token_count: { type: 'integer' },
          created_at: { type: 'date' }
        }
      }
    }
  };
  es.client().indices.create({ index: indexName, body: body }, cb);
};

es.countTokens = function(text, cb) {
  console.log('counting tokens: ', text);
  es.client().indices.analyze({ tokenizer: 'standard', format: 'text', body: text, format: 'detailed' }, function(err, resp) {
    if (err != null) {
      console.log('err: ', err);
      cb(err);
    } else {
      var tokenCount = resp['tokens'].length;
      cb(null, tokenCount);
    }
  });
};

es.addUsage = function(usage, cb) {
  es.validateIndex('usages', function(err) {
    if (err != null) {
      cb(err);
    } else {
      var doc = {
        customer_id: usage.customer_id,
        from: usage.from,
        to: usage.to,
        text: usage.text,
        token_count: usage.token_count,
        created_at: usage.created_at
      };
      es.client().index({ index: 'usages', type: 'usage', body: doc}, function(err, resp) {
        if (err != null) {
          cb(err);
        } else {
          usage._id = resp._id;
          cb(null);
        }
      });
    }
  });
};
