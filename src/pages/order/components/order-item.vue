<template>
  <view class="order-item">
    <view class="plr28 relative" @tap="onClick">
      <image v-if="isInsideActivity" :src="IMAGE['inside_shopping_icon_white']" class="w-h94 absolute" style="left:0;top:0;z-index:999"></image>
      <view class="row space-between center-y ptb32 hairline-bottom">
        <view class="fs28 fw500 fc-black">
          <slot name="title">
            <text>收件人：{{ receiver }}</text>
          </slot>
        </view>
        <view>
          <text class="fs28 fw500 fc-money" v-if="status === '1' && !isDeliveryNopay">待支付</text>
          <text class="fs28 fw500 fc-block" v-else-if="(isDeliveryNopay && status === '1') || status === '2' || status === '3'">待发货</text>
          <text class="fs28 fw500 fc-gray" v-else-if="status === '4'">已取消</text>
          <text class="fs28 fw500 fc-block" v-else-if="status === '8'">部分发货</text>
          <text class="fs28 fw500 fc-block" v-else-if="status === '5'">待收货</text>
          <text class="fs28 fw500 fc-block" v-else-if="status === '7'">已签收</text>
          <text class="fs28 fw500 fc-block" v-else-if="status === '6'">已完成</text>
        </view>
      </view>
    </view>
    <view @tap="onClick">
      <slot name="goods"></slot>
      <slot name="footer">
        <view class="plr28">
          <view class="row flex-end pb30 hairline-bottom">
            <view class="row fs24 center-y">
              <text class="mr20">共{{ skuLength }}件</text>
              <text>{{ status === '1' && !isDeliveryNopay ? '需付款：' : '合计：' }}</text>
              <text class="price-text fs32">¥{{ totalPrice | formatMoney }}</text>
            </view>
          </view>
        </view>
      </slot>
    </view>
    <view class="row space-between center-y ptb32 plr28" v-if="['1', '5', '6', '7', '8'].includes(status) ">
      <view>
        <slot name="footer-left"></slot>
      </view>
      <view v-if="status === '1' && !isDeliveryNopay">
        <text class="fs28 fw500 fc-money btn ml10" @tap="actionClick('pay')" >去支付</text>
      </view>
      <view v-if="['5', '6', '7', '8'].includes(status)">
        <!-- 只有待收货5、已签收7、已完成6 三个状态的订单才会显示查看物流 -->
        <text v-if="['5', '6', '7', '8'].includes(status)" class="fs28 fw500 btn ml16" @tap="actionClick('logistics')" >查看物流</text>
        <text v-if="status === '5'" class="fs28 fw500 fc-money btn pay ml16" @tap="actionClick('confirm')" >确认收货</text>
      </view>
    </view>
  </view>
</template>1

<script>
import { inside_shopping_icon_white } from '@/image-config'

export default {
  components: {},
  props: {
    value: Object,
    receiver: String,
    status: String, // 1:待付款 2-3:待发货 4:已取消 5:待收货 6:已完成
    skuLength: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      default: 0
    },
    //  是否后付款
    isDeliveryNopay: {
      type: Boolean,
      default: false
    },
    //  是否内购活动
    isInsideActivity: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      IMAGE: {
        inside_shopping_icon_white
      }
    }
  },
  computed: {},
  created() {},
  methods: {
    onClick() {
      this.$emit('click')
    },
    actionClick(type) {
      this.$emit('action', type, this.value)
    }
  }
};
</script>
<style lang="scss" scoped>
.order-item{
  background: white;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  .btn{
    display: inline-block;
    min-width: 120rpx;
    padding: 0 20rpx;
    height: 56rpx;
    line-height: 56rpx;
    text-align: center;
    background: #FFFFFF;
    border-radius: 44rpx;
    border: 1px solid #cccccc;
    color: #353535;
  }
  .pay {
    border: 1px solid #FF7640;
    color: #FF7640;
  }
  .border{
    border-bottom: 1px solid #F0F1F2;
  }
}
</style>