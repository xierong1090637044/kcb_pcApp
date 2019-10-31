const {app, dialog} = require('electron')
const path = require('path')
/**
 * 使用外部协议启动应用
 */
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('electron-demo1', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('electron-demo1')
}

app.on('open-url', (event, url) => {
  dialog.showErrorBox('欢迎回来', `您来自: ${url}`)
})
