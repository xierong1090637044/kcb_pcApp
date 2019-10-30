import Vue from 'vue'
import Bmob from 'hydrogen-js-sdk'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

Bmob.initialize("db7d7df44b87bb60", "109063","db1c531222c31c7511629dd458a72436");

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
