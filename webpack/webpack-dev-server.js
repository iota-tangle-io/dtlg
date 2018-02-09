const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./dev.js');
const path = require('path');

const env = { dev: process.env.NODE_ENV === 'development' };

const devServerConfig = {
    hot: true,
    inline: true,
    https: false,
    lazy: false,
    disableHostCheck: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: path.join(__dirname, '../frontend'),
    // need historyApiFallback to be able to refresh on dynamic route
    historyApiFallback: { disableDotRule: true },
    // pretty colors in console
    stats: { colors: true }
};

try {
    const server = new WebpackDevServer(webpack(webpackConfig(env)), devServerConfig);
    server.listen(8080, '127.0.0.1');
} catch (err) {
    console.error(err);
}

