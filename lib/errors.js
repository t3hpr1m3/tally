module.exports.ValidationError = function ValidationError(object) {
  this.name = 'ValidationError';
  this.errors = object.errors;
};

module.exports.api = {
  invalid_auth_token: 'Invalid/missing Auth token',
  invalid_customer: 'Invalid customer id',
  validation_failed: 'Validation failed',
  communication_error: 'Unable to authenticate'
};
