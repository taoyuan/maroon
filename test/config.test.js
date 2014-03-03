var s = require('./support');
var t = s.t;

describe('maroon.loadConfigs', function() {
    it('should load configs from given directory', function() {
        var maroon = s.getMaroon();
        maroon.loadConfigs(__dirname + '/fixtures/config');
        t.ok(maroon.set('database'), 'load database config');
        t.equal(maroon.set('database').driver, 'memory');
        t.ok(maroon.set('foo'), 'load extra config');
        t.equal(maroon.set('foo'), 'bar');
        t.notOk(maroon.set('hello'));
    });
    
});
