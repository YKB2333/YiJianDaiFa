
<template>
  <view class="w-h-full">
    <!-- 单个 30% -->
    <view v-if="type == '30'" :class="['hidden goods-box-shadow bg-white',parentClass]" style="width:29.5vw;margin-right:1vw" @click="getCilick">
      <!-- img -->
      <view class="relative radius8 hidden border-box p6" style="width:29.5vw;height:29.5vw">
        <view class="bg-white radius8 w-h-full hidden">
          <van-image :src="fetchImage(img)" fit='contain' lazy-load  width="100%" height="100%" use-loading-slot>
            <van-loading slot="loading" type="spinner" size="20" vertical />
          </van-image>
        </view>
        <!-- tag -->
        <view v-if="tag" class="three_tag" >
          <image :src="IMAGE[tag]"  class="w-h-full" />
        </view>
        <!-- 已售罄 -->
        <view class="sale_end" v-if="saleEnd">
          <image :src="IMAGE['sale_end']"  class="w-h-full"/>
        </view>
        <!-- 活动标签名称 -->
        <view class="tagTitle" v-if="tagTitle">
          {{ tagTitle }}
        </view>
      </view>
      <!-- titel -->
      <view class="mlr12 mt6  fs26 fw500 color-black ellipsis ">
        {{ title }}
      </view>
      <view class="row space-between center-y  mlr12 ">
        <view class="color-orange fw500 row center-y " >
          <auth-money
            :money="price"
            :originPrice="originPrice"
            moneyLabel="fs22 mr4 mb2"
            moneyClass="fs28 fw600"
            tipsClass="fs22 mb2"
          />
        </view>
        <view @click.stop="add" :class="['ptb20 row center-y justify-content-flex-end',{'opacity06':isTrue}]">
          <image :src="IMAGE['index_icon_add']" class="w44 h44"  />
        </view>
      </view>
    </view>

    <!-- 单个 50% -->
    <view v-if="type == '50'" :class="['hidden goods-box-shadow  radius8 bg-white col space-between h-full',parentClass]" @click="getCilick">
      <!-- img -->
      <view class="relative w-full h356"  >
        <van-image :src="fetchImage(img)" fit='contain' lazy-load  width="100%" height="100%" use-loading-slot>
          <van-loading slot="loading" type="spinner" size="20" vertical />
        </van-image>
        <!-- 已售罄 -->
        <view class="sale_end" v-if="saleEnd" style="width:45%;height:45%">
          <image :src="IMAGE['sale_end']"  class="w-h-full"/>
        </view>
        <!-- 活动标签名称 -->
        <view class="tagTitle" v-if="tagTitle">
          {{ tagTitle }}
        </view>
      </view>
      <view class="mlr20 col space-between flex-1">
        <!-- titel -->
        <view :class="['mt20 mb8 fs28 fw500 color-black', intro ? 'ellipsis' : 'ellipsis2' ]">
          {{ title }}
        </view>
        <view class="fs24 fw500 mb8 color-gray ellipsis ">
          {{ intro }}
        </view>
        <view class="row space-between center-y ">
          <view class="color-orange fw500 row center-y">
            <auth-money
              :money="price"
              :originPrice="originPrice"
              moneyLabel="fs24 mr4 mb2"
              moneyClass="fs32 fw600"
              tipsClass="fs26"
            />
          </view>
          <view @click.stop="add" :class="['ptb20 row center-y justify-content-flex-end',{'opacity06':isTrue}]">
            <image :src="IMAGE['index_icon_add']" class="w56 h56"  />
          </view>
        </view>
      </view>
    </view>

    <!-- 单个 100% -->
    <view v-if="type == '100'" :class="['hidden goods-box-shadow row ptb16  bg-white',parentClass]"  @click="getCilick">
      <!-- img -->
      <view class=" relative ml16" style="width:28vw;height:28vw">
        <van-image :src="fetchImage(img)" fit="contain" class="radius8" lazy-load width="100%" height="100%" use-loading-slot>
          <van-loading slot="loading" type="spinner" size="20" vertical />
        </van-image>
        <!-- tag -->
        <view v-if="tag" class="one_tag">
          <image :src="IMAGE[tag]"  class="w-h-full"/>
        </view>
        <!-- 已售罄 -->
        <view class="sale_end" v-if="saleEnd">
          <image :src="IMAGE['sale_end']"  class="w-h-full"/>
        </view>
        <!-- 活动标签名称 -->
        <view class="tagTitle" v-if="tagTitle">
          {{ tagTitle }}
        </view>
      </view>
      <view class="col  w-full hidden flex-1 mlr20" >
        <!-- titel -->
        <view class="mt16 mb6 fs28 fw500 color-black ellipsis2 ">
          {{ title }}
        </view>
        <view class="mb10 fs24 fw500 color-gray ellipsis flex-1">
          {{ intro || '' }}
        </view>
        <view class="row space-between center-y  mlr12 " style="align-items: flex-end;">
          <view class="color-orange row center-y">
            <auth-money
              :money="price"
              :originPrice="originPrice"
              moneyLabel="fs24 mr4 mb2"
              moneyClass="fs32 fw600"
              tipsClass="fs26"
            />
          </view>
          <view @click.stop="add" :class="['ptb20 row center-y justify-content-flex-end',{'opacity06':isTrue}]"  >
            <image :src="IMAGE['index_icon_add']" class="w56 h56" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import * as IMAGE from '@/image-config.js'
import vanLoading from '@/wxcomponents/vant/loading/index'
import vanImage from '@/wxcomponents/vant/image/index'
import { authentication } from '@/mixins/auth'

export default {
  name: 'GoodItem',
  props: {
    type: { // 传入类型大小
      type: Number,
      default: 0
    },
    title: { // 标题
      type: String,
      default: ''
    },
    tag: { // 标签
      type: String,
      default: ''
    },
    img: { // 图片
      type: String,
      default: ''
    },
    price: { // 金钱
      type: [Number, String],
      default: '0'
    },
    originPrice: { // 原价金钱
      type: [Number, String],
      default: '0'
    },
    intro: {
      type: String,
      default: ''
    },
    tagTitle: {
      type: String,
      default: ''
    },
    parentClass: { // 总盒子类名
      type: [Array, String, Object],
      default: () => {}
    },
    isCooperated: {
      type: Boolean,
      default: false
    },
    saleEnd: {
      type: Boolean,
      default: false
    }
  },
  mixins: [authentication],
  data() {
    return {
      IMAGE: IMAGE,
      isTrue: false
    };
  },
  components: {
    vanLoading,
    vanImage
  },
  watch: {
    isCooperated(newValue) {
      this.isTrue = newValue
    }
  },
  mounted() {
    this.isTrue = this.isCooperated
  },
  methods: {
    add() {
      const status = this.checkUserAuth()
      if (status) return
      this.$emit('add')
    },
    getCilick() {
      this.$emit('link')
    },
    fetchImage(img) {
      return img ? `${img}?x-oss-process=image/resize,m_lfit,h_400,w_400` : this.IMAGE.big_logo
    }
  }
};
</script>

<style lang="scss" scoped>
.color-black {
  color: #242629;
}
.color-orange {
  color: #FF7640;
}
.color-gray {
  color: #959CA7;
}
.goods-box-shadow {
  box-shadow:0px 0px 10px 0px rgba(240,240,240,1);
  border-radius: 8rpx;
}
.no-goods-box-shadow {
  box-shadow:none !important;
  border-radius: 8rpx;
}
.justify-content-flex-end {
  justify-content: flex-end;
}
.opacity06 {
  opacity: 0.3;
}
.three_tag {
  position: absolute;
  left: 50%;
  top: 0;
  width: 100rpx;
  height: 32rpx;
  z-index: 99;
  transform:translate(-50%,0)
}
.one_tag {
  position: absolute;
  left: -16rpx;
  top: 0;
  width: 76rpx;
  height: 32rpx;
  z-index: 99;
}
.sale_end {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  width: 60%;
  height: 60%;
  z-index:1;
}
.tagTitle {
  position: absolute;
  left: 0%;
  top: 28rpx;
  padding: 4rpx 12rpx;
  color: white;
  font-weight: 500;
  font-size: 22rpx;
  background: linear-gradient(90deg, #FF7C5B 0%, #FF2927 100%);
  border-radius: 0 156rpx 156rpx 0;
}
</style>
