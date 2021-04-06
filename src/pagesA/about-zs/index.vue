<template>
  <view>
    <web-view :src="aboutZs" @load="loadSeccess" @error="loadError"></web-view>
  </view>
</template>

<script>
import { aboutZs } from '@/config'

export default {
  name: 'ABOUT_ZS',
  data() {
    return {
      aboutZs
    }
  },
  onLoad() {
    uni.showLoading()
  },
  methods: {
    loadSeccess() {
      uni.hideLoading()
    },
    loadError() {
      uni.hideLoading()
      uni.showToast({ title: '加载失败, 请重试', icon: 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>