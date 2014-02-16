var s = require('./support');
var t = s.t;

describe('naf.loadConfigs', function() {
    it('should load configs from given directory', function() {
        var naf = s.getNaf();
        naf.loadConfigs(__dirname + '/fixtures/config');
        t.ok(naf.get('database'), 'load database config');
        t.equal(naf.get('database').driver, 'memory');
        t.ok(naf.get('foo'), 'load extra config');
        t.equal(naf.get('foo'), 'bar');
        t.notOk(naf.get('hello'));
    });
});
