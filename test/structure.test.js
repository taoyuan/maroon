"use strict";

var s = require('./support');
var t = s.t;
var maroon = require('../');

describe('structure', function () {
    it('should load structure', function (done) {
        var app = {};
        var m = maroon.create(app, {
            root: __dirname + '/fixtures',
            structure: ['controllers', 'services']
        });
        m.on('ready', function () {
            t.ok(m.structure.controllers);
            t.ok(m.structure.controllers['controller1']);
            t.ok(m.structure.controllers['controller2']);
            t.ok(m.structure.services);
            t.ok(m.structure.services['service1']);
            t.ok(m.structure.services['service2']);
            t.notOk(m.structure.tests);
            done();
        });
    });
});