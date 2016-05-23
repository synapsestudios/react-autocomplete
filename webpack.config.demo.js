/* globals __dirname */
'use strict';

var autoprefixer = require('autoprefixer');
var Webpack      = require('webpack');
var HtmlWebpack  = require('html-webpack-plugin');
var path         = require('path');
var npmPath     = path.resolve(__dirname, 'node_modules');

module.exports = {
    devtool: "eval-source-map",
    entry: [
        './demo/bootstrap.js',
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:9000'
    ],
    module: {
        loaders: [
            {
                test    : /\.jsx?$/,
                loaders : ['react-hot', 'babel'],
                exclude : npmPath,
            },
            {
                test    : /\.scss$/,
                loader  : 'style!css!postcss!sass?outputStyle=nested&includePaths[]=' + npmPath,
                include : /scss/
            },
            {
                test   : /\.css$/,
                loader : 'style-loader!css-loader'
            }
        ]
    },
    output: {
        filename   : 'demo.js',
        path       : path.resolve(__dirname, 'demo-build'),
        publicPath : '/'
    },
    resolve : {
        extensions : ['', '.js', '.jsx', '.css', '.scss']
    },
    plugins: [
        new HtmlWebpack({
            template : './demo/index.html'
        }),
        new Webpack.HotModuleReplacementPlugin(),
        new Webpack.optimize.OccurenceOrderPlugin(),
    ],
    postcss : function() {
        return [autoprefixer];
    }
};
