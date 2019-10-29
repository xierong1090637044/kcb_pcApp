'use strict'

import { app, BrowserWindow, ipcMain, dialog } from 'electron';

// 引入自动更新模块
const { autoUpdater } = require('electron-updater');
const feedUrl = `https://www.jimuzhou.com/download/`; // 更新包位置
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, webContents
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)
  webContents = mainWindow.webContents;
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}


// 主进程监听渲染进程传来的信息
ipcMain.on('update', (e, arg) => {
  console.log("update");
  checkForUpdates();
});

let checkForUpdates = () => {
  // 配置安装包远端服务器
  autoUpdater.setFeedURL(feedUrl);
  let _this = this;
  // 下面是自动更新的整个生命周期所发生的事件
  autoUpdater.on('error', function(e,message) {
      sendUpdateMessage('error', message);
  });
  autoUpdater.on('checking-for-update', function(e,message) {
      sendUpdateMessage('checking-for-update', message);
  });
  autoUpdater.on('update-available', function(e,message) {
      sendUpdateMessage('update-available', message);
  });
  autoUpdater.on('update-not-available', function(e,message) {
      sendUpdateMessage('update-not-available', message);
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', function(progressObj) {
      sendUpdateMessage('downloadProgress', progressObj);
  });
  // 更新下载完成事件
  autoUpdater.on('update-downloaded', function(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      sendUpdateMessage('isUpdateNow');
      ipcMain.on('updateNow', (e, arg) => {
          autoUpdater.quitAndInstall();
      });
  });

  //执行自动更新检查
  autoUpdater.checkForUpdates();
};

// 主进程主动发送消息给渲染进程函数
function sendUpdateMessage(message, data) {
  console.log('2222',{ message, data });
  webContents.send('message', { message, data });
}




app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})