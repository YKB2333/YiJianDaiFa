<template>
  <van-popup
    @close="closePopup"
    :show="isShowPopup"
    round
    closeable
    :close-on-click-overlay="true"
    position="bottom"
    :close-icon="IMAGE['icon_close']"
    custom-style="background: transparent;z-index: 99999"
  >
    <view class="col center-x relative bg-white">
      <view class="mt156 mb72">
        <image :src="IMAGE['yjdf_logo']" class="w-h162"/>
      </view>
      <view class="fw500 mb20 fs40">
        为获得更优质的服务
      </view>
      <view class="fs28 mb80 fw500" style="color:#9A9A9A;">
        您可使用微信授权的方式进行登录
      </view>
      <view class="mlr80 mb122" @click="authShowLoading()">
        <button
          class="login-btn"
          :loading="loading"
          @getuserinfo="handleUserInfo"
          open-type="getUserInfo"
        >
          微信快捷登录
        </button>
      </view>
    </view>
  </van-popup>
</template>

<script>
import { mapGetters } from 'vuex';
import { yjdf_logo, icon_close } from '@/image-config.js'
import { authentication } from '@/mixins/auth'
import TYPES from '@/store/types'
import { visitorVisit, updateWxInfo, login } from '@/api/user'

export default {
  name: '',
  mixins: [authentication],
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    visible: {
      handler(newValue) {
        this.isShowPopup = newValue
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'shareInvitationCode', 'sessionKey'])
  },
  data() {
    return {
      isShowPopup: false,
      loading: false,
      IMAGE: {
        yjdf_logo, icon_close
      }
    }
  },
  methods: {
    // 关闭弹窗
    closePopup(state) {
      const isBoolean = typeof state === 'boolean' ? state : false
      this.isShowPopup = isBoolean
      this.$emit('update:visible', isBoolean)
    },
    linkPage() {
      this.$emit('action', 'confirm')
    },
    authShowLoading() {
      this.loading = true
    },
    async handleUserInfo({ detail }) {
      if (detail.errMsg === 'getUserInfo:fail auth deny') {
        uni.showToast({ title: '授权失败', duration: 2000, icon: 'none' });
        return
      }
      this.loading = false
      this.closePopup()
      this.saveUserInfo(detail)
      // 本来这里想更新的 但是没有认证是没有用的
    },
    /**
     * 逻辑说明
     * 如果这个用户没有头像信息则获取用户信息授权、并且走注册接口补全信息
    */
    async saveUserInfo(detail) {
      if (this.shareInvitationCode) {
        visitorVisit({
          invitationCode: this.shareInvitationCode,
          sessionKey: this.sessionKey,
          visitorHead: detail.userInfo.avatarUrl,
          visitorName: detail.userInfo.nickName
        })
        await this.updataUserInfo()
        updateWxInfo({
          userHead: detail.userInfo.avatarUrl,
          userName: detail.userInfo.nickName
        }).then(async({ result }) => {
          this.updataUserInfo()
        }).catch((e) => {
          uni.showToast({ title: e.message || '绑定失败', duration: 2000, icon: 'none' });
        })
      }
    },
    // 更新用户信息
    updataUserInfo() {
      return new Promise(async(resolve, reject) => {
        const code = await this.$store.dispatch('getWxCode')
        login(code).then(({ result }) => {
          this.$store.commit(TYPES.SET_USER_INFO, result)
          resolve(result)
        }).catch((e) => {
          reject(e)
        })
      })
    }
  }
};
</script>

<style scoped>
.login-btn {
  background-color: #07C160;
  color: #FFFFFF;
  font-size: 32rpx;
  border-radius: 8rpx;
  height: 88rpx;
  line-height: 88rpx;
}
</style>
