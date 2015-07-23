'use strict';
/* globals __dirname, process */
var Webpack      = require('webpack');
var HtmlWebpack  = require('html-webpack-plugin');
var WebpackError = require('webpack-error-notification');
var RewirePlugin = require('rewire-webpack');
var path         = require('path');

var environment = 'development';
var config      = {
    entry   : [
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:9999',
        './tests.js'
    ],
    plugins : [
        new HtmlWebpack({template : './index.html'}),
        new Webpack.DefinePlugin({
            __BACKEND__     : process.env.BACKEND,
            __ENVIRONMENT__ : '\''+environment+'\''
        }),
        new Webpack.HotModuleReplacementPlugin(),
        new WebpackError(process.platform),
        new RewirePlugin()
    ],
    reactLoaders : ['react-hot', 'babel']
};

module.exports = {
    name   : 'test bundle',
    entry  : config.entry,
    output : {
        filename   : 'tests.js',
        path       : __dirname + '/build',
        publicPath : '/'
    },
    module : {
        preLoaders : [
        ],
        loaders : [
            {
                test   : /\.(ico|jpg|png)$/,
                loader : 'file-loader',
                query  : {name : '[path][name].[ext]'}
            },
            {
                test   : /(favicon|mocha|sinon)\.js$/,
                loader : 'file-loader',
                query  : {name : '[name].js'}
            },
            {
                test    : /\.jsx$/,
                loaders : config.reactLoaders,
                exclude : /node_modules/
            },
            {
                test    : /\.(jsx|js)$/,
                loaders : config.reactLoaders,
                include : path.resolve(__dirname, '../node_modules/react-dropzone')
            },
            {
                test   : /\.json$/,
                loader : 'json-loader'
            },
            {
                test   : /\.css$/,
                loader : 'style!css'
            },
            {
                test   : /\.scss$/,
                loader : 'null-loader'
            }
        ]
    },
    plugins : config.plugins,
    resolve : {
        extensions : ['', '.css', '.js', '.json', '.jsx', '.scss', '.webpack.js', '.web.js']
    },
    devtool : '#inline-source-map'
};
