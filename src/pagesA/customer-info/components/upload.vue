<template>
  <van-popup
    :show="show"
    @close="close"
    close-icon="close"
    position="bottom"
    closeable
    round
  >
    <view class="relative w-h-full">
      <view class="hairline-bottom ptb30 fs34 fw600 text-center">
        {{ title }}
      </view>
      <view class="col center-y mauto hidden wpct92">
        <!-- 这样写是为了兼容动态改变mode 时候不生效 -->
        <image :src="image" mode="widthFix" class="ptb30"/>
        <rich-text class="fc-gray fs22 mb40" v-if="tips" :nodes="tips"></rich-text>
      </view>
      <!-- 按钮 -->
      <view class="hairline-top hairline-bottom w-full ptb18 row center-y" >
        <button
          @click="onChooseImg"
          class="h88 l-h88 fc-white br44 bg-theme hairline wpct92"
        >{{ buttonName }}</button>
      </view>
    </view>
  </van-popup>
</template>
<script>
import { uploadFile } from '@/api/oss'

export default {
  name: 'upload',
  props: {
    title: {
      type: String,
      default: '上传照片示例'
    },
    buttonName: {
      type: String,
      default: '上传照片'
    },
    keys: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    tips: {
      type: String,
      default: null
    },
    show: {
      type: Boolean,
      default: false
    },
    apiName: {
      type: String,
      default: null
    },
    mode: {
      type: String,
      default: 'widthFix'
    }
  },
  methods: {
    // 关闭上传弹窗
    close() {
      this.$emit('close')
    },
    // 点击选择照片或者拍照
    onChooseImg(type) {
      if (!this.apiName) {
        uni.showToast({
          title: '上传失败、缺少上传地址',
          duration: 2000,
          icon: 'none'
        });
        return
      }
      uni.chooseImage({
        count: 1,
        sizeType: ['original'],
        success: async(res) => {
          uni.showLoading({
            title: '上传中',
            mask: true
          });
          await uploadFile(res.tempFilePaths[0], this.apiName).then(res => {
            const data = { ...res, keys: this.keys }
            this.$emit('success', data)
            uni.hideLoading();
          }).catch((e) => {
            uni.hideLoading();
            uni.showToast({ title: e.message, icon: 'none' });
          })
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
