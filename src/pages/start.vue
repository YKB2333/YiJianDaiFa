<template>
  <view></view>
</template>
<script>
import { login, visitCount, visitorVisit } from '@/api/user';
import { mapGetters } from 'vuex'
import TYPES from '@/store/types'
import { authentication } from '@/mixins/auth'

export default {
  name: 'StartPage',
  data() {
    return {
      isLoading: false, // 是否显示loading
      // 启动参数
      options: {}
    }
  },
  mixins: [authentication],
  computed: {
    ...mapGetters(['needToCheckLogin', 'userInfo', 'sessionKey'])
  },
  onLoad(options) {
    this.options = options
    if (this.needToCheckLogin) {
      this.$store.commit(TYPES.SET_NEED_TO_CHECK_LOGIN, false)
      this.initLogin()
    } else {
      // 不用重复执行login，直接进入首页
      this.nextPage()
    }
  },
  methods: {
    // 初始化-登陆
    initLogin() {
      uni.login({
        success: (res) => {
          if (res.code) {
            if (this.isLoading) {
              uni.showLoading()
            }
            this.fetchLogin(res.code)
          } else {
            this.showErrorModel(res.errMsg)
          }
        },
        fail: (e) => {
          this.showErrorModel(e.errMsg)
        }
      })
    },
    // 调取登陆接口
    fetchLogin(code) {
      login(code).then(({ result }) => {
        this.$store.commit(TYPES.SET_USER_INFO, result)
        // 是否需要跳转‘感兴趣页’ 否则走默认跳转
        if (result.isNeedSelectCategory) {
          this.nextPage('INTERESTED_CATEGORY')
        } else {
          this.nextPage()
        }
        // 如果有用户信息获取用户信息
        if (result.customerId && result.ncCode) {
          this.$store.dispatch('getBaseInfo')
        }
      }).catch(err => {
        this.showErrorModel(err.message)
      }).finally(() => {
        if (this.isLoading) {
          uni.hideLoading()
        }
      })
    },
    showErrorModel(msg) {
      uni.showModal({
        title: '加载失败，请重试',
        content: msg || '请求出错',
        confirmText: '重新加载',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            this.isLoading = true
            this.initLogin()
          }
        }
      });
    },
    /**
     * 传入链接格式
     * pages/start?page=PageUrlName&paramsName=XXXXX
     * scene=a=shareCode 二维码参数
    */
    async nextPage(page) {
      const defaultPage = this.$pageUrl.HOME
      let path = defaultPage
      // 存储邀请码并记录访问人数
      if (this.options && Object.keys(this.options).includes('scene')) {
        // parames => scene="a%3D3TWAKA" => scene="a=3TWAKA"
        const shareInvitationCode = decodeURIComponent(this.options.scene).split('=')[1]
        if (shareInvitationCode) {
          this.$store.commit(TYPES.SET_INVITATION_CODE, shareInvitationCode)
          const code = await this.$store.dispatch('getWxCode')
          visitCount({
            code: code,
            invitationCode: shareInvitationCode
          })
          this.fetchVisitorVisit(shareInvitationCode)
        }
      }
      if (page) { // 如果有指定页面
        this.next(this.$pageUrl[page])
        return
      }
      // 是否有跳转页面
      if (this.options.page) {
        path = this.$pageUrl[this.options.page]
        const paramsKey = Object.keys(this.options).filter(key => key !== 'page')
        // 获取参数
        if (paramsKey.length) {
          const params = [] // key1=value1&key2=value2
          paramsKey.forEach(key => {
            params.push(`${key}=${this.options[key]}`)
          })
          path = `${path}?${params.join('&')}`
        }
      }
      // // 如果用户是再次点击分享的卡片、并且进入页面是注册页、判断是否注册成功、成功跳去首页、不用跳转详情页
      // if (['CUSTOMER_DETAILS', 'AUTH_RIGHTS', 'CUSTOMER_INFO'].includes(this.options.page) && this.userStatus === 'enable') {
      //   path = defaultPage
      // }
      this.next(path)
    },
    fetchVisitorVisit(shareInvitationCode) {
      const { userName, userHead } = this.userInfo
      if (userName && userHead) {
        visitorVisit({
          invitationCode: shareInvitationCode,
          sessionKey: this.sessionKey,
          visitorHead: userHead,
          visitorName: userName
        })
      }
    },
    next(path) {
      console.log(path);
      uni.reLaunch({
        url: path
      })
    }
  }
}
</script>

<style lang="scss">
page{
  background-color: #ffffff;
}
</style>
