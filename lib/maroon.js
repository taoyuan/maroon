var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    existsSync = fs.existsSync || path.existsSync,

    configurable = require('./configurable');
    utils = require('./utils');

function Maroon(root, app, options) {
    if (!(this instanceof Maroon)) {
        return new Maroon(root, app, options);
    }
    options = options || {};

    _.assign(this, options);

    var maroon = this;

    this.conf = configurable();
    this.structure = options.structure || {};

    maroon.utils = utils;
    this.parent = null;
    this.root = root || process.cwd();

    if (app) {
        app.maroon = maroon;
        maroon.app = app;
    }

    if (options.forward) {
        console.log('WARNING: forward option has been deprecated');
    }

    maroon.__defineGetter__('rootModule', function () {
        return module.parent;
    });

    maroon.tools = require('./tools');
    maroon.extensions = require('./extensions');
    maroon.loadStructure = require('./structure')(this);
    maroon.__defineGetter__('version', function () {
        return require('../package').version;
    });

    process.nextTick(function () {
        if (!maroon.initialized) {
            maroon.init();
        }
    });
}

util.inherits(Maroon, EventEmitter);

Maroon.prototype.init = function (root) {
    var maroon = this;
    maroon.initialized = true;

    root = root || maroon.root;

    // run environment.{js|coffee}
    // and environments/{test|development|production}.{js|coffee}
    maroon.emit('configure');
    maroon.configureApp(root);
    maroon.emit('after configure');

    // extensions should be loaded before server startup
    maroon.emit('extensions', maroon);
    maroon.extensions();
    maroon.emit('after extensions', maroon);

    if ('function' === typeof maroon.loadStructure) {
        maroon.loadStructure(root);
    }
    maroon.emit('structure', maroon.structure, maroon);

    // run config/initializers/*
    maroon.runInitializers(root);
    maroon.emit('initializers', maroon);

    maroon.emit('ready', maroon);

    return maroon;
};

Maroon.prototype.env = function (val) {
    var app = isConfigurable(this.app) ? this.app : this.conf;
    if (arguments.length === 0) {
        return app.get('env');
    }
    return app.set('env', val);
};

function isConfigurable(obj) {
    return obj && obj.get && obj.settings;
}

Maroon.prototype.loadConfigs = function loadConfigs(dir) {
    var maroon = this;
    var app = isConfigurable(maroon.app) ? maroon.app : maroon.conf;
    fs.readdirSync(dir).forEach(function(file) {
        if (file.match(/^(Roco|environment|routes|autoload)\.(js|coffee|json|yml|yaml)$/)) {
            return;
        }
        var filename = path.join(dir, file);
        var basename = path.basename(filename, path.extname(filename));
        var stats = fs.statSync(filename);
        if (stats.isFile()) {
            var conf = require(filename);
            if ('function' === typeof conf) {
                conf(maroon);
            } else {
                app.set(basename, conf[maroon.env()]);
            }
        }
    });
};

/**
 * Run configurators in `config/environment` and `config/environments/env`.
 * @param {Maroon} root
 */
Maroon.prototype.configureApp = function configureApp(root) {
    var maroon = this;
    root = root || maroon.root;
    var mainEnv = root + '/config/environment';

    if (!requireIfExists(maroon, mainEnv + '.js')) {
        requireIfExists(maroon, mainEnv + '.coffee');
    }

    var supportEnv = root + '/config/environments/' + maroon.env();
    if (!requireIfExists(maroon, supportEnv + '.js')) {
        requireIfExists(maroon, supportEnv + '.coffee');
    }

};

/**
 * Require `module` if it exists
 *
 * @param {Maroon} maroon
 * @param {String} module - path to file.
 * @return {Boolean} success - returns true when required file exists.
 */
function requireIfExists(maroon, module) {
    if (fs.existsSync(module)) {
        requireFun(module)(maroon);
        return true;
    } else {
        return false;
    }
}

function requireFun(filename) {
    var mod, err;
    try {
        mod = require(filename);
    } catch (e) {
        err = e;
    }
    if (typeof mod !== 'function') {
        console.log('WARNING: ', filename,
            'should export function(maroon) but given ' + typeof mod);
    }
    if (err) {
        throw err;
    }
    if (typeof mod === 'function') {
        return mod;
    } else {
        return function() {};
    }
}

/**
 * Run initializers in sandbox mode
 *
 * @param {String} root - root path.
 */
Maroon.prototype.runInitializers = function runInitializers(root) {
    var queue, maroon = this, initializersPath = path.join(
        root || maroon.root, 'config', 'initializers');

    if (existsSync(initializersPath)) {
        queue = fs.readdirSync(initializersPath).map(function(file) {
            if (file.match(/^\./)) return false;
            return requireFun(path.join(initializersPath, file));
        }).filter(Boolean);

        next();
    }

    function next() {
        var initializer = queue.shift();
        if (!initializer) return;
        if (initializer.length === 2) {
            initializer(maroon, next);
        } else {
            initializer(maroon);
            next();
        }
    }
};


/**
 * @param {Object|*} app
 * @param {Object|String|*} options
 * @return {Maroon} maroon.
 */
exports.create = function (app, options) {
    options = options || {};
    if (typeof options === 'string') {
        options = {root: options};
    }
    var root = options.root || process.cwd();
    delete options.root;

    return new Maroon(root, app, options);
};

exports.Maroon = Maroon;

