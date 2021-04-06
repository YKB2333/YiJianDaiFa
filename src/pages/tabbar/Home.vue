<template>
<scroll-view :scroll-y="!visible"
  style="height:100vh;"
  @scrolltolower="onLoadTable"
>
  <view class="page">
    <view class="home-scroll">
      <!-- 搜索框 -->
      <view @click="navigateTo($pageUrl.SEARCH)" class="searcHeader">
        <van-search
          shape="round"
          background="#ffffff"
          placeholder="请输入搜索关键词"
          readonly
          :left-icon="IMAGE['search']"
        />
      </view>

      <!-- 热搜标签 -->
      <view class="tagList">
        <text class="tag fs24" style="border: 1rpx solid transparent;">热搜</text>
        <view class="flex-1">
          <text
            v-for="(tag,index) in tag.hotwords"
            :key="index"
            class="ml20 tag fs24"
            @click="navigateTo($pageUrl.SEARCH, `name=${tag}`)"
          >
            {{ tag }}
          </text>
        </view>
      </view>

      <!-- banner图 -->
      <view class="swiper-wrapper">
        <swiper
          indicator-color="#f4f4f4"
          indicator-active-color="#10967B"
          autoplay
          interval="3000"
          class="home_swiper"
          @change="onSwiperChange"
        >
          <swiper-item v-for="(item, index) in bannerList" :key="index">
            <view class="row center-y w-h-full plr28 hidden border-box" @click="linkPageType(item)">
              <image :src="item.titleImage" mode='widthFix' class="w-full radius10 hidden"></image>
            </view>
          </swiper-item>
        </swiper>
        <view class="swiper-dot-contanier" v-if="!isInVideo">
          <view v-for="(dot, index) in bannerList" :key="dot.id" class="dot" :class="{ 'active': index === swiperCurrent }"></view>
        </view>
      </view>

      <!-- 精美新品 -->
      <view v-if="tag.goodProduct.isShow">
        <base-title
          :icon_url="tag.goodProduct.icon_url"
          :title="tag.goodProduct.title"
          :value="tag.goodProduct.more"
          icon
          @link="navigateTo($pageUrl.GOODS_LIST, `yjdfTopic=${tag.goodProduct.tag}&labelId=${tag.goodProduct.labelId}&title=${tag.goodProduct.title}`)"
        />
        <view class="border-bottom20 pb44">
          <view :class="['row wpct92 mauto',{'space-between': tag.goodProduct.children.length == 3}]">
            <goods-item
              type='30'
              v-for="(item,index) in tag.goodProduct.children"
              :key="index"
              :title="item.name"
              :price="priceTypeReturnValue(item.lowestStrategyPrice, item.lowestPrice)"
              :saleEnd="item.yjdfStock == 0"
              :img="item.titleImage"
              tag="tag_new_red"
              :parentClass="`HoemBackgroundRedLinear no-goods-box-shadow ${ (index+1) %3 == 0 && 'mr0'}`"
              @link="navigateTo($pageUrl.SPU, `spuId=${item.id}`)"
              @add="addCart(item)"
            ></goods-item>
          </view>
          <!-- 没有数据 -->
          <empty-box
            :loading="tag.goodProduct.loading"
            :is-empty="tag.goodProduct.children.length === 0 && tag.goodProduct.finished"
            :image="IMAGE['img_car_none2']"
            img-class="w316 h270"
          />
        </view>
      </view>

      <!-- 热销爆款 -->
      <view v-if="tag.hotProduct.isShow" class="bg_hot border-bottom20 pb34">
        <view
          class="row space-between center-y mauto"
          @click="navigateTo($pageUrl.GOODS_LIST, `yjdfTopic=${tag.hotProduct.tag}&labelId=${tag.hotProduct.labelId}&title=${tag.hotProduct.title}`)"
        >
          <view class="fw500 fs32 flex-1 row center-y " style="margin-left:4%">
            <image :src="IMAGE[tag.hotProduct.icon_url]" class="w44 h44 mr8"/>
            {{ tag.hotProduct.title }}
          </view>
          <view class="row center-y fs26 h-full">
            <image :src="IMAGE['bg_hot2']" class="w300 h120"/>
          </view>
        </view>

        <view class="wpct92 mauto">
          <goods-item
            type='100'
            v-for="(item,index) in tag.hotProduct.children"
            :key="index"
            :intro="item.productDescribe"
            :title="item.name"
            :price="priceTypeReturnValue(item.lowestStrategyPrice, item.lowestPrice)"
            :saleEnd="item.yjdfStock == 0"
            :img="item.titleImage"
            parentClass="mb28 no-goods-box-shadow"
            tag="tag_hot@2x"
            @link="navigateTo($pageUrl.SPU, `spuId=${item.id}`)"
            @add="addCart(item)"
          ></goods-item>
          <!-- 没有数据 -->
          <empty-box
            :loading="tag.hotProduct.loading"
            :is-empty="tag.hotProduct.children.length === 0 && tag.hotProduct.finished"
            :image="IMAGE['img_car_none2']"
            img-class="w316 h270"
          />
        </view>
      </view>

      <!-- 每日精选 -->
      <view v-if="tag.dailyProduct.isShow">
        <base-title
          :icon_url="tag.dailyProduct.icon_url"
          :title="tag.dailyProduct.title"
          :value="tag.dailyProduct.more"
          icon
          @link="navigateTo($pageUrl.GOODS_LIST, `yjdfTopic=${tag.dailyProduct.tag}&labelId=${tag.dailyProduct.labelId}&title=${tag.dailyProduct.title}`)"
        />
        <view class="wpct92 mauto mb20" v-if="dailySelection && dailySelection.titleImage">
          <image :src="dailySelection.titleImage" @click="linkPageType(dailySelection)" mode='widthFix' class="w-full radius10"></image>
        </view>
        <view class="border-bottom20 pb40">
          <view class="row wpct92 mauto">
            <goods-item
              type='30'
              v-for="(item,index) in tag.dailyProduct.children"
              :parentClass="(index+1) %3 == 0 ? 'mr0' : null"
              :key="index"
              :title="item.name"
              :price="priceTypeReturnValue(item.lowestStrategyPrice, item.lowestPrice)"
              :saleEnd="item.yjdfStock == 0"
              :img="item.titleImage"
              @link="navigateTo($pageUrl.SPU,`spuId=${item.id}`)"
              @add="addCart(item)"
            ></goods-item>
          </view>
          <!-- 没有数据 -->
          <empty-box
            :loading="tag.dailyProduct.loading"
            :is-empty="tag.dailyProduct.children.length === 0 && tag.dailyProduct.finished"
            :image="IMAGE['img_car_none2']"
            img-class="w316 h270"
          />
        </view>
      </view>
    </view>

    <van-tabs
      v-if="tabList[0].children.length"
      animated
      line-width='25'
      :active="activeTableIndex"
      @click="switchTab"
      :class="{'home_fixed': isFixedTabs}">
      <van-tab
        v-for="(t_item,t_index) in tabList"
        :title="t_item.title"
        :key="t_index"
        :name="t_index"
      >
        <view :class="['row space-between wrap wpct92 mauto mt30', {'pt76': isFixedTabs}]">
          <goods-item
            type='50'
            v-for="(item,index) in t_item.children"
            :key="index"
            :title="item.name"
            :tagTitle="getTagTitle(item)"
            :price="activityPriceTypeReturnValue(item)"
            :originPrice="originPrice(item)"
            :saleEnd="item.yjdfStock == 0"
            :img="item.titleImage"
            :intro="item.productDescribe"
            style="width:49%;margin-bottom:2%"
            @link="navigateTo($pageUrl.SPU, `spuId=${item.id}`)"
            @add="addCart(item)"
          ></goods-item>
        </view>
        <empty-box
          :loading="!t_item.finished"
          :finished="t_item.finished"
          :is-empty="t_item.children.length === 0 && t_item.finished"
          :image="IMAGE['img_car_none2']"
          img-class="w316 h270"
        >
          <template v-slot:finished>
            <base-empty v-if="t_item.children.length && t_item.finished"/>
          </template>
        </empty-box>
      </van-tab>
    </van-tabs>

    <!-- 去认证 -->
    <to-authenticate></to-authenticate>

    <!-- 回到顶部 -->
    <base-back-to-top :show="isFixedTabs" />

    <!-- sku弹窗 -->
    <sku-popup :spu-id="currentSpuId" :visible.sync="visible" />

    <!-- 获取授权弹窗 -->
    <auth-popup :visible.sync="authPopupVisible"/>

  </view>
</scroll-view>
</template>

<script>
import BaseTitle from '@/components/BaseTitle';
import GoodsItem from '@/components/GoodsItem';
import BaseEmpty from '@/components/BaseEmpty';
import authPopup from '@/pages/auth/auth-popup';
import toAuthenticate from '@/components/to-authenticate';
import BaseBackToTop from '@/components/BaseBackToTop';
import { throttles, linkPage, navigateTo } from '@/utils'
import { searchGoods, getDictionary, cmsSelectPage, searchGoodsSort } from '@/api/home';
import { cmsCategoryId } from '@/config'
import SkuPopup from '../sku-popup/index'
import EmptyBox from '@/components/empty-box'
import { mapGetters } from 'vuex'
import { authentication } from '@/mixins/auth'
import { share } from '@/mixins/share'
import {
  icon_all_rec_active,
  icon_all_rec,
  icon_focus_rec_active,
  icon_focus_rec,
  icon_activity_active,
  icon_activity,
  icon_sale_active,
  icon_sale,
  img_car_none2,
  icon_back_top,
  search,
  index_icon_new,
  index_icon_hot,
  bg_hot2
} from '@/image-config.js'

export default {
  name: 'Home',
  components: {
    BaseTitle,
    GoodsItem,
    BaseEmpty,
    BaseBackToTop,
    SkuPopup,
    toAuthenticate,
    EmptyBox,
    authPopup,
  },
  mixins: [authentication, share],
  data() {
    return {
      tag: { //标签列表
        hotwords: '', // 热搜关键字
        goodProduct: {}, //精品新品
        hotProduct: {}, //热销爆款q
        dailyProduct: {}, //每日精选
        netRecommend: {}//全网推荐
      },
      dirctionaryList: [], //所以字典数据
      isFixedTabs: false, // 是否开启固定tabs
      vanTabsTop: 0, // tabs距离顶部的滚动距离
      activeTableIndex: 0, // 当前索引
      IMAGE: { // 图标列表
        icon_all_rec_active,
        icon_all_rec,
        icon_focus_rec_active,
        icon_focus_rec,
        icon_activity_active,
        icon_activity,
        icon_sale_active,
        icon_sale,
        img_car_none2,
        icon_back_top,
        search,
        bg_hot2,
        index_icon_new,
        index_icon_hot
      },
      bannerList: [], // banner图列表
      tabList: [ // 当前tab列表
        { code: 'netRecommend', children: [], pageIndex: 1, pageSize: 20, loading: false, finished: false }
      ],
      tabListKey: ['netRecommend'], // tab的key
      dailySelection: '', // 每日精选
      requestSucceed: false,
      swiperCurrent: 0,
      visible: false,
      currentSpuId: '', // 弹窗spuId
      refresh: false,
      authPopupVisible: false
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'customerUserInfo', 'shareInvitationCode'])
  },
  onShow() {
    this.getWxUserInfo()
  },
  created() {
    if (['dev', 'test'].includes(process.env.VUE_APP_ENV)) {
      uni.setNavigationBarTitle({
        title: process.env.VUE_APP_ENV === 'test' ? '测试环境' : '开发环境'
      });
    }
    this.init()
  },
  // 滑动显示返回顶部按钮
  onPageScroll: throttles(function(data) { // 节流
    const query = uni.createSelectorQuery()
    query.select('.home-scroll').boundingClientRect((res) => {
      if (res) {
        this.vanTabsTop = res.height || 0
      }
    }).exec()
    const headHeight = 64
    this.isFixedTabs = this.vanTabsTop > 0 && (data.scrollTop > (this.vanTabsTop - headHeight))
  }, 100),
  methods: {
    linkPage,
    navigateTo,
    async init(init) {
      // 重置数据
      if (init) {
        this.reset()
      }
      // 从字段中获取从的、再请求
      await this.getInitDictionary();
      if (this.refresh) {
        uni.stopPullDownRefresh()
        this.refresh = false
      }
      // 通过code 获取数据
      this.fetchTagListData()
      this.fetchHomeBanner()
    },
    // 获取全部字典
    getInitDictionary() {
      return new Promise((resolve, reject) => {
        getDictionary().then(({ result }) => {
          // 根据本地code列表获取code、格式数据格式
          result.forEach(item => {
            if (!Object.prototype.hasOwnProperty.call(this.tag, item.code)) return
            // 获取热搜标签
            if (item.code === 'hotwords') {
              this.tag.hotwords = item.value.split('|').filter(e => e)
              return
            }
            // 格式化value 数据
            const value = (item.value && JSON.parse(item.value.replace(/'/g, '"'))) || {}
            // 赋值给tab对象
            this.tag[item.code] = Object.assign(item, value)
            // 赋值給tab对象
            const tabIndex = this.tabList.findIndex(e => e.code == item.code)
            if (tabIndex !== -1) {
              this.tabList[tabIndex] = Object.assign(this.tabList[tabIndex], value)
            }
          });
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    // 获取标签列表数据
    fetchTagListData() {
      for (const key in this.tag) {
        const isTableKey = this.tabList.find(e => e.code === this.tag[key].code)
        if (isTableKey) {
          this.fetchTableLists(key)
        } else if (this.tag[key].tag) {
          this.fetchActivityGoodsSort(key)
        }
      }
    },
    // 获取table列表数据、现在只需要一个就是全网推荐
    fetchTableLists(key) {
      const tabItem = this.tabList.find(e => e.code === this.tag[key].code)
      const data = {
        orderType: 1,
        pageIndex: 1,
        pageSize: 10,
        orderProperty: 'yjdfStock'
      }
      tabItem.loading = true
      searchGoods(data).then(({ result }) => {
        if (result && result.list.length) {
          tabItem.children = result.list
        }
        tabItem.pageIndex++
      }).finally(() => {
        tabItem.loading = false
      })
    },
    // 通过字典查找三个活动的数据
    fetchActivityGoodsSort(key) {
      this.tag[key].loading = true
      const { tag, code, labelId } = this.tag[key]
      searchGoodsSort({
        pageIndex: 1,
        pageSize: 3,
        yjdfTopic: tag,
        code: code,
        labelId: labelId
      }).then(({ result }) => {
        if (result && result.list && result.list.length) {
          this.tag[key].children = result.list
        }
      }).finally(() => {
        this.tag[key].loading = false
      })
    },
    //  获取 banner 每日精选 资讯
    fetchHomeBanner() {
      cmsSelectPage(cmsCategoryId.home.banner).then(({ result }) => {
        this.bannerList = result.records
      })
      cmsSelectPage(cmsCategoryId.home.dailySelection).then(({ result }) => {
        this.dailySelection = result.records[0]
      })
    },
    onLoadTable() {
      const index = this.activeTableIndex
      // 如果是发送请求、当前页面已经请求完成了、则不在调用请求
      if (this.requestSucceed || this.tabList[index].finished) {
        this.requestSucceed = false //请求状态恢复
        return
      }
      this.requestSucceed = true // 请求状态等待中
      const data = {
        pageIndex: this.tabList[index].pageIndex,
        pageSize: this.tabList[index].pageSize,
        orderProperty: 'yjdfStock',
        orderType: 1
      }
      this.tabList[index].loading = true
      searchGoods(data).then(({ result }) => {
        if (!result || !result.list || !result.list.length) {
          this.tabList[index].finished = true
          return
        }
        this.tabList[index].pageIndex++
        this.tabList[index].children = this.tabList[index].children.concat(result.list)
      }).finally(() => {
        this.tabList[index].loading = false
        this.requestSucceed = false
      })
    },
    // 轮播切换时
    onSwiperChange({ detail }) {
      this.swiperCurrent = detail.current
    },
    // 切换四个tab
    switchTab(e) {
      const query = uni.createSelectorQuery()
      query.select('.home-scroll').boundingClientRect((res) => {
        uni.pageScrollTo({
          scrollTop: res.height - 54
        })
      }).exec()
      this.requestSucceed = false
      this.activeTableIndex = e.detail.index
    },
    // 添加入选品车
    addCart({ id }) {
      this.currentSpuId = id
      this.visible = true
    },
    linkPageType(item) {
      if (!item) return
      // 1.如果是有跳转类型的、有跳转链接的
      if (item.infoKeyword && item.skipUrl) {
        // 2.如果是http类型的
        if (item.infoKeyword === 'https') {
          uni.navigateTo({
            url: `${this.$pageUrl.HTTPS_PAGE}?url=${item.skipUrl}`
          })
          return
        }
        // 3.跳转类型、路由类型
        this.linkPage(item.infoKeyword, item.skipUrl)
        return
      }
      // 默认跳转资讯页面
      if (item.content) {
        this.navigateTo(this.$pageUrl.INFORMATION, `id=${item.id}`)
      }
    },
    // 获取当前活动标签名字
    getTagTitle(item) {
      if (item.lowestActivityGeneralPrice || item.lowestActivityStrategyPrice) {
        return '限时抢购'
      }
      return null
    },
    // 不同状态下的价格关系 新品、爆款、今日精选首页不显示活动
    priceTypeReturnValue(streategy, price) {
      return this.isStrategy ? streategy : price
    },
    // 不同状态下的 活动价格 活动 2代发
    activityPriceTypeReturnValue(data) {
      if (data.lowestActivityGeneralPrice || data.lowestActivityStrategyPrice) {
        return this.isStrategy ? data.lowestActivityStrategyPrice : data.lowestActivityGeneralPrice
      } else {
        return this.isStrategy ? data.lowestStrategyPrice : data.lowestPrice
      }
    },
    // 不同状态下原价格价格 1活动 2代发
    originPrice(data) {
      const { highestActivityGeneralPrice, highestActivityStrategyPrice, highestStrategyPrice, highestPrice } = data
      if (highestActivityGeneralPrice || highestActivityStrategyPrice) {
        return this.isStrategy ? highestStrategyPrice : highestPrice
      }
      return null
    },
    // 重置数据
    reset() {
      Object.assign(this.$data, this.$options.data())
    },
    // 获取微信用户信息
    getWxUserInfo() {
      // 没有头像、通过邀请码进入的才可以弹框 凸^-^凸
      if (this.shareInvitationCode && this.userInfo && !this.userInfo.userHead && this.userInfo.userId) {
        this.authPopupVisible = true
      }
    }
  },
  // 转发 战略客户、和推荐官客户才有邀请码
  onShareAppMessage() {
    let path = null
    if (this.invitationCode) {
      path = `${this.createdSharePage()}&${this.createdInvitationCode()}`
    }
    return {
      title: '一件达',
      path: path || this.createdSharePage()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background: white;
}
.tagList {
  display: flex;
  width: 92%;
  margin: 0 auto;
  padding-top:54px;
  padding-bottom: 4rpx;
  font-size:13px;
  font-weight:400;
  color:rgba(149,156,167,1);
  .tag {
    border-radius: 22rpx;
    border: 1rpx solid #DCDCDC;
    padding: 4rpx 10rpx;
    display: inline-block;
    margin-bottom: 10rpx;
    margin-top: 4rpx;
    font-size: 24rpx;
  }
}
.home_swiper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: unset;
  margin-bottom: 28rpx;
}
.border-bottom20 {
  border-bottom: 28rpx solid #F6F6F6;
}
.color-gray {
  color: #71767D;
}
.activeTableIndex {
  color: #10967B;
}
.border-right1 {
  position: relative;
}
.border-right1::after {
  content: '';
  position:absolute;
  right: 0;
  height: 50%;
  width: 1px;
  background: #e5e5e5;
  top: 50%;
  transform: translate(0,-50%);
}

.home_fixed {
  padding-top: 144px;
  /deep/ .van-sticky{
    position: fixed !important;
    top: 54px;
    left: 0px;
    width: 100%;
    z-index: 999;
  }
}
.bg-pale {
  background:#F6F6F6;
}

.searcHeader {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  background: white;
  z-index: 1000;
  padding: 0;
  overflow:hidden;
  height: 54px;
}

/deep/ .van-search {
  height: 54px;
  overflow: hidden;
}
/deep/ .van-tabs__line {
  background: #429881;
  display: flex;
  justify-content: flex-start;
  bottom: 0%;
}
/deep/ .van-icon--image {
  display: flex;
}
.swiper-wrapper {
  position: relative;
  height: 340rpx;
  padding-bottom: 28rpx;
  padding-top: 18rpx;
  border-bottom: 28rpx solid #F6F6F6;
  background: white;
  overflow: hidden;
  .swiper-dot-contanier{
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9;
    .dot{
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: rgba(16,150,123, 0.2);
      margin-right: 8px;
      &.active{
        background-color: rgba(16,150,123, 1);
      }
    }
  }
}
</style>
<style >
.HoemBackgroundRedLinear {
  background:linear-gradient(180deg,rgba(255,208,194,1) 0%,rgba(255,241,233,1) 100%);
}
.bg_hot {
  background:linear-gradient(180deg,#f1e7fe 0%,#edecfe 100%);
}
</style>
