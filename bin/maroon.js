#!/usr/bin/env node

var sys = require('util');
var fs = require('fs');

try {
    var pkg = require(process.cwd() + '/package.json');
    if (pkg.main.match(/\.coffee$/)) {
        require('coffee-script');
    }
    instantiateApp = require(process.cwd());
} catch(e) {
    instantiateApp = null;
}

var app, maroon;
if (typeof instantiateApp === 'function') {
    app = instantiateApp();
    maroon = app['maroon'];
}
if (!maroon) {
    var Maroon = require('maroon').Maroon;
    maroon = new Maroon;
}

var args = process.argv.slice(2);
var exitAfterAction = true;
var command = args.shift();

process.nextTick(function () {
    switch (command) {
        default:
        case 'h':
        case 'help':
            if (command && command !== 'help' && command !== 'h') {
                var found = false;
                Object.keys(maroon.tools).forEach(function (cmd) {
                    var c = maroon.tools[cmd];
                    if (cmd === command || (c && c.help && c.help.shortcut === command)) {
                        exitAfterAction = c(maroon, args);
                        found = true;
                    }
                });

                if (found) {
                    break;
                }
            }
            var topic = args.shift();
            if (topic) {
                showMan(topic);
                return;
            }
            var help = [
                'Usage: maroon command [argument(s)]\n',
                'Commands:'
            ];
            var commands = [
                ['h', 'help [topic]',    'Display maroon man page']
            ];
            Object.keys(maroon.tools).forEach(function (cmd) {
                var h = maroon.tools[cmd].help;
                if (h && h.usage) {
                    commands.push([h.shortcut || '', h.usage, h.description]);
                }
            });
            var maxLen = 0, addSpaces = maroon.utils.addSpaces;
            commands.forEach(function (cmd) {
                if (cmd[1].length > maxLen) {
                    maxLen = cmd[1].length;
                }
            });
            commands.forEach(function (cmd) {
                help.push('  ' + addSpaces(cmd[0] + ',', 4) + addSpaces(cmd[1], maxLen + 1) + cmd[2]);
            });
//            maroon.generators.init(maroon, args);
//            help.push('\nAvailable generators:\n');
//            help.push('  ' + maroon.generators.list());
            sys.puts(help.join('\n'));
            break;

        case '--version':
            console.log(maroon.version);
            break;
    }

    if (exitAfterAction) {
        process.exit(0);
    }

});

function showMan(topic) {
    var manDir = require('path').resolve(__dirname + '/../man');
    require('child_process').spawn(
        'man', [manDir + '/' + topic + '.3'],
        {
            customFds: [0, 1, 2],
            env: process.env,
            cwd: process.cwd()
        }
    );
}

/*vim ft:javascript*/
