const path = require('path');
const webpack = require('webpack');
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
    })
]

module.exports = {
    target: 'electron-main',
    entry: {
        main: ['./src/main/index.js']
    },
    output: {
        path: path.join(process.cwd(), 'dist'),
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