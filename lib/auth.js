/*
 * Module dependencies.
 */

var request = require('request'),
    defaults = require('./defaults'),
    API = require('./api');

/**
 * Authentication for PhoneGap Build.
 *
 * Authenticates with PhoneGap Build to obtain an auth token. With the auth
 * token, an API instance in created and returned via the callback.
 *
 * Options:
 *
 *   - `options` {Object} is the authentication settings.
 *   - `options.username` {String} is the phonegap build username.
 *   - `options.password` {String} is the phonegap build password.
 *   - `options.token` {String} can be used instead of username and password.
 *   - `callback` {Function} is trigger after the authentication.
 *     - `e` {Error} is null unless there is an error.
 *     - `api` {Object} is the `API` instance to interact with phonegap build.
 */

module.exports = function(options, callback) {
    options = extend(defaults, options);

    // require options parameter
    if (!options) throw new Error('missing options argument');

    // require options parameter credentials
    if (!options.client_id) throw new Error('missing options.client_id argument');
    if (!options.client_secret) throw new Error('missing options.client_secret argument');
    if (!options.token) throw new Error('missing options.token argument');

    // require callback parameter
    if (!callback) throw new Error('missing callback argument');

    // url for authentication
    var uri = options.protocol + '//' + options.host + ':' + options.port + '/authorize' +
        '?client_id=' + options.client_id + 
        '&client_secret=' + options.client_secret + 
        '&auth_token=' + options.token;

    // try to authenticate
    request.post(uri, {}, function(e, response, body) {
        // failed request
        if (e) {
            callback(e);
            return;
        }

        // failed response
        if (response.statusCode !== 200) {
            // provide a default message when none is provided
            body = body || 'server returned status code ' + response.statusCode;
            callback(new Error(body));
            return;
        }

        // parse phonegap build response
        var data = JSON.parse(body);

        // failed api validation
        if (data.error) {
            callback(new Error(data.error));
            return;
        }

        // create API object
        options.token = data.access_token;
        options.username = undefined;
        options.password = undefined;
        callback(null, new API(options));
    });
};

var extend = function(defaults, overrides) {
    var result = {},
        key;

    for (key in defaults) {
        result[key] = defaults[key];
    }

    for (key in overrides) {
        result[key] = overrides[key];
    }
    return result;
};
