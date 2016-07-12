'use strict';

const oniyiLogger = require('oniyi-logger');

// create a logger instance and export it
module.exports = function makeLogger(label, settings) {
  const loggerLabel = label || 'anonymous';
  return oniyiLogger(`loopback:connector:aggregate:${loggerLabel}`, settings);
};
