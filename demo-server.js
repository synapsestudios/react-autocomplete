/* globals __dirname */
'use strict';
var path             = require('path');
var proxy            = require('express-http-proxy');
var request          = require('request');
var WebpackDevServer = require('webpack-dev-server');
var webpack          = require('webpack');
var config           = require('./webpack.config.demo');

var server = new WebpackDevServer(webpack(config), {
    contentBase : path.resolve(__dirname, 'demo-build'),
    hot         : true,
    noInfo      : true
});

server.use('', proxy('http://localhost'));

server.use(function (req, res, next) {
    var ext = path.extname(req.url);

    console.log('req.hostname', req.hostname);

    if ((ext === '' || ext === '.html') && req.url !== '/') {
        req.pipe(request('http://' + req.hostname + ':9001')).pipe(res);
    } else {
        next();
    }
});

server.listen(9001, function (err, result) {
    if (err) {
        console.log(err);
    }

    console.log('Listening at localhost:9001');
});
