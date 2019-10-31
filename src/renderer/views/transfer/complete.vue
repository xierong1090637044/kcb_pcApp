<template>
  <div id="app-conatiner">
    <div style="height:18px;margin-top:8px">
    <div style="float:left;margin-top:13px;">共传输完成 {{ count }}个文件</div>
    <el-button type="danger" icon="el-icon-delete" round size="small" style="float:right;" @click="deleteAll">清除所有记录</el-button>
    </div>
    <div style="border-bottom:1px solid #eee;margin-top:18px"></div>
    <el-table
      :show-header="false"
      :data="tableData"
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
          <div style="position: relative;top: -18px;left:30px;font-size: 12px;color: #cccccc;width:100px;margin:2px;padding:0px">{{ scope.row.size}}</div>
          <div style="position: relative;top:-60px;left:30px;margin:0px;padding:0px"  :title="scope.row.name"> {{ showName(scope.row.name)}}</div>
      </div>
     </template>
      </el-table-column>
      <!-- <el-table-column
        prop="name"
        >
      </el-table-column> -->
      <el-table-column
        prop="opTime"
        width="100"
        >
        </el-table-column>
       <el-table-column
       width="100">
        <template slot-scope="scope">
            <span v-if="scope.row.status===1">
              <i class="el-icon-top" style="color:#67C23A"></i>
             上传完成
            </span>
            <span v-else>
              <i class="el-icon-bottom" style="color:#409EFF"></i>下载完成
            </span>
         </template>
      </el-table-column>
        <el-table-column
         width="200"
      align="right">
      <template slot-scope="scope">
          <i class="el-icon-document" title='打开文件' style="margin-left:10px;margin-right:10px" @click="openFile(scope.row.path)"></i>
          <i class="el-icon-folder" title='打开所在文件夹' style="margin-left:10px;margin-right:10px" @click="openDir(scope.row.path)"></i>
          <i class="el-icon-milk-tea" title="清除记录" style="margin-left:10px;margin-right:10px" @click="deleteRecord(scope.$index,tableData,scope.row._id)"></i>
      </template>
    </el-table-column>
    </el-table>
  </div>
</template>
<script>
// import { getFileTypeShowImg } from '@/utils/common'
export default {
  name: 'completeTransfer',
  data () {
    return {
      count: 0,
      tableData: []
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      this.$electron.ipcRenderer.send('findNeDB', {})
      this.$electron.ipcRenderer.on('findNeDBEvent', (e, data) => {
        this.tableData = data
        this.count = data.length
      })
    },
    showName (name) {
      let len = name.length
      if (len > 50) {
        return name.substr(0, 50) + '...'
      } else {
        return name
      }
    },
    openFile (path) {
      this.$electron.ipcRenderer.send('openExtraFile', path)
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
    deleteRecord (index, rows, _id) {
      this.$electron.ipcRenderer.send('removeNeDB', {_id: _id})
      this.$electron.ipcRenderer.on('removeNeDBEvent', (event, flag) => {
        if (flag) {
          rows.splice(index, 1)
          this.count = this.count - 1
          if (this.count < 0) {
            this.count = 0
          }
        }
      })
    },
    deleteAll () {
      this.$electron.ipcRenderer.send('removeAllNeDB')
      this.$electron.ipcRenderer.on('removeAllNeDBEvent', (event, flag) => {
        console.log(flag)
        if (flag) {
          this.tableData = []
          this.count = 0
        }
      })
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
#app-conatiner{
  padding:0px 10px
}
.el-table__row>td{
	border: none;
}
.el-table::before {//去掉最下面的那一条线
	height: 0px;
}
</style>