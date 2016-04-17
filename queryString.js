/*!
    query-string
    Parse and stringify URL query strings
    https://github.com/sindresorhus/query-string
    by Sindre Sorhus
    MIT License
    Some modifications by Jacob Fischer
*/
(function () {
    'use strict';
    var queryString = {};

    queryString.parse = function (str) {
        if (typeof str !== 'string') {
            return {};
        }

        str = str.trim().replace(/^\?/, '');

        if (!str) {
            return {};
        }

        return str.trim().split('&').reduce(function (ret, param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            var key = parts[0];
            var val = parts[1];

            key = decodeURIComponent(key);
            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            if (!ret.hasOwnProperty(key)) {
                ret[key] = val;
            } else if (Array.isArray(ret[key])) {
                ret[key].push(val);
            } else {
                ret[key] = [ret[key], val];
            }

            return ret;
        }, {});
    };

    queryString.stringify = function (obj) {
        return obj ? Object.keys(obj).map(function (key) {
            var val = obj[key];

            if (Array.isArray(val)) {
                return val.map(function (val2) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                }).join('&');
            }

            return encodeURIComponent(key) + '=' + encodeURIComponent(val);
        }).join('&') : '';
    };

    queryString.setAll = function(key_values) {
        var params = queryString.parse(location.search);
        var changed = false;
        for(var key in key_values) {
            if(key_values.hasOwnProperty(key)) {
                var value = key_values[key];
                if(params[key] !== value) {
                    changed = true;
                }

                if(value === undefined) { // delete the key
                    delete params[key];
                }
                else {
                    params[key] = key_values[key];
                }
            }
        }

        if(changed) {
            var new_params_string = queryString.stringify(params);
            history.pushState({}, "", window.location.pathname + '?' + new_params_string);
        }
    };

    queryString.getAll = function() {
        return queryString.parse(location.search);
    };

    queryString.clear = function() {
        var params = queryString.getAll();
        for(var key in params) {
            params[key] = undefined;
        }

        queryString.setAll(params);
    };

    queryString.set = function (key, new_value) {
        var params = queryString.parse(location.search);
        if(params[key] === new_value) {
            return;
        }
        params[key] = new_value;
        var new_params_string = queryString.stringify(params)
        history.pushState({}, "", window.location.pathname + '?' + new_params_string);
    };

    queryString.remove = function (key) {
        var params = queryString.parse(location.search);
        if(!params.hasOwnProperty(key)) {
            return;
        }
        delete params[key]
        var new_params_string = queryString.stringify(params)
        history.pushState({}, "", window.location.pathname + '?' + new_params_string);
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = queryString;
    } else {
        window.queryString = queryString;
    }
})();
