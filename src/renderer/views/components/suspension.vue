<template>
    <div id="suspension">
        <div class="logo"></div>
        <div class="content_body">
            <div v-if="progress===0">
                <div class="upload">拖拽上传</div>
            </div>
            <div class="upload1" v-else>
                {{progress}} %
                <i class="el-icon-top" style="color:#67C23A"></i>
            </div>
            
            
        </div>
    </div>
</template>

<script>
    export default {
      name: 'suspension',
      data () {
        return {
          progress: 0
        }
      },
      mounted () {
        let win = this.$electron.remote.getCurrentWindow()
        let biasX = 0
        let biasY = 0
        let that = this
        document.addEventListener('mousedown', function (e) {
          switch (e.button) {
            case 0:
              biasX = e.x
              biasY = e.y
              document.addEventListener('mousemove', moveEvent)
              break
            case 2:
              that.$electron.ipcRenderer.send('createSuspensionMenu')
              break
          }
        })

        document.addEventListener('mouseup', function () {
          biasX = 0
          biasY = 0
          document.removeEventListener('mousemove', moveEvent)
        })

        document.addEventListener('dblclick', function () {
          that.$electron.ipcRenderer.send('hideSuspensionWindow')
          that.$electron.ipcRenderer.send('showMainWinEvent')
        })
        function moveEvent (e) {
          win.setPosition(e.screenX - biasX, e.screenY - biasY)
        }
        that.$electron.ipcRenderer.on('showMainWin', () => {
          that.$electron.ipcRenderer.send('showMainWinEvent')
        })
        that.$electron.ipcRenderer.on('uploadCountProgress', (e, progress) => {
          console.log('->' + progress)
          that.progress = progress
        })
      }
    }
</script>

<style>
    * {
        padding: 0;
        margin: 0;
    }
    .upload {
        height: 25px;
        line-height: 25px;
        font-size: 12px;
        text-align: center;
        color: #74A1FA;
    }
    .upload1 {
        height: 25px;
        line-height: 25px;
        font-size: 15px;
        text-align: center;
        color: #74A1FA;
        font-weight:600;
    }

    .logo {
        width: 40px;
        background: #5B9BFE url("../../assets/256x256.png") no-repeat 2px;
        background-size: 75%;
    }

    .content_body {
        background-color: #EEF4FE;
        width: 100%;
    }

    #suspension {
        -webkit-user-select: none;
        cursor: pointer;
        overflow: hidden;
    }

    #suspension {
        cursor: pointer !important;
        height: 25px;
        border-radius: 4px;
        display: flex;
        border: 1px solid #3388FE;
    }
</style>