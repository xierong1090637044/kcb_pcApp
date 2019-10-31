import { ipcRenderer } from 'electron'
import router from '../router'
ipcRenderer.on('jumpNotifyCenter', () => {
  router.push('/notify')
})

export function getFileTypeShowImg (type) {
  console.log(type)
}
