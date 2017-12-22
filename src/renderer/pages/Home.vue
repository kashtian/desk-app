<template>
    <div class="home-page">
        <div>图片压缩工具</div>
        <button @click="openSrc">请选择文件</button>
        <div>开始目录：{{src}}</div>
        <button @click="openDest">请选择存储目录</button>
        <div>目标目录: {{dest}}</div>
        <button @click="compressImages">开始压缩</button>
    </div>
</template>

<script>
import { remote, ipcRenderer } from 'electron';

export default {
    name: 'home',

    route: {
        path: '/',
        title: '图片压缩'
    },

    data() {
        return {
            src: '',
            dest: ''
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
            ipcRenderer.send('compress-img', {
                src: this.src,
                target: this.dest
            })
        }
    }
}
</script>