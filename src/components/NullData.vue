
<template>
 <view class="w-full">
    <view class="row center w-full h80"  v-if="!loading">
      <van-loading size="24px">加载中...</van-loading>
    </view>
    <view v-if="loading && children.length == 0 && finished" :class="['mauto bg-white', size ? size :'w316 h270']">
      <image :src="IMAGE[img || 'img_car_none2']"  class="w-h-full" />
      <text style="color:#959CA7" class="fs24 block mt10 text-center">{{ tips }}</text>
      <slot></slot>
    </view>
 </view>
</template>

<script>
import vanLoading from '@/wxcomponents/vant/loading/index'
import * as IMAGE from '@/image-config'

export default {
  name: 'NullData',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    finished: {
      type: Boolean,
      default: false
    },
    children: {
      type: Array,
      default: () => []
    },
    img: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    tips: {
      type: String,
      default: ''
    }
  },
  components: {
    vanLoading
  },
  data() {
    return {
      IMAGE: IMAGE
    };
  }
};
</script>

<style lang="scss" scoped>

</style>
