<template>
  <view>
    <web-view :src="url" @load="loadSeccess" @error="loadError"></web-view>
  </view>
</template>

<script>

export default {
  name: 'https',
  data() {
    return {
      url: ''
    }
  },
  onLoad(option) {
    if (option.title) {
      uni.setNavigationBarTitle({
        title: option.title //页面标题为路由参数
      })
    }
    this.url = option.url
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