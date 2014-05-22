var s = require('./support');
var t = s.t;

describe('maroon', function () {

    it.only('should set right arguments with dot notation argv', function (done) {
        var m = s.getMaroon({argv: {a: {b: {c: 'hello'}}}});
        m.on('ready', function () {
            t.deepEqual({b: {c: 'hello'}}, m.argv.a);
            done();
        });
    });

});