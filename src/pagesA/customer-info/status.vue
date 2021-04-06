
<template>
  <view class="page w-full col center-y">
    <view class="w400 h400 mt140">
      <image :src="IMAGE[imagePath]" class="w-h-full"/>
    </view>
    <view class="mt40 fs32 fw400 mb60 mlr100 text-center" style="color:#242629">{{ message }}</view>
    <view class="row center">
      <view @click="linkPage('mine')" class="btn">关闭</view>
    </view>
  </view>
</template>

<script>
import * as IMAGE from '@/image-config'
export default {
  name: 'paySuccess',
  data() {
    return {
      IMAGE: IMAGE,
      message: '',
      imagePath: ''
    };
  },
  onLoad(options) {
    this.message = options.message
    this.imagePath = options.image
  },
  methods: {
    linkPage(type) {
      if (type == 'mine') {
        uni.switchTab({
          url: this.$pageUrl.MINE
        })
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.page{
  background: white;
  height: 100vh;
}
.btn{
  width: 180rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 44rpx;
  border: 2rpx solid #C7CACF;
  font-size: 14px;
  color: #71767D;
  text-align: center;
}
</style>
