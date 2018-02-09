// development config
const merge = require('webpack-merge');
const webpack = require('webpack');
const {resolve, join} = require('path');
const commonConfig = require('./common');
const outputPath = resolve(__dirname, '../frontend/js');
const publicPath = 'http://127.0.0.1:8080/';

module.exports = env => {

    const NODE_ENV = env.prod ? 'production' : 'development';

    return merge(commonConfig, {
        entry: {
            app: [
                'react-hot-loader/patch', // activate HMR for React
                'webpack-dev-server/client?http://127.0.0.1:8080',// bundle the client for webpack-dev-server and connect to the provided endpoint
                'webpack/hot/only-dev-server', // bundle the client for hot reloading, only- means to only hot reload for successful updates
                join(__dirname, '../frontend/js/entry.tsx') // the entry point of our app
            ]
        },
        output: {
            filename: 'bundle.js',
            path: outputPath,
            publicPath: publicPath // necessary for HMR to know where to load the hot update chunks
        },
        devServer: {
            hot: true, // enable HMR on the server
            contentBase: outputPath,
            publicPath: publicPath
        },
        devtool: 'cheap-module-eval-source-map',
        plugins: [
            new webpack.HotModuleReplacementPlugin(), // enable HMR globally
            new webpack.NamedModulesPlugin(), // prints more readable module names in the browser console on HMR updates
            new webpack.DefinePlugin({
                __DEVELOPMENT__: Boolean(env.dev),
                'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
            }),
        ],
    });
};