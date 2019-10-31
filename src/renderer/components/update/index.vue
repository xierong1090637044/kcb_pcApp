<template>
  <div class="app-container">
    <el-dialog
      :title="title"
      :visible.sync="centerDialogVisible"
      width="40%" 
      :close-on-click-modal="false" 
      :close-on-press-escape="false"	 
      center>
      <span>{{ remark }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" @click="updateApp">立即升级</el-button>
        <el-button size="small" @click="centerDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="downloadDialogVisible"
       :show-close="false" 
       :close-on-click-modal="false" 
       :close-on-press-escape="false"  
       title="下载进度"
      width="30%"
      >
      <div style="text-align:center">
          <el-progress type="circle" :percentage="downloadPercent"></el-progress>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {
  props: {
    centerDialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      downloadPercent: '',
      // centerDialogVisible: false,
      downloadDialogVisible: false,
      title: '最新版本3.3.1',
      remark: '需要注意的是内容是默认不居中的'
    }
  },
  mounted () {
    this.checkForUpdate()
  },
  methods: {
    updateApp () {
      this.centerDialogVisible = false
      this.downloadDialogVisible = true
      this.downloadUpdate()
    },
    checkForUpdate () {
      ipcRenderer.send('checkForUpdate')
    },
    downloadUpdate () {
      ipcRenderer.send('downloadUpdate')
      // 注意："downloadProgress”事件可能存在无法触发的问题，只需要限制一下下载网速就好了
      ipcRenderer.on('downloadProgress', (event, progressObj) => {
        console.log(progressObj)
        this.downloadPercent = Math.trunc(progressObj.percent) || 0
        // this.downloadPercent = progressObj.percent.toFixed(2) || 0
        console.log(Math.trunc(this.downloadPercent))
        console.log(Math.trunc(this.downloadPercent) === 100)
        if (Math.trunc(this.downloadPercent) === 100) {
          console.log('开始更新...')
          ipcRenderer.on('isUpdateNow', function () {
            ipcRenderer.send('isUpdateNow')
          })
        }
      })
    }
  },
  destroyed () {
    // ipcRenderer.removeAll(['message', 'downloadProgress'])
  }
}
</script>


