var chai = require('chai');
chai.Assertion.includeStack = true;

process.env.NODE_ENV = 'test';

exports.t = chai.assert;

exports.getMaroon = function() {
    var maroon = require('../').create({});
    maroon.enable('quiet');
    return maroon;
};