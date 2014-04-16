"use strict";

var fs = require('fs');
var _ = require('lodash');
var needs = require('needs');

module.exports = function (maroon) {
    var paths = maroon.structure;
    if (!Array.isArray(paths)) {
        if (typeof paths === 'string') {
            paths = [paths];
        } else if (typeof paths === 'object') {
            paths = Object.keys(paths);
        } else {
            throw new Error('Invalid structure options type');
        }
    }

    maroon.structure = {};
    return function(root) {
        var log = require('logs').get('maroon:structure');
        root = root || maroon.root;
        var appDir = root + '/app/';
        if (fs.existsSync(appDir)) {
            log.debug('Loading structure from ' + root);
            fs.readdirSync(appDir).forEach(function(file) {
                if (isRegisteredType(file) && fs.statSync(appDir + file).isDirectory()) {
                    maroon.structure[file] = needs(appDir, file);
                }
            });
        }
    };

    function isRegisteredType(file) {
        return _.contains(paths, file);
    }
};