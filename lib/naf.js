var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    debug = require('logs').get('naf').debug,
    existsSync = fs.existsSync || path.existsSync,
    exists = fs.exists || path.exists,

    configurable = require('./configurable'),
    utils = require('./utils');

function Naf(app, root) {
    if (!(this instanceof Naf)) {
        return new Naf(app, root);
    }
    var naf = this;
    configurable.init.call(naf);

    if (app) {
        app.naf = naf;
        naf.app = app;
    }
    naf.utils = utils;
    this.parent = null;
    this.root = root || process.cwd();

    naf.__defineGetter__('rootModule', function () {
        return module.parent;
    });

    naf.tools = require('./tools');
    naf.extensions = require('./extensions');
    naf.__defineGetter__('version', function () {
        return require('../package').version;
    });

//    process.nextTick(function () {
        naf.init();
//    });
}

util.inherits(Naf, EventEmitter);
_.extend(Naf.prototype, configurable);

Naf.prototype.init = function (root) {
    var naf = this;
    naf.initialized = true;

    root = root || naf.root;

    // run environment.{js|coffee}
    // and environments/{test|development|production}.{js|coffee}
    naf.emit('configure');
    naf.configureApp(root);
    naf.emit('after configure');

    // extensions should be loaded before server startup
    naf.emit('extensions', naf);
    naf.extensions();
    naf.emit('after extensions', naf);

    // run config/initializers/*
    naf.runInitializers(root);
    naf.emit('initializers', naf);

    naf.emit('ready', naf);

    return naf;
};

Naf.prototype.loadConfigs = function loadConfigs(dir) {
    var naf = this;
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
                conf(naf);
            } else {
                naf.set(basename, conf[naf.get('env')]);
            }
        }
    });
};

/**
 * Run configurators in `config/environment` and `config/environments/env`.
 * @param {Naf} naf
 */
Naf.prototype.configureApp = function configureApp(root) {
    var naf = this;
    root = root || naf.root;
    var mainEnv = root + '/config/environment';

    if (!requireIfExists(naf, mainEnv + '.js')) {
        requireIfExists(naf, mainEnv + '.coffee');
    }

    var supportEnv = root + '/config/environments/' + naf.settings.env;
    if (!requireIfExists(naf, supportEnv + '.js')) {
        requireIfExists(naf, supportEnv + '.coffee');
    }

};

/**
 * Require `module` if it exists
 *
 * @param {Naf} naf
 * @param {String} module - path to file.
 * @return {Boolean} success - returns true when required file exists.
 */
function requireIfExists(naf, module) {
    if (fs.existsSync(module)) {
        requireFun(module)(naf);
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
            'should export function(naf) but given ' + typeof mod);
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
Naf.prototype.runInitializers = function runInitializers(root) {
    var queue, naf = this, initializersPath = path.join(
        root || naf.root, 'config', 'initializers');

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
            initializer(naf, next);
        } else {
            initializer(naf);
            next();
        }
    }
};

/**
 * @return {Naf} naf.
 */
exports.create = function (/*root, app*/) {
    var root, app;
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (typeof arg === "string") {
            root = arg;
        } else if (typeof arg === "function") {
            app = arg();
        } else if (typeof arg === "object") {
            app = arg
        }
    }
    root = root || process.cwd();
    return new Naf(app, root);
};

exports.Naf = Naf;

