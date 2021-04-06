<template>
  <view class="mb6">
    <view class="row center-y fc-money mr20" v-if="isEnable">
      <!-- 显示当前选中价格 -->
      <view v-if="isFocus" class="fc-money">
        <view>
          <text class="fs26">¥</text>
          <text class="fw600 fs36">{{ price | formatMoney }}</text>
        </view>
      </view>
      <!-- 价格区间 -->
      <view v-if="!isFocus">
        <text class="fs26">¥</text>
        <text class="fw600 fs36">{{ lowestPrice | formatMoney }}</text>
      </view>
      <block v-if="!isFocus && lowestPrice !== higherPrice">
        <view class="mlr8">~</view>
        <view>
          <text class="fs26">¥</text>
          <text class="fw600 fs36">{{ higherPrice | formatMoney }}</text>
        </view>
      </block>
      <!-- 价格区间 end -->
    </view>
    <!-- 没有认证、价格隐藏 -->
    <view v-else>
      <auth-money :money="0" moneyLabel="fs26" moneyClass="fs36"/>
    </view>
    <view class="fs22 fc-grey">{{ title }}</view>
  </view>
</template>

<script>
export default {
  name: '',
  components: { },
  data() {
    return {
    }
  },
  props: {
    title: { // 标题
      type: String,
      default: '价格'
    },
    isEnable: { // 是否验证完成
      type: Boolean,
      default: false
    },
    isFocus: { // 是否有选择属性
      type: Boolean,
      default: false
    },
    price: { // 当前价格
      type: [String, Number],
      default: '0'
    },
    lowestPrice: { // 最低价
      type: [String, Number],
      default: '0'
    },
    higherPrice: { // 最高价
      type: [String, Number],
      default: '0'
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
