<template>
  <view class="fs24 color-gray text-center mtb20">
    <text class="notMore">
      {{ description || '没有更多了'}}
    </text>
  </view>
</template>

<script>

export default {
  name: 'BaseEmpty',
  props: {
    description: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>
.color-gray{
  color: #71767D;
}
.notMore{
  display: inline-block;
  color:#C7CACF ;
  padding: 0rpx 100rpx;
  position: relative;
}
.notMore::after{
  content: '';
  position: absolute;
  left: 0%;
  height: 1px;
  top: 50%;
  transform: translate(0,-50%);
  width: 30px;
  background: #e5e5e5;
}
.notMore::before{
  content: '';
  position: absolute;
  transform: translate(0,-50%);
  top: 50%;
  right: 0%;
  height: 1px;
  width: 30px;
  background: #e5e5e5;
}

</style>
