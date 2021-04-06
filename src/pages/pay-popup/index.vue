<template>
  <block>
    <van-popup
      :close-icon="IMAGE['icon_close_pay']"
      :close-on-click-overlay="true"
      :show="showPopup"
      :z-index="1000"
      position="bottom"
      custom-style="max-height: 94vh; overflow: hidden; display: flex; flex-direction: column"
      round
      closeable
      @close="closePopup"
    >
      <view class="row h100 center fs32 fw500 hairline-bottom">
        <view>支付</view>
      </view>

      <view class="col center mt64 fs26 fc-grey">
        <view>订单金额</view>
        <view class="fs48 fw500 fc-black mtb8">¥{{ price }}</view>
        <view>我的余额: ¥{{ balance }}</view>
      </view>

      <view class="col mt64">
        <view class="row center-y space-between h128 mlr42 mb16 hairline-bottom"  @click.stop="onSelectPay('balance')">
          <view class="row">
            <image :src="IMAGE['balance_pay']" mode='widthFix' class="w48 h48 mr24"></image>
            <view class="col">
              <text class="fs32 mb2">余额支付</text>
              <text class="fs28 fc-grey" v-if="balance < price">还需充值¥{{ (price - balance).toFixed(2) }}</text>
            </view>
          </view>
          <view class="flex-end">
            <van-checkbox :value="currentSelect === 'balance'" checked-color="#10967B"></van-checkbox>
          </view>
        </view>
        <view class="row center-y space-between h128 mlr42 mb62" @click.stop="onSelectPay('wx')">
          <view class="row">
            <image :src="IMAGE['wx_pay']" mode='widthFix' class="w48 h48 mr24"></image>
            <view class="col">
              <text class="fs32 mb2">微信支付</text>
            </view>
          </view>
          <view class="flex-end">
            <van-checkbox :value="currentSelect === 'wx'" checked-color="#10967B" ></van-checkbox>
          </view>
        </view>
        <button class="popup-close-btn" @tap="confirm">确认支付</button>
      </view>
    </van-popup>
  </block>
</template>

<script>
import { icon_close, big_logo, wx_pay, balance_pay, icon_close_pay } from '@/image-config.js'
import { mapGetters } from 'vuex'
import { authentication } from '@/mixins/auth'

export default {
  name: 'SkuPopup',
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    balance: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      IMAGE: {
        icon_close,
        big_logo,
        wx_pay,
        balance_pay,
        icon_close_pay
      },
      showPopup: false,
      currentSelect: ''
    }
  },
  mixins: [authentication],
  computed: {
    ...mapGetters(['customerUserInfo', 'userInfo']),
  },
  watch: {
    visible(val) {
      this.showPopup = val
    }
  },
  methods: {
    // 关闭弹窗
    closePopup() {
      this.showPopup = false
      this.$emit('update:visible', false)
    },
    confirm() {
      this.$emit('confirm', this.currentSelect)
    },
    onSelectPay(key) {
      this.currentSelect = key
    }
  }
};
</script>

<style lang="scss" scoped>
.popup-close-btn {
  background-color: #10967B;
  border-radius: 44rpx;
  margin: 28rpx 30rpx;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 500;
  padding: 5rpx 0;
}
</style>
