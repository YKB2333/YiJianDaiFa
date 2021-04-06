<template>
  <view class="backTop" @click="goTop" v-show="show">
    <image :src="IMAGE['icon_back_top']" mode='widthFix' class="radius10 w60 h60"></image>
  </view>
</template>

<script>
import {
  icon_back_top
} from '@/image-config.js'

export default {
  name: '',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      IMAGE: { // 图标列表
        icon_back_top
      }
    };
  },
  methods: {
    goTop() { // 一键回到顶部
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0
        })
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.backTop{
  position: fixed;
  right: 7.5%;
  bottom: 10%;
  z-index: 2;
}
</style>
