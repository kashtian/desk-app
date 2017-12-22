import fs from 'fs';
import path from 'path';
import gm from 'gm';
import imagemin from 'imagemin';
import imageminPng from 'imagemin-pngquant';

let options = {
    quality: 88
}

export function compressImg(src, target, opts) {
    Object.assign(options, opts);
    return getFileNames(src).then(({jpgs, pngs}) => {
        if (!jpgs.length && !pngs.length) {
            throw '没有图片可以压缩';
        }
        return Promise.all([
            compressJpg(jpgs, target),
            compressPng(pngs, target)
        ])
    })
}

function getFileNames(src) {
    return new Promise((resolve, reject) => {
        if (isDir(src)) {
            fs.readdir(src, (err, files) => {
                if (err) {
                    reject(err.message.error)
                }
                let jpgs = [], pngs = [];
                for (let i = 0, len = files.length; i < len; i++) {
                    if (/^\./.test(files[i])) {
                        continue;
                    }
                    if (/\.png/.test(files[i])) {
                        pngs.push(`${src}/${files[i]}`);
                    } else if (/\.(jpg|jpeg)/.test(files[i])) {
                        jpgs.push(`${src}/${files[i]}`)
                    }
                }
                resolve({
                    jpgs,
                    pngs
                })
            })
        } else {
            resolve({
                jpgs: /\.(jpg|jpeg)/.test(src) ? [src] : [],
                pngs: /\.png/.test(src) ? [src] : []
            })
        }
    })
}

// 压缩jpg图片
function compressJpg(files, target) {
    return new Promise((resolve, reject) => {
        if (!files.length) {
            resolve();
        }
        let errors = [];
        for (let i = 0, len = files.length; i < len; i++) {
            gm(files[i])
            .quality(options.quality_jpg || options.quality)
            .write(`${target}/${path.posix.basename(files[i])}`, function(err) {
                if (err) {
                    errors.push(`compress ${files[i]} error: ${err}`)
                }
                if (i == len - 1) {
                    if (errors.length) {
                        reject(JSON.stringify(errors))
                    } else {
                        resolve();
                    }
                }
            })
        }        
    })  
}

// 压缩png图片
function compressPng(files, target) {
    return imagemin(files, target, {
        plugins: [
            imageminPng({
                quality: options.quality_png || options.quality
            })
        ]
    })
}

function isDir(src) {
    return fs.statSync(src).isDirectory();
}