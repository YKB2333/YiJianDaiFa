import types from '../types.js'
import { isEmpty } from '@/utils'

export default {
  state: {
    // 设备信息
    systemInfo: uni.getStorageSync('system_info') || {}
  },
  mutations: {
    [types.SET_SYSTEM_INFO](state, payload) {
      if (isEmpty(state.systemInfo)) {
        state.systemInfo = payload
        uni.setStorageSync('system_info', payload)
      }
    }
  },
  actions: {
    // 获取JSON数据
    requestTypeJson({ commit }, { url, commitName }) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: url,
          headers: { 'Content-Type': 'application/json' },
          success: function(res) {
            commit(commitName, res.data)
            resolve()
          }
        })
      })
    }
  }
}