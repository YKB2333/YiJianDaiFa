
<template>
  <view class="page col hidden" style="height: 100vh">
    <!-- 搜索 -->
    <base-search
      :isFocus="false"
      v-model="query.keyword"
      :placeholder="isInsideActivity ? '分类/品牌/商品名称/商品条码/规格编码' : '请输入搜索关键词'"
      @onChange="onChangeSearch"
      @onSearch="onClickSearch"
      @onReset="resetquery"
    />
    <scroll-view
      :scroll-y="!scroll"
      style="height: calc(100vh - 54px)"
      lower-threshold="150"
      @scrolltolower="onSearch"
    >
      <!-- 内购广告位 -->
      <view v-if="isShowCountDown && bannerImage && isInsideActivity" class="w-full page-scroll relative h340 mb20">
        <view class="w-h-full h340">
          <image :src="bannerImage" class="w-full h340"/>
        </view>
        <view class="downTime">
          <view class="hairline-bottom pb6">{{ activityTimeTips }}</view>
          <van-count-down use-slot :time="countDownTimeLength" @change="timeDataChange" @finish="isShowCountDown = false">
            <view class="fs26 fc-white pt6">
              距结束仅剩
              <text class="item">{{ time.days }}</text>天
              <text class="item">{{ time.hours }}</text>时
              <text class="item">{{ time.minutes }}</text>分
              <text class="item">{{ time.seconds }}</text>秒
            </view>
          </van-count-down>
        </view>
      </view>
      <!-- 商品列表 -->
      <goods-list
        :scroll.sync="scroll"
        :list="goodsList"
        :loading="query.loading"
        :finished="query.finished"
        :fixed="isFixed"
        :topStyle="isFixed ? 'margin-top:54px' : null"
        :filter="isFilter"
        :innerbuyActivityId="query.innerbuyActivityId"
        :page="options.page"
        @change="switchTab"
        @confirm="confirm"
      />
    <!-- 内购购物车 -->
    <view class="inside_shopping_cart" @click="toCartPage" v-if="isInsideActivity">
      <view class="relative">
        <image :src="IMAGE['inside_shopping_cart']" class="w-full" mode="widthFix"/>
        <view class="insideCartNumber" v-if="cartCount">{{ cartCount > 99 ? '99+' : cartCount }}</view>
      </view>
    </view>
    <!-- 去认证 -->
    <to-authenticate />
    <van-dialog id="van-dialog" />
    </scroll-view>
  </view>
</template>

<script>
import BaseSearch from '@/pages/search/BaseSearch';
import GoodsList from './components/GoodsList';
import { searchGoods } from '@/api/home';
import { debounce, formatDate } from '@/utils'
import toAuthenticate from '@/components/to-authenticate';
import { cmsInfoIds } from '@/config'
import { getInfoById } from '@/api/cms'
import { inside_shopping_cart } from '@/image-config.js'
import { innerActivityGoods, getCartCount } from '@/api/goods'
import { mapGetters } from 'vuex'
import { checkInnerbuyStatus } from '@/api/order'
import { authentication } from '@/mixins/auth'
import TYPES from '@/store/types'

export default {
  name: 'goods-list',
  components: {
    GoodsList,
    BaseSearch,
    toAuthenticate
  },
  data() {
    return {
      requestSucceed: false,
      goodsList: [],
      query: {
        loading: false,
        error: false,
        finished: false,
        pageIndex: 1,
        pageSize: 20,
        keyword: '',
        orderProperty: 'yjdfStock',
        orderType: 1 // 1降序 2升序
      },
      isShowCountDown: false,
      IMAGE: { // 图标列表
        inside_shopping_cart
      },
      options: {},
      bannerImage: '',
      activityTimeTips: '',
      activityHeight: 0, // 活动广告的高度
      isFixed: true, // 默认吸顶
      isFilter: false, // 默认不显示筛选
      cartCount: 0, // 购物车数量
      countDownTimeLength: '', // 倒计时时长
      time: null,
      scroll: false
    }
  },
  mixins: [authentication],
  computed: {
    ...mapGetters(['activityObject', 'userInfo']),
    // 是否内购活动
    isInsideActivity() {
      return this.options.page === 'inside_shopping_activity'
    },
    goodsType() {
      return this.isInsideActivity ? 'INNER_GOODS' : 'COMMON_GOODS'
    }
  },
  async onLoad(options) {
    this.options = options
    uni.setNavigationBarTitle({
      title: options.title || '商品列表'//页面标题为路由参数
    })
    // 通过内购入口进入
    if (options.page === 'inside_shopping_activity') {
      if (Object.keys(this.activityObject).length === 0) { // 判断有无内购对象、如果没有重新请求
        await this.fetchInsideActivity()
      }
      this.initCMSInofById(cmsInfoIds.inside_shopping_activity) // 获取活动banner
      this.isFixed = false
      this.isFilter = true
      this.query.innerbuyActivityId = this.activityObject.id // 赋值内购活动id
      this.query.orderProperty = 'sort'
      // 活动时间范围
      this.activityTimeTips = `活动时间: ${formatDate(this.activityObject.startTime, 'M月D日  h时')} ~ ${formatDate(this.activityObject.endTime, 'M月D日  h时')}`
      this.countDownTimeLength = this.activityObject.endTime - new Date().getTime()
      this.isShowCountDown = true
      this.onSearch()
      return
    }
    // 通过首页活动进入
    if (options.yjdfTopic) {
      this.query.yjdfTopic = options.yjdfTopic
      this.query.orderProperty = ''
      this.query.labelId = options.labelId
      this.onSearch()
      return
    }
    // 通过分类进入
    if (options.cateOne && options.cateTwo) {
      this.query.cateOne = options.cateOne
      this.query.cateTwo = options.cateTwo
      this.onSearch()
    }
  },
  onShow() {
    if (this.isInsideActivity) {
      this.fetchCartCount() // 购物车
    }
  },
  methods: {
    timeDataChange(e) {
      this.time = e.detail
    },
    onSearch: debounce(function() {
      if (this.requestSucceed || this.query.finished) return
      this.requestSucceed = true
      this.query.loading = true
      // 获取内购商品数据
      if (this.isInsideActivity) {
        this.fetchInsideShoppingGoods()
      } else if (this.query.yjdfTopic || (this.query.cateOne && this.query.cateTwo)) {
        this.fetchSearchGoods()
      }
    }, 300),
    // 搜索商品列表
    fetchSearchGoods() {
      const data = this.filterObjectNull(this.query)
      searchGoods(data).then(({ result }) => {
        const data = (result && result.list) || []
        this.goodsList = this.goodsList.concat(data)
        if (data.length === 0 || this.goodsList.length < this.query.pageSize) {
          this.query.finished = true
          return
        }
        this.query.pageIndex += 1
        this.query.error = false
      }).finally(() => {
        this.requestSucceed = false
        this.query.loading = false
      })
    },
    switchTab(index, param) {
      //  0全部  1销量totalSales  2价格lowerDsPrice
      this.query.pageIndex = 1
      this.query.pageSize = 10
      this.goodsList = []
      this.requestSucceed = false
      this.query.finished = false
      delete this.query.queryField
      // 0 全部、 1 销量 2价格（param=> 升降） filterType 过滤类型
      if (index == 0) {
        this.query.orderProperty = ''
        this.query.orderType = 1
      } else if (index == 1) {
        this.query.orderProperty = this.isInsideActivity ? 'spuTotalSales' : 'totalSales'
        this.query.orderType = '1'
      } else if (index == 2) {
        this.query.orderProperty = this.isInsideActivity ? 'lowerInnerPrice' : 'lowerDsPrice'
        this.query.orderType = param
        this.query.queryField = 1
      } else if (index === 'filterType') {
        Object.assign(this.query, param)
      }
      this.onSearch()
    },
    // 查询改变触发
    onChangeSearch(e) {
      this.requestSucceed = false
      this.resetquery()
      this.query.keyword = e
      this.onSearch()
    },
    // 点击触发查询
    onClickSearch() {
      this.query.pageIndex = 1
      this.goodsList = []
      this.requestSucceed = false
      this.query.finished = false
      this.onSearch()
    },
    // 重置查询条件
    resetquery() {
      this.query.pageIndex = 1
      this.query.pageSize = 10
      this.query.keyword = ''
      this.query.finished = false
      this.goodsList = []
    },
    // 获取cms资讯-banner图
    initCMSInofById(id) {
      getInfoById(id).then(({ result }) => {
        this.bannerImage = result.titleImage
      })
    },
    filterObjectNull(data) {
      const result = {}
      for (const i in data) {
        if (data[i]) {
          result[i] = data[i]
        }
      }
      return result
    },
    // 搜索内购商品列表
    fetchInsideShoppingGoods() {
      const data = this.filterObjectNull(this.query)
      innerActivityGoods(data).then(({ result }) => {
        const data = (result && result.list) || []
        this.goodsList = this.goodsList.concat(data)
        if (data.length === 0 || this.goodsList.length < this.query.pageSize) {
          this.query.finished = true
          return
        }
        this.query.pageIndex += 1
        this.query.error = false
      }).finally(() => {
        this.requestSucceed = false
        this.query.loading = false
      })
    },
    // 请求选品车数量
    fetchCartCount() {
      if (this.isInsideActivity) {
        const data = {
          pageIndex: 1,
          pageSize: 100,
          goodsType: this.goodsType
        }
        getCartCount(data).then(({ result }) => {
          this.cartCount = Number(result)
        })
      }
    },
    // 跳转选品车页面
    toCartPage() {
      uni.navigateTo({
        url: `${this.$pageUrl.CART_PAGE}?page=inside_shopping_activity&title=内购购物车`
      })
    },
    // 添加购物车成功后刷新
    confirm() {
      this.fetchCartCount()
    },
    goBack(title) {
      uni.switchTab({
        url: this.$pageUrl.MINE
      })
      uni.showToast({
        title: title,
        duration: 2000,
        icon: 'none'
      });
    },
    fetchInsideActivity() {
      return new Promise(async(resolve, reject) => {
        /**
         * 是认证用户、并且是内购员工、并且活动开启
         * */
        if (this.userStatus !== 'enable') return
        if (!this.userInfo || Object.keys(this.userInfo).length === 0) {
          await this.$store.dispatch('getBaseInfo')
        }
        if (!this.userInfo || !this.userInfo.innerPerson) {
          this.goBack('非内购员工')
          return
        }
        checkInnerbuyStatus().then(({ result }) => {
          this.$store.commit(TYPES.SET_INSIDE_SHOPPING_ACTIVITY, result)
          if (result && result.status === 'STARTING') { //活动状态是 开始中
            this.countDownTimeLength = result && result.endTime - new Date().getTime()
            resolve(result)
          } else {
            this.goBack('活动未开启')
          }
        }).catch((e) => {
          this.goBack(e.message || '活动信息错误')
          reject(e)
        })
      })
    }
  },
  onPageScroll: debounce(function(data) { // 防抖
    if (this.isInsideActivity) {
      const query = uni.createSelectorQuery()
      const navHeight = 54
      query.select('.page-scroll').boundingClientRect((res) => {
        if (res.height) {
          this.activityHeight = res.height
        }
      }).exec()
      if (this.activityHeight > 0 && data.scrollTop > (this.activityHeight + navHeight)) {
        this.isFixed = true
      } else {
        this.isFixed = false
      }
    }
  }, 50)
}
</script>

<style lang="scss" scoped>
.page{
  width: 100%;
  min-height: calc(100% + 1px);
  overflow-y: auto;
  background: #F6F6F6;
}
/deep/ .van-stepper__input{
  color: #242629 !important;
  font-size: 13px;
  background-color: #F6F6F6;
}
.inside_shopping_cart{
  position: fixed;
  bottom: 10%;
  right: 3%;
  z-index: 2;
  width:100rpx;
  height:100rpx;
}
.insideCartNumber{
  position: absolute;
  top: 16rpx !important;
  right: 16rpx !important;
  background: #FA8181;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  text-align: center;
  min-width: 16px;
  padding: 0 3px;
  box-sizing: border-box;
}
.bannerTitle{
  left:50%;
  bottom:112rpx;
  width: 100%;
  text-align: center;
  transform: translate(-50%,0);
  color:#DD3926
}
.downTime {
  position: absolute;
  left: 50%;
  width: 100%;
  top: 156rpx;
  transform: translate(-50%, 0);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #FFECDB;
  font-size: 24rpx;
  font-weight: 500;
  padding: 0 16rpx;
  box-sizing: border-box;
  text-shadow: 0px 2px 2px rgba(212, 19, 4, 0.83);
  .item {
    width: 30rpx;
    height: 30rpx;
    line-height: 30rpx;
    padding: 3rpx;
    margin: 0 6rpx;
    border-radius: 4rpx;
    font-size: 24rpx;
    text-align: center;
    align-items: center;
    background: #FFFFFF;
    color: #E04536;
    display: inline-block;
    text-shadow: none;
  }
}
</style>
