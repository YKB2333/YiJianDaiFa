import Vue from 'vue'
import App from './App'
import authMoney from '@/components/auth-money'

/**
 * Vuex
 */
import store from '@/store'

/**
 * 全局过滤器
 */
import * as filters from './filters'

Vue.component('authMoney', authMoney)
Vue.prototype.$store = store

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 事件名称对象
Vue.prototype.$eventName = require('./const/bus')

// 页面路径
Vue.prototype.$pageUrl = require('./const/page-url')

Vue.config.productionTip = false

App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
