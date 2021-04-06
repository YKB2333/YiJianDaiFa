import { baseURL } from '@/config'
import store from '@/store'
export const SERVICE = 'gf-oss-service'

export function uploadFile(tempFilePage, apiName) { // storagePrefix存储目录, tempFilePage本地临时路径
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${baseURL}${apiName}`,
      filePath: tempFilePage,
      name: 'file',
      header: {
        Authorization: store.getters.token
      },
      success: (res) => {
        try {
          const response = JSON.parse(res.data)
          if (response.code === 'SUCCESS') {
            resolve(response.result)
          } else {
            uni.showToast({ title: '上传失败，请重试', icon: 'none' })
            reject()
          }
        } catch (e) {
          uni.showToast({ title: '上传失败，请重试', icon: 'none' })
          reject()
        }
      },
      fail: () => {
        uni.showToast({ title: '上传失败，请重试', icon: 'none' })
        reject()
      }
    })
  })
}
