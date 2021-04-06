<template>
  <view class="pt40">
    <view class="card-wrapper">
      <view class="row center-y">
        <image
          :src="msgData.imagePath"
          style="width: 45px; height: 45px; border-radius:50%;"
        />
        <view class="flex-1 ml20 col space-around">
          <view class="fw600 fs32" style="color: #242629;" >{{ msgData.name }}</view>
          <view class="ellipsis" style="font-size: 13px; color: #959CA7;">{{ msgData.position }}</view>
        </view>
        <image :src="IMAGE['icon_phone_active']" style="width: 30px; height: 30px;" @tap="onCall" />
      </view>
      <view class="mt26 mb10">手机号码：{{ msgData.phone }}</view>
      <view>
        业务描述：{{ msgData.serverDesc }}
      </view>
    </view>
    <view class="wpct92 mauto ptb60 hidden">
      <customer-service class="w-full">
        <view class=" w-full h88 l-h88 center-x fc-white br44 bg-theme">客服咨询</view>
      </customer-service>
    </view>
  </view>
</template>

<script>
import { icon_avatar, icon_phone_active } from '@/image-config.js'
import { getDictionaryByCode } from '@/api/dictionary'
import { MSGS_CODE } from '@/const/dictionary'
import customerService from '@/components/customer-service';

export default {
  name: 'Message',
  data() {
    return {
      IMAGE: {
        icon_avatar,
        icon_phone_active
      },
      msgData: {
        imagePath: '',
        name: '',
        position: '',
        phone: '',
        serverDesc: ''
      },
      refresh: false // 下拉刷新标志
    }
  },
  components: {
    customerService
  },
  onLoad() {
    this.init()
  },
  methods: {
    init() {
      uni.showLoading()
      getDictionaryByCode(MSGS_CODE).then(({ result }) => {
        const data = JSON.parse(result.value)
        data.imagePath = data.imagePath && data.imagePath.includes('http') ? data.imagePath : this.IMAGE.icon_avatar
        this.msgData = data
      }).finally(() => {
        uni.hideLoading()
        if (this.refresh) {
          // 如果开启了下拉刷新，结束下拉刷新
          uni.stopPullDownRefresh()
          this.refresh = false
        }
      })
    },
    // 拨打电话
    onCall() {
      uni.makePhoneCall({
        phoneNumber: this.msgData.phone
      })
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.refresh = true
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.card-wrapper{
  background-color: #ffffff;
  border-radius: 10px;
  margin: 0 14px;
  padding: 24px 20px;
  color: #71767D;
  font-size: 14px;
}
</style>
