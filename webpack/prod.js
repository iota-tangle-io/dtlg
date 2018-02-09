// production config
const merge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
const {resolve} = require('path');

const commonConfig = require('./common');

module.exports = merge(commonConfig, {
    context: path.resolve(__dirname, '../frontend/js'),
    entry: "./entry.tsx",
    devtool: false,
    output: {
        filename: 'bundle.min.js',
        path: resolve(__dirname, '../frontend/js'),
        publicPath: '/',
    },
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            PRODUCTION: JSON.stringify(true),
            __DEVELOPMENT__: JSON.stringify(false),
            BUILD_TIME: JSON.stringify(Date.now()),
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                'screw_ie8': true,
                'warnings': false,
                'unused': true,
                'dead_code': true,
            },
            output: {
                comments: false,
            },
            sourceMap: false,
        })
    ],
});