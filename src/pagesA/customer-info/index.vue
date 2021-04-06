<template>
  <view class="info">
    <view class="title">请选择进入一件达的认证类型</view>

    <view @click="authShowLoading('enterprise')">
      <button
        @getphonenumber="getPhoneNumber"
        open-type="getPhoneNumber"
        class="removeDefaultClass"
      >
        <view class="text-center">
          <image :src="IMAGE['auth_enterprise']" mode='widthFix'/>
          <view class="btn">企业</view>
        </view>
      </button>
    </view>

    <!-- or -->
    <view class="line">
      <view class="left"></view>
      <view class="title">OR</view>
      <view class="right"></view>
    </view>
    <!-- or -->

    <view @click="authShowLoading('personal')">
      <button
        @getphonenumber="getPhoneNumber"
        open-type="getPhoneNumber"
        class="removeDefaultClass"
      >
        <view class="text-center">
          <image :src="IMAGE['auth_personal']" mode='widthFix'/>
          <view class="btn">个人</view>
        </view>
      </button>
    </view>

  </view>
</template>

<script>
import { auth_enterprise, auth_personal } from '@/image-config.js';
import TYPES from '@/store/types'
import { mapGetters } from 'vuex';
import { register, login } from '@/api/user';
import { authentication } from '@/mixins/auth'

export default {
  name: 'CustomerInfo',
  mixins: [authentication],
  data() {
    return {
      IMAGE: { auth_enterprise, auth_personal },
      type: null
    };
  },
  computed: {
    ...mapGetters(['sessionKey', 'userInfo', 'ncCode', 'isEnable', 'wxUserInfo'])
  },
  onShow() {
    // 如果已存在用户id则是已认证
    if (this.userStatus === 'enable') {
      uni.redirectTo({
        url: `${this.$pageUrl.CUSTOMER_DETAILS}`
      });
    }
  },
  methods: {
    authShowLoading(type) {
      uni.showLoading({
        title: '获取授权',
        mask: true
      });
      this.type = type
    },
    // 获取手机号
    async getPhoneNumber({ detail }) {
      uni.hideLoading();
      if (detail.errMsg !== 'getPhoneNumber:ok') {
        uni.showToast({ title: '授权失败', duration: 2000, icon: 'none' });
        return
      }
      if (Object.keys(this.wxUserInfo).length === 0) {
        this.nextPage(this.$pageUrl.CUSTOMER_INFO)
        uni.showToast({ title: '注册失败、缺失用户信息', duration: 2000, icon: 'none' });
        return
      }
      uni.showLoading({ title: '提交中', mask: true });
      // 注册前刷新
      await this.updataUserInfo()
      register({
        avatarUrl: this.wxUserInfo.avatarUrl,
        encryptedData: detail.encryptedData,
        iv: detail.iv,
        sessionKey: this.sessionKey
      }).then(async({ result }) => {
        uni.hideLoading();
        const { isEnable, customerId, ncCode } = result
        // 如果有这些信息、则跳转详情 -》 子账号
        if (isEnable && customerId && ncCode) {
          // 成功再次刷新
          const user = await this.updataUserInfo()
          this.$store.commit(TYPES.SET_USER_INFO, user)
          this.nextPage(this.$pageUrl.CUSTOMER_DETAILS)
        } else {
          this.nextPage(`${this.$pageUrl.CUSTOMER_DETAILS}?type=${this.type}`)
        }
      }).catch((e) => {
        uni.hideLoading();
        uni.showToast({ title: e.message || '绑定失败失败', duration: 2000, icon: 'none' });
      })
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
    },
    nextPage(url) {
      uni.navigateTo({
        url: url
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.info {
  width: 100vw;
  height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  .title {
    font-size: 40rpx;
    color: #393C41;
    margin-top: 84rpx;
  }
  .line {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 100rpx;
    .left, .right {
      width: 112rpx;
      height: 1px;
      background: #CCCCCC;
    }
    .title {
      color: #C1C1C1;
      font-size: 24rpx;
      margin: 0 20rpx;
    }
  }
  image {
    width: 289rpx;
    margin-top: 80rpx;
    margin-bottom: 30rpx;
    display: block;
  }
  .btn {
    background: #10967B;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 4rpx 10rpx 0px rgba(16, 150, 123, 0.28);
    border-radius: 36rpx;
    font-size: 28rpx;
    padding: 17rpx 88rpx;
    display: inline-block;
  }
}
.removeDefaultClass{
  position: relative;
  line-height: inherit;
  background-color: transparent;
}
button::after{ border: none; }
</style>
