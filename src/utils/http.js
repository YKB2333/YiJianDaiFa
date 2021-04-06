import Fly from 'flyio/dist/npm/wx'
import {
  baseURL,
  headersTokenKey,
  headersSessionKey
} from '@/config'
import store from '@/store'
import {
  START
} from '@/const/page-url'

const request = new Fly()

// 正在请求的的列表
const pendingRequestList = []
// 获取当前请求列表的索引
const pendingIndex = url => pendingRequestList.findIndex(item => item.url === url)
// 判断是否正在请求
const isPending = url => {
  return pendingIndex(url) > -1 // 当前url正在请求中
}
// 移除完成的请求
const removePending = url => {
  pendingRequestList.splice(pendingIndex(url), 1)
}

request.config.baseURL = baseURL
request.config.headers['Content-Type'] = 'application/json'
// 添加请求拦截器
request.interceptors.request.use((req) => {
  // 在发送请求之前做些什么
  if (store.getters.token) {
    req.headers[headersTokenKey] = store.getters.token
  }
  // 请求前添加请求列表
  pendingRequestList.push(req)
  return req
}, (error) => {
  // 对请求错误做些什么
  return Promise.reject(error)
})

request.interceptors.response.use(
  (res) => {
    const token = res.headers[headersTokenKey.toLocaleLowerCase()]
    const sessionKey = res.headers[headersSessionKey.toLocaleLowerCase()]
    // 更新token
    if (token) {
      store.commit('SET_TOKEN', token[0])
    }
    if (sessionKey) {
      store.commit('SET_WX_SESSION_KEY', sessionKey[0])
    }
    // 请求完成删除请求列表
    removePending(res.request.url)
    // 如果当前是需要拦截的、并且再删除一次列表中还有多个请请求的时候 拒绝当次请求
    if (res.request.isCancel && isPending(res.request.url)) {
      return Promise.reject()
    }
    // 返回结果集
    if (res.status === 200 && res.data) {
      if (res.data.success) {
        return res.data
      } else {
        uni.showToast({
          title: res.data.message,
          icon: 'none'
        })
        return Promise.reject(res.data)
      }
    } else {
      uni.showToast({
        title: res.status,
        icon: 'none'
      })
      return Promise.reject(res.status)
    }
  },
  (error) => {
    removePending(error.request.url)
    const token = error.response && error.response.headers[headersTokenKey.toLocaleLowerCase()]
    // 更新token
    if (token) {
      store.commit('SET_TOKEN', token[0])
    }
    if (error.status === 0) {
      uni.showToast({
        title: '网络错误',
        icon: 'none'
      })
      return Promise.reject({
        message: '网络错误'
      })
    } else if (error.status === 1) {
      uni.showToast({
        title: '请求超时',
        icon: 'none'
      })
      return Promise.reject({
        message: '请求超时'
      })
    } else if (error.status === 401) {
      store.dispatch('clearUserData').then(() => {
        uni.reLaunch({
          url: `${START}`
        })
      })
      return Promise.reject(error)
    } else if (error.status === 404) {
      uni.showToast({
        title: '404',
        icon: 'none'
      })
      return Promise.reject(error)
    } else {
      const msg = (error.response && error.response.data.message) || '请求失败'
      uni.showToast({
        title: msg,
        icon: 'none'
      })
      return Promise.reject(error)
    }
  }
);

export default request;
