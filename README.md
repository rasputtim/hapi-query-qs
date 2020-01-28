# Hapi Query String qs
[![Build Status](https://travis-ci.org/lob/hapi-query-filter.svg)](https://npm.org/package/hapi-query-qs)
[![NPM version](https://badge.fury.io/js/hapi-query-filters.svg)](https://npm.org/package/hapi-query-qs)
[![Downloads](http://img.shields.io/npm/dm/hapi-query-filters.svg)](https://npm.org/package/hapi-query-qs)

The purpose of this plugin isparse the query parameters into a object that is accessible via `request.query.qs`.

the onjetive is to allow 'brackets' '[]' in the querystring an permit the quind of query string parsed by the qs package:

// GET /search?`q=tobi+ferret`
console.dir(req.query.q)
// => 'tobi ferret'

// GET /shoes?`order=desc&shoe[color]=blue&shoe[type]=converse`
console.dir(req.query.order)
// => 'desc'

console.dir(req.query.shoe.color)
// => 'blue'

console.dir(req.query.shoe.type)
// => 'converse'

// GET /shoes?`color[]=blue&color[]=black&color[]=red`
console.dir(req.query.color)
// => ['blue', 'black', 'red']



# Registering the Plugin
```javascript
var Hapi = require('@hapi/hapi');
var server = new Hapi.Server();

server.register([
  {
    register: require('hapi-query-qs'),
    options: {
      ignoredKeys: ['count', 'offset'], // Array of query parameters not to convert to filter object
      defaultEnabled: true // if true plugin will be used on all routes
    }
  }
], function (err) {
  // An error will be available here if anything goes wrong
});
```

# Ignoring Keys
You can ignore keys to have them stay at the root level of `request.query`. A configuration of:

```javascript
var Hapi = require('@hapi/hapi');
var server = new Hapi.Server();

server.register([
  {
    register: require('hapi-query-qs'),
    options: {
      ignoredKeys: ['count', 'offset'], // Array of query parameters not to convert to filter object
      defaultEnabled: true // if true plugin will be used on all routes
    }
  }
], function (err) {
  // An error will be available here if anything goes wrong
});
```

Will cause a request like /shoes?`order=desc&shoe[color]=blue&shoe[type]=converse` to create a `request.query.qs` that looks like:
```javascript
{
  order: 'desc',
  
  shoe: {
    color: 'blue',
    type: 'converse'
  }
}
```

# Enabling at the Route Level
If `defaultEnabled: false` you will need to enable the plugin an a per-route basis by doing the following:
```javascript
var Hapi = require('@hapi/hapi');
var server = new Hapi.Server();

server.register([
  {
    register: require('hapi-query-qs')
  }
], function (err) {
  // An error will be available here if anything goes wrong
});

server.route({
  method: 'GET',
  path: '/test',
  handler: function (request, reply) { ... },
  config: {
      plugins: {
      queryFilter: {
        enabled: true,
        ignoredKey: ['count', 'offset'], // Array will be concatenated with the ignoredKeys set at register
        params: ['test_param'] // Array of request.params that will be put into filter object
      }
    }
  }
})
```
