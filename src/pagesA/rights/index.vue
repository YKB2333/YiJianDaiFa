<template>
  <view id="page">
    <view :style="{'backgroundImage':'url('+IMAGE.bg_auth+')'}" class="top h336 fs48 fc-white pt84 center-x mb100">
      <text class="center-x l-h66">{{ authentication.title }}</text>
    </view>
    <view class="wpct90 mauto mb166 hidden">
      <view v-for="(item,index) in authentication.list" :key="index" class="row mb100 center-y">
        <img class="h96 w96 mr40" :src="IMAGE[item.icon]" alt="">
        <view class="flex-1 ellipsis w-full">
          <view class="ellipsis fw600 fs32">{{ item.label }}</view>
          <view class="fc-gray lineClamp fs28">{{ item.value }}</view>
        </view>
      </view>
    </view>
    <view class="plr60" @click="authShowLoading()">
      <button
        @getuserinfo="handleUserInfo"
        open-type="getUserInfo"
        class="removeDefaultClass">
        <view style="background:#56CC7E;" class="h88 l-h88 center-x fc-white br44">完善认证</view>
      </button>
    </view>
  </view>
</template>
<script>
import {
  bg_auth,
  auth_qualification,
  good_service
} from '@/image-config.js'
import { mapGetters } from 'vuex';
import TYPES from '@/store/types'
import { visitorVisit } from '@/api/user'
import { getDictionaryByCode } from '@/api/dictionary'
import { AUTHENTICATION } from '@/const/dictionary'

export default {
  name: 'rights',
  data() {
    return {
      IMAGE: {
        bg_auth,
        auth_qualification,
        good_service
      },
      authentication: {}
    }
  },
  computed: {
    ...mapGetters(['sessionKey', 'userInfo', 'ncCode', 'isEnable', 'shareInvitationCode'])
  },
  onShow() {
    const { customerId } = this.userInfo
    if (customerId && this.ncCode && this.isEnable) {
      uni.switchTab({
        url: this.$pageUrl.HOME
      });
    }
    uni.showLoading({
      title: '加载中',
      mask: true
    });
    this.fetchAuthentication()
  },
  methods: {
    async handleUserInfo({ detail }) {
      uni.hideLoading();
      if (detail.errMsg === 'getUserInfo:fail auth deny') {
        uni.showToast({ title: '授权失败', duration: 2000, icon: 'none' });
        return
      }
      this.saveUserInfo(detail.userInfo)
      this.nextPage(this.$pageUrl.CUSTOMER_INFO)
    },
    saveUserInfo(userInfo) {
      this.$store.commit(TYPES.SET_WX_USER_INFO, userInfo)
      if (this.shareInvitationCode) {
        visitorVisit({
          invitationCode: this.shareInvitationCode,
          sessionKey: this.sessionKey,
          visitorHead: userInfo.avatarUrl,
          visitorName: userInfo.nickName
        })
      }
    },
    authShowLoading() {
      uni.showLoading({
        title: '获取授权',
        mask: true
      });
    },
    // 下一页
    nextPage(url) {
      uni.navigateTo({
        url: url
      });
    },
    // 获取字典中认证资料详情
    fetchAuthentication() {
      getDictionaryByCode(AUTHENTICATION).then(({ result }) => {
        this.authentication = JSON.parse(result.value) || {}
        uni.hideLoading();
      }).catch(e => {
        uni.hideLoading();
        uni.showToast({
          title: e.message || '获取字典异常',
          duration: 2000,
          icon: 'none'
        });
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#page{
  height: 100vh;
  background-color: #fff;
  min-height: 100%;
  color:#242629;
}
view,text{
  box-sizing: border-box;
}
.top{
  background-repeat: no-repeat;
  background-position:center;
  background-size: 100%;
}
.lineClamp{
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  white-space: normal !important;
  -webkit-box-orient: vertical;
}

.removeDefaultClass{
  position: relative;
  line-height: inherit;
  background-color: transparent;
}
button::after{ border: none; }
</style>
