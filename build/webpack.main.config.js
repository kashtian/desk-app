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
    new CopyWebpackPlugin(getCopyList())
]

module.exports = {
    target: 'electron-main',
    entry: {
        main: ['./src/main/index.js']
    },
    node: {
        __dirname: process.argv.includes('--development'),  // 生产环境禁止mock
        __filename: process.argv.includes('--development')  
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

function getDependencies(arr) {
    let keys = [];
    if (!arr.length) {
        return keys;
    }
    arr.forEach(item => {
        let { dependencies } = require(`${item}/package.json`);
        removeRepeat(keys, Object.keys(dependencies || {}));
    })
    return removeRepeat(getDependencies(keys), arr);
}

function removeRepeat(src, target) {
    target.forEach(item =>{
        if (!src.includes(item)) {
            src.push(item)
        }
    })   
    return src; 
}

function getCopyList() {
    let dependencies = getDependencies(['jimp', 'pngquant']);
    let list = [];
    dependencies.forEach(item =>{
        list.push({
            from: path.join(__dirname, `../node_modules/${item}/**/*`),
            to: path.join(__dirname, `../dist/`)
        })
    })
    list.push({
        from: path.join(__dirname, '../package.json'),
        to: path.join(__dirname, '../dist')
    })
    return list;
}