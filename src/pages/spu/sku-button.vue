<template>
  <view>
    <view :class="['button-gray fc-black inlink-block', {'button-disabled': disabled}, {'button-active': active}, parentClass]" @click="onClick">
      <slot>
        {{ title }}
      </slot>
    </view>
  </view>
</template>

<script>

export default {
  name: 'SkuButton',
  props: {
    title: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    parentClass: { // 总盒子类名
      type: [Array, String, Object],
      default: () => {}
    }
  },
  data() {
    return {};
  },
  created() {

  },
  methods: {
    onClick() {
      if (this.disabled) return
      this.$emit('click')
    }
  }
};
</script>

<style lang="scss" scoped>
.button-gray{
  margin-right: 32rpx;
  margin-bottom: 20rpx;
  color: #363636;
  background: #f5f5f5;
  border-radius: 30px;
  padding: 4px 12px;
  font-size: 13px;
  border:1px solid #F6F6F6;
}
.button-active{
  color: #10967B !important;
  background:rgba(16,150,123,0.1);
  border:1px solid rgba(16,150,123,1);
  text-decoration: unset !important;
}
.button-disabled {
  background: #f5f5f5 !important;
  color: #cfcfcf !important;
}
.inlink-block{
  display: inline-block;
}
</style>
