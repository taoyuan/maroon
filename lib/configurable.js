/**
 * Configurable prototype.
 */

var configurable = exports = module.exports = {};

configurable.init = function (settings) {
    this.settings = settings || {};
    this.defaultConfiguration();
};

/**
 * Initialize configurable configuration.
 *
 * @api private
 */

configurable.defaultConfiguration = function () {
    // default settings
    this.set('env', process.env['NODE_ENV'] || 'development');
};

configurable.get = function (setting) {
    return this.settings[setting];
};

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 *
 *    Configurable.prototype.set('foo', 'bar');
 *    Configurable.prototype.get('foo');
 *    // => "bar"
 *
 * Mounted servers inherit their parent server's settings.
 *
 * @param {String} setting
 * @param {*|?} val
 * @return {Configurable|*} for chaining
 * @api public
 */

configurable.set = function (setting, val) {
    if (1 == arguments.length) {
        return this.get(setting);
    } else {
        this.settings[setting] = val;
        return this;
    }
};

/**
 * Assign `settings` key-value to current settings.
 *
 * @param settings
 */
configurable.setAll = function (settings) {
    for(var key in settings) {
        this.set(key, settings[key]);
    }
};

/**
 * Check if `setting` is enabled (truthy).
 *
 *    Configurable.prototype.enabled('foo')
 *    // => false
 *
 *    Configurable.prototype.enable('foo')
 *    Configurable.prototype.enabled('foo')
 *    // => true
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */

configurable.enabled = function (setting) {
    return !!this.set(setting);
};

/**
 * Check if `setting` is disabled.
 *
 *    Configurable.prototype.disabled('foo')
 *    // => true
 *
 *    Configurable.prototype.enable('foo')
 *    Configurable.prototype.disabled('foo')
 *    // => false
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */

configurable.disabled = function (setting) {
    return !this.set(setting);
};

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {Configurable} for chaining
 * @api public
 */

configurable.enable = function (setting) {
    return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {Configurable} for chaining
 * @api public
 */

configurable.disable = function (setting) {
    return this.set(setting, false);
};

/**
 * Configure callback for zero or more envs,
 * when no `env` is specified that callback will
 * be invoked for all environments. Any combination
 * can be used multiple times, in any order desired.
 *
 * Examples:
 *
 *    Configurable.prototype.configure(function(){
     *      // executed for all envs
     *    });
 *
 *    Configurable.prototype.configure('stage', function(){
     *      // executed staging env
     *    });
 *
 *    Configurable.prototype.configure('stage', 'production', function(){
     *      // executed for stage and production
     *    });
 *
 * Note:
 *
 *  These callbacks are invoked immediately, and
 *  are effectively sugar for the following:
 *
 *     var env = process.env.NODE_ENV || 'development';
 *
 *      switch (env) {
     *        case 'development':
     *          ...
     *          break;
     *        case 'stage':
     *          ...
     *          break;
     *        case 'production':
     *          ...
     *          break;
     *      }
 *
 * @param {String} env
 * @param {Function} fn
 * @return {Configurable|*} for chaining
 * @api public
 */

configurable.configure = function (env, fn) {
    var envs = 'all'
        , args = [].slice.call(arguments);
    fn = args.pop();
    if (args.length) envs = args;
    if ('all' == envs || ~envs.indexOf(this.settings.env)) fn.call(this);
    return this;
};

