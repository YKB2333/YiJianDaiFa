import { uniDonwloadFile, uniSaveImage } from '@/const/promise-client-api'
import { debounce } from '@/utils'

export const save = {
  data() {
    return {
      path: ''
    }
  },
  methods: {
    // 保存图片
    saveImage: debounce(function(path) {
      if (!path) {
        uni.showToast({ title: '请传入图片呦～', icon: 'none' })
        return
      }
      this.path = path
      uni.getSetting({
        success: (res) => {
          if (res.authSetting['scope.writePhotosAlbum']) { // 有保存权限
            this.saveImageInPhone()
          } else { // 没有保存权限
            uni.authorize({ // 权限授权申请
              scope: 'scope.writePhotosAlbum',
              success: () => { // 授权成功
                this.saveImageInPhone()
              },
              fail: () => { // 未授权
                this.openSetting()
              }
            })
          }
        }
      })
    }, 300),
    // 保存当前手机中
    async saveImageInPhone() {
      try {
        uni.showLoading({ title: '保存中', mask: true })
        let tempFilePathImg = this.path
        if (this.path.includes('http')) {
          tempFilePathImg = await uniDonwloadFile(this.path)
        }
        await uniSaveImage(tempFilePathImg)
        uni.hideLoading()
        uni.showToast({ title: '图片已保存到手机相册', icon: 'none' })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: `${error}`, icon: 'none' })
      }
    },
    // 没有保存图片权限
    openSetting() {
      uni.showModal({
        title: '未开启保存权限',
        content: '开启保存权限才可以保存哦',
        confirmText: '去开启',
        success: t => {
          if (t.confirm) {
            uni.openSetting({ // 打开设置页面
              success(settingData) {
                if (settingData.authSetting['scope.writePhotosAlbum']) {
                  uni.showToast({ title: '开启权限成功，再次保存即可', icon: 'none' })
                } else {
                  uni.showToast({ title: '未开启权限', icon: 'none' })
                }
              }
            })
          }
        }
      })
    }
  }
}
