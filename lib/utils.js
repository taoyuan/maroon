var path = require('path'),
    fs = require('fs');


exports.safe_merge = function(merge_what) {
    merge_what = merge_what || {};
    Array.prototype.slice.call(arguments).forEach(function(merge_with, i) {
        if (i == 0) return;
        for (var key in merge_with) {
            if (!merge_with.hasOwnProperty(key) || key in merge_what) continue;
            merge_what[key] = merge_with[key];
        }
    });
    return merge_what;
};

exports.humanize = function(underscored) {
    var res = underscored.replace(/_/g, ' ');
    return res[0].toUpperCase() + res.substr(1);
};

exports.camelize = function(underscored, upcaseFirstLetter) {
    var res = '';
    underscored.split('_').forEach(function(part) {
        res += part[0].toUpperCase() + part.substr(1);
    });
    return upcaseFirstLetter ? res : res[0].toLowerCase() + res.substr(1);
};

exports.classify = function(str) {
    return exports.camelize(exports.singularize(str));
};

exports.underscore = function(camelCaseStr) {
    var initialUnderscore = camelCaseStr.match(/^_/) ? '_' : '';
    var str = camelCaseStr
        .replace(/^_([A-Z])/g, '$1')
        .replace(/([A-Z])/g, '_$1')
        .replace(/^_/, initialUnderscore);
    return str.toLowerCase();
};

exports.singularize = function singularize(str, singular) {
    return require('inflection').singularize(str, singular);
};

exports.pluralize = function pluralize(str, plural) {
    return require('inflection').pluralize(str, plural)
};

// Stylize a string
function stylize(str, style) {
    if (typeof window !== 'undefined') return str;
    var styles = {
        'bold' : [1, 22],
        'italic' : [3, 23],
        'underline' : [4, 24],
        'cyan' : [96, 39],
        'blue' : [34, 39],
        'yellow' : [33, 39],
        'green' : [32, 39],
        'red' : [31, 39],
        'grey' : [90, 39],
        'green-hi' : [92, 32]
    };
    var s = styles[style];
    return '\033[' + s[0] + 'm' + str + '\033[' + s[1] + 'm';
}

var $ = function(str) {
    str = new(String)(str);

    ['bold', 'grey', 'yellow', 'red', 'green', 'cyan', 'blue', 'italic', 'underline'].forEach(function(style) {
        Object.defineProperty(str, style, {
            get: function() {
                return $(stylize(this, style));
            }
        });
    });
    return str;
};
stylize.$ = $;
exports.stylize = stylize;

exports.addCoverage = function(code, filename) {
    if (!global.__cov) return code;
    return require('semicov').addCoverage(code, filename);
};

// cache for source code
var cache = {};

function addSpaces(str, len, to_start) {
    var str_len = str.length;
    for (var i = str_len; i < len; i += 1) {
        if (!to_start) {
            str += ' ';
        } else {
            str = ' ' + str;
        }
    }
    return str;
}
exports.addSpaces = addSpaces;

function readYaml(file) {
    try {
        var yaml = require(['yaml', 'js'].join('-'));
        var obj = yaml.load(fs.readFileSync(file).toString());
        if (obj && obj.shift) {
            obj = obj.shift();
        }
        return obj;
    } catch (e) {
        console.log('Error in reading', file);
        console.log(e.message);
        console.log(e.stack);
    }
}
exports.readYaml = readYaml;

exports.existsSync = fs.existsSync || path.existsSync;

function recursivelyWalkDir(directory, filter, callback) {
    if(!callback) { callback = filter; filter = null; }
    var results = [];
    fs.readdir(directory, function(err, list) {
        if (err) return callback(err);
        var pending = list.length;
        if (!pending) return callback(null, results);

        list.forEach(function(file) {
            file = directory + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    recursivelyWalkDir(file, filter, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) callback(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) callback(null, results);
                }
            });
        });
    });
}
exports.recursivelyWalkDir = recursivelyWalkDir;

function ensureDirectoryExists(directory, root) {
    var dirs = directory.split('/')
        , dir = dirs.shift();

    root = (root || '') + dir + '/';

    try { fs.mkdirSync(root); }
    catch (e) {
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }

    return !dirs.length || ensureDirectoryExists(dirs.join('/'), root);
}
exports.ensureDirectoryExists = ensureDirectoryExists;

exports.bind = bind;
function bind(fn, context) {
    var curriedArgs = Array.prototype.slice.call(arguments, 2);
    if (curriedArgs.length) {
        return function () {
            var allArgs = curriedArgs.slice(0);
            for (var i = 0, n = arguments.length; i < n; ++i) {
                allArgs.push(arguments[i]);
            }
            fn.apply(context, allArgs);
        };
    } else {
        return function () {
            return fn.apply(context, arguments);
        };
    }
}

/**
 * Forward `functions` from `from` to `to`.
 *
 * The `this` context of forwarded functions remains bound to the `to` object,
 * ensuring that property pollution does not occur.
 *
 * @param {Object} from
 * @param {Object} to
 * @param {Array} functions
 * @api private
 */
exports.forward = forward;
function forward(from, to, functions) {
    for (var i = 0, len = functions.length; i < len; i++) {
        var method = functions[i];
        from[method] = bind(to[method], to);
    }
}

