const path = require('path');
const express = require('express');
const webpack = require('webpack');
const electron = require('electron');
const { spawn } = require('child_process');
const colors = require('colors');
const mainConfig = require('./webpack.main.config');
const rendererConfig = require('./webpack.renderer.config');

const app = express();

function startRenderer() {
    return new Promise((resolve, reject) => {
        const rendererCompiler = webpack(rendererConfig);
        const devMiddleware = require('webpack-dev-middleware')(rendererCompiler, {
            stats: {
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }
        });
        app.use(devMiddleware);

        // hot middleware
        app.use(require('webpack-hot-middleware')(rendererCompiler));

        app.listen(1110, () => {
            resolve();
            console.log(`==> Listening at http://localhost:${1110}`.green)
        })
    })
}

function startMain() {
    return new Promise((resolve, reject) => {
        const mainCompiler = webpack(mainConfig);

        mainCompiler.watch({}, (err, stats) => {
            if (err) {
                console.log(`main compile error: =====>${err}`.red);
                return;
            }
            console.log(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }))
            resolve();
        })
    })
}

function startElectron() {
    let electronProcess = spawn(electron, ['--inspect=5859', path.join(__dirname, '../dist/main.js')])

    electronProcess.stdout.on('data', data => {
        console.log(`electron process stdout data========>${data}`.blue);
    })

    electronProcess.stderr.on('data', data => {
        console.log(`electron process error: =============>${data}`.red);
    })

    electronProcess.on('close', () => {
        console.log('electron process close')
        process.exit();
    })
}

function init() {
    Promise.all([
        startRenderer(),
        startMain()
    ]).then(() => {
        startElectron();
    }).catch(err => {
        console.log(`init error: ==========>${err}`.red);
    })
}

init();