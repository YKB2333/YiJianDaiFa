<template>
  <view>
    <view class="col center-y bg-white" v-if="isEmpty" :class="emptyClass">
      <image :src="image" :class="imgClass" />
      <text class="fs24 mt26 text-center fc-grey">{{ label }}</text>
      <slot></slot>
    </view>
    <view class="row center w-full h80 ptb20" v-else-if="loading">
      <van-loading size="24px">加载中...</van-loading>
    </view>
    <view class="text-center ptb20" v-else-if="finished">
      <slot name="finished">
        <text class="fc-grey fs24">没有更多数据了</text>
      </slot>
    </view>
    <view class="text-center ptb20" v-else-if="error">
      <text class="fc-grey fs24" @tap="errorClick">加载失败，请点击重试</text>
    </view>
  </view>
</template>

<script>
import VanLoading from '@/wxcomponents/vant/loading/index'

export default {
  components: { VanLoading },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    finished: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    image: String,
    label: String,
    imgClass: String,
    emptyClass: String
  },
  methods: {
    errorClick() {
      this.$emit('error-click')
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
