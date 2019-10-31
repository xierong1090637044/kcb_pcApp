// 参考https://www.colabug.com/723908.html
import Datastore from 'nedb'
import path from 'path'
import { app, ipcMain } from 'electron'
console.log(app.getPath('userData'))
const db = new Datastore({
  autoload: true,
  filename: path.join(app.getPath('userData'), 'db/uploadRecord.db')
})
// 初始化数据
// let docs = [
//   {
//     id: 1,
//     type: 'pdf',
//     name: 'Spring Boot+Vue全栈开发实战@java1234.com.pdf',
//     path: 'E:/Spring Boot+Vue全栈开发实战@java1234.com1.pdf',
//     opTime: '19-08-01',
//     status: 1,
//     size: '190M'
//   },
//   {
//     id: '2',
//     type: '7z',
//     name: 'nsis-3.0.3.2.7z',
//     path: 'E:/nsis-3.0.3.2.7z',
//     opTime: '19-08-02',
//     status: 0,
//     size: '1M'
//   }
// ]
// for (var i = 0; i < docs.length; i++) {
//   db.insert(docs[i], function (err, newDoc) {
//     'use strict'
//     console.log(err, newDoc)
//   })
// }

// 插入
ipcMain.on('insertNeDB', (e, doc) => {
  console.log(doc)
  db.insert(doc, function (err, newDoc) {
    'use strict'
    console.log(err, newDoc)
    e.sender.send('returnInsertNeDB', newDoc)
  })
})
// 批量插入
ipcMain.on('insertBatchNeDB', (e, docs) => {
  for (var i = 0; i < docs.length; i++) {
    db.insert(docs[i], function (err, newDoc) {
      'use strict'
      console.log(err, newDoc)
    })
  }
})
// 查询
ipcMain.on('findNeDB', (e, doc) => {
  db.find(doc, function (err, docs) {
    'use strict'
    console.log(err, docs)
    e.sender.send('findNeDBEvent', docs)
  })
})
// 删除
ipcMain.on('removeNeDB', (e, doc) => {
  console.log(doc)
  db.remove(doc, {}, (err, ret) => {
    'use strict'
    console.log(err, ret)
    e.sender.send('removeNeDBEvent', true)
  })
})
// 删除全部
ipcMain.on('removeAllNeDB', (e) => {
  console.log('删除全部')
  db.remove({}, { multi: true }, (err, ret) => {
    'use strict'
    console.log(err, ret)
    e.sender.send('removeAllNeDBEvent', true)
  })
})
// 修改
ipcMain.on('updateNeDB', (e, _id, doc) => {
  db.update({ _id: _id }, { $set: doc }, { multi: true }, function (err, ret) {
    'use strict'
    console.log(err, ret)
    e.sender.send('updateNeDBEvent', true)
  })
})

// 查询总数
ipcMain.on('countNeDB', (e, doc) => {
  db.remove(doc, (err, ret) => {
    'use strict'
    console.log(err, ret)
    e.sender.send('countNeDBEvent', ret)
  })
})
export default db
