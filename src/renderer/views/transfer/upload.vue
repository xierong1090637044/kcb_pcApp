<template>
    <div id="app-conatiner">
        <input id="file" style="display: none" type="file">
        <el-button @click="upload" size="small" type="primary">上传</el-button>
        <el-button @click="openSuspension" size="small" type="primary">开启悬浮窗</el-button>
        <div style="border-bottom:1px solid #eee;margin-top:8px"></div>
        <el-table
                :data="tableData"
                :show-header="false"
                style="width: 100%">
            <template slot="empty">
                <img  src="~@/assets/Noneimg@256x.png" style="margin-top:100px" /><br>
                <p style="margin:0;padding:0">没有数据喔~</p>
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
                        {{scope.row.name}}
                    </div>
                </template>
            </el-table-column>
            <el-table-column  width="100">
                <template slot-scope="scope">
                {{getSize(scope.row.size)}}
                </template>
            </el-table-column>
            <el-table-column
                    width="200">
                <template slot-scope="scope">
                     <span v-if="scope.row.status ===0 || scope.row.status ===1 || scope.row.status ===2 || scope.row.status ===3 ">
                        <el-progress :percentage="scope.row.percent"></el-progress>
                     </span>
                    <span v-if="scope.row.status === 4 || scope.row.status === 5">
                        100%
                    </span>
                </template>
            </el-table-column>
            <el-table-column
                    width="200">
                <template slot-scope="scope">
                    <span v-if="scope.row.status===0">
                        <i class="el-icon-time" style="color: #409EFF;"></i>
                         计算MD5值 {{scope.row.calculation_md5_progress}}%
                    </span>
                    <span v-if="scope.row.status===1">
                        {{scope.row.speed}}
                    </span>
                    <span v-if="scope.row.status===2">
                       ------
                    </span>
                    <span v-if="scope.row.status===3">
                        <i class="el-icon-time" style="color: #409EFF;"></i>
                         校验MD5值
                    </span>
                    <span v-if="scope.row.status===4">
                        <i class="el-icon-success" style="color:#67C23A"></i>
                         完成
                    </span>
                    <span v-if="scope.row.status===5">
                        <i class="el-icon-success" style="color: #67C23A"></i>
                         秒传
                    </span>
                    <span v-if="scope.row.status===6">
                        <i class="el-icon-warning-outline"  style="color: #F56C6C;"></i>
                       出错了
                    </span>
                </template>
            </el-table-column>
            <el-table-column
                    width="100">
                <template slot-scope="scope">
                  <span v-if="scope.row.calculation_md5_progress=== 100">
                    <span v-if="scope.row.status=== 0 || scope.row.status=== 1">
                        <i @click="doStop($event,scope.row._id)" class="el-icon-video-pause "   style="margin-right: 5px;"></i>
                        <i @click="deleteRow(scope.$index,scope.row._id)" class="el-icon-close" style="margin-right: 5px;"></i>
                    </span>
                    <span v-if="scope.row.status=== 2">
                        <i @click="doStart($event,scope.row._id)" class="el-icon-video-play"   style="margin-right: 5px;"></i>
                        <i @click="deleteRow(scope.$index,scope.row._id)" class="el-icon-close" style="margin-right: 5px;"></i>
                    </span>
                    <span v-if="scope.row.status=== 3">
                        <i @click="deleteRow(scope.$index,scope.row._id)" class="el-icon-close" style="margin-right: 5px;"></i>
                    </span>
                  </span>
                  <span v-if="scope.row.status===6">
                        <i class="el-icon-refresh-right"  style="margin-right: 5px;"></i>
                        <i @click="deleteRow(scope.$index,scope.row._id)" class="el-icon-close" style="margin-right: 5px;"></i>
                    </span>
                </template>
            </el-table-column>

        </el-table>
    </div>
</template>
<script>
  import {uploadFile, filterData, getSize, getFileMD52, getFileMD53, calcCountProgress} from '@/utils/upload'
  // import {uploadFile, filterData, getSize, uploadChunk2, getFileMD52} from '@/utils/upload'
export default {
    data () {
      return {
        tableData: [],
        countProgress: 0
      }
    },
    mounted () {
      this.init()
    },
    watch: {
      countProgress: {
        handler (newValue, oldValue) {
          this.$electron.ipcRenderer.send('countProgressEnvent', newValue)
        }
      }
    },
    methods: {
      init () {
        this.$electron.ipcRenderer.send('findNeDB', {})
        this.$electron.ipcRenderer.once('findNeDBEvent', (e, data) => {
          this.tableData = data
          calcCountProgress(this, this.tableData)
          for (var i = 0; i < this.tableData.length; i++) {
            console.log(this.tableData[i])
            console.log((this.tableData[i].status !== 4 && this.tableData[i].status !== 5))
            if (this.tableData[i].status !== 4 && this.tableData[i].status !== 5) {
              getFileMD53(this, this.tableData[i])
            }
          }
        })
      },
      getSize (size) {
        return getSize(size)
      },
      doStart (event, _id) {
        var that = this
        this.$electron.ipcRenderer.send('updateNeDB', _id, {status: 1})
        this.$electron.ipcRenderer.once('updateNeDBEvent', (e, flag) => {
          if (flag) {
            // 上传
            var i = filterData(_id, this.tableData)
            this.tableData[i].status = 1
            getFileMD52(that, _id)
            // this.$electron.ipcRenderer.send('findNeDB', {_id: _id})
            // this.$electron.ipcRenderer.once('findNeDBEvent', (e, ret) => {
            //   var data = ret[0]
            //   uploadChunk2(that, data.name, data.path, data.size, data.currentChunk + 1, data.chunks, data.md5, _id)
            // })
          }
        })
        // getFileMD52(this, _id)
      },

      doStop (event, _id) {
        // 暂停
        var i = filterData(_id, this.tableData)
        this.tableData[i].status = 2
        this.$electron.ipcRenderer.send('updateNeDB', _id, {status: 2})
      },
      deleteRow (index, _id) {
        this.$electron.ipcRenderer.send('removeNeDB', {_id: _id})
        this.$electron.ipcRenderer.once('removeNeDBEvent', (e, flag) => {
          if (flag) {
            this.tableData.splice(index, 1)
          }
        })
      },
      upload () {
        let that = this
        var uploadfile = document.getElementById('file')
        uploadfile.click()
        uploadfile.onchange = function () {
          var file = this.files[0]
          if (!file) {
            alert('请选择文件！')
            return false
          }
          uploadFile(that, file)
        }
      },
      openSuspension () {
        this.$electron.ipcRenderer.send('showSuspensionWindow')
        this.$electron.ipcRenderer.send('hideWin')
        // openFile()
      },
      upload1 () {
        this.$electron.ipcRenderer.send('countProgressEnvent', 80)
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
