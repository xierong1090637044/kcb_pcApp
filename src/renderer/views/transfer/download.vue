<template>
  <div id="app-container">
    <el-button type="primary" size="small" @click="dialogVisible = true">选择下载文件目录</el-button>
    <el-dialog
  title="选择下载目录"
  :visible.sync="dialogVisible"
  width="400px" 
  :before-close="handleClose"
 >
  <el-form ref="form" :inline="true" size="small">
  <el-form-item label="路径">
    <el-input v-model="dir"></el-input>
  </el-form-item>
   <el-form-item>
     <el-button type="default" size="small" @click="openDownloadDir">更改</el-button>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="handleClose" size="small">取 消</el-button>
    <el-button type="primary" size="small" @click="download">确 定</el-button>
  </span>
</el-dialog>

  <el-table
                :data="tableData"
                :show-header="false"
                style="width: 100%">
            <template slot="empty">
                <img  src="~@/assets/Noneimg@256x.png" style="margin-top:100px" /><br>
                <p style="margin:0;padding:0">没有下载数据喔~</p>
            </template>
            <el-table-column>
                <template slot-scope="scope">
                    <div style="height: 35px">
                  <span v-if="scope.row.type=='pdf'">
                    <img src="~@/assets/pdf.png" style="position:relative;top:5px">
                  </span>
                                <span v-else-if="scope.row.type=='zip'||scope.row.type=='rar'||scope.row.type=='7z'||scope.row.type=='tar'||scope.row.type=='tar.gz'||scope.row.type=='gz'">
                    <img src="~@/assets/zip.png" style="position:relative;top:5px">
                  </span>
                                <span v-else-if="scope.row.type=='html'||scope.row.type=='xml'||scope.row.type=='htm'">
                    <img src="~@/assets/htm.png" style="position:relative;top:5px">
                  </span>
                                <span v-else-if="scope.row.type=='doc'||scope.row.type=='docx'">
                    <img src="~@/assets/doc.png" style="position:relative;top:5px">
                  </span>
                                <span v-else-if="scope.row.type=='mp4'||scope.row.type=='mov'||scope.row.type=='avi'||scope.row.type=='mkv'||scope.row.type=='rmvb'">
                    <img src="~@/assets/mp4.png" style="position:relative;top:5px">
                  </span>
                                <span v-else-if="scope.row.type=='ppt'">
                    <img src="~@/assets/ppt.png" style="position:relative;top:5px">
                  </span>
                                <span v-else-if="scope.row.type=='mp3'">
                    <img src="~@/assets/mp3.png" style="position:relative;top:5px">
                  </span>
                                <span v-else-if="scope.row.type=='txt'">
                    <img src="~@/assets/txt.png" style="position:relative;top:5px">
                  </span>
                                <span v-else>
                      <img src="~@/assets/file.png" style="position:relative;top:5px">
                  </span>
                        {{scope.row.filename}}
                    </div>
                </template>
            </el-table-column>
            <el-table-column  width="100">
                <template slot-scope="scope">
                {{getSize(scope.row.size)}}
                </template>
            </el-table-column>
            <el-table-column  width="200">
                <template slot-scope="scope">
                  <span v-if="scope.row.progress!==100">
                    <el-progress :percentage="scope.row.progress"></el-progress>
                </span>
                </template>
            </el-table-column>
             <el-table-column  width="100">
                <template slot-scope="scope">
                <span v-if="scope.row.status===1">
                    <i class="el-icon-success" style="color:#67C23A"></i>
                         完成
                </span>
                <span v-if="scope.row.status===0 && scope.row.pause">
                    ----
                </span>
                <span v-if="scope.row.status===0 && !scope.row.pause">
                    {{scope.row.speed}}
                </span>
                </template>
            </el-table-column>
            <el-table-column  width="100">
                <template slot-scope="scope">
                    <span v-if="scope.row.pause=== false && scope.row.status=== 0">
                        <i @click="doStop($event,scope.row._id)" class="el-icon-video-pause "   style="margin-right: 5px;"></i>
                        <i @click="deleteRow(scope.$index,scope.row._id)" class="el-icon-close" style="margin-right: 5px;"></i>
                    </span>
                    <span v-if="scope.row.pause=== true && scope.row.status=== 0">
                        <i @click="doStart($event,scope.row._id)" class="el-icon-video-play"   style="margin-right: 5px;"></i>
                        <i @click="deleteRow(scope.$index,scope.row._id)" class="el-icon-close" style="margin-right: 5px;"></i>
                    </span>
                    <span v-if="scope.row.status=== 1">
                        <i @click="openDir(scope.row.savepath)" class="el-icon-folder" style="margin-right: 5px;"></i>
                        <i @click="deleteRow(scope.$index,scope.row._id)" class="el-icon-close" style="margin-right: 5px;"></i>
                    </span>
                </template>
            </el-table-column>
  </el-table>
  </div>
</template>
<script>
import {getSize, filterData} from '@/utils/download'
export default {
  data () {
    return {
      dialogVisible: false,
      dir: 'D:/',
      tableData: []
    }
  },
  mounted () {
    this.$electron.ipcRenderer.on('updateDownloadStatus', (e, ret) => {
      var i = filterData(ret._id, this.tableData)
      this.tableData[i].status = ret.status
    })
    this.$electron.ipcRenderer.on('sendDownloadInfo', (e, ret) => {
      console.log(ret)
      var i = filterData(ret._id, this.tableData)
      this.tableData[i].speed = ret.speed
      this.tableData[i].progress = ret.progress
    })
  },
  methods: {
    download () {
      this.dialogVisible = false
      var filename = 'deepin-15.11-amd64.iso'
      var type = filename.substr(filename.lastIndexOf('.') + 1, filename.length)
      var dirpath = this.dir
      if (dirpath.lastIndexOf('/') > 0) {
        dirpath += filename
      } else {
        dirpath = dirpath + '/' + filename
      }
      let doc = {
        filename: filename,
        savepath: dirpath,
        size: 0,
        pause: false,
        start: 0,
        type: type,
        status: 0,
        speed: 0,
        progress: 0
      }
      this.$electron.ipcRenderer.send('getDownloadFileInfo', filename)
      this.$electron.ipcRenderer.once('getDownloaFileInfoSize', (e, size) => {
        doc.size = size
        this.$electron.ipcRenderer.send('downloadFile', doc)
        this.$electron.ipcRenderer.once('addDownloadFile', (e, _id) => {
          doc._id = _id
          this.tableData.push(doc)
        })
      })
    },
    doStart (e, _id) {
      var i = filterData(_id, this.tableData)
      this.tableData[i].pause = false
      this.$electron.ipcRenderer.send('startDownloadFile', _id)
    },
    doStop (e, _id) {
      var i = filterData(_id, this.tableData)
      this.tableData[i].pause = true
      this.$electron.ipcRenderer.send('pauseDownloadFile', _id)
    },
    deleteRow (index, _id) {
      this.$electron.ipcRenderer.send('removeDownloadNeDB', {_id: _id})
      this.$electron.ipcRenderer.once('removeDownloadNeDBEvent', (e, flag) => {
        if (flag) {
          this.tableData.splice(index, 1)
        }
      })
    },
    openDownloadDir () {
      this.$electron.ipcRenderer.send('open-directory-dialog', 'openDirectory')
      this.$electron.ipcRenderer.on('selectedItemDir', (e, path) => {
        this.dir = path
      })
    },
    openDir (path) {
      this.$electron.ipcRenderer.send('existFileAction', path)
      // 存在一个bug，Message提示时会出现多个，原因是existFileEvent事件会返回多次flag
      this.$electron.ipcRenderer.once('existFileEvent', (e, flag) => {
        if (flag) {
          path = path.substr(0, path.lastIndexOf('/') + 1)
          this.$electron.ipcRenderer.send('openExtraFile', path)
        } else {
          this.$message({
            message: '文件已经移除或文件名已修改',
            type: 'warning'
          })
        }
      })
    },
    handleClose () {
      this.dir = 'D:/'
      this.dialogVisible = false
    },
    getSize (size) {
      return getSize(size)
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
    #app-conatiner{
        padding:5px 10px
    }
    .el-table__row>td{
        border: none;
    }
    .el-table::before {//去掉最下面的那一条线
        height: 0px;
    }
    .active{
        display: none;
    }
</style>