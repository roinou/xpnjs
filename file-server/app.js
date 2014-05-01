var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if ('OPTIONS' == req.method){
        return res.send(200);
    }
    next();
});

var _dataDir = 'data';

app.get('/data/:id', function(req, res) {
    var file = extractFilename(req.params.id);
    if (file) {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                console.log('Error: ' + err);
                res.send(null);
                return;
            }
            try {
                data = JSON.parse(data);
            } catch (parseErr) {
                console.log('error parsing ', data);
            }
            if (data) res.send(data);
        });
    }
});

app.post('/data/:id', function(req, res) {
    console.log('received POST: '+ res.params);
    var file = extractFilename(req.params.id);
    if (file) {
        if (!fs.existsSync(file)) {
            fs.openSync(file, 'w');
        }
//        console.log('body', req.body);
        fs.writeFile(file, JSON.stringify(req.body), function(err) {
            if(err) {
                console.log(err);
            }
            res.send(null);
        });
    }
});

extractFilename = function(filename) {
    var file = filename;
    if (file) {
        if (file.indexOf('..') >= 0) return;
        if (file.indexOf('.json') < 0) {
            file = file + '.json';
        }
        file = _dataDir + '/' + file;
        return file;
    }
    return null;
};

app.listen(8080);
console.log('Listening on port 8080...');