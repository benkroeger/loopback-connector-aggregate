'use strict';

const _ = require('lodash');
const async = require('async');
const Connector = require('loopback-connector').Connector;
const loggerFactory = require('./logger');

const MethodNotSupportedError = require('./errors/MethodNotSupportedError');
/**
 * assign all properties of "update" that are not of type "function" to base
 * @param  {Object} base   destination object
 * @param  {Object} update source object
 * @return {Object}        object that combines keys from base and update. keys in update overwrite keys in base. base is not modified
 */
function merge(base, update) {
  if (!base) {
    return update;
  }
  return _.assign({}, base, _.omitBy(update, _.isFunction));
}

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
    return callback(null, {});
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

  // make lifestyle handler functions member of the connector object
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
    logger.debug('> define');
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
    logger.debug('> create');
    return callback(new MethodNotSupportedError('create'));
  }

  function updateOrCreate(model, data, options, callback) {
    logger.debug('> updateOrCreate');
    return callback(new MethodNotSupportedError('updateOrCreate'));
  }

  function findOrCreate(model, data, options, callback) {
    logger.debug('> findOrCreate');
    return callback(new MethodNotSupportedError('create'));
  }

  function all(model, filter, options, callback) {
    logger.debug('> all');
    logger.debug('model', model);
    logger.debug('filter', Object.keys(filter), filter);
    logger.debug('options', Object.keys(options), options);
    return callback(null, []);
  }

  function count(model, where, options, callback) {
    logger.debug('> count');
    return callback(new MethodNotSupportedError('create'));
  }

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

  // removeAll, deleteAll, destroyAll
  function destroyAll(model, where, options, callback) {
    logger.debug('> destroyAll');
    return callback(new MethodNotSupportedError('create'));
  }

  function save(model, id, options, callback) {
    logger.debug('> save');
    return callback(new MethodNotSupportedError('create'));
  }

  // update, updateAll
  function update(model, where, data, options, callback) {
    logger.debug('> update');
    return callback(new MethodNotSupportedError('create'));
  }

  // remove, delete, destroy
  function destroy(model, id, options, callback) {
    logger.debug('> destroy');
    return callback();
  }

  function updateAttributes(model, id, data, options, callback) {
    logger.debug('> updateAttributes');
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
}

module.exports = aggregateConnector;
