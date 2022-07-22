'use strict';


import Hoek from '@hapi/hoek';
import { createRequire } from "module";
import qs from 'qs';
// Internal modules
import Schema from './schema.js';
const require = createRequire(import.meta.url);

const pluginName = 'hapi-query-qs';
const pluginRouteOption = 'hapi_query_qs'
const internals = {
	defaults: {
		defaultEnabled: true
	}
};
const HapiQS = {

 name: pluginName,
  version: require('../package.json').version,
  multiple: true,
  pkg: require('../package.json'),


/**
 * Registers the plugin
 *
 * @param server
 * @param options
 */
register:  (server, options) =>{

  options.ignoredKeys = options.ignoredKeys || [];
  // Validate the options passed into the plugin
  Schema.assert('plugin', options, 'Invalid settings');

  const settings = Hoek.applyToDefaults(internals.defaults, options || {});

  server.decorate('server', 'hapi-query-qs', settings);

  // Validate the server options on the routes
  if (server.after) { // Support for hapi < 11
    server.after(internals.validateRoutes);
  } else {
    server.ext('onPreStart', internals.validateRoutes);
  }

  server.ext('onPreHandler', internals.parseQuery);

  
}

} //end plugin
/**
   * Parse an extended query string with qs.
   *
   * @return {Object}
   * @private
   */
  internals.parseExtendedQueryString =  (str)=> {
    return qs.parse(str, {
      allowPrototypes: true
    });
  }

internals.parseQuery = (request, reply) => {
  const settings = request.route.settings.plugins.hapi_query_qs;
  const options = request.server['hapi-query-qs']
  let filter = {};

  if (internals.defaults.defaultEnabled || settings && settings.enabled || options && options.defaultEnabled) {
    // Concatenate route level ignoredKeys with server level
    if (settings && settings.ignoredKeys) {
      internals.defaults.ignoredKeys = internals.defaults.ignoredKeys.concat(settings.ignoredKeys);
    }
    if (options && options.ignoredKeys && options.ignoredKeys.length>0) {
      internals.defaults.ignoredKeys = internals.defaults.ignoredKeys.concat(options.ignoredKeys);
    }
    //Todo: use ignoredkeys

    if ( request.url && request.url.search.length > 0) {
      filter = qs.parse(request.url.search.replace('?',''), {
        allowPrototypes: true
      });
    }

    

    request.query.qs = filter;
  }

  return  reply.continue;
  }


  /**
   * Runs on server start and validates that every route that has paginationValidator 
   * params is valid
   *
   * @param server
   * plugins: {
      hapi-query-qs: {
        enabled: true,
        ignoredKey: ['count', 'offset'], // Array will be concatenated with the ignoredKeys set at register
        params: ['test_param'] // Array of request.params that will be put into filter object
      }
   */
   internals.validateRoutes = (server) => {
  
    const routes = server.table();

    // Loop through each route
    routes.forEach((route) => {

        const queryHandlerParams = route.settings.plugins[pluginRouteOption] ? route.settings.plugins[pluginRouteOption] : false;

        // If there are paginationValidator params and are not disabled by using "false", validate em
        if (queryHandlerParams !== false) {

            // If there is a default auth
            if (server.auth.settings.default) {

                // If there is also an auth on the route, make sure it's not false or null
                if (route.settings.auth !== undefined) {

                    // Make sure that there is either a default auth being set, or that there is an auth specified on every route with paginationValidator plugin params
                    Hoek.assert(route.settings.auth !== null && route.settings.auth !== false, 'hapi-query-qs can be enabled only for secured route');
                }
            }
            // Else there is no default auth set, so validate each route's auth
            else {
                // Make sure that there is either a default auth being set, or that there is an auth specified on every route with paginationValidator plugin params
                Hoek.assert(route.settings.auth && route.settings.auth !== null && route.settings.auth !== false, 'hapi-query-qs can be enabled only for secured route');
            }

            Schema('route', queryHandlerParams, 'Invalid settings');
        }
    });
};

export default HapiQS
