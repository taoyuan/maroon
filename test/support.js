var chai = require('chai');
chai.config.includeStack = true;

process.env.NODE_ENV = 'test';

exports.t = chai.assert;

exports.getMaroon = function(options) {
    var maroon = require('../').create(undefined, options);
    return maroon;
};