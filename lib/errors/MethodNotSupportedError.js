// Used to wrap any error caused by a failed validation check on loaded buckets

'use strict';
const util = require('util');

function MethodNotSupportedError(methodName) {
  Error.call(this);
  // captureStackTrace is V8-only (node, chrome)
  Error.captureStackTrace(this, MethodNotSupportedError);

  this.name = 'MethodNotSupportedError';
  this.message = util.format(`method "${methodName}" is not supported on this object`);
}

util.inherits(MethodNotSupportedError, Error);

module.exports = MethodNotSupportedError;
