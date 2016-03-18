'use strict';

const assert = require('assert');

const _ = require('lodash');
const async = require('async');
const Connector = require('loopback-connector').Connector;
const loggerFactory = require('./logger-factory');

const MethodNotSupportedError = require('./errors/MethodNotSupportedError');

/**
 * The constructor for Aggregate connector
 * @param {Object} settings The settings object
 * @param {DataSource} dataSource The data source instance
 * @constructor
 */
function aggregateConnector(settings, dataSource) {
  const connector = {};
  Connector.call(connector, 'aggregate', settings);

  const logger = loggerFactory(settings.name);

  if (settings.debug) {
    logger.enableDebug();
  }

  // verify sources information
  const sourcesSettings = settings.sources;
  assert(_.isPlainObject(sourcesSettings), 'settings.sources must be an object literal');
  assert(Object.keys(sourcesSettings).length > 0, 'settings.sources must have at least one key');

  // create catalog for source services
  const services = {};

  logger.debug('Settings: %j', settings);

  _.assign(connector, {
    buildNearFilter: false,
    dataSource,
  });

  // Lifecycle Handlers

  /**
   * create connections to the backend system
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  function connect(callback) {
    logger.debug('> connect');

    // aggregate all information provided in "settings.sources" into the "sources" map.
    return async.map(Object.keys(sourcesSettings), (sourceName, iteratorCallback) => {
      logger.debug(`configuring source "${sourceName}"`);
      const sourceConfig = sourcesSettings[sourceName];

      // abort if sourceConfig is falsy or no connector was provided
      if (!sourceConfig || !sourceConfig.connector) {
        logger.warn(`no config provided for "${sourceName}" - ignoring connector`);
        return iteratorCallback(null, null);
      }

      // assume sourceConfig.connector is the configured connector instance already
      logger.debug(`connector instance for "${sourceName}" was provided`);
      return iteratorCallback(null, _.defaults({
        name: sourceName,
        connector: sourceConfig.connector,
      }, sourceConfig, {
        transformers: {},
      }));

      // @TODO: implement optional creation of connector from config properties
      // @TODO: implement transformers for all model method delegations
    }, (iterateErr, result) => {
      if (iterateErr) {
        return callback(iterateErr);
      }

      // reduce result name-indexed map for services
      result
        .filter((item) => {
          return item && item.name && item.connector;
        })
        .reduce((reduced, item) => {
          /* eslint-disable no-param-reassign */
          reduced[item.name] = item;
          /* eslint-enable no-param-reassign */
          return reduced;
        }, services);

      // finish "connect" function
      return callback();
    });
  }

  /**
   * close connections to the backend system
   * @param  {Function} [callback] [description]
   * @return {[type]}            [description]
   */
  function disconnect(callback) {
    logger.debug('> disconnect');
    return callback();
  }

  /**
   * (optional): check connectivity
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  function ping(callback) {
    logger.debug('> ping');
    return callback();
  }

  // make lifecycle handler functions member of the connector object
  _.assign(connector, {
    connect,
    disconnect,
    ping,
  });

  // Connector metadata (optional)
  // Model definition for the configuration, such as host/URL/username/password
  // What data access interfaces are implemented by the connector (the capability of the connector)
  // Connector-specific model/property mappings
  function getTypes() {
    return ['aggregated'];
  }

  // triggered from DataSource.createModel as the last manipulating step
  function define(options) {
    logger.debug('> define; options %j', options);
    // {
    //   model: modelClass,
    //   properties: modelClass.definition.properties,
    //   settings: settings
    // }
  }

  // make connector metadate functions member of the connector object
  _.assign(connector, {
    getTypes,
    define,
  });

  // Model method delegations
  // Delegating model method invocations to backend calls, for example create, retrieve, update, and delete
  function create(model, data, options, callback) {
    logger.debug('> create; model %s, data %j, options %j', model, data, options);
    return callback(new MethodNotSupportedError('create'));
  }

  function updateOrCreate(model, data, options, callback) {
    logger.debug('> updateOrCreate; model %s, data %j, options %j', model, data, options);
    return callback(new MethodNotSupportedError('updateOrCreate'));
  }

  function findOrCreate(model, data, options, callback) {
    logger.debug('> findOrCreate; model %s, data %j, options %j', model, data, options);
    return callback(new MethodNotSupportedError('create'));
  }

  function all(model, filter, options, callback) {
    logger.debug('> all; model %s, filter %j, options %j', model, filter, options);

    async.concat(Object.keys(services), (serviceName, iteratorCallback) => {
      const service = services[serviceName];
      const sourceConnector = service.connector;
      return sourceConnector.all.call(sourceConnector, model, filter, options, (sourceErr, sourceResult) => {
        if (sourceErr) {
          return iteratorCallback(sourceErr, null);
        }
        if (!Array.isArray(sourceResult)) {
          return iteratorCallback(new TypeError(`received non-array response from service ${serviceName}
            actual type: ${typeof sourceResult}`));
        }
        if (service.transformers && typeof service.transformers.all === 'function') {
          return iteratorCallback(null, sourceResult.map((entry) => {
            return service.transformers.all(entry);
          }));
        }
        return iteratorCallback(sourceErr, sourceResult);
      });
    }, (iterateErr, result) => {
      if (iterateErr) {
        return callback(iterateErr);
      }
      return callback(null, result.filter((item) => {
        return !!item;
      }));
    });
  }

  function count(model, where, options, callback) {
    logger.debug('> count; model %s, where %j, options %j', model, where, options);
    return callback(new MethodNotSupportedError('create'));
  }

  // removeAll, deleteAll, destroyAll
  function destroyAll(model, where, options, callback) {
    logger.debug('> destroyAll; model %s, where %j, options %j', model, where, options);
    return callback(new MethodNotSupportedError('create'));
  }

  function save(model, id, options, callback) {
    logger.debug('> save; model %s, id %s, options %j', model, id, options);
    return callback(new MethodNotSupportedError('create'));
  }

  // update, updateAll
  function update(model, where, data, options, callback) {
    logger.debug('> update; model %s, where %j, data %j, options %j', model, where, data, options);
    return callback(new MethodNotSupportedError('create'));
  }

  // remove, delete, destroy
  function destroy(model, id, options, callback) {
    logger.debug('> destroy; model %s, id %s options %j', model, id, options);
    return callback();
  }

  function updateAttributes(model, id, data, options, callback) {
    logger.debug('> updateAttributes; model %s, id %s, data %j, options %j', model, id, data, options);
    return callback(new MethodNotSupportedError('create'));
  }

  // make Model method delegation functions member of the connector object
  _.assign(connector, {
    create,
    updateOrCreate,
    findOrCreate,
    all,
    destroyAll,
    count,
    save,
    update,
    destroy,
    updateAttributes,
  });

  return connector;

  // DAO calls DAO.findOne --> DAO.find --> connector.all
  // function findById(model, data, options, callback) {
  //   logger.debug('> findById');
  // return callback();
  // }

  // DAO calls DAO.find --> which calls connector.all
  // function findByIds(model, data, options, callback) {
  //   logger.debug('> findByIds');
  // return callback();
  // }

  // DAO calls connector.all
  // function find(model, data, options, callback) {
  //   logger.debug('> find');
  // return callback();
  // }

  // DAO calls DAO.find --> connector.all
  // function findOne(model, data, options, callback) {
  //   logger.debug('> findOne');
  // return callback();
  // }

  // DAO calls connector.count
  // function exists(model, data, options, callback) {
  //   logger.debug('> exists');
  //   return callback();
  // }

  // DAO calls DAO.remove --> connector.destrox
  // function destroyById(model, where, options, callback) {
  //   logger.debug('> destroyById');
  //   return callback();
  // }
}

module.exports = aggregateConnector;
