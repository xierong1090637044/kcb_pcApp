import Events from 'events'
import { Notification } from 'electron'
const path = require('path')
const nativeImage = require('electron').nativeImage
export default class Notify extends Events {
  $notify = null
  /**
   * 显示提示
   * @param {String} body
   */
  show (body) {
    let logo
    if (process.env.NODE_ENV !== 'development') {
      logo = nativeImage.createFromPath(path.join(__dirname, '../../../icon.ico'))
    } else {
      logo = nativeImage.createFromPath('build/icons/icon.ico')// app.ico是app目录下的ico文件
    }
    this.close()
    this.$notify = new Notification({
      title: 'electron-demo1',
      body,
      icon: logo
    })
    this.$notify.on('click', () => {
      this.close()
      this.emit('click')
    })
    this.$notify.show()
  }

  /**
   * 关闭提示
   */
  close () {
    if (this.$notify) {
      this.$notify.close()
      this.$notify = null
    }
  }
}
