
<template>
 <view class="page w-full col centre-x center-y">
   <view class="w280 h210 mt174">
    <image :src="IMAGE['order_success']"  class="w-h-full" />
   </view>
   <view class="mt40 fs38 fw600 mb22" style="color:#242629">支付成功</view>
   <view class="fs24" style="color:#242629">支付金额：¥{{ money }}</view>
   <view class="row centre mt72">
     <view class="mr32 btn" @click="linkPage('home')">回到首页</view>
     <view class="btn" @click="linkPage('order')">查看订单</view>
   </view>

 </view>
</template>

<script>
import { order_success } from '@/image-config'
export default {
  name: 'paySuccess',
  props: {
  },
  components: {
  },
  data() {
    return {
      IMAGE: {
        order_success
      },
      orderId: '',
      money: ''
    };
  },
  onLoad(options) {
    this.money = options.money
    this.orderId = options.orderId
  },
  created() {
  },

  methods: {
    linkPage(type) {
      if (type == 'home') {
        uni.switchTab({
          url: this.$pageUrl.HOME
        })
      } else if (type == 'order') {
        uni.redirectTo({
          url: `${this.$pageUrl.ORDER_DETAIL}?id=${this.orderId}`
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
  font-weight: 500;
  color: #71767D;
  text-align: center;
}
</style>
