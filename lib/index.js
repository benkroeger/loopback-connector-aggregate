'use strict';

const logger = require('./logger-factory')('main');

const aggregateConnector = require('./aggregate-connector');
/**
 * receive configuration from the data source settings and initialize the connector instance
 * @param {DataSource} dataSource The data source instance
 * @param {Function} [callback] The callback function
 */
exports.initialize = function initializeDataSource(dataSource, callback) {
  const settings = dataSource.settings;
  logger.debug('initialize', settings.name);

  /* eslint-disable no-param-reassign */
  dataSource.connector = aggregateConnector(settings, dataSource);
  /* eslint-enable no-param-reassign */

  if (callback) {
    dataSource.connector.connect(callback);
  }
};
