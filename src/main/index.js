'use strict'

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import Notify from './notify'
require('./protocol-handler')
require('./application-menu')
require('./context-menu')
require('./suspension')
require('./db')
require('./download')
require('./fs')
const electron = require('electron')
const globalShortcut = electron.globalShortcut
const path = require('path')
const nativeImage = require('electron').nativeImage
var log = require('electron-log')
log.transports.console.level = false
log.transports.console.level = 'silly'
const os = require('os')
if (os.platform() === 'win32') {
  console.log('win32')
  app.setAppUserModelId('com.electron.electron-demo1')
}
console.log(app.getAppPath())
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
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
  // 进入最大化
  // mainWindow.maximize()
  mainWindow.on('close', (e) => {
    e.preventDefault()
    openCloseDialog()
  })
}

app.on('ready', () => {
  createWindow()
  handleUpdate()
  initNotify()
  registShortCommand() // 注册快捷键
  // handleUpdate(mainWindow, destroyMainWindow)
})

export function registShortCommand () {
  globalShortcut.register('CommandOrControl+Alt+K', function () {
    dialog.showMessageBox({
      type: 'info',
      message: '成功!',
      detail: '你按下了一个全局注册的快捷键绑定.',
      buttons: ['好的']
    })
  })
}
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

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
// =================================================================================================================
// 更新升级，注意这个autoUpdater不是electron中的autoUpdater
// 更新地址
const updateURL = 'https://www.jimuzhou.com/download/'
// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
export function handleUpdate () {
  //= =================================================================================================================
  const message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新'
  }
  // 设置是否自动下载，默认是true,当点击检测到新版本时，会自动下载安装包，所以设置为false
  autoUpdater.autoDownload = false
  // https://github.com/electron-userland/electron-builder/issues/1254
  if (process.env.NODE_ENV === 'development') {
    autoUpdater.updateConfigPath = path.join(__dirname, 'default-app-update.yml')
  } else {
    autoUpdater.updateConfigPath = path.join(__dirname, '../../../app-update.yml')
  }
  autoUpdater.setFeedURL(updateURL)
  autoUpdater.on('error', function () {
    mainWindow.webContents.send(message.error)
  })
  autoUpdater.on('checking-for-update', function () {
    mainWindow.webContents.send(message.checking)
  })
  autoUpdater.on('update-available', function (info) {
    mainWindow.webContents.send(message.updateAva)
  })
  autoUpdater.on('update-not-available', function (info) {
    mainWindow.webContents.send(message.updateNotAva)
  })

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    log.warn('触发下载。。。')
    console.log(progressObj)
    log.warn(progressObj)
    mainWindow.webContents.send('downloadProgress', progressObj)
  })
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    ipcMain.on('isUpdateNow', (e, arg) => {
      log.warn('开始更新')
      autoUpdater.quitAndInstall()
      mainWindow.destroy()
      // callback()
    })
    mainWindow.webContents.send('isUpdateNow')
  })

  ipcMain.on('checkForUpdate', () => {
    // 执行自动更新检查
    log.warn('执行自动更新检查')
    log.warn(__dirname)
    autoUpdater.checkForUpdates()
  })

  ipcMain.on('downloadUpdate', () => {
    // 下载
    log.warn('执行下载')
    autoUpdater.downloadUpdate()
  })
}

//= =====================关闭对话框===============================================================================
let closeIcon = null
if (process.env.NODE_ENV !== 'development') {
  closeIcon = nativeImage.createFromPath(path.join(__dirname, '../../../mark48.png'))// app.ico是app目录下的ico文件
} else {
  closeIcon = nativeImage.createFromPath('build/icons/mark48.png')// app.ico是app目录下的ico文件
}
function openCloseDialog () {
  const options = {
    type: 'info',
    title: '关闭提示',
    icon: closeIcon,
    message: '关闭应用还是最小化到托盘？',
    buttons: ['取消', '关闭应用', '最小化到托盘']
  }
  dialog.showMessageBox(options, (index) => {
    if (index === 1) {
      mainWindow.destroy()
    }
    if (index === 2) {
      console.log('最小化到托盘')
    }
  })
}

export function initNotify () {
  let $notify = new Notify()
  ipcMain.on('notify', (e, body) => $notify.show(body))
  $notify.on('click', () => showMainWin())
}

function showMainWin () {
  if (mainWindow) {
    console.log(mainWindow.isMinimized())
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
  // 跳转到消息中心
  mainWindow.webContents.send('jumpNotifyCenter')
}

ipcMain.on('electron-notifications-lit-notify', (e, obj) => {
  let icon
  if (process.env.NODE_ENV !== 'development') {
    // icon = path.join(__dirname, '../../../icons.ico')
    icon = path.join(app.getAppPath(), '../icon.ico')// app.ico是app目录下的ico文件
  } else {
    icon = path.join(app.getAppPath(), 'icon.png')// app.ico是app目录下的ico文件
  }
  const notifier = require('electron-notifications-lite')
  const notification = notifier.notify(obj.title, {
    duration: 8000,
    message: obj.message,
    icon: icon
  })
  notification.on('clicked', () => {
    notification.close()
    showMainWin()
  })
})

//= ====================================================================================
// 打开文件
const shell = require('electron').shell
ipcMain.on('openExtraFile', (e, path) => {
  shell.openItem(path)
})

// 判断文件是否存在
const fs = require('fs')
ipcMain.on('existFileAction', (e, path) => {
  console.log(path)
  const f = fs.existsSync(path)
  console.log(f)
  mainWindow.webContents.send('existFileEvent', f)
})

ipcMain.on('hideWin', () => {
  mainWindow.hide()
})
ipcMain.on('showMainWinEvent', () => {
  mainWindow.show()
})
