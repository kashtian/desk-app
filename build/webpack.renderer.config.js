const path = require('path');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const vueConfig = require('./vue-loader.config');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')


const baseConfig = {
    target: 'electron-renderer',

    entry: {
        renderer: ['./src/renderer/main.js'],
        vendor: [
            'vue',
            'vue-router',
            'vuex',
            'vuex-router-sync'
        ]
    },

    output: {
        path: path.join(process.cwd(), 'dist'),
        filename: '[name].[chunkhash:7].js',
        libraryTarget: 'commonjs2'
    },

    resolve: {
        alias: {
            '@': path.join(__dirname, '../src/renderer')
        },
        extensions: ['.js', '.vue']
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: vueConfig
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif)/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'images/[hash:7].[ext]'
                }
            }
        ]
    }
}

if (process.argv.includes('--development')) {
    /**
     * 开发环境配置热替换
     */
    baseConfig.entry.renderer.push('webpack-hot-middleware/client');
    baseConfig.output.filename = '[name].js';
} else {
    vueConfig.loaders = {
        less: ExtractTextPlugin.extract({
            use: 'css-loader!less-loader',
            fallback: 'vue-style-loader'
        })
    }
}

const devConfig = {
    devtool: 'source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        //跳过编译中出错的模块
        new webpack.NoEmitOnErrorsPlugin(),
        new HTMLPlugin({
            template: 'src/index.html'
        })
    ]
};

const prodConfig = {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.IgnorePlugin(/vertx/),
        //根据模块调用次数，给模块分配ids，常被调用的ids分配更短的id，使得ids可预测，降低文件大小
        new webpack.optimize.OccurrenceOrderPlugin(),
        new UglifyJsPlugin(),
        // extract vendor chunks for better caching
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        }),
        new HTMLPlugin({
            template: 'src/index.html'
        }),
        new ExtractTextPlugin('[name].[contenthash:7].css')
    ]
}

module.exports = Object.assign({}, baseConfig, process.argv.indexOf('--development') > -1 ? devConfig : prodConfig);

