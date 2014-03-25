var s = require('./support');
var t = s.t;
var maroon = require('../');

describe('maroon', function () {
    it('should forward configuration functions', function () {
        var app = {};
        var m = maroon.create(app, { forward: true });
        m.set('message', 'hello');
        t.equal('hello', app.get('message'));
    });
});