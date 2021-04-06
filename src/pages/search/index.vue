<template>
  <view :class="['page col hidden',{'searchBackground':query.keyword.length && searchGoodsList.length}]" style="height: 100vh">
    <!-- 搜索 -->
    <base-search
      :isFocus="isFocus"
      v-model="query.keyword"
      @onChange="onChange"
      @onSearch="onChangSearchList"
      @onReset="resetQuery"
    />
    <scroll-view
      lower-threshold="150"
      v-show="query.keyword.length"
      :scroll-y="!scroll"
      style="height: calc(100vh - 54px);"
      @scrolltolower="onSearch"
    >
      <!-- 搜索商品列表 -->
      <view class="w-full">
        <goods-list
          :scroll.sync="scroll"
          :list="searchGoodsList"
          :loading="query.loading"
          :finished="query.finished"
          :isVisible="true"
          @change="switchTab"
          fixed
          topStyle="margin-top: 54px"
        ></goods-list>
      </view>
    </scroll-view>

    <!-- 历史搜索 热门搜索-->
    <view v-show="!query.keyword.length " class="height100">
      <view class=" wpct92  mauto border-bottom1 col hidden "  v-if="historyList.length">
        <view class="fs28 fw600 mt44  mb32 color-black row space-between center-y">
          <view>
            历史搜索
          </view>
          <view @click="clearHistorySearch">
            <image :src="IMAGE['icon_clear']" mode='widthFix' class="radius10 w44 h44" ></image>
          </view>
        </view>
        <view class=" pt4 color-gray row wrap pb22">
          <text
            v-for="(item, index) in historyList"
            :key="index"
            v-show="index < visibleNumber"
            class="mr22 mb22 tag"
            @click="onClickSearchName(item)"
          >{{ item }}</text>
          <view class="radius row center btn"  v-if="historyList.length > 10">
            <van-icon name="arrow-up" v-if="visibleFlag" @click="switchHistory"/>
            <van-icon name="arrow-down"  v-else @click="switchHistory"/>
          </view>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view class="wpct92  mauto">
        <view class="fs28 fw600 mt44 mb32 color-black">热门搜索</view>
        <view class="hidden ptb4 color-gray row wrap">
          <text
            v-for="(item,index) in hotSearch"
            :key="index"
            class="mr22 mb22 tag"
            @click="onClickSearchName(item)"
            >{{ item }}</text>
        </view>
      </view>
    </view>
    <van-dialog id="van-dialog" />
  </view>
</template>

<script>
import {
  icon_clear,
  search,
  img_ser_none
} from '@/image-config.js'
import goodsList from '@/pages/goods-list/components/GoodsList';
import BaseSearch from './BaseSearch';
import { searchGoods, getDictionary } from '@/api/home';
import Dialog from '@/wxcomponents/vant/dialog/dialog';
import { debounce } from '@/utils'

export default {
  name: 'search',
  components: { goodsList, BaseSearch },
  data() {
    return {
      isFocus: true,
      IMAGE: {
        search,
        icon_clear,
        img_ser_none
      },
      searchValue: '',
      hotSearch: [],
      searchGoodsList: [],
      historyList: [],
      visibleNumber: 10,
      visibleFlag: false,
      query: {
        pageIndex: 1,
        pageSize: 20,
        keyword: '',
        orderProperty: 'yjdfStock',
        orderType: 1,
        loading: false,
        error: false,
        finished: false
      },
      scroll: false
    }
  },
  onLoad(option) {
    if (option) {
      this.isFocus = false
      this.searchValue = option.name
      this.query.keyword = option.name
      this.onSearch()
    }
  },
  created() {
    this.getHotSearch()
  },
  methods: {
    onSearch: debounce(function(isCancel = true) {
      const { loading, finished, error } = this.query
      if (!this.query.keyword || loading || finished || error) return
      this.query.loading = true
      searchGoods(this.query, isCancel).then(({ result }) => {
        this.saveHistoryList()
        const data = (result && result.list) || []
        this.searchGoodsList = this.searchGoodsList.concat(data)
        this.query.error = false
        if (data.length === 0 || this.searchGoodsList.length < this.query.pageSize) {
          this.query.finished = true
          return
        }
        this.query.pageIndex += 1
      }).catch(err => {
        this.query.error = true
      }).finally(() => {
        this.query.loading = false
      })
    }, 300),
    resetQuery() {
      this.query = {
        pageIndex: 1,
        pageSize: 10,
        keyword: '',
        orderProperty: '',
        orderType: 1,
        loading: false,
        error: false,
        finished: false
      }
      this.searchGoodsList = []
    },
    saveHistoryList() {
      const arr = uni.getStorageSync('historySearch') || []
      if (this.query.keyword.trim().length === 0 || arr.find(e => e == this.query.keyword.trim())) return
      arr.push(this.query.keyword)
      uni.setStorage({
        key: 'historySearch',
        data: arr
      })
      this.historyList = uni.getStorageSync('historySearch').reverse()
    },
    switchTab(index, type) {
      //  0全部  1销量totalSales  3价格lowerDsPrice
      this.query.pageIndex = 1
      this.query.orderType = ''
      this.searchGoodsList = []
      this.query.finished = false
      delete this.query.queryField
      if (index == 0) {
        this.query.orderProperty = ''
      } else if (index == 1) {
        this.query.orderProperty = 'totalSales'
        this.query.orderType = '1'
      } else if (index == 2) {
        this.query.orderProperty = 'lowerDsPrice'
        this.query.orderType = type
        this.query.queryField = 1
      }
      this.onSearch()
    },
    // 切换显示历史
    switchHistory() {
      this.visibleFlag = !this.visibleFlag
      this.visibleNumber = this.visibleFlag ? this.historyList.length : 10
    },
    clearHistorySearch() {
      Dialog.confirm({
        title: '清空记录',
        message: '是否清空历史记录'
      }).then(() => {
        uni.setStorage({
          key: 'historySearch',
          data: []
        })
        this.historyList = []
      })
    },
    onChange(value) {
      this.resetQuery()
      this.query.keyword = value
      this.onSearch()
    },
    onClickSearchName(name) {
      this.resetQuery()
      this.query.keyword = name
      this.onSearch()
    },
    getHotSearch() {
      this.historyList = uni.getStorageSync('historySearch').reverse()
      getDictionary().then(({ result }) => {
        const str = result.find(e => e.code === 'hotwords').value;
        this.hotSearch = str.split('|').filter(e => e)
      })
    },
    onChangSearchList() {
      this.query.finished = false
      this.query.pageIndex = 1
      this.searchGoodsList = []
      this.onSearch()
    }
  }
}
</script>

<style lang="scss" scoped>
.page{
  width: 100%;
}
.color-black{
  color: #242629;
}
.color-gray{
  color: #959CA7;
}
.tag{
  font-size: 13px;
  background: #F6F6F6;
  border-radius: 13px;
  padding: 6px 15px;
}
.border-bottom1{
  border-bottom:1px solid #eee
}
.btn{
  background: #F6F6F6;margin-bottom: 14px;width: 26px;
}

.searchBackground{
  background: #F6F6F6;
}

.height100{
  height:calc(100vh - 54px);
  background: white;
}
/deep/ .van-stepper__input{
  color: #242629 !important;
  font-size: 13px;
  background-color: #F6F6F6;
}
</style>
