/*
    server.js
    main server script for the socket.io chat demo
*/

var net = require('net');
var server = net.createServer();
var clients = [];

server.on('connection', function(socket) {
    var name;

    function broadcast(name, message) {
        clients.forEach(function(client) {
            if (client != socket) {
                client.write('[' + name '] ' + message + '\n');
            }
        });
    } 

    clients.push(socket);

    console.log('new connection');
    socket.write('Hello what is your name?\n');

    socket.on('data', function(data) {
        if (!name) {
            name = data.toString();
            socket.write('Hi there ' + name + '\n');
        } else {
            broadcast(name, data.toString());
        }
    });

    socket.on('close', function() {
        console.log('connection closed');
    });

    
});

server.on('listening', function() {
    console.log('server listening...');
});

server.listen(3000);
