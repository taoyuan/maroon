var s = require('./support');
var t = s.t;

describe('maroon.loadConfigs', function() {
    it('should load configs from given directory', function() {
        var maroon = s.getMaroon();
        maroon.loadConfigs(__dirname + '/fixtures/config');
        t.ok(maroon.get('database'), 'load database config');
        t.equal(maroon.get('database').driver, 'memory');
        t.ok(maroon.get('foo'), 'load extra config');
        t.equal(maroon.get('foo'), 'bar');
        t.notOk(maroon.get('hello'));
    });
});
