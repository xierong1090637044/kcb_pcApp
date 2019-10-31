import {ipcMain, dialog, app} from 'electron'
import Datastore from 'nedb'
const path = require('path')
const dbDownload = new Datastore({
  autoload: true,
  filename: path.join(app.getPath('userData'), 'db/downloadRecord.db')
})
const fs = require('fs')
// const http = require('http')
// export function download (total, downloadPath) {
//   let ws = fs.createWriteStream('D:/bamboo-activiti-ch.rar')
//   // 请求配置
//   let config = {
//     host: 'localhost',
//     port: 8081,
//     method: 'GET',
//     path: '/download/breakPointDownload?filename=bamboo-activiti-ch.rar'
//   }

//   // 创建可写流
//   // 配置，每次范围请求 step 个字节
//   config.headers = {
//     'Range': `bytes=${start}-${start + step - 1}`
//   }

//   // 维护下次 start 的值
//   start += step

//   // 发送请求
//   http.request(config, res => {
//     // 获取文件总长度
//     console.log(res.headers['content-range'])
//     console.log(res.statusCode)
//     if (typeof total === 'number' && total === 0) {
//       total = res.headers['content-range'].match(/\/(\d*)/)[1]
//       console.log(`${total}`)
//     }

//     // 读取返回数据
//     let buffers = []
//     res.on('data', data => buffers.push(data))
//     res.on('end', () => {
//       console.log('下载完成')
//       // 合并数据并写入文件
//       console.log(buffers.length)
//       let buf = Buffer.concat(buffers)
//       ws.write(buf)

//       // 递归进行下一次请求
//       if (!pause && start < total) {
//         download(total, 'D:/bamboo-activiti-ch.rar')
//       }
//     })
//   }).end()
// }
const request = require('request')
export function download (total, _id, e) {
  dbDownload.find({_id: _id}, function (err, docs) {
    'use strict'
    if (docs.length > 0) {
      if (err) throw err
      var startTime = new Date()
      let downloadObj = docs[0]
      let start = downloadObj.start // 请求初始值
      let step = 1024 * 1024 // 每次请求字符个数
      let filename = downloadObj.filename
      let savepath = downloadObj.savepath + '.temp'
      let pause = downloadObj.pause
      var req = request({
        'method': 'GET',
        'url': 'http://localhost:8081/download/breakPointDownload?filename=' + filename
      })
      if (start < total || total === 0) {
        req.headers['Range'] = `bytes=${start}-${start + step - 1}`
        var out = fs.createWriteStream(savepath, {flags: 'a'})// 创建文件写入
        req.pipe(out)
        req.on('response', (data) => {
          console.log(data.headers['content-range'])
          console.log(data.statusCode)
          if (typeof total === 'number' && total === 0) {
            total = data.headers['content-range'].match(/\/(\d*)/)[1]
            console.log(`${total}`)
          }
        })

        // 维护下次 start 的值

        let buff = 0
        req.on('data', (chunk) => {
          if (chunk) {
            buff += chunk.length
          }
        })
        req.on('end', () => {
          console.log('下载完成')
          var endTime = new Date()
          // 递归进行下一次请求,保存开始位置
          const progress = parseInt((start + buff) / total * 100) > 100 ? 100 : parseInt((start + buff) / total * 100)
          const speed = getSize(parseInt(buff / (endTime - startTime) * 1000)) + '/s'
          e.sender.send('sendDownloadInfo', {_id: _id, progress: progress, speed: speed})
          let status = 0
          start += step
          if (start > total) {
            status = 1
          }
          dbDownload.update({ _id: _id }, { $set: {start: start, status: status, progress: progress} }, { multi: true }, function (err, ret) {
            'use strict'
            if (err) throw err
            console.log('pause=' + pause)
            if (!pause && start < total) {
              download(total, _id, e)
            }
            if (start > total) {
              let newSavePath = savepath.replace('.temp', '')
              fs.rename(savepath, newSavePath, () => {
                e.sender.send('updateDownloadStatus', {_id: _id, status: status})
              })
            }
          })
        })
      }
    }
  })
}
ipcMain.on('downloadFile', (e, doc) => {
  dbDownload.insert(doc, function (err, newDoc) {
    'use strict'
    if (err) throw err
    e.sender.send('addDownloadFile', newDoc._id)
    download(0, newDoc._id, e)
  })
})

ipcMain.on('pauseDownloadFile', (e, _id) => {
  dbDownload.update({ _id: _id }, { $set: {pause: true} }, { multi: true }, function (err, ret) {
    'use strict'
    if (err) throw err
    // e.sender.send('pauseDownloadFileEvent', true)
    download(0, _id, e)
  })
})

ipcMain.on('startDownloadFile', (e, _id) => {
  dbDownload.update({ _id: _id }, { $set: {pause: false} }, { multi: true }, function (err, ret) {
    'use strict'
    if (err) throw err
    // e.sender.send('startDownloadFileEvent', true)
    download(0, _id, e)
  })
})

// 删除
ipcMain.on('removeDownloadNeDB', (e, doc) => {
  console.log(doc)
  dbDownload.remove(doc, {}, (err, ret) => {
    'use strict'
    console.log(err, ret)
    e.sender.send('removeDownloadNeDBEvent', true)
  })
})

// 打开文件/文件夹对话框
ipcMain.on('open-directory-dialog', function (event, p) {
  dialog.showOpenDialog({
    properties: [p]
  }, function (files) {
    if (files) { // 如果有选中
      // 发送选择的对象给子进程
      event.sender.send('selectedItemDir', files[0])
    }
  })
})

ipcMain.on('getDownloadFileInfo', (e, filename) => {
  request('http://localhost:8081/download/getDownloaFileInfo?filename=' + filename, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var data = JSON.parse(body)
      e.sender.send('getDownloaFileInfoSize', data.data)
    }
  })
})

export function getSize (size) {
  let result = size + 'b'
  if (size >= 1024 && size < 1024 * 1024) {
    if (size % 1024 === 0) {
      result = (size / 1024) + 'kb'
    } else {
      result = (size / 1024).toFixed(2) + 'kb'
    }
  }
  if (size >= 1024 * 1024 && size < 1024 * 1024 * 1024) {
    if (size % (1024 * 1024) === 0) {
      result = (size / (1024 * 1024)) + 'M'
    } else {
      result = (size / (1024 * 1024)).toFixed(2) + 'M'
    }
  }
  if (size >= 1024 * 1024 * 1024 && size < 1024 * 1024 * 1024 * 1024) {
    if (size % (1024 * 1024 * 1024) === 0) {
      result = (size / (1024 * 1024 * 1024)) + 'G'
    } else {
      result = result = (size / (1024 * 1024 * 1024)).toFixed(2) + 'G'
    }
  }
  return result
}
