<template>
  <div id="app-container">
    <div>
      <el-button size="small" @click="upload">
        <i class="el-icon-upload2 "></i> 上传
      </el-button>
      <el-button size="small">
        <i class="el-icon-download "></i> 下载
      </el-button>
      <el-button size="small">
        <i class="el-icon-delete "></i> 删除
      </el-button>
      <el-button size="small">
        <i class="el-icon-folder-add "></i> 新建文件夹
      </el-button>
      <el-dropdown>
      <el-button size="small" class="el-dropdown-link" style="margin-left:10px;margin-right:10px">
        <i class="el-icon-sort "></i> 排序 <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="sortParam('sortSize','sortName','sortTime')">
          <i :class="sortForm.sortSize" id="sortSize"></i>
          大小</el-dropdown-item>
        <el-dropdown-item @click.native="sortParam('sortName','sortSize','sortTime')">
          <i :class="sortForm.sortName" id="sortName"></i> 
          名称</el-dropdown-item>
        <el-dropdown-item @click.native="sortParam('sortTime','sortName','sortSize')">
          <i :class="sortForm.sortTime" id="sortTime"></i>
          修改时间</el-dropdown-item>
        <el-dropdown-item divided @click.native="sort('sortAsc','sortDesc')">
          <i :class="sortForm.sortAsc" id="sortAsc"></i>
          升序</el-dropdown-item>
        <el-dropdown-item @click.native="sort('sortDesc','sortAsc')">
          <i :class="sortForm.sortDesc" id="sortDesc"></i>
          降序</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
      <el-button size="small" @click="toggleModel">
        <i class="el-icon-s-operation" id="toggleModelIcon"></i><span id="toggleModelText">切换到列表模式</span>
      </el-button>
    </div>
    <ul id="docList" :class="{active:toggleMode}">
      <li @click="upload">
        <div class="doc_item">
        <img src="~@/assets/upload@256.png" alt="">
        <p class="img_title">上传文件</p>
        </div>
      </li>
    </ul>
    <div id="docListTable" :class="{active:!toggleMode}">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 100%"
          :default-sort ="{prop:'updateTime',order:'descending'}"
          @cell-mouse-enter="showCell"
          @cell-mouse-leave="hideCell"
          @sort-change='sortChange'
          @selection-change="handleSelectionChange">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
            <el-table-column
                label="名称"
                sortable="custom"
              >
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
            <el-table-column
             width="200"
            >
             <template slot-scope="scope">
              <span v-if="scope.row.showTools">
                <i class="el-icon-download" style="margin-right:10px" title="下载" @click="downloadFile(scope.row.name)"></i>
                <i class="el-icon-delete" title="删除" @click="deleteFile(scope.row.name)"></i>
              </span>
            </template>
            </el-table-column>
          <el-table-column
            prop="updateTime"
            label="修改时间"
             width="150"
             sortable="custom"
            >
          </el-table-column>
          <el-table-column
            prop="size"
            label="大小"
            sortable="custom"
            width="120">
          </el-table-column>
        </el-table>
    </div>
    <div id="count" :class="{active:isActive}" @click="jumpTransfer">
      <p>+{{count}}</p>
    </div>
    <input id="file" style="display: none" type="file">
</div>
</template> 
<script>
export default {
  data () {
    return {
      count: 0,
      isActive: true,
      toggleMode: false,
      sortForm: {
        sortSize: 'el-icon-check',
        sortName: 'el-icon-empty',
        sortTime: 'el-icon-empty',
        sortAsc: 'el-icon-empty',
        sortDesc: 'el-icon-check'
      },
      tableData: [{
        updateTime: '2016-05-03 10:30:10',
        name: 'Java编程指南.pdf',
        size: '128M',
        type: 'pdf',
        showTools: false
      }, {
        updateTime: '2016-05-03 10:30:20',
        name: 'Java编程指南.pdf',
        size: '128M',
        type: 'pdf',
        showTools: false

      }, {
        updateTime: '2016-05-03 10:30:30',
        name: 'Java编程指南.pdf',
        size: '128M',
        type: 'pdf',
        showTools: false
      }, {
        updateTime: '2016-05-03 10:30:40',
        name: 'Java编程指南1.pdf',
        size: '128M',
        type: 'pdf',
        showTools: false
      }, {
        updateTime: '2016-05-03 10:30:20',
        name: 'Java编程指南.pdf',
        size: '128M',
        type: 'pdf',
        showTools: false
      }, {
        updateTime: '2016-05-03 10:30:20',
        name: 'Java编程指南.pdf',
        size: '128M',
        type: 'pdf',
        showTools: false
      }, {
        updateTime: '2016-05-03 10:30:20',
        name: 'Java编程指南.pdf',
        size: '128M',
        type: 'pdf',
        showTools: false
      }]
    }
  },
  methods: {
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
        that.isActive = false
        that.count++
        // 创建或显示传输窗口
      }
    },
    jumpTransfer () {
      // 显示传输窗口
    },
    toggleModel () {
      var toggleModelIcon = document.getElementById('toggleModelIcon')
      var toggleModelText = document.getElementById('toggleModelText')
      if (toggleModelIcon.classList.contains('el-icon-s-operation')) {
        toggleModelText.innerText = '切换到缩略图模式'
        toggleModelIcon.classList.remove('el-icon-s-operation')
        toggleModelIcon.classList.add('el-icon-menu')
        this.toggleMode = true
      } else {
        toggleModelText.innerText = '切换到列表模式'
        toggleModelIcon.classList.remove('el-icon-menu')
        toggleModelIcon.classList.add('el-icon-s-operation')
        this.toggleMode = false
      }
    },
    sort (e1, e2) {
      var that = this
      if (e1 === 'sortAsc') {
        that.sortForm.sortAsc = 'el-icon-check'
        that.sortForm.sortDesc = 'el-icon-empty'
      } else {
        that.sortForm.sortAsc = 'el-icon-empty'
        that.sortForm.sortDesc = 'el-icon-check'
      }
    },
    sortParam (e1, e2, e3) {
      var that = this
      if (e1 === 'sortSize') {
        that.sortForm.sortSize = 'el-icon-check'
        that.sortForm.sortName = 'el-icon-empty'
        that.sortForm.sortTime = 'el-icon-empty'
      }
      if (e1 === 'sortName') {
        that.sortForm.sortSize = 'el-icon-empty'
        that.sortForm.sortName = 'el-icon-check'
        that.sortForm.sortTime = 'el-icon-empty'
      }
      if (e1 === 'sortTime') {
        that.sortForm.sortSize = 'el-icon-empty'
        that.sortForm.sortName = 'el-icon-empty'
        that.sortForm.sortTime = 'el-icon-check'
      }
    },
    sortChange (column, prop, order) {
      // 点击排序按钮后拿到column.order，可以发送column.order给后台，后台再根据什么排序来返回排序过后的数据
      console.log(column + '---' + column.prop + '---' + column.order)
      // 输出的结果 [object Object]---name---ascending
    },
    showCell (row, column, cell, event) {
      row.showTools = true
    },
    hideCell (row, column, cell, event) {
      row.showTools = false
    },
    downloadFile (name) {
      alert(name)
    },
    deleteFile (name) {
      alert(name)
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
#app-container{
  padding:10px
}

#docList{
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 90
}
#docList li{
  list-style: none;
  float: left;
}
#docList li p{
  padding: 0;
  margin:0;
  font-size: 12px;
}
.doc_item{
  text-align: center;
  padding: 20px;
}
.doc_item:hover{
  background: rgb(242,250,255)
}
#count{
  width:40px;
  height:40px;
  text-align: center;
  vertical-align:middle;
  color: #fff;
  background: #409EFF;
  border-radius: 20px;
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 99
}
#count p{
  position: relative;
  top:-5px
}
.active{
  display: none;
}
.el-icon-empty{
  width:15px
}
.el-icon-empty::before{
  content: ' '
}
</style>