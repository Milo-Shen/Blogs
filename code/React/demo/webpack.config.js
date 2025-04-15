"use strict";

let path = require('path');
let webpack = require('webpack');

// 根目录，代码目录，生成目录
let ROOT_PATH = path.resolve(__dirname);
let APP_PATH = path.resolve(ROOT_PATH, 'app');
let BUILD_PATH = path.resolve(ROOT_PATH, 'build');
let MODULES_PATH = path.resolve(ROOT_PATH, 'node_modules');

module.exports = {

    entry: ['babel-polyfill', path.resolve(APP_PATH, 'app.jsx')],
    output: {
        path: BUILD_PATH,
        filename: "bundle.js"
    },

    // 开启 dev source map
    devtool: 'eval-source-map',

    // 开启 webpack dev server
    devServer: {
        contentBase: BUILD_PATH,
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true,
    },

    // 加载部分模块
    module: {
        loaders: [
            {test: /\.jsx?$/, exclude: MODULES_PATH, include: APP_PATH, loader: 'babel'},
            {test: /\.css$/, loaders: ['style', 'css']},
        ]
    },

    // 配置 plugin
    plugins: [

    ],

    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};