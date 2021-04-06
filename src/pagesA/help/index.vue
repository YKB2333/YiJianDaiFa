
<template>
  <view class="w-h-full" style="border-top:1px solid #f5f6f8">
    <van-cell
      v-for="(item,index) in list"
      :key="index"
      @click="link(item)"
      is-link
    >
      <view slot="title" class="wpct92 hidden">
        <view class="van-cell-text lineClamp  hidden">{{ item.name || item.title }}</view>
      </view>
    </van-cell>
    <view class="pos-center" v-if="loading" style="margin-top:-15%">
      <null-data :loading="loading" :finished="finished" :children="list" />
      <view class="fs24 color-gray text-center mtb20">
        <text class="notMore" v-if="!list.length">没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script>
import { cmsCategoryId } from '@/config';
import { cmsSelectPage, getColumnIdList } from '@/api/cms';

export default {
  name: 'help',
  data() {
    return {
      list: [],
      loading: false,
      finished: false
    };
  },
  onLoad(options) {
    const id = options.id || cmsCategoryId.mine.help;
    this.init(id);
  },
  methods: {
    async init(id) {
      wx.showLoading({
        mask: true,
        title: '加载中'
      })
      try {
        await this.initColumnList(id);
        await this.initCmsSelectPage(id);
        this.loading = true;
        this.finished = true;
      } finally {
        wx.hideLoading()
      }
    },
    initColumnList(id) {
      return new Promise((resolve, reject) => {
        getColumnIdList(id).then(({ result }) => {
          this.list = this.list.concat(result);
          resolve(result);
        });
      });
    },
    initCmsSelectPage(id) {
      return new Promise((resolve, reject) => {
        cmsSelectPage({
          pageIndex: 1,
          pageSize: 500,
          status: 1,
          infoCategoryId: id,
          orderStr: 'orderLevel asc'
        }).then(({ result }) => {
          this.list = this.list.concat(result.records);
          resolve(result);
        });
      });
    },
    link(item) {
      //  只有栏目有name
      if (item.name) {
        wx.navigateTo({
          url: `${this.$pageUrl.HELP}?id=${item.id}`
        });
      } else {
        wx.navigateTo({
          url: `${this.$pageUrl.INFORMATION}?id=${item.id}`
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .van-cell {
  padding: 27rpx 28rpx;
  font-size: 15px;
}
.notMore {
  display: inline-block;
  color: #c7cacf;
  padding: 0rpx 100rpx;
  position: relative;
}
.lineClamp{
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  white-space: normal !important;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>
