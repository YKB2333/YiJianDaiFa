import types from '../types.js';
import { getBaseInfo, getCustomerInfo } from '@/api/user'

export default {
  state: {
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || {},
    sessionKey: uni.getStorageSync('sessionKey') || '',
    needToCheckLogin: true, // 是否需要login，如果执行过login，重定向之后跳回启动页无需再执行login
    address: '',
    baseInfo: uni.getStorageSync('baseInfo') || '', // 认证后的用户信息
    cartSkuIds: [],
    activity: {},
    temporaryUserInfo: {},
    CART_STATUS_REFRESH: {
      tab_cart_status: false,
      page_cart_status: false
    },
    shareInvitationCode: null,
    wxUserInfo: {},
    customerUserInfo: {},
    standardPrice: 0
  },
  mutations: {
    [types.SET_TOKEN](state, token) {
      state.token = token;
      uni.setStorageSync('token', token)
    },
    [types.SET_WX_SESSION_KEY](state, sessionKey) {
      state.sessionKey = sessionKey
      uni.setStorageSync('sessionKey', sessionKey)
    },
    [types.SET_USER_INFO](state, userInfo) {
      state.userInfo = userInfo;
      uni.setStorageSync('userInfo', userInfo)
    },
    [types.SET_NEED_TO_CHECK_LOGIN](state, payload) {
      state.needToCheckLogin = payload
    },
    [types.SET_ADDRESS](state, address) {
      state.address = address
    },
    [types.SET_BASE_INFO](state, baseInfo) {
      state.baseInfo = baseInfo;
      uni.setStorageSync('baseInfo', baseInfo)
    },
    [types.SET_CART_SKUIDS](state, arr) {
      state.cartSkuIds = arr
    },
    [types.SET_INSIDE_SHOPPING_ACTIVITY](state, data) {
      state.activity = data
    },
    [types.SET_CART_STATUS_REFRESH](state, type) {
      if (type === 'refresh') {
        state.CART_STATUS_REFRESH = {
          tab_cart_status: true,
          page_cart_status: true
        }
      } else if (type === 'tab_cart') {
        state.CART_STATUS_REFRESH.tab_cart_status = false
      } else if (type === 'page_cart') {
        state.CART_STATUS_REFRESH.page_cart_status = false
      }
    },
    [types.SET_INVITATION_CODE](state, data) {
      state.shareInvitationCode = data
    },
    [types.SET_WX_USER_INFO](state, data) {
      state.wxUserInfo = data
    },
    [types.SET_CUSTOMER_USER_INFO](state, data) {
      state.customerUserInfo = data
    },
    [types.SET_ORDER_SUM](state, data) {
      state.standardPrice = data
    }
  },
  actions: {
    // 获取认证后的用户信息
    getBaseInfo({ dispatch, commit, state }) {
      return new Promise((resolve, reject) => {
        getBaseInfo().then(({ result }) => {
          resolve(result)
          commit(types.SET_BASE_INFO, result)
          const userInfo = Object.assign(state.userInfo, result)
          commit(types.SET_USER_INFO, userInfo)
          dispatch('getCustomerInfo')
        })
      })
    },
    // 获取认证的客户信息
    getCustomerInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getCustomerInfo().then(({ result }) => {
          resolve(result)
          commit(types.SET_CUSTOMER_USER_INFO, result)
        })
      })
    },
    // 获取微信用户信息
    getWxUserInfo() {
      return new Promise((resolve, reject) => {
        uni.getSetting({
          success: (setting) => {
            if (setting.authSetting['scope.userInfo']) {
              uni.getUserInfo({
                withCredentials: true,
                success: (info) => {
                  resolve(info)
                },
                fail: (error) => {
                  reject(error)
                }
              })
            } else {
              reject({
                errMsg: 'userInfoFail'
              })
            }
          },
          fail: (error) => {
            reject(error)
          }
        })
      })
    },
    // token过期后清除相关数据
    clearUserData({ commit }) {
      return new Promise((resolve, reject) => {
        commit(types.SET_TOKEN, '')
        commit(types.SET_WX_SESSION_KEY, '')
        commit(types.SET_USER_INFO, {})
        commit(types.SET_NEED_TO_CHECK_LOGIN, true)
        resolve()
      })
    },
    // 获取订阅权限、判断是否开启开关-跳转设置页面
    fetchSetting({ commit }) {
      return new Promise((resolve, reject) => {
        wx.getSetting({
          withSubscriptions: true,
          success: (res) => {
            if (res.subscriptionsSetting.mainSwitch) {
              resolve(res.subscriptionsSetting)
              return
            }
            uni.showModal({
              title: '未开启小程序订阅通知',
              content: '在「右上角」-「关于」-「右上角」-「设置」可以开启呦',
              confirmText: '去开启',
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting() // 跳转开通权限
                }
              }
            });
          },
          fail: (error) => {
            reject(error)
          }
        })
      })
    },
    // 获取用户授权
    fetchMessage({ dispatch }, messagList) {
      return new Promise(async(resolve, reject) => {
        try {
          const messageList = messagList
          await dispatch('fetchSetting')
          await dispatch('requestSubscribeMessage', messageList)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    },
    // 请求订阅消息
    requestSubscribeMessage({ commit }, messageList) {
      return new Promise((resolve, reject) => {
        wx.requestSubscribeMessage({
          tmplIds: messageList,
          success(res) {
            resolve(res)
          },
          fail(error) {
            reject(error)
          }
        })
      })
    }
  }
}
