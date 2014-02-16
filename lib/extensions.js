var utils = require('./utils'),
    fs = require('fs'),
    path = require('path');

/**
 * Initialize extensions
 */
module.exports = function() {
    var root = this.root;

    var autoload = path.join(root, 'config', 'autoload');
    if (utils.existsSync(autoload + '.js') ||
        utils.existsSync(autoload + '.coffee')
        ) {
        var exts = require(autoload);
        init(exts(this), this);
    }

    function init(exts, c) {
        if (exts && exts.forEach) {
            exts.forEach(function (e) {
                if (e.init) {
                    e.init(c);
                }
            });
        }
    }
};