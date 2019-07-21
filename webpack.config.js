/* eslint no-use-before-define: 0 */
var path = require('path');
var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
// const nodeExternals = require('webpack-node-externals');

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */

module.exports = {
    mode: 'production',
    entry: ['./src/app.ts'],
    target: 'node',
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist'),
    },

    plugins: [new webpack.ProgressPlugin(), new CleanWebpackPlugin()],

    module: {
        rules: [
            {
                test: /.(ts|tsx)?$/,
                loader: 'ts-loader',
                include: [path.resolve(__dirname, 'src')],
                exclude: [/node_modules/],
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'eslint-loader',
                include: [path.resolve(__dirname, 'src')],
                exclude: /(node_modules)/,
            },
        ],
    },

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    priority: -10,
                    test: /[\\/]node_modules[\\/]/,
                },
            },
            chunks: 'async',
            minChunks: 1,
            minSize: 30000,
            name: true,
        },
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};
