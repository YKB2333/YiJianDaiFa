<template>
  <van-popup
    :show="visible"
    @close="onClose"
    custom-style="width: 100%; background: transparent;"
  >
    <view class="relative">
      <view class="relative" style="width:92%; margin-left:8%">
        <image :src="IMAGE['shopping_success_popup']" mode="widthFix" class="w-full"/>
      </view>
      <view class="w-full col text-center fw500 absolute" style="color: #9B7C4E;transform: translate(-50%, 0);left: 50%;top:100rpx">
        <text class="fs48">恭喜您!</text>
        <text class="fs40 mt14">您已成功升级为推荐官!</text>
      </view>
      <view @click="linkPage" class="btn" style="transform: translate(-50%, 0);left: 50%;bottom: 84rpx">
        前往推荐官工作台
      </view>
    </view>
    <!-- 关闭按钮 -->
    <view class="w-fiull row center pt56 pb20" style="background: transparent" @click="onClose">
      <image :src="IMAGE['icon_close']" mode="widthFix" class="w60 h60"/>
    </view>
  </van-popup>
</template>

<script>
import vanPopup from '@/wxcomponents/vant/popup/index';
import { shopping_success_popup, icon_close } from '@/image-config.js'
import { mapGetters } from 'vuex'

export default {
  name: '',
  data() {
    return {
      visible: false,
      IMAGE: {
        shopping_success_popup, icon_close
      }
    }
  },
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  components: {
    vanPopup
  },
  watch: {
    show: {
      handler(newValue) {
        this.visible = newValue
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters(['customerUserInfo'])
  },
  methods: {
    onClose() {
      this.$emit('action', 'close')
    },
    linkPage() {
      this.$emit('action', 'confirm')
    }
  }
}
</script>

<style lang="scss" scoped>
.btn {
  position: absolute;
  left: 21.22%;
  bottom: 15%;
  background: #FFFCF4;
  border-radius: 44rpx;
  text-align: center;
  color: #9B7C4E;
  padding: 20rpx 38rpx;
  font-size: 32rpx;
}
</style>