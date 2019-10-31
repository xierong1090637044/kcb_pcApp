import {ipcMain} from 'electron'
const fs = require('fs')
const path = require('path')
const mkdirs = (dirname, callback, errback) => {
  fs.stat(dirname, (err, stats) => {
    if (err) {
      mkdirs(path.dirname(dirname), () => {
        fs.mkdir(dirname, callback)
      }, errback)
    } else {
      if (stats.isDirectory()) {
        callback()
      } else {
        errback()
      }
    }
  })
}
ipcMain.on('checkUploadChunks', (event, path) => {
  console.log(path)
  let stats = fs.statSync(path)// 读取文件信息
  let chunkSize = 3 * 1024 * 1024// 每片分块的大小3M
  let size = stats.size// 文件大小
  let pieces = Math.ceil(size / chunkSize)// 总共的分片数
  console.log('size=' + size)
  console.log('pieces=' + pieces)
  console.log('chunkSize=' + chunkSize)
  event.sender.send('updateChunks', pieces, size, chunkSize)
})
ipcMain.on('uploadPiece', (event, i, size, chunkSize, pieces, path) => {
  // 计算每块的结束位置
  let enddata = Math.min(size, (i + 1) * chunkSize)
  // console.log(enddata)
  let arr = []
  // 创建一个readStream对象，根据文件起始位置和结束位置读取固定的分片
  let readStream = fs.createReadStream(path, { start: i * chunkSize, end: enddata - 1 })
  // on data读取数据
  readStream.on('data', (data) => {
    arr.push(data)
  })
  // // on end在该分片读取完成时触发
  readStream.on('end', () => {
    event.sender.send('uploadPieceEvent', arr)
  })
})

// let uploadPiece = function (i, size, chunkSize, pieces, path) {
//   // 计算每块的结束位置
//   let enddata = Math.min(size, (i + 1) * chunkSize)
//   // console.log(enddata)
//   let arr = []
//   // 创建一个readStream对象，根据文件起始位置和结束位置读取固定的分片
//   let readStream = fs.createReadStream(path, { start: i * chunkSize, end: enddata - 1 })
//   // on data读取数据
//   readStream.on('data', (data) => {
//     arr.push(data)
//   })
//   // // on end在该分片读取完成时触发
//   readStream.on('end', () => {
//     // 这里服务端只接受blob对象，需要把原始的数据流转成blob对象，这块为了配合后端才转
//     console.log(arr)
//     // let blob = new Blob(arr)
//     // 新建formdata数据对象
//     var formdata = new FormData()
//     let md5Val = md5(Buffer.concat(arr))
//     console.log(md5Val)
//     // formdata.append('file', blob)
//     // console.log('blob.size', blob.size)
//     formdata.append('md5', md5Val)
//     formdata.append('size', size + '') // 数字30被转换成字符串"30"
//     formdata.append('chunk', i + '')// 第几个分片，从0开始
//     formdata.append('chunks', pieces + '')// 分片数
//     formdata.append('name', name)// 文件名
//     console.log(formdata)
//     // post(formdata)//这里是伪代码，实现上传，开发者自己实现
//   })
// }

ipcMain.on('readChunkFile', (e, path, currentChunk, size) => {
  // 计算每块的结束位置
  let buff = []
  let enddata = Math.min(size, (currentChunk + 1) * chunkSize)
  // 创建一个readStream对象，根据文件起始位置和结束位置读取固定的分片
  let readStream = fs.createReadStream(path, { start: currentChunk * chunkSize, end: enddata - 1 })
  // on data读取数据
  readStream.on('data', (data) => {
    buff.push(data)
  })
  // // on end在该分片读取完成时触发
  readStream.on('end', () => {
    e.sender.send('readChunkFileEvent', {buff})
  })
})

ipcMain.on('sendUploadChunk2', () => {
  console.log(1111)
  const {net} = require('electron')
  const request = net.request('http://localhost:8081/upload/upload')
  request.on('response', (response) => {
    console.log(`STATUS: ${response.statusCode}`)
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
    response.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`)
    })
    response.on('end', () => {
      console.log('No more data in response.')
    })
  })
  request.end()
})
ipcMain.on('sendUploadChunk', () => {
  console.log(1111)
  let path = 'G:/test/bamboo-activiti-ch.rar'
  // let path = 'G:/deepin-15.11-amd64.iso'
  getFileMd5(path, md5 => {
    console.log(md5)
  })
  getFilePartMd5(path, 0, md5 => {
    console.log(md5)
  })
})

// 计算文件分片md5、分片数
const chunkSize = 5 * 1024 * 1024
export function getFilePartMd5 (path, currentChunk, callback) {
  const crypto = require('crypto')
  const md5Hash = crypto.createHash('md5')
  let stats = fs.statSync(path)// 读取文件信息
  let size = stats.size// 文件大小
  // 计算每块的结束位置
  let enddata = Math.min(size, (currentChunk + 1) * chunkSize)
  // 创建一个readStream对象，根据文件起始位置和结束位置读取固定的分片
  let readStream = fs.createReadStream(path, { start: currentChunk * chunkSize, end: enddata - 1 })
  // on data读取数据
  readStream.on('data', (data) => {
    md5Hash.update(data)
  })
  // // on end在该分片读取完成时触发
  readStream.on('end', () => {
    let md5 = md5Hash.digest('hex')
    callback(md5)
  })
}

export function getFileMd5 (path, callback) {
  const crypto = require('crypto')
  const md5Hash = crypto.createHash('md5')
  var stream = fs.createReadStream(path)
  stream.on('data', function (data) {
    md5Hash.update(data)
  })
  stream.on('end', function () {
    let md5 = md5Hash.digest('hex')
    callback(md5)
  })
}

// getFileMd5('G:/deepin-15.11-amd64.iso', md5 => {
//   console.log('md5=' + md5)
// })
// export function uploadChunk(params){

// }

// 模拟发送http请求
// var request = require('request')

// get请求
// request('http://www.baidu.com', function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(body) // Show the HTML for the baidu homepage.
//   }
// })

// fs.readFile('F:/账号.txt', (err, data) => {
//   console.log(err, data)
//   var formData = {
//     md5: '70aa8e97d59518a3976ef4c305945980',
//     partMd5: '70aa8e97d59518a3976ef4c305945980',
//     name: '账号.txt',
//     path: 'F:/账号.txt',
//     currentChunk: 0,
//     toatalChunk: 1,
//     size: 331,
//     data: data
//   }
//   var request = require('request')
//   request.post({url: 'http://localhost:8081/upload/upload', formData: formData}, function (err, httpResponse, body) {
//     if (err) {
//       return console.error('upload failed:', err)
//     }
//     console.log('Upload successful!  Server responded with:', body)
//     uploadFileXX('bamboo-activiti-ch.rar', 'G:/bamboo-activiti-ch.rar')
//   })
// })

export function uploadFileXX (name, path) {
  let stats = fs.statSync(path)// 读取文件信息
  let size = stats.size// 文件大小
  let chunks = Math.ceil(size / chunkSize)
  getFileMd5(path, md5 => {
    for (var i = 0; i < chunks; i++) {
      let currentChunk = i
      uploadChunk3(size, name, path, currentChunk, chunks, md5)
    }
  })
}

export function uploadChunk3 (size, name, path, currentChunk, chunks, md5) {
  // 计算每块的结束位置
  const crypto = require('crypto')
  const md5Hash = crypto.createHash('md5')
  let buff = []
  let enddata = Math.min(size, (currentChunk + 1) * chunkSize)
  // 创建一个readStream对象，根据文件起始位置和结束位置读取固定的分片
  let readStream = fs.createReadStream(path, { start: currentChunk * chunkSize, end: enddata - 1 })
  // on data读取数据
  readStream.on('data', (data) => {
    buff.push(data)
    md5Hash.update(data)
  })
  // // on end在该分片读取完成时触发
  readStream.on('end', () => {
    let partMd5 = md5Hash.digest('hex')
    var formData = {
      md5: md5,
      partMd5: partMd5,
      name: name,
      type: name.substr(name.lastIndexOf('.') + 1, name.length),
      path: path,
      currentChunk: currentChunk,
      toatalChunk: chunks,
      size: size,
      data: buff
    }
    var request = require('request')
    request.post({url: 'http://localhost:8081/upload/upload', formData: formData}, function (err, httpResponse, body) {
      if (err) {
        return console.error('upload failed:', err)
      }
      let res = JSON.parse(body)
      if (res.code === 206) {
        uploadChunk3(size, name, path, currentChunk + 1, chunks, md5)
      }
      if (res.code === 205) {
        console.log('出错了')
      }
      if (res.code === 200) {
        console.log(res)
      }
    })
  })
}
