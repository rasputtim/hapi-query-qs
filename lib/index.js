'use strict';

const Joi = require('joi');
const Hoek	= require('@hapi/hoek');
const qs	= require('qs');

// Internal modules
const Schema				= require('./schema');

const pluginName = 'hapi-query-qs';

const internals = {
	defaults: {
		defaultEnabled: true
	}
};

/**
 * Registers the plugin
 *
 * @param server
 * @param options
 */

exports.register = function (server, options) {

  options.ignoredKeys = options.ignoredKeys || [];
  // Validate the options passed into the plugin
  Schema.assert('plugin', options, 'Invalid settings');

  const settings = Hoek.applyToDefaults(internals.defaults, options || {});

  server.decorate('server', 'hacli', settings);

  // Validate the server options on the routes
  if (server.after) { // Support for hapi < 11
    server.after(internals.validateRoutes);
  } else {
    server.ext('onPreStart', internals.validateRoutes);
  }

  server.ext('onPreHandler', internals.parseQuery);

  
};


/**
 * Gets the name and version from package.json
 */
exports.plugin = {
  register:register,
  name: pluginName,
  version: require('../package.json').version,
  multiple: true,
  pkg: require('../package.json')
}

/**
   * Parse an extended query string with qs.
   *
   * @return {Object}
   * @private
   */
  internals.parseExtendedQueryString=  (str)=> {
    return qs.parse(str, {
      allowPrototypes: true
    });
  }

internals.parseQuery = (request, reply) => {
  const settings = request.route.settings.plugins.queryFilter;
  let filter = {};

  if (options.defaultEnabled || settings && settings.enabled) {
    // Concatenate route level ignoredKeys with server level
    if (settings && settings.ignoredKeys) {
      options.ignoredKeys = options.ignoredKeys.concat(settings.ignoredKeys);
    }

    if ( request.url && request.url.search.length > 0) {
      filter = qs.parse(request.url.search.replace('?',''), {
        allowPrototypes: true
      });
    }

    

    request.query.qs = filter;
  }

  reply.continue();
};