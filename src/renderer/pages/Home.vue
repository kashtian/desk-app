<template>
    <div class="home-page">
        <div>图片压缩工具</div>
        <button @click="openSrc">请选择文件</button>
        <div>开始目录：{{src}}</div>
        <button @click="openDest">请选择存储目录</button>
        <div>目标目录: {{dest}}</div>
        <button @click="compressImages">开始压缩</button>
        <div>
            <span>请选择jpg压缩质量：</span>
            <input type="range" step="1" min="0" max="100" v-model="quality_jpg"/>
            <span>{{quality_jpg}}</span>
        </div>
        <div>
            <span>请选择png压缩质量：</span>
            <input type="range" step="1" min="0" max="100" v-model="quality_png"/>
            <span>{{quality_png}}</span>
        </div>
    </div>
</template>

<script>
import { remote } from 'electron';
import { compressImg, options as cOpts } from '../utils/compress-img'

export default {
    name: 'home',

    route: {
        path: '/',
        title: '图片压缩'
    },

    data() {
        return {
            src: '',
            dest: '',
            quality_jpg: cOpts.quality,
            quality_png: cOpts.quality
        }
    },

    methods: {
        openSrc() {
            remote.dialog.showOpenDialog({
               filters: [
                   {
                       name: 'Images',
                       extensions: ['jpg', 'jpeg', 'png']
                   }
               ],
               properties: ['openFile', 'openDirectory']
            }, filePaths => {
                if (filePaths) {
                    this.src = filePaths[0];
                }                
            })
        },

        openDest() {
            remote.dialog.showOpenDialog({
               properties: ['openDirectory', 'createDirectory']
            }, filePaths => {
                if (filePaths) {
                     this.dest = filePaths[0];
                }               
            })
        },

        compressImages() {
            if (!this.src) {
                remote.dialog.showErrorBox('警告', '开始目录不能为空')
                return;
            }
            if (!this.dest) {
                remote.dialog.showErrorBox('警告', '目标目录不能为空')
                return;
            }
            let params = {};
            this.quality_jpg && (params.quality_jpg = parseInt(this.quality_jpg));
            this.quality_png && (params.quality_png = parseInt(this.quality_png));
            compressImg(this.src, this.dest, params).then(() => {
                remote.dialog.showMessageBox({
                    message: '图片处理完成'
                })
            }).catch(err => {
                console.log(err)
                remote.dialog.showErrorBox('图片处理失败', err || '出错了');
            })
        }
    }
}
</script>