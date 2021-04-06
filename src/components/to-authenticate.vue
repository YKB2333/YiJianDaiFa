<template>
  <view class="auth-top" @click="linkPage" v-if="['underReview', 'notEnable', 'disabled'].includes(userStatus)" :style="styleString">
    <image :src="IMAGE['user_auth']" mode='widthFix' class="logoAuth"  ></image>
  </view>
</template>

<script>
import {
  user_auth
} from '@/image-config.js'
import { authentication } from '@/mixins/auth'
export default {
  name: '',
  mixins: [authentication],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    styleString: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      IMAGE: { // 图标列表
        user_auth
      }
    };
  },
  methods: {
    linkPage() {
      this.checkUserAuth()
    }
  }
};
</script>

<style lang="scss" scoped>
.auth-top{
  position: fixed;
  right: 3%;
  bottom: 18%;
  z-index: 2;
}
.logoAuth {
  width: 132rpx;
  height: 132rpx;
}
</style>
