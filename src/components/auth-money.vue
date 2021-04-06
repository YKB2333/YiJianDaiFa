<template>
  <block class="row center-y">
    <text v-if="userStatus === 'enable'" :class="['price-text row', customClass]" >
      <text :class="moneyLabel">¥</text>
      <text :class="moneyClass">{{ money | formatMoney }}</text>
      <text v-if="originPrice > 0" class="originPrice">¥{{ originPrice | formatMoney }}</text>
    </text>
    <text v-else>
      <text :class="['ellipsis tips fc-money',tipsClass]">认证后查看价格</text>
    </text>
  </block>
</template>

<script>
import { authentication } from '@/mixins/auth'

export default {
  mixins: [authentication],
  props: {
    money: {
      type: [Number, String],
      default: 0
    },
    originPrice: {
      type: [Number, String],
      default: 0
    },
    customClass: {
      type: String,
      default: ''
    },
    moneyLabel: {
      type: String,
      default: ''
    },
    moneyClass: {
      type: String,
      default: ''
    },
    tipsClass: {
      type: String,
      default: ''
    }
  }
};
</script>
<style lang="scss" scoped>
.tips{
  font-size: 26rpx;
}
.originPrice{
  font-size: 24rpx;
  margin-top: 2rpx;
  color: #C7CACF;
  margin-left: 10rpx;
  text-decoration:line-through
}
</style>
