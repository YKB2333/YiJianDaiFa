<template>
  <view>
    <van-search
      class="searcHeader"
      :value="value"
      :placeholder="placeholder"
      use-action-slot
      shape="round"
      @change="onTestChange"
      @search="onSearch"
      @clear="onReset"
      :focus="isFocus"
      :left-icon="IMAGE['search']"
    >
      <view slot="action" @click="onSearch()" class="w-full plr16">搜索</view>
    </van-search>
  </view>
</template>

<script>

import {
  search
} from '@/image-config.js'
export default {
  name: 'BaseEmpty',
  props: {
    value: { //  value
      type: String,
      default: ''
    },
    isFocus: { //  是否获取焦点
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '请输入搜索关键词'
    }
  },
  data() {
    return {
      searchValue: '',
      IMAGE: {
        search
      }
    };
  },
  watch: {

  },
  created() {

  },

  methods: {
    onTestChange(e) {
      this.searchValue = e.detail
      this.$emit('onChange', e.detail)
    },
    onSearch() {
      this.$emit('onSearch')
    },
    onReset() {
      this.$emit('onReset')
    },
    onChangSearchList() {
      this.$emit('onChangSearchList')
    }
  }
};
</script>

<style lang="scss" scoped>
.searcHeader{
  width: 100%;
  background: white;
  z-index: 1000;
  padding: 0;
  overflow:hidden;
  height: 54px;
}
/deep/ .van-search {
padding: 10px 12px;
height: 54px;
}
/deep/ .van-search__action {
  padding: 0 ;
}
/deep/ .van-icon--image{
  display: flex;
}
</style>
