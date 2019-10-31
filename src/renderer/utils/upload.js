import SparkMD5 from 'spark-md5'
const fs = require('fs')
const chunkSize = 5 * 1024 * 1024
const UPLOAD_URL = 'http://localhost:8081/upload/upload'
const UPLOAD_SECOND_TRANSFER_URL = 'http://localhost:8081/upload/secondTransfer'
/**
 * 使用fs读取分片文件上传，crypto加密文件
 * @param {*} that
 * @param {*} name
 * @param {*} path
 * @param {*} size
 * @param {*} currentChunk
 * @param {*} chunks
 * @param {*} md5
 * @param {*} _id
 */
export function uploadChunk2 (that, name, path, size, currentChunk, chunks, md5, _id) {
  var i = filterData(_id, that.tableData)
  that.$electron.ipcRenderer.send('findNeDB', {_id: _id})
  that.$electron.ipcRenderer.once('findNeDBEvent', (e, ret) => {
    console.log(ret[0])
    if (ret[0].status === 1) {
      that.tableData[i].status = 1
      const crypto = require('crypto')
      const md5Hash = crypto.createHash('md5')
      var begin = new Date()
      // 计算每块的结束位置
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
        var formdata = new FormData()
        formdata.append('md5', md5)
        formdata.append('partMd5', partMd5)
        formdata.append('name', name)
        formdata.append('type', name.substr(name.lastIndexOf('.') + 1, name.length))
        formdata.append('toatalChunk', chunks)
        formdata.append('chunkSize', chunkSize)
        formdata.append('size', size)
        formdata.append('currentChunk', currentChunk)
        formdata.append('file', new Blob([Buffer.concat(buff)]))
        let xhr = new XMLHttpRequest()
        xhr.open('post', UPLOAD_URL, true)
        xhr.onreadystatechange = function () {
          // 上传成功
          if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.response)
            if (response.code === 206) {
              uploadChunk2(that, name, path, size, currentChunk + 1, chunks, md5, _id)
            }
            if (response.code === 200) {
              that.tableData[i].status = 4
              that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 4})
            }
            if (response.code === 205) { // 秒传
              that.tableData[i].status = 6
              that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 6})
            }
            return
          }
          if (xhr.readyState === 4 && xhr.status === 500) {
          // 文件上传出错,重传
            that.tableData[i].status = 6
            that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 6})
            alert(name + '文件上传出错')
          }
        }
        // 文件上传进度条
        xhr.upload.onprogress = function (e) {
          if (e.loaded !== 0) {
            var end = new Date()
            var t = parseInt(end - begin)
            // 计算上传的进度
            const progress = parseInt((e.loaded + currentChunk * chunkSize) / size * 100)
            console.log()
            // var i = filterData(_id, that.tableData)
            that.tableData[i].percent = progress
            that.$electron.ipcRenderer.send('updateNeDB', _id, {percent: progress, currentChunk: currentChunk}) // 保存进度

            that.tableData[i].speed = getSize(parseInt(e.loaded / t * 1000)) + '/s\xa0\xa0\xa0' + getTime(parseInt((size - e.loaded - currentChunk * chunkSize) / (e.loaded / t * 1000)))
            // 更新ui
            if (progress === 100) {
              that.tableData[i].status = 3 // 校验MD5
              that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 3})
            }
            calcCountProgress(that, that.tableData)
          }
        }
        xhr.onerror = xhr.upload.onerror = function () {
        // 文件上传出错
          that.tableData[i].status = 6
          that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 6})
        }
        // 开始发送
        xhr.send(formdata)
        formdata = null
      })
    }
  })
}

export function toArrayBuffer (buf) {
  var ab = new ArrayBuffer(buf.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}
// js获得文件md5
export function getFileMD5 (that, _id, file, callback) {
  var begin = new Date()
  // 声明必要的变量
  var fileReader, chunks, currentChunk, spark, i
  fileReader = new FileReader()
  chunks = Math.ceil(file.size / chunkSize)
  currentChunk = 0
  spark = new SparkMD5()
  i = filterData(_id, that.tableData)
  // 每块文件读取完毕之后的处理
  fileReader.onload = function (e) {
    var progress = parseInt((currentChunk + 1) / chunks * 100)
    that.tableData[i].calculation_md5_progress = progress
    that.$electron.ipcRenderer.send('updateNeDB', _id, {calculation_md5_progress: progress})
    // 每块交由sparkMD5进行计算
    spark.appendBinary(e.target.result)
    currentChunk++

    // 如果文件处理完成计算MD5，如果还有分片继续处理
    if (currentChunk < chunks) {
      loadNext()
    } else {
      var end = new Date()
      console.log(parseInt(end - begin))
      callback(spark.end(), chunks)
    }
  }

  // 处理单片文件的上传
  function loadNext () {
    var start, end
    start = currentChunk * chunkSize
    end = start + chunkSize >= file.size ? file.size : start + chunkSize

    fileReader.readAsBinaryString(file.slice(start, end))
  }
  loadNext()
}
/**
 * fs计算文件md5
 */
export function getFileMD52 (that, _id) {
  var i = filterData(_id, that.tableData)
  that.$electron.ipcRenderer.send('findNeDB', {_id: _id})
  that.$electron.ipcRenderer.once('findNeDBEvent', (e, ret) => {
    if (ret[0].calculation_md5_progress !== 100) {
      const crypto = require('crypto')
      const md5Hash = crypto.createHash('md5')
      for (var j = 0; j < ret[0].chunks; j++) {
      // 计算每块的结束位置
        let buff = []
        let enddata = Math.min(ret[0].size, (j + 1) * chunkSize)
        // 创建一个readStream对象，根据文件起始位置和结束位置读取固定的分片
        let readStream = fs.createReadStream(ret[0].path, { start: j * chunkSize, end: enddata - 1 })
        // on data读取数据
        readStream.on('data', (data) => {
          buff.push(data)
          md5Hash.update(data)
        })
        // // on end在该分片读取完成时触发
        readStream.on('end', () => {
          var progress = parseInt((j + 1) / ret[0].chunks * 100)
          that.tableData[i].calculation_md5_progress = progress
          that.$electron.ipcRenderer.send('updateNeDB', _id, {calculation_md5_progress: progress})
        })
      }
      that.tableData[i].status = 1
      let md5 = md5Hash.digest('hex')
      that.$electron.ipcRenderer.send('updateNeDB', _id, {calculation_md5_progress: 100, md5: md5, status: 1})
      uploadChunk2(that, ret[0].name, ret[0].path, ret[0].size, ret[0].currentChunk, ret[0].chunks, md5, ret[0]._id)
    } else {
      uploadChunk2(that, ret[0].name, ret[0].path, ret[0].size, ret[0].currentChunk + 1, ret[0].chunks, ret[0].md5, ret[0]._id)
    }
  })
}
export function getFileMD53 (that, row) {
  var i = filterData(row._id, that.tableData)
  if (row.calculation_md5_progress !== 100) {
    const crypto = require('crypto')
    const md5Hash = crypto.createHash('md5')
    for (var j = 0; j < row.chunks; j++) {
      // 计算每块的结束位置
      let buff = []
      let enddata = Math.min(row.size, (j + 1) * chunkSize)
      // 创建一个readStream对象，根据文件起始位置和结束位置读取固定的分片
      let readStream = fs.createReadStream(row.path, { start: j * chunkSize, end: enddata - 1 })
      // on data读取数据
      readStream.on('data', (data) => {
        buff.push(data)
        md5Hash.update(data)
      })
      // // on end在该分片读取完成时触发
      readStream.on('end', () => {
        var progress = parseInt((j + 1) / row.chunks * 100)
        that.tableData[i].calculation_md5_progress = progress
        that.$electron.ipcRenderer.send('updateNeDB', row._id, {calculation_md5_progress: progress})
      })
    }
    that.tableData[i].status = 1
    let md5 = md5Hash.digest('hex')
    that.$electron.ipcRenderer.send('updateNeDB', row._id, {calculation_md5_progress: 100, md5: md5, status: 1})
    uploadChunk2(that, row.name, row.path, row.size, row.currentChunk, row.chunks, md5, row._id)
  } else {
    console.log(12)
    uploadChunk2(that, row.name, row.path, row.size, row.currentChunk + 1, row.chunks, row.md5, row._id)
  }
}
/**
 * 前端上传分片文件
 * status-0 计算md5
 * status-1 开始上传
 * status=2 暂停
 * status=3 验证md5
 * status=4 完成
 * status=5 妙传
 * @param that
 * @param file
 * @param currentChunk
 * @param chunks
 * @param md5
 * @param _id
 */
export function uploadChunk (that, file, currentChunk, chunks, md5, _id) {
  var i = filterData(_id, that.tableData)
  that.$electron.ipcRenderer.send('findNeDB', {_id: _id})
  that.$electron.ipcRenderer.once('findNeDBEvent', (e, ret) => {
    if (ret[0].status === 1) {
      that.tableData[i].status = 1
      var begin = new Date()
      var fileReader, blobSlice, spark
      fileReader = new FileReader()
      blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      spark = new SparkMD5.ArrayBuffer()
      fileReader.onload = function (e) {
        spark.append(e.target.result)
        var partMd5 = spark.end()
        var formdata = new FormData()
        console.log(partMd5)
        formdata.append('md5', md5)
        formdata.append('partMd5', partMd5)
        formdata.append('name', file.name)
        formdata.append('type', file.name.substr(file.name.lastIndexOf('.') + 1, file.name.length))
        formdata.append('toatalChunk', chunks)
        formdata.append('chunkSize', chunkSize)
        formdata.append('size', file.size)
        formdata.append('currentChunk', currentChunk)
        formdata.append('file', new Blob([e.target.result]))
        let xhr = new XMLHttpRequest()
        xhr.open('post', UPLOAD_URL, true)
        xhr.onreadystatechange = function () {
          // 上传成功
          if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.response)
            var response = JSON.parse(xhr.response)
            if (response.code === 206) {
              uploadChunk(that, file, currentChunk + 1, chunks, md5, _id)
            }
            if (response.code === 200) {
              that.tableData[i].status = 4
              that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 4})
            }
            if (response.code === 205) { // 上传出错
              that.tableData[i].status = 6
              that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 6})
            }
            return
          }
          if (xhr.readyState === 4 && xhr.status === 500) {
            // 文件上传出错,重传
            that.tableData[i].status = 6
            that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 6})
            alert(name + '文件上传出错')
          }
        }
        // 文件上传进度条
        xhr.upload.onprogress = function (e) {
          if (e.loaded !== 0) {
            var end = new Date()
            var t = parseInt(end - begin)
            // 计算上传的进度
            const progress = parseInt((e.loaded + currentChunk * chunkSize) / file.size * 100)
            console.log()
            // var i = filterData(_id, that.tableData)
            that.tableData[i].percent = progress
            that.$electron.ipcRenderer.send('updateNeDB', _id, {percent: progress, currentChunk: currentChunk}) // 保存进度
            that.tableData[i].speed = getSize(parseInt(e.loaded / t * 1000)) + '/s\xa0\xa0\xa0' + getTime(parseInt((file.size - e.loaded - currentChunk * chunkSize) / (e.loaded / t * 1000)))
            // 更新ui
            if (progress === 100) {
              that.tableData[i].status = 3 // 校验MD5
              that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 3})
            }
            calcCountProgress(that, that.tableData)
          }
        }
        xhr.onerror = xhr.upload.onerror = function () {
          // 文件上传出错
          that.tableData[i].status = 6
          that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 6})
        }
        // 开始发送
        xhr.send(formdata)
        formdata = null
      }

      fileReader.onerror = function () {
        console.warn('oops, something went wrong.')
      }

      const loadNext = () => {
        var start, end
        start = currentChunk * chunkSize
        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
      }
      loadNext()
    }
  })
}

export function calcCountProgress (that, tableData) {
  let countProgress = 0
  let len = 0
  for (var i = 0; i < tableData.length; i++) {
    if (tableData[i].status === 1 || tableData[i].status === 2) {
      countProgress = tableData[i].percent + countProgress
      len = len + 1
    }
  }
  if (len <= 0) {
    that.countProgress = 0
  } else {
    that.countProgress = parseInt(countProgress / len)
  }
}
/**
 * 转换时间
 * @param t
 * @returns {string}
 */
export function getTime (t) {
  var r = '00:00:' + (t < 10 ? '0' + t : t)
  var m, h, s
  if (t >= 60 && t < 60 * 60) {
    m = parseInt(t / 60)
    s = t - m * 60
    r = '00:' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s)
  }
  if (t >= 60 * 60 && t < 60 * 60 * 24) {
    h = parseInt(t / (60 * 60))
    m = parseInt((t - h * 60 * 60) / 60)
    s = t - h * 60 * 60 - m * 60
    r = (h < 10 ? '0' + h : h) + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s)
  }
  return r
}
/**
 * 获取分片md5
 * @param that
 * @param file
 * @param currentChunk
 */
export function getFileChunkMd5 (file, currentChunk, callback) {
  // 获取每一块的md5
  var blobSlice, spark, fileReader
  blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
  spark = new SparkMD5.ArrayBuffer()
  fileReader = new FileReader()

  fileReader.onload = function (e) {
    // console.log('read chunk nr', currentChunk + 1, 'of', chunks);
    spark.append(e.target.result) // Append array buffer
    callback(spark.end())
  }

  fileReader.onerror = function () {
    console.warn('oops, something went wrong.')
  }

  function loadNext () {
    var start, end
    start = currentChunk * chunkSize
    end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
  }
  loadNext()
}
/**
 * 上传文件
 * @param {*} that
 * @param {*} file
 */
export function uploadFile (that, file) {
  console.log(file)
  let data = {
    name: file.name,
    path: file.path,
    size: file.size,
    speed: '',
    status: 0,
    md5: '',
    calculation_md5_progress: 0,
    chunks: 0,
    currentChunk: 0,
    percent: 0,
    type: file.name.substr(file.name.lastIndexOf('.') + 1, file.name.length)
  }
  that.$electron.ipcRenderer.send('insertNeDB', data)
  that.$electron.ipcRenderer.once('returnInsertNeDB', (e, data) => {
    that.tableData.push(data)
    getFileMD5(that, data._id, file, (md5, chunks) => {
      // 更新md5和chunks,更新完后开始上传
      that.$electron.ipcRenderer.send('updateNeDB', data._id, {md5: md5, chunks: chunks, status: 1})
      that.$electron.ipcRenderer.once('updateNeDBEvent', (e, flag) => {
        // 开始上传
        if (flag) {
          // console.log(that.tableData[0])
          // var i = filterData(data._id, that.tableData)
          // that.tableData[i].percent = 30
          // 开始验证是否是秒传还是分片上传
          var currentChunk = 0
          secondTransfer(that, file, currentChunk, chunks, md5, data._id, uploadChunk)
          // uploadChunk(that, file, currentChunk, chunks, md5, data._id)
        }
      })
    })
  })
}

/**
 * 判断是否秒传
 * @param {*} that
 * @param {*} file
 * @param {*} currentChunk
 * @param {*} chunks
 * @param {*} md5
 * @param {*} _id
 * @param {*} callback
 */
export function secondTransfer (that, file, currentChunk, chunks, md5, _id, callback) {
  var i = filterData(_id, that.tableData)
  var formdata = new FormData()
  formdata.append('md5', md5)
  formdata.append('name', name)
  formdata.append('type', name.substr(name.lastIndexOf('.') + 1, name.length))
  let xhr = new XMLHttpRequest()
  xhr.open('post', UPLOAD_SECOND_TRANSFER_URL, true)
  xhr.onreadystatechange = function () {
    // 上传成功
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.response)
      if (response.code === 200) { // 秒传
        that.tableData[i].status = 5
        that.$electron.ipcRenderer.send('updateNeDB', _id, {status: 5})
      }
      if (response.code === 208) {
        callback(that, file, currentChunk, chunks, md5, _id)
      }
      return
    }
    if (xhr.readyState === 4 && xhr.status === 500) {
      // 文件上传出错,重传
      alert('文件上传出错')
    }
  }
  xhr.send(formdata)
  formdata = null
}
export function filterData (_id, tableData) {
  for (var i = 0; i < tableData.length; i++) {
    if (tableData[i]._id === _id) {
      return i
    }
  }
}
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
