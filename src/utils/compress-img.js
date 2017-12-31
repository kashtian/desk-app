import fs from 'fs';
import path from 'path';
import PngQuant from 'pngquant';
import Jimp from 'jimp';

export let options = {
    quality: 68
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
            Jimp.read(files[i], (err, image) => {
                if (err) {
                    errors.push(`compress ${files[i]} error: ${err}`)
                    if (i == len - 1) {
                        reject(JSON.stringify(errors))
                    }
                } else {
                    image.quality(options.quality_jpg || options.quality)
                    .write(`${target}/${getFileName(files[i])}`, err => {
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
    })  
}

// 压缩png图片
function compressPng(files, target) {
    return new Promise((resolve, reject) => {
        if (!files.length) {
            resolve();
        }
        let errors = [], srcStream, destStream, myPngQuant;
        for (let i = 0, len = files.length; i < len; i++) {
            srcStream = fs.createReadStream(files[i]);
            destStream = fs.createWriteStream(`${target}/${getFileName(files[i])}`)
            myPngQuant = new PngQuant([100, '-f', '--quality', getPngQualityRange()])
            myPngQuant.on('error', err => {
                errors.push(`compress ${getFileName(files[i])} error: ${err}`)                
            }).on('data', () => {
                console.log('png data')
            }).on('end', () => {
                if (errors.length) {
                    reject(JSON.stringify(errors))
                } else {
                    resolve();
                }                
            })
            srcStream.pipe(myPngQuant).pipe(destStream);                      
        }        
    })
}

function getPngQualityRange() {
    let quality = options.quality_png || options.quality;
    return `${quality-10 < 0 ? 0 : (quality-10)}-${quality+10 > 100 ? 100 : (quality+10)}`
}

function getFileName(filePath) {
    return path.posix.basename(filePath);
}

function isDir(src) {
    return fs.statSync(src).isDirectory();
}