<template>
  <view class="ptb30 plr28">
    <view class="row w-full">
      <view class="row center-y w-full relative">
        <image
          v-for="img in imageList" :key="img"
          :src="img"
          class="w-h160 mr6"
          mode="aspectFit"
        />
        <van-icon name="arrow" class="arrow" color="#C7CACF" />
      </view>
    </view>
  </view>
</template>

<script>
import VanIcon from '@/wxcomponents/vant/icon/index'
import { big_logo } from '@/image-config.js'

export default {
  components: { VanIcon },
  props: {
    skus: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    imageList() {
      const urls = []
      this.skus.forEach(e => {
        const images = e.skuTitleImage || e.spuTitleImages || e.titleImage || big_logo
        urls.push(images)
      })
      return urls.splice(0, 4)
    }
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>
.arrow{
  width: 28rpx;
  height: 28rpx;
  position: absolute;
  transform: translate(0,-50%);
  top: 50%;
  right: 0;
}
</style>