import types from '../types.js';
import { posterStrategy, posterRecommend, imageVersion, baseURL, imagesURL } from '@/config'

import { fetchQrCode } from '@/api/user'
import { deepClone } from '@/utils'
import TYPES from '@/store/types'

export default {
  state: {
    posterStrategy: {},
    posterRecommend: {},
    posterTemplate: {}
  },
  mutations: {
    [types.SET_POSTER_STRATEGY](state, arr) {
      state.posterStrategy = arr
    },
    [types.SET_POSTER_RECOMMEND](state, arr) {
      state.posterRecommend = arr
    },
    [types.POSTER_TEMPLATE](state, arr) {
      state.posterTemplate = arr
    }
  },
  actions: {
    // 获取 战略海报对象
    fetchPosterStrategy({ dispatch, commit }) {
      return new Promise((resolve, reject) => {
        dispatch('requestTypeJson', {
          url: posterStrategy,
          commitName: types.SET_POSTER_STRATEGY
        }).then(() => {
          resolve()
        })
      })
    },
    // 获取推荐官海报对象
    fetchPosterRecommend({ dispatch, commit }) {
      return new Promise((resolve, reject) => {
        dispatch('requestTypeJson', {
          url: posterRecommend,
          commitName: types.SET_POSTER_RECOMMEND
        }).then(() => {
          resolve()
        })
      })
    },
    // 获取二维码 将二进制文件存到本地获取 url
    fetchQrCode({ getters }) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${baseURL}/${fetchQrCode()}`, //获取图片的URL
          method: 'post',
          header: {
            Authorization: getters.token
          },
          data: {
            width: '404'
          },
          responseType: 'arraybuffer',
          success: (res) => {
            const file = wx.getFileSystemManager();
            const FILE_BASE_NAME = 'myQrCode'; //自定义文件名
            const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.png`;
            file.writeFile({
              filePath,
              data: res.data,
              encoding: 'binary',
              success: (path) => {
                console.log(path, 'file success callback params');
                resolve(filePath)
              }
            });
          }
        })
      })
    },
    // 初始化分享海报对象
    initSharePoster({ dispatch, commit, getters }, poster) {
      return new Promise((resolve, reject) => {
        if (!Object.keys(getters.posterStrategy).length && !Object.keys(getters.posterRecommend).length) {
          uni.showToast({ title: '缺少海报对象、生成海报失败', icon: 'none' })
          reject()
          return
        }
        if (!poster || !poster.qrCode) {
          uni.showToast({ title: '缺少二维码、生成海报失败', icon: 'none' })
          reject()
          return
        }
        if (!getters.baseInfo || !getters.userInfo || !getters.baseInfo.userHead || !getters.baseInfo.customerName) {
          uni.showToast({ title: '缺少客户信息、生成海报失败', icon: 'none' })
          reject()
          return
        }
        const template = deepClone(poster.isStrategy ? getters.posterStrategy : getters.posterRecommend) // 海报对象
        const shareData = [
          {
            key: 'logo',
            type: 'url',
            value: getters.baseInfo.userHead
          },
          {
            key: 'qrCode',
            type: 'url',
            value: poster.qrCode
          },
          {
            key: 'companyName',
            type: 'text',
            value: getters.baseInfo.customerName
          },
          {
            key: 'background',
            type: 'url',
            value: `${imagesURL}/${imageVersion}`
          }
        ]
        shareData.forEach(item => {
          const find = template && template.views.find(e => e.key === item.key)
          if (find) {
            if (item.key === 'background') {
              const url = `${item.value}/${find.url}`
              find[item.type] = url
            } else {
              find[item.type] = item.value
            }
          }
        })
        commit(TYPES.POSTER_TEMPLATE, template)
        resolve()
      })
    }

  }
}