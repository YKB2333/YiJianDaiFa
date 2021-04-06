<template>
  <view class="plr28" @tap="onClick">
    <view class="order-goods-item" :class="{ 'border': border }">
      <image :src="getImage()" class="w-h180"  mode="aspectFit"/>
      <view class="flex-1 row">
        <view class="plr16 flex-1">
          <view class="fs28 ellipsis2">{{ sku.spuName }}</view>
          <view class="fs24 fc-grey mt20">{{ getAtbValues() }}</view>
        </view>
        <view class="w120 text-right col flex-end">
          <auth-money :money="sku.skuUnitPrice || sku.skuPrice" moneyLabel="fs26" moneyClass="fs28" customClass="fs28 fc-black fw500"/>
          <view class="fs24 fc-grey mt20 row" >× {{ sku.skuQuantity || sku.skuNumber || 0}}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { big_logo } from '@/image-config.js'

export default {
  props: {
    sku: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    },
    border: {
      type: Boolean,
      default: true
    },
    // 不同的sku返回数据类型(goods or order)
    resType: {
      type: String,
      default: 'goods'
    }
  },
  methods: {
    getImage() {
      return this.sku.skuTitleImage || this.sku.spuTitleImages || this.sku.titleImage || this.sku.skuImg || big_logo
    },
    // sku规格
    getAtbValues() {
      if (Object.prototype.hasOwnProperty.call(this.sku.hasOwnProperty, 'skuName')) {
        const skuValue = JSON.parse(this.sku.skuName)
        return Object.values(skuValue).join('；')
      }
      const arr = []
      let fKey = 'firstAtbValue'
      let sKey = 'secondAtbValue'
      if (this.resType === 'order') {
        fKey = 'skuFirstAtbValue'
        sKey = 'skuSecondAtbValue'
      }
      if (this.sku[fKey]) arr.push(this.sku[fKey])
      if (this.sku[sKey]) arr.push(this.sku[sKey])
      return arr.join('；')
    },
    onClick() {
      this.$emit('click')
    }
  }
};
</script>

<style lang="scss" scoped>
.order-goods-item{
  padding: 36rpx 0;
  display: flex;
  align-items: center;
  &.border{
    border-bottom: 1px solid #F0F1F2;
  }
}
</style>
