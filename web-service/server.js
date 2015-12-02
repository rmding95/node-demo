/*
    server.js
    main server script for our task list web service
*/

'use strict';

var SQL_CREATE_TABLE = 'create table if not exists tasks(title string, done int, createdOn datetime)';

var express = require('express');
var sqlite = require('sqlite3');
var bodyParser = require('body-parser');

var app = express();
var port = 8080;

app.use(express.static(__dirname + '/static'));
//tell express to parse post body data as json
app.use(bodyParser.json());

app.get('/api/tasks', function(req, res, next) {
    db.all('select rowid, title, done, createdOn from tasks where done != 1', function(err, rows) {
        if (err) {
            return next(err);
        }
        //send data as json to client
        res.json(rows);
    });
});
//npm install --save body-parser, sqlite3, express
app.post('/api/tasks', function(req, res, next) {
    var newTask = {
        title: req.body.title || 'New Task',
        done: false,
        createdOn: new Date()
    };

    var sql = 'insert into tasks(title, done, createdOn) values (?,?,?)';
    db.run(sql, [newTask.title, newTask.done, newTask.createdOn], function(err) {
        if (err) {
            return next(err);
        }
        newTask.rowid = this.lastID;
        res.status(201).location('/api/tasks/' + newTask.rowid).json(newTask);
    });
});

app.put('/api/tasks/:rowid', function(req, res, next) {
    var sql = 'update tasks set done=? where rowid=?';
    db.run(sql, [req.body.done, req.params.rowid], function(err) {
        if (err) {
            return next(err);
        }
        res.json(req.body);
    });
});

//global error handler for express
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
        message: err.message
    });
});
    
var db = new sqlite.Database(__dirname + '/data/tasks.db', function(err) {
    if (err) {
        throw err;
    }

    db.run(SQL_CREATE_TABLE, function(err) {
        if (err) {
            throw err;
        }
        app.listen(port, function() {
            console.log('server is listening on http://localhost:' + port);
        });
    });
});

process.on('exit', function() {
    if (db) {
        console.log('closing the database');
        db.close();
    }
});

