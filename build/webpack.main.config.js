const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { dependencies } = require('../package.json');

let plugins = [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        comments: false
    }),
    new CopyWebpackPlugin([
        {
            from: path.join(__dirname, '../package.json'),
            to: path.join(__dirname, '../dist')
        }
    ])
]

module.exports = {
    target: 'electron-main',
    entry: {
        main: ['./src/main/index.js']
    },
    node: {
        __dirname: false,  // no mock
        __filename: false   // no mock
    },
    output: {
        path: path.join(__dirname, '../dist'),
        filename: 'main.js',
        libraryTarget: 'commonjs2'
    },
    externals: [
        ...Object.keys(dependencies || {})
    ],
    resolve: {
        extensions: ['.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: process.argv.includes('--development') ? [] : plugins
}