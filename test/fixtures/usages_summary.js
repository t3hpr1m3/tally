module.exports = {
  'took': 13,
  'timed_out': false,
  'hits': {
    'total': 2,
    'max_score': 1.0,
    'hits': [
      {
        '_index': 'usages',
        '_type': 'usage',
        '_id': '1',
        '_score': 1.0,
        '_source': {
          'customer_id': '12345',
          'from': 'en',
          'to': 'es',
          'text': 'Hello World',
          'token_count': 2
        }
      },
      {
        '_index': 'usages',
        '_type': 'usage',
        '_id': '2',
        '_score': 1.0,
        '_source': {
          'customer_id': '12345',
          'from': 'en',
          'to': 'es',
          'text': 'Happy Birthday Mister President',
          'token_count': 4
        }
      },
      {
        '_index': 'usages',
        '_type': 'usage',
        '_id': '3',
        '_score': 1.0,
        '_source': {
          'customer_id': '54321',
          'from': 'en',
          'to': 'es',
          'text': 'Taco Tuesday',
          'token_count': 2
        }
      },
    ]
  },
  'aggregations': {
    'group_by_customer_id': {
      'buckets': [
        { 'key': '12345', 'doc_count': '2', 'total_tokens': { 'value': '6' } },
        { 'key': '54321', 'doc_count': '1', 'total_tokens': { 'value': '2' } }
      ]
    }
  }
};
