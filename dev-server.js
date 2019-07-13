/* eslint-disable */
var webpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');

var config = require('./webpack.dev.config');
var options = {
    contentBase: './dist',
    hot: true,
    host: 'localhost',
};

webpackDevServer.addDevServerEntrypoints(config, options);
var compiler = webpack(config);
var server = new webpackDevServer(compiler, options);

server.listen(5000, 'localhost', () => {
    console.log('dev server listening on port 5000');
});
