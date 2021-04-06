<template>
  <view :class="['mlr22 bg-white', (parentClass || 'coupon_box')]">
    <view class="coupon">
      <view :class="['col left', { 'disabled': ['notEnable', 'expired', 'disabled', 'used'].includes(status) }]">
        <view class="row center-y">
          <text class="fs40 mr2">¥</text>
          <text class="fs78 fw500">{{ parseFloat(price) }}</text>
        </view>
        <view class="fs26">{{ condition }}</view>
      </view>
      <view class="row space-between right">
        <view class="flex-1 ptb10">
          <view class="fs34 fw500">{{ name }}</view>
          <view class="fs24 fc-grey mt30 row center-y" @click.stop="onClickLookDetails">
            {{ time }}
            <image :src="IMAGE['icon_up']" mode='widthFix' class="w26 h26 ml8" v-show="detailsVisible"></image>
            <image :src="IMAGE['icon_up']" mode='widthFix' class="w26 h26 ml8" style="transform: rotate(180deg)" v-show="!detailsVisible"></image>
          </view>
          <view class="fs24 fc-grey" v-show="detailsVisible">{{ application }}</view>
        </view>
        <view class="h206  row center-y">
          <slot name="button">
            <!-- 禁用 -->
            <view v-if="status === 'disabled'"></view>
            <view v-if="status === 'used'">
              <image :src="IMAGE['icon_used']" class="w100 h100"/>
            </view>
            <!-- 去使用 -->
            <view v-if="status === 'enable'" class="btn" @click="action('enable')">去使用</view>
            <!-- 立即领取 -->
            <view v-if="status === 'notReceived'" class="btn fs24" @click="action('notReceived')">立即领取</view>
            <!-- 去使用状态-禁止使用 -->
            <view v-if="status === 'notEnable'" class="btn disabled">去使用</view>
            <!-- 已领取 -->
            <view v-else-if="status === 'received'" class="mr16">
              <image :src="IMAGE['icon_received']" class="w100 h100" />
            </view>
            <!-- 已过期 -->
            <view v-else-if="status === 'expired'" class="mr16">
              <image :src="IMAGE['icon_expired']" class="w100 h100"/>
            </view>
          </slot>
        </view>
      </view>
    </view>
    <view v-if="description" class="fs22 fc-grey mt8 mlr28">
      {{ description }}
    </view>
  </view>
</template>

<script>
import { authentication } from '@/mixins/auth';
import { icon_expired, icon_received, icon_used, icon_up } from '@/image-config'
import vanIcon from '@/wxcomponents/vant/icon/index'

export default {
  name: '',
  mixins: [authentication],
  components: {
    vanIcon
  },
  props: {
    value: {},
    status: {
      type: String,
      default: ''
    },
    condition: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: ''
    },
    price: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      default: ''
    },
    application: {
      type: String,
      default: ''
    },
    parentClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      IMAGE: {
        icon_expired, icon_received, icon_used, icon_up
      },
      detailsVisible: false
    }
  },
  methods: {
    action(type) {
      this.$emit('action', type, this.value)
    },
    onClickLookDetails() {
      this.detailsVisible = !this.detailsVisible
    }
  }
}
</script>

<style lang="scss" scoped>
.coupon_box {
  box-shadow: 0px 1px 4px 5px rgba(248, 248, 248, 0.8);
  border-radius: 16rpx;
  margin: 0 28rpx;
  .left::after,
  .right::after {
    background: linear-gradient(to bottom, rgb(250, 250, 250) 0%, rgba(250, 250, 250, 1) 100%) !important;
  }
  .left::before, .right::before {
    box-shadow: 0px -5px 10px -5px rgba(77, 77, 77, 0.8);
    background: linear-gradient(to bottom, rgb(250, 250, 250) 0%, rgba(250, 250, 250, 1) 100%) !important;
  }
}
.coupon {
  color: white;
  display: flex;
  .left {
    width: 210rpx;
    height: 205rpx;
    background: #FFA940;
    border-radius: 16rpx 0px 0px 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .right {
    padding-left: 28rpx;
    flex: 1;
    color: #242629;
    background: #FFFFFF;
    border-radius: 0px 16rpx 16rpx 0px;
  }
  .left, .right {
    position: relative;
    overflow: hidden;
  }
  .left::after,
  .right::after,
  .left::before,
  .right::before {
    content: '';
    position: absolute;
    width: 20rpx;
    height: 20rpx;
    background: #F6F6F6;
    border-radius: 50%;
  }
  .left::after{
    right: -10rpx;
    top: -10rpx;
  }
  .left::before{
    right: -10rpx;
    bottom: -10rpx;
  }
  .right::after{
    left: -10rpx;
    top: -10rpx;
  }
  .right::before{
    left: -10rpx;
    bottom: -10rpx;
  }

  .btn {
    background: #FFA940;
    border-radius: 28rpx;
    text-align: center;
    display: flex;
    align-items: center;
    color: white;
    font-size: 28rpx;
    padding: 8rpx 24rpx;
    margin-right: 16rpx;
  }
}
.disabled {
  pointer-events: none;
  opacity: 0.7;
  background: #C7CACF !important;
}
</style>
