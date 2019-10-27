import Vue from 'vue'
import Bmob from 'hydrogen-js-sdk'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

Bmob.initialize('825b954fe97e9186', '109063', '47f76baf4ee4d90630d7b2bc17f7505c');
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.use(Bmob)
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
