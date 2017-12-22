import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { compressImg } from '../utils/compress-img'

const winURL = process.env.NODE_ENV == 'production' 
    ? `file://${__dirname}/index.html` : 'http://localhost:1110';

let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        height: 563,
        useContentSize: true,
        width: 1000
    })

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (mainWindow == null) {
        createWindow();
    }
})

ipcMain.on('compress-img', (event, arg) => {
    compressImg(arg.src, arg.target).then(() => {
        dialog.showMessageBox({
            message: '图片处理完成'
        })
    }).catch(err => {
        dialog.showErrorBox('图片处理失败', err);
    })
})