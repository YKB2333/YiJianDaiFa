<template>
  <view
    :class="['row space-between center-y wpct92 mauto ptb48', parentClass ]"
    :style="parentStyle"
    >
    <!-- 标题 -->
    <slot name="title">
      <view :class="title_Class.length ? title_Class : ['fw500', 'fs32','flex-1','row','center-y']">
        <image :src="IMAGE[icon_url]"  class="w44 h44 mr8" v-if="icon_url"/>
        {{ title || '标题' }}
      </view>
    </slot>
    <!-- 右侧文本内容 -->
    <view
      v-if="isValue || value || this.$slots.value "
      @click="getLink"
      :class="['row','center-y','fs26', right_Class]"
      style="color:#afafaf"
    >
      <slot >
        {{ value  || '更多'}}
      </slot>
      <van-icon name="arrow" color="#afafaf"  v-if="icon"/>
    </view>
  </view>
</template>

<script>
import * as IMAGE from '@/image-config.js'
import vanIcon from '@/wxcomponents/vant/icon/index'
export default {
  name: 'BaseTitle',
  props: {
    title: { // 标题
      type: String,
      default: ''
    },
    icon_url: { // 图标地址
      type: String,
      default: ''
    },
    value: { //  右侧文本
      type: String,
      default: ''
    },
    isValue: { //  是否显示右侧文本
      type: Boolean,
      default: false
    },
    icon: { // 是否显示 右侧箭头
      type: Boolean,
      default: false
    },
    is_link: { // 是否跳转开关
      type: Boolean,
      default: false
    },
    url: { //跳转地址
      type: String,
      default: ''
    },
    to: { //路由跳转地址
    },
    title_Class: { // 标题类格外类名
      type: Array,
      default: () => {}
    },
    right_Class: { // 右侧格外类名
      type: Array,
      default: () => {}
    },
    parentClass: { // 总盒子类名
      type: Array,
      default: () => {}
    },
    parentStyle: { // 总盒子样式
      type: Array,
      default: () => {}
    }
  },
  data() {
    return {
      IMAGE: IMAGE
    };
  },
  components: {
    vanIcon
  },
  methods: {
    getLink() {
      this.$emit('link')
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
