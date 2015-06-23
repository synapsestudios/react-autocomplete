/* globals __dirname */
'use strict';

var autoprefixer = require('autoprefixer-core');
var Webpack      = require('webpack');
var HtmlWebpack  = require('html-webpack-plugin');
var path         = require('path');

var npmPath     = path.resolve(__dirname, 'node_modules');
var config      = {
    sassOptions  : (
        '?outputStyle=nested&includePaths[]=' + npmPath
    )
};

module.exports = {
    entry: [
        './demo/bootstrap.js',
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:9001'
    ],
    module: {
        loaders: [
            {
                test    : /\.(jsx|js)$/,
                loaders : ['babel', 'react-hot'],
                exclude : /node_modules/
            },
            {
                test    : /\.scss$/,
                loader  : 'style!css!postcss!sass' + config.sassOptions,
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
        new Webpack.optimize.OccurenceOrderPlugin()
    ],
    postcss : function() {
        return [autoprefixer];
    }
};
