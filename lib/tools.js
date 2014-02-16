var path = require('path'),
    fs = require('fs'),
    readline = require('readline'),
    childProcess = require('child_process'),
    sys = require('util'),
    util = sys,
    utils = require('./utils');

/**
 * Debug console.
 * node REPL console with naf bindings
 *
 * Predefined helpers:
 *
 *  - `c` - callback, assigning it's arguments to _0 _1 .. _N variables
 *  - `reload` - reload models
 *  - `exit` - quit repl
 *
 * Usage Example:
 * ```
 * $ naf console
 * naf> User.all(c)
 * undefined
 * naf> [ [ 'hgetall', 'User:68' ],
 *  [ 'hgetall', 'User:69' ],
 *  [ 'hgetall', 'User:70' ],
 *  [ 'hgetall', 'User:71' ],
 *  [ 'hgetall', 'User:72' ],
 *  [ 'hgetall', 'User:73' ],
 *  [ 'hgetall', 'User:74' ],
 *  [ 'hgetall', 'User:75' ] ] '[2ms]'
 *  Callback called with 2 arguments:
 *  _0 = null
 *  _1 = [object Object],[object Object],...
 * naf> _1[0].toObject()
 * { id: '68',
 *   githubId: null,
 *   displayName: null,
 *   username: null,
 *   avatar: null }
 * ```
 *
 * @return {Boolean} true.
 *
 */
function debugConsole(naf, args) {
    var ctx = require('repl').start('naf> ').context;

    ctx.reload = function() {
        // TODO: reload models
//        ctx.app = naf.app;
        for (var model in naf.models) {
            ctx[model] = naf.models[model];
        }
    };

    ctx.c = function() {
        var l = arguments.length,
            message = 'Callback called with ' + l +
                ' argument' + (l === 1 ? '' : 's') + (l > 0 ? ':\n' : '');

        for (var i = 0; i < 10; i++) {
            if (i < arguments.length) {
                ctx['_' + i] = arguments[i];
                message += '_' + i + ' = ' + arguments[i] + '\n';
            } else {
                if (ctx.hasOwnProperty('_' + i)) {
                    delete ctx['_' + i];
                }
            }
        }
        console.log(message);
    };

    ctx.exit = function() {
        process.exit(0);
    };

    process.nextTick(ctx.reload);

    return false;
}

exports.console = debugConsole;

debugConsole.help = {
    shortcut: 'c',
    usage: 'console',
    description: 'Debug console'
};


exports.dbconsole = function dbconsole(naf, args) {
    var db = childProcess.spawn('mongo');
    var rli = readline.createInterface(process.stdin, process.stdout, autocomplete);
    var data = '';
    db.stdout.on('data', function(chunk) {
        data += chunk;
        write();
    });
    function write() {
        if (write.to) {
            clearTimeout(write.to);
        }
        setTimeout(function() {
            process.stdout.write(data);
            rli.prompt();
            data = '';
        }, 50);
    }
    rli.on('SIGINT', rli.close.bind(rli));
    rli.addListener('close', process.exit);
    rli.setPrompt('mongo > ');
    rli.addListener('line', function(line) {
        db.stdin.write(line + '\n');
    });
    // console.log(db);
    function autocomplete(input) {
        return [['help', 'test'], input];
    }
};

/**
 * Naf server. Command optionally accept PORT argument
 *
 * ```sh
 * naf server 8000      # run server on 8000 port
 * naf s 127.0.0.1 3000 # run server on 127.0.0.1:3000 using shorter alias
 * PORT=80 naf s        # run server on 80 port usin env var PORT
 * ```
 *
 * @return {Boolean} false - to not quit process after executing.
 */
function server(naf, args) {
    var port = process.env.PORT || args.shift() || 3000;
    var host = process.env.HOST || args.shift() || "0.0.0.0";
    var app = naf.app;
    if (app) {
        app.listen(port, host, function () {
            console.log('Naf server listening on %s:%d within `%s` environment.',
                host, port, naf.set('env'));
        });
    }
    return false;
}

exports.server = server;

server.help = {
    shortcut: 's',
    usage: 'server [port]',
    description: 'Run naf server'
};

/**
 * Install naf extension
 *
 * @return {Boolean} false - to not quit process after executing.
 */
//function install(naf, args) {
//    var what = args.shift();
//    naf.installer.init(naf);
//    if(typeof what == "undefined" || what == null) {
//        console.log('No package specified');
//    } else {
//        naf.installer.install(what);
//    }
//    return false;
//}
//
//exports.install = install;
//
//install.help = {
//    shortcut: 'x',
//    usage: 'install [module]',
//    description: 'Install naf module'
//};
//
