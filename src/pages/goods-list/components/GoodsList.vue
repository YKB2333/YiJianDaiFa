<template>
  <view class="page">
    <!-- tabs -->
    <view class="row center-y" style="height:54px;">
      <view :class="['header', {'header_fixed': fixed}, topClass]" :style="topStyle">
        <view :class="['tabsTag', {'active': activeIndex == 0}]" @click="setActiveIndex(0)">全部</view>
        <view :class="['tabsTag', {'active': activeIndex == 1}]" @click="setActiveIndex(1)">销量</view>
        <view :class="['tabsTag row center-y', {'active': activeIndex == 2}]" @click="setActiveIndex(2)">
          <view>价格</view>
          <view class="ml10 row center-y">
            <image :src="IMAGE['icon_sort_de']" mode='widthFix' class="w12 h20" v-show="priceState == 0"></image>
            <image :src="IMAGE['icon_sort_down']" mode='widthFix' class="w12 h20" v-show="priceState == 1" ></image>
            <image :src="IMAGE['icon_sort_up']" mode='widthFix' class="w12 h20" v-show="priceState == 2"> </image>
          </view>
        </view>
        <view v-if="filter" class="tabsTag row center-y" @click="toggleFilterPopup">
          筛选
          <image :src="IMAGE['icon_filter']" mode='widthFix' class="w22 h22"></image>
        </view>
        <view class="row center-y" v-else>
          <image :src="IMAGE['icon_layout_card']" mode='widthFix' class="w40 h40" v-if="isLine" @click="isLine = false"></image>
          <image :src="IMAGE['icon_layout_list']" mode='widthFix' class="w40 h40" v-else @click="isLine = true"></image>
        </view>
      </view>
    </view>

    <!-- 列表 -->
    <view class="pt20 w-full hidden">
      <view :class="['wpct96 mauto', topClass, {'row space-between wrap': isLine == false}]">
        <!--
        isInsideActivity 是否内购活动 作为内购与外销的判断值
         -->
        <goods-item
          v-for="(item,index) in list"
          :key="index"
          :title="item.name"
          :tagTitle="getTagTitle(item)"
          :price="priceTypeReturnValue(item, isInsideActivity)"
          :saleEnd="item.yjdfStock == 0"
          :originPrice="originPrice(item)"
          :img="item.titleImage"
          :intro="item.productDescribe"
          @link="nextPage(item)"
          @add="addCart(item)"
          :type="isLine ? '100' : '50'"
          :parentClass="isLine ? 'mb20' : null"
          :class="{'singleColumn': !isLine}"
        ></goods-item>
      </view>
      <!-- 没有更多了 -->
      <view :style="list.length === 0 && finished ? 'height: 86vh' : 'min-height:120rpx'" class="bg-white">
        <empty-box
          :loading="!finished"
          :finished="finished"
          :is-empty="list.length === 0 && finished"
          :image="IMAGE['img_car_none2']"
          label="没有找到相关商品"
          img-class="w430 h340 mt160"
        >
          <template v-slot:finished>
            <base-empty v-if="isVisible && list.length && finished"/>
          </template>
        </empty-box>
      </view>
    </view>

    <!-- 去认证 -->
    <to-authenticate></to-authenticate>

    <!-- sku选择列表 -->
    <sku-popup :spu-id="currentSpuId" :visible.sync="visible" :page="page" @confirm="confirm" />

    <!-- 筛选列表 -->
    <van-popup
      @click-overlay="toggleFilterPopup"
      :show="filterPopupVisible"
      position="right"
      custom-style="height:100vh;width:82%"
      :z-index="1000"
    >
      <view style="height: 88%; overflow-y: auto;">
        <dropdown-list
          ref="dropdown1"
          v-model="dropdownBrand"
          label="品牌"
          @action="(item, data)=>{ onChange('brandIds', item, data) }"
        />
        <dropdown-list
          ref="dropdown2"
          v-model="dropdownCategory"
          label="品类"
          :multiple="false"
          @action="(item, data)=>{ onChange('cateOne', item, data) }"
        />
        <dropdown-list
          ref="dropdown3"
          v-model="coopStatus"
          label="合作状态"
          :defaultIndex="0"
          valueNmae="label"
          keyName="label"
          @action="(item, data)=>{ onChange('workStatus', item, data) }"
          :multiple="false"
        />
      </view>
      <view class="row space-between plr32 absolute w-full border-box" style="bottom:3%">
        <view class="popupButton" @click="reset">重置</view>
        <view class="popupButton confirmButton" @click="toggleFilterPopup">确认</view>
      </view>
    </van-popup>
  </view>
</template>

<script>
import GoodsItem from '@/components/GoodsItem';
import BaseEmpty from '@/components/BaseEmpty';
import { linkPage } from '@/utils'
import SkuPopup from '@/pages/sku-popup/index'
import EmptyBox from '@/components/empty-box'
import toAuthenticate from '@/components/to-authenticate';
import dropdownList from '@/components/dropdown-list';
import { search4Condition } from '@/api/goods';
import { INSIDE_COOP_STATUS } from '@/const/dictionary'
import { getDictionaryByCode } from '@/api/dictionary'
import { mapGetters } from 'vuex'
import { authentication } from '@/mixins/auth'
import { goods } from '@/mixins/goods'
import {
  icon_sort_de, icon_sort_down, icon_sort_up,
  icon_layout_card, icon_layout_list, img_car_none2,
  icon_filter
} from '@/image-config.js'

export default {
  name: 'goodsList',
  mixins: [authentication, goods],
  components: {
    GoodsItem,
    BaseEmpty,
    SkuPopup,
    EmptyBox,
    toAuthenticate,
    dropdownList
  },
  props: {
    list: { // 标题
      type: [Array, Object],
      default: () => {}
    },
    loading: { // 标题
      type: Boolean,
      default: false
    },
    finished: { // 标题
      type: Boolean,
      default: false
    },
    fixed: { // 是否吸顶
      type: Boolean,
      default: false
    },
    topClass: { // topClass
      type: [Array, String, Object],
      default: () => {}
    },
    topStyle: { // topClass
      type: String,
      default: ''
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    // 是否显示过滤器
    filter: {
      type: Boolean,
      default: false
    },
    page: {
      type: String,
      default: ''
    },
    innerbuyActivityId: { // 内购活动id
      type: String,
      default: ''
    },
    scroll: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    visible(newValue) {
      console.log(newValue);
      this.$emit('update:scroll', newValue)
    }
  },
  data() {
    return {
      activeIndex: 0,
      priceRanking: false,
      IMAGE: { // 图标列表
        icon_sort_de,
        icon_sort_down,
        icon_sort_up,
        icon_layout_card,
        icon_layout_list,
        img_car_none2,
        icon_filter
      },
      priceState: 0, // 0空状态、 1倒序 、2正
      isLine: false, // 图标是否一行
      visible: false,
      currentSpuId: '', // 弹窗spuId
      filterPopupVisible: false,
      dropdownBrand: null,
      dropdownCategory: null,
      coopStatus: null,
      filterPopupData: {
        brandIds: [],
        cateOne: '',
        workStatus: ''
      }
    }
  },
  computed: {
    ...mapGetters(['customerUserInfo', 'userInfo']),
    // 是否内购活动
    isInsideActivity() {
      return this.page === 'inside_shopping_activity'
    }
  },
  mounted() {
    this.initDorpdownlist()
  },
  methods: {
    linkPage,
    // 不同状态下的价格关系
    originPrice(data) {
      if (this.isInsideActivity) {
        return data.lowerMsrp
      }
      // 1活动 2代发
      if (data.highestActivityGeneralPrice || data.highestActivityStrategyPrice) {
        return this.isStrategy ? data.highestStrategyPrice : data.highestPrice
      }
      return null
    },
    nextPage(item) {
      // 存在内购价、代表当前为内购页面
      if (this.isInsideActivity) {
        this.linkPage('navigateTo', this.$pageUrl.SPU, `spuId=${item.id}&page=inside_shopping_activity`)
      } else {
        this.linkPage('navigateTo', this.$pageUrl.SPU, `spuId=${item.id}`)
      }
    },
    setActiveIndex(index) {
      wx.pageScrollTo({
        scrollTop: 0
      })
      // 点击价格排序
      if (index == 2) {
        this.activeIndex = index
        // priceState 0空状态、 1倒序 、2正
        if (this.priceState == 0) {
          this.priceState = 1
          this.$emit('change', index, this.priceState)
          return
        }
        this.priceState = this.priceState == 1 ? 2 : 1 // 替换位置排序
        this.$emit('change', index, this.priceState)
      } else if (this.activeIndex !== index) {
        this.priceState = 0
        this.activeIndex = index
        this.$emit('change', index)
      }
    },
    addCart(item) {
      this.currentSpuId = item.id
      this.visible = true
    },
    toggleFilterPopup() {
      this.filterPopupVisible = !this.filterPopupVisible
    },
    // 获取筛选的数据列表
    initDorpdownlist() {
      if (this.filter) {
        search4Condition({
          innerbuyActivityId: this.innerbuyActivityId
        }).then(({ result }) => {
          const { brandList, categoryList } = result
          this.dropdownBrand = brandList
          this.dropdownCategory = categoryList
        })
        getDictionaryByCode(INSIDE_COOP_STATUS).then(({ result }) => {
          this.coopStatus = JSON.parse(result.value)
        })
      }
    },
    onChange(type, item, data) {
      if (['brandIds'].includes(type)) {
        this.filterPopupData[type] = data.map(e => e.id)
      } else if (['cateOne'].includes(type)) {
        if (item.orderLevel === 0) {
          this.filterPopupData.cateOne = String(data.map(e => e.code)).split('-')[0]
          this.filterPopupData.cateTwo = String(data.map(e => e.code)).split('-')[1]
        } else {
          this.filterPopupData[type] = String(data.map(e => e.id))
          this.filterPopupData.cateTwo = null
        }
      } else {
        this.filterPopupData[type] = String(data.map(e => e.value))
      }
      this.$emit('change', 'filterType', this.filterPopupData)
    },
    confirm() {
      this.$emit('confirm')
    },
    reset() {
      this.$refs.dropdown1.reset()
      this.$refs.dropdown2.reset()
      this.$refs.dropdown3.reset()
      this.filterPopupData = {
        brandIds: [],
        cateOne: '',
        cateTwo: '',
        workStatus: ''
      }
      this.$emit('change', 'filterType', this.filterPopupData)
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background: white;
}
.singleColumn{
  width:49%;
  margin-bottom:2%
}
.active{
  font-weight: 500;
  border-bottom: 3px solid #10967B !important;
  color: black;
}
.header_fixed {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}
.border-top20{
  border-top: 20rpx solid #F6F6F6;
}
.header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  background: white;
  box-sizing: border-box;;
  margin: 0 auto;
  width: 100%;
  padding:0 8%;
  color:#959CA7;
  height:54px;
  border-bottom:1px solid #F6F6F6
}
.tabsTag{
  height: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border-bottom: 3px solid transparent;
}
.popupButton {
  width: 48%;
  height: 76prx;
  line-height: 76rpx;
  text-align: center;
  background: #FFFFFF;
  border-radius: 40rpx;
  border: 1px solid #C7CACF;
  font-size: 32rpx;
  color: #242629;
}
.confirmButton {
  background: #10967B;
  color: white;
}
</style>
