
<template>
  <view class="common-cart" :class="{ 'can-back': canBack }">
    <view :class="['page_have']" :style="topHeight ? 'padding-top:'+ topHeight +'px' : ''" >
      <view class="top bg-white" id="topHeihgt">
        <!-- 优惠券 -->
        <view v-if="couponListReceiveStatus && couponList && couponList.length" class="ptb28 pl56 row center-y coupon w-full border-box hidden">
          <view @click="onClickReceiveCoupon" class="row w-full">
            <view class="fc-black fs32 fw600">优惠券</view>
            <view class="row flex-1 relative hidden">
              <view class="receiveItem" v-for="(item, index) in couponListSlice" :key="index">{{ getCouponName(item) }}</view>
              <view class="receiveButton row center">领券 <van-icon name="arrow" class="ml6" color="#ffffff" /></view>
            </view>
          </view>
        </view>
         <!-- notice 通知栏 -->
        <van-notice-bar
          v-if="!isInsideActivity && !couponListReceiveStatus && couponList && couponList.length"
          text="已领取优惠券,现在下单可享受优惠哦～"
          left-icon="volume-o"
          color="#FF7640"
          background="#FFF1EB"
        />
        <view v-if="cartList.length">
          <!-- 全选 -->
          <view class="selectBox">
            <van-checkbox checked-color="#10967B" @change="checkAllClick" :value="isSelectCheckAll">
              <text class="fc-gray">全选</text>
            </van-checkbox>
            <text @tap="toggleEditStatus" class="fs28 fc-gray">{{ isEdit ? '完成': '编辑' }}</text>
          </view>
          <van-notice-bar
            v-if="notice && isInsideActivity"
            :text="notice"
            left-icon="volume-o"
            color="#FF7640"
            background="#FFF1EB"
          />
        </view>
      </view>
      <view class="pb120" v-if="goodsOnSaleList.length || goodsOnStopList.length">
        <!-- 上架商品 -->
        <view class="plr28 mt28" v-if="goodsOnSaleList.length">
          <van-checkbox-group :value="checkLists" @change="onSelectGoods">
            <van-swipe-cell
              v-for="(item, index) in goodsOnSaleList"
              :key="item.skuId"
              :name="item.skuId"
              :right-width="65"
              async-close
              @close="(item) => {onDelete([item.detail.name])}"
            >
              <view class="ptb24 mb20 bg-white br8 row center-y checkbox-wrapper">
                <van-checkbox :name="item.skuId" :disabled="!item.isOnSale" checked-color="#10967B"></van-checkbox>
                <view class="flex-1 row center-y pr24 hidden">
                  <image class="w200 h200 mr14 shrink0" :src="getImage(item)" @tap="toGoodsDetail(item)" mode="aspectFit"/>
                  <view class="hidden col space-around flex-1">
                    <view class="fs28 fw600 mb10 row space-between flex-start" @tap="toGoodsDetail(item)">
                      <view class="flex-1 hidden mr20 ellipsis2">{{ item.spuName }}</view>
                      <view class="fc-money" @tap="toGoodsDetail(item)">
                        <auth-money :money="item.price" customClass="fs28" moneyLabel="fs26" moneyClass="fs28"/>
                      </view>
                    </view>
                    <view class="fs24 ellipsis fc-gray" @tap="toGoodsDetail(item)">{{ getAtbValues(item) }}</view>
                    <view class="fs22 ptb20" @tap="toGoodsDetail(item)">
                      <text class="tag-item ellipsis" v-if="item.activityPrice">限时抢购</text>
                      <block v-for="(tag, index) in item.tag" :key="tag">
                        <text class="tag-item ellipsis" v-if="index <= 2">{{ tag }}</text>
                      </block>
                    </view>
                    <view class="row space-between center-y">
                      <view class="fs24 ellipsis fc-gray">库存：{{ item.stock > 1000 ? '充足' : (item.stock || 0) }}</view>
                      <view class="relative">
                        <van-stepper
                          async-change
                          :min="1"
                          :value="item.skuQuantity"
                          @plus="onQuantityPlus(item)"
                          @minus="onQuantityMinus(item)"
                          @change="onQuatityChange"
                          @focus="onClickEditSteppr(item.skuQuantity, index)"
                          @blur="onQuantityBlur"
                          button-size="25px"
                          input-width="40px"
                        />
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              <view slot="right" >
                <view>删除</view>
              </view>
            </van-swipe-cell>
          </van-checkbox-group>
        </view>
        <!-- 下架商品 -->
        <view class="plr28 mt28" v-if="goodsOnStopList.length">
          <view class="row space-between bg-white ptb20 plr20 fc-gray fs28 hairline-bottom br8">
            <view>失效商品({{ goodsOnStopList.length }})</view>
            <view @click="clearInvalidGoods">清空</view>
          </view>
          <van-swipe-cell :right-width="65" v-for="item in goodsOnStopList" :key="item.skuId" :name="item.skuId" async-close  @close="(item)=>{onDelete([item.detail.name])}">
            <view class="ptb24 mb20 bg-white br8 row center-y checkbox-wrapper" @tap="toGoodsDetail(item)">
              <view class="invalid-btn mlr20">失效</view>
              <view class="flex-1 row center-y pr28 hidden">
                <image class="w200 h200 mr16 shrink0" :src="getImage(item)" mode="aspectFit"/>
                <view class="hidden col space-around flex-1">
                  <view class="fs28 fw600 mb10 row space-between">
                    <view class="flex-1 hidden mr20 ellipsis2">{{ item.spuName }}</view>
                    <view class="fc-money">
                      <auth-money :money="item.price" customClass="fs28" moneyLabel="fs26" moneyClass="fs28"/>
                    </view>
                  </view>
                  <view class="fs24 ellipsis fc-gray">{{ getAtbValues(item) }}</view>
                  <view class="fs22 ptb20">
                    <text class="tag-item ellipsis" v-if="item.activityPrice">限时抢购</text>
                    <block v-for="(tag, i) in item.tag" :key="tag">
                      <text class="tag-item ellipsis" v-if="i <= 2">{{ tag }}</text>
                    </block>
                  </view>
                  <view class="row space-between center-y">
                    <view class="fs24 ellipsis fc-red" style="color:red">{{ !item.isOnSale ? '商品已下架' : '商品已售罄' }}</view>
                  </view>
                </view>
              </view>
            </view>
            <view slot="right" >
              <view>删除</view>
            </view>
          </van-swipe-cell>
        </view>
      </view>
      <!-- 合计 -->
      <view class="bottom hairline-top" v-if="cartList.length">
        <view>
          <text>合计：</text>
          <text class="fc-money fs26">¥</text>
          <text class="fc-money fs36 fw600">{{ getTotal('price') | formatMoney }}</text>
        </view>
        <view class="row flex-end">
          <text v-if="isEdit" @tap="onDelete()" class="action-btn delete">删除</text>
          <text v-if="!isEdit && !isInsideActivity" @tap="onDownload" class="action-btn ellipsis">
            下载资料<text v-if="checkLists.length > 0">({{ checkLists.length >= 99 ? '99+' : checkLists.length }})</text>
          </text>
          <text v-if="!isEdit" @tap="onSettle" class="action-btn settle ellipsis">
            去结算<text v-if="getTotal('count') > 0">({{ getTotal('count') >= 99 ? '99+' : getTotal('count')}})</text>
          </text>
        </view>
      </view>
    </view>
    <!-- 空数据展示 empty-->
    <view v-if="cartList.length == 0 && finished" class="empty"  :style="{'min-height': 'calc(100vh - ' + topHeight + 'px)'}">
      <view class="pos-center w-full" style="margin-top: -10%;">
        <view class="center-x">
          <img class="w430 h340" :src="IMAGE.img_car_none1" />
        </view>
        <view class="fc-gray fs26 center-x">哎呀，您的{{ isInsideActivity ? '购物车' : '选品车' }}已经空空如也！</view>
        <view style="padding:120rpx 180rpx 0;">
          <view @tap="toHome" class="h88 l-h88 center-x fc-white br44 bg-theme">去逛逛</view>
        </view>
      </view>
    </view>
    <!-- 下载资料提示弹框 -->
    <van-popup
      custom-style="width:560rpx;border-radius:16rpx;z-index:1000;"
      overlay-style="background:rgba(0,0,0,1);z-index:999;opacity:0.4;"
      :show="showEmail"
      @close="closeEmail">
      <view class="fw600 center-x pt50 fs36">提示</view>
      <view class="center-x mt30 mb40 fs30 fc-gray">资料将发送至邮箱，请及时下载</view>
      <view class="plr40 center-x pb60">
        <input
          :value="dataVo.email"
          @input="onChangeInputEmail"
          class="h68 br16 mb2 email-input"
          placeholder="请输入您的邮箱"
          placeholder-style="color:#D8D8D8;"
          type="text"
        />
        <view v-for="(item,index) in emailList" :key="index" @click="setEmail(item)" class="h68 l-h68" style="background:#F6F6F6">{{ item }}</view>
      </view>
      <view @click="confirmEmail" class="ptb28 fs32 fw600 center-x fc-theme mb1" style="border-top: 1px solid #eeeeee;">确定</view>
    </van-popup>
  </view>
</template>
<script>
import { getSelection, download } from '@/api/cart.js'
import { changeCartQuantity, deleteCart } from '@/api/goods.js'
import { img_car_none1, big_logo } from '@/image-config.js'
import constEmailList from '@/const/email'
import { mapGetters } from 'vuex'
import { validEmail, isEmpty, debounce, toThousandFilter } from '@/utils'
import { getDictionaryByCode } from '@/api/dictionary'
import { SHOPPING_CART_NOTICE, WXMP_COUPON_SHOP_CODE } from '@/const/dictionary'
import TYPES from '@/store/types'
import { getCouponTemplateVo } from '@/api/coupon'

export default {
  props: {
    canBack: {
      type: Boolean,
      default: false
    },
    page: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      IMAGE: {
        img_car_none1,
        big_logo
      },
      loading: false,
      error: false,
      finished: false,
      isEdit: false,
      checkLists: [],
      cartList: [],
      skuList: [],
      goodsOnSaleList: [], // 商品在售列表
      goodsOnStopList: [], // 商品停止销售列表
      searchVo: {
        pageIndex: 1,
        pageSize: 30,
        status: '1'
      },
      showEmail: false,
      dataVo: {
        email: null
      },
      emailList: [],
      steppedNumber: 0,
      selectSteppenIndex: -1,
      notice: '',
      topHeight: 0,
      couponList: [],
      couponListReceiveStatus: false,
      couponListSlice: [],
      time: null,
      activityCouponType: 'SHOPPING_CAR',
      shopCode: {}
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'cartSkuIds']),
    getTotal() {
      return (type) => {
        let total = 0
        this.checkLists.forEach(skuId => {
          if (this.cartList.find(e => e.skuId === skuId)) {
            const { skuQuantity, price } = this.cartList.find(e => e.skuId === skuId)
            if (type === 'price') {
              total += price * skuQuantity
            } else if (type === 'count') {
              total += Number(skuQuantity)
            }
          }
        })
        return total
      }
    },
    isSelectCheckAll() {
      if (this.goodsOnSaleList.length === 0) {
        return false
      }
      const check = this.checkLists.length === this.goodsOnSaleList.length;
      return check
    },
    goodsType() {
      return this.page === 'inside_shopping_activity' ? 'INNER_GOODS' : 'COMMON_GOODS'
    },
    // 是否内购活动
    isInsideActivity() {
      return this.page === 'inside_shopping_activity'
    }
  },
  mounted() {
    if (this.isInsideActivity) {
      this.fetchNotice()
    }
  },
  methods: {
    onClickReceiveCoupon() {
      uni.$off(this.$eventName.COUPON_CAR_REFRESH)
      uni.$on(this.$eventName.COUPON_CAR_REFRESH, (ids) => {
        this.fetchCouponList()
      })
      if (this.isInsideActivity) {
        this.linkPage('RECEIVE', `type=${this.activityCouponType}&page=inside_shopping_activity`)
      } else {
        this.linkPage('RECEIVE', `type=${this.activityCouponType}`)
      }
    },
    getCouponName(item) {
      if (item.amount === 0) {
        return `无门槛减${toThousandFilter(item.couponValue)}元`
      }
      return `满${toThousandFilter(item.amount)}减${toThousandFilter(item.couponValue)}`
    },
    async fetchCouponList() {
      await this.fetchDictionary()
      const data = {
        activityCouponType: this.activityCouponType, // 商品详情;
        shopCode: this.shopCode.shop_code
      }
      if (this.isInsideActivity) {
        data.shopCode = this.shopCode.inside_shop_code
      }
      getCouponTemplateVo(data).then(({ result }) => {
        if (result && result.length) {
          this.couponList = result
          this.couponListSlice = result.filter(e => !e.isReceive).slice(0, 2)
          this.couponListReceiveStatus = result.some(e => !e.isReceive)
          setTimeout(() => {
            this.fetchHeadViewHeight()
          }, 100)
        }
      })
    },
    fetchHeadViewHeight() {
      const query = uni.createSelectorQuery().in(this)
      query.select('#topHeihgt').boundingClientRect(data => {
        if (data) {
          this.topHeight = data.height
        }
      }).exec();
    },
    onQuantityPlus: debounce(function(item) {
      if (item.stock < (item.skuQuantity + 1)) {
        uni.showToast({ title: '库存不足', icon: 'none' })
        return
      }
      item.skuQuantity++
      changeCartQuantity({
        goodsType: this.goodsType,
        skuId: item.skuId,
        skuQuantity: item.skuQuantity,
        spuId: item.spuId
      })
    }, 300),
    onQuantityMinus: debounce(function(item) {
      //  提前判断
      let skuQuantity = item.skuQuantity
      --skuQuantity
      if (item.miniQuantity > skuQuantity) {
        uni.showToast({ title: `最小起订量为${item.miniQuantity}`, icon: 'none' })
        return
      }
      // 判断结束
      item.skuQuantity = skuQuantity
      changeCartQuantity({
        goodsType: this.goodsType,
        skuId: item.skuId,
        skuQuantity: item.skuQuantity,
        spuId: item.spuId
      })
    }, 300),
    // 点击修改步进器
    onClickEditSteppr(number, index) {
      this.steppedNumber = number
      this.selectSteppenIndex = index
    },
    onQuantityBlur() {
      const { stock, skuId, spuId } = this.goodsOnSaleList[this.selectSteppenIndex]
      if (stock < this.steppedNumber) {
        uni.showToast({ title: '库存不足', icon: 'none' })
        return
      }
      this.goodsOnSaleList[this.selectSteppenIndex].skuQuantity = null
      this.$nextTick(() => {
        this.goodsOnSaleList[this.selectSteppenIndex].skuQuantity = this.steppedNumber
      })
      changeCartQuantity({
        goodsType: this.goodsType,
        skuId: skuId,
        skuQuantity: this.steppedNumber,
        spuId: spuId
      })
    },
    onQuatityChange({ detail }) {
      if (this.selectSteppenIndex === -1) return
      const { stock, miniQuantity } = this.goodsOnSaleList[this.selectSteppenIndex]

      const throwError = (title) => {
        uni.showToast({ title: title, icon: 'none' })
        this.goodsOnSaleList[this.selectSteppenIndex].skuQuantity = null
        this.$nextTick(() => {
          this.goodsOnSaleList[this.selectSteppenIndex].skuQuantity = this.steppedNumber
        })
      }
      if (miniQuantity > detail) {
        return
      }
      if (stock < detail) {
        throwError('库存不足')
      } else {
        this.steppedNumber = detail
      }
    },
    // 邮箱input框动态匹配
    onChangeInputEmail(e) {
      const email = e.detail.value;
      const searchList = []
      if (email.includes('@')) {
        const value = email.split('@')
        const lsit = constEmailList.filter(item => item.includes(value[1]))
        lsit.forEach(item => {
          searchList.push(`${value[0]}${item}`)
        });
      } else {
        constEmailList.forEach(item => {
          searchList.push(`${email}${item}`)
        });
      }
      if (this.dataVo.email == searchList[0] || email == '' || searchList.length == 0) {
        this.emailList = []
        return
      }
      this.emailList = searchList.splice(0, 7)
    },
    // 复制邮箱
    setEmail(item) {
      this.dataVo.email = item
      this.emailList = []
    },
    closeEmail() {
      this.showEmail = false
    },
    //下载资料
    confirmEmail() {
      if (isEmpty(this.dataVo.email)) {
        uni.showToast({ title: '请输入邮箱', icon: 'none' })
        return
      } else if (!validEmail(this.dataVo.email)) {
        uni.showToast({ title: '请输入正确邮箱', icon: 'none' })
        return
      }
      uni.showLoading({ mask: true, title: '下载中' })
      this.showEmail = false
      download(this.dataVo).then(() => {
        uni.hideLoading()
        uni.showModal({
          content: `资料已发送至邮箱 ${this.dataVo.email} ，请及时下载并添加到您的商品库`,
          showCancel: false
        });
        this.checkLists = []
      }).catch((e) => {
        uni.hideLoading()
        uni.showToast({
          title: e.message,
          duration: 2000,
          icon: 'none'
        });
      })
    },
    // 跳转商详
    toGoodsDetail(item) {
      if (item.isOnSale === false) return
      // 如果当前是编辑状态下、点击为选择商品
      if (this.isEdit) {
        const checkedIndex = this.checkLists.findIndex(e => e === item.skuId)
        checkedIndex === -1 ? this.checkLists.push(item.skuId) : this.checkLists.splice(checkedIndex, 1)
        return
      }
      let url = `${this.$pageUrl.SPU}?spuId=${item.spuId}&skuId=${item.skuId}`
      if (this.isInsideActivity) {
        url = `${url}&page=inside_shopping_activity`
      }
      uni.navigateTo({
        url: url
      })
    },
    // 删除
    onDelete(list) {
      if (this.checkLists.length == 0 && !list) {
        uni.showToast({ title: '请选择商品', icon: 'none' })
        return
      }
      uni.showModal({
        content: '确定要删除吗？',
        confirmColor: '#10967B',
        success: (t) => {
          if (t.confirm) {
            const data = {
              goodsType: this.goodsType,
              skuIds: list || this.checkLists
            }
            deleteCart(data).then(() => {
              uni.showToast({ title: '删除成功', icon: 'none' })
              this.$store.commit(TYPES.SET_CART_SKUIDS, [])
              this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
              this.loadList(true)
            })
          }
        }
      })
    },
    // 跳转页面
    linkPage(path, params) {
      let url = `${this.$pageUrl[path]}`
      if (params) {
        url = `${url}?${params}`
      }
      uni.navigateTo({
        url: url
      });
    },
    // 结算
    onSettle() {
      if (this.checkOrder()) {
        const itemDtoList = this.skuList.map(item => {
          return {
            spuId: item.spuId,
            skuId: item.skuId,
            number: item.skuQuantity,
            codeBar: item.codeBar
          }
        })
        let url = `${this.$pageUrl.ORDER_CONFIRM}?itemDtoList=${JSON.stringify(itemDtoList)}`
        if (this.isInsideActivity) {
          url = `${url}&page=inside_shopping_activity`
        }
        uni.navigateTo({
          url: url
        })
      }
    },
    checkOrder() {
      if (this.checkLists.length === 0) {
        uni.showToast({ title: '请选择商品', icon: 'none' })
        return false
      }
      const emptyStocks = []
      const notFullQuanlity = []
      this.skuList = []
      this.checkLists.forEach(skuId => {
        const item = this.cartList.find(item => item.skuId === skuId)
        if (item.miniQuantity > item.skuQuantity) {
          notFullQuanlity.push(item)
        }
        if (!item.stock || item.stock <= 0 || item.stock < item.skuQuantity) {
          emptyStocks.push(item)
        } else {
          this.skuList.push(item)
        }
      })
      const throwError = (title) => {
        uni.showModal({
          content: title,
          showCancel: false,
          success(res) {
          }
        })
      }
      if (notFullQuanlity.length) {
        throwError(`"${notFullQuanlity[0].spuName}:${this.getAtbValues(notFullQuanlity[0])}"最小起订量为${notFullQuanlity[0].miniQuantity}`)
        return false
      }
      if (emptyStocks.length) {
        throwError(`"${emptyStocks[0].spuName}:${this.getAtbValues(emptyStocks[0])}"库存不足，无法下单`)
        return false
      }
      return true
    },
    // 下载资料
    onDownload() {
      if (this.checkLists.length == 0) {
        uni.showToast({ title: '请选择商品', icon: 'none' })
        return
      }
      this.dataVo.email = this.userInfo.email
      this.dataVo.spuIds = this.getUniSpuIds()
      this.showEmail = true
    },
    onSelectGoods(event) {
      this.checkLists = event.detail;
      this.$store.commit(TYPES.SET_CART_SKUIDS, this.checkLists)
    },
    checkAllClick(e) {
      this.checkLists = [];
      if (e.detail) {
        this.checkLists = this.goodsOnSaleList.map(item => item.skuId);
      }
      this.$store.commit(TYPES.SET_CART_SKUIDS, this.checkLists)
    },
    reset() {
      this.finished = false
      this.loading = false
      this.error = false
      this.searchVo.pageIndex = 1
      this.checkLists = []
      this.goodsOnStopList = []
      this.goodsOnSaleList = []
      this.cartList = []
      this.isEdit = false
      setTimeout(() => {
        this.fetchHeadViewHeight()
      }, 100)
    },
    // 父组件调用、获取购物车列表
    loadList(init = true) {
      if (init) this.reset()
      if (this.loading || this.finished || this.error) return
      this.loading = true
      uni.showLoading({ title: '加载中', mask: true })
      this.searchVo.goodsType = this.goodsType
      getSelection(this.searchVo).then(({ result }) => {
        uni.hideLoading()
        const list = result.list || []
        if (list.length < this.searchVo.pageSize) {
          this.finished = true
        }
        this.searchVo.pageIndex += 1
        list.forEach(item => {
          if (item.tag) item.tag = item.tag.split('|').filter(e => e)
        })
        this.cartList = this.cartList.concat(list)
        this.goodsOnSaleList = this.cartList.filter(e => e.isOnSale && e.stock)
        this.goodsOnStopList = this.cartList.filter(e => !e.isOnSale || !e.stock).sort((a, b) => b.isOnSale - a.isOnSale)
        this.error = false
        if (init) {
          this.setCartSkuIds()
        }
        setTimeout(() => {
          this.fetchHeadViewHeight()
        }, 100)
      }).catch(e => {
        uni.hideLoading()
        uni.showToast({
          title: e.message,
          duration: 2000,
          icon: 'none'
        });
        this.error = true
      }).finally(() => {
        this.loading = false
      })
    },
    // 返回首页
    toHome() {
      if (this.isInsideActivity) {
        uni.navigateTo({
          url: `${this.$pageUrl.GOODS_LIST}?title=内购活动&page=inside_shopping_activity`
        })
      } else {
        uni.switchTab({
          url: this.$pageUrl.HOME
        })
      }
    },
    // 切换编辑状态
    toggleEditStatus() {
      this.isEdit = !this.isEdit
    },
    // sku规格
    getAtbValues(sku) {
      const arr = []
      if (sku.firstAtbValue) arr.push(sku.firstAtbValue)
      if (sku.secondAtbValue) arr.push(sku.secondAtbValue)
      return arr.join('；')
    },
    getUniSpuIds() {
      const spuIds = []
      this.checkLists.forEach(skuId => {
        const { spuId } = this.cartList.find(e => e.skuId === skuId)
        spuIds.push(spuId)
      })
      return Array.from(new Set(spuIds))
    },
    // 获取sku图片
    getImage(sku) {
      let url = this.IMAGE.big_logo
      if (sku.titleImage) {
        url = sku.titleImage
      } else if (sku.images && sku.images.length) {
        const arr = sku.images.filter(e => e.isTitleImage && e.imageType === '1')
        if (arr.length) {
          url = arr[0].imagePath
        }
      } else if (sku.spuTitleImage) {
        url = sku.spuTitleImage
      }
      return url
    },
    // 进入页面重新刷新购物车里的skuID列表
    setCartSkuIds(arr) {
      const values = this.cartSkuIds.filter(skuId => this.goodsOnSaleList.findIndex(item => item.skuId === skuId) >= 0)
      this.$store.commit(TYPES.SET_CART_SKUIDS, values)
      this.checkLists = values
    },
    // 清空失效数据
    clearInvalidGoods() {
      const clearGoodsList = this.goodsOnStopList.map(e => e.skuId)
      this.onDelete(clearGoodsList)
    },
    // 获取字典的通知
    fetchNotice() {
      getDictionaryByCode(SHOPPING_CART_NOTICE).then(({ result }) => {
        this.notice = result.value
        setTimeout(() => {
          this.fetchHeadViewHeight()
        }, 100)
      })
    },
    fetchDictionary() {
      return new Promise((resolve, reject) => {
        getDictionaryByCode(WXMP_COUPON_SHOP_CODE).then(({ result }) => {
          this.shopCode = result && JSON.parse(result.value)
          resolve()
        })
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.common-cart{
  min-height: 100%;
  .page_have{
    min-height: 100%;
    background: #f6f6f6;
    box-sizing: border-box;
  }
  .top{
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    z-index: 999;
    .selectBox {
      display: flex;
      background: #fff;
      justify-content: space-between;
      align-items: center;
      height: 98rpx;
      padding-left: 56rpx;
      padding-right: 28rpx;
    }
  }
  .bottom{
    box-sizing: border-box;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background: #fff;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    padding: 18rpx 28rpx;
    align-items: center;
  }
  .del{
    padding: 24rpx 68rpx;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 44rpx;
    background-color: #fa8181;
    color: #fff;
  }
  .action-btn{
    display: inline-block;
    font-weight: bold;
    width: 200rpx;
    line-height: 74rpx;
    color: $uni-color-theme;
    border: 1px solid $uni-color-theme;
    border-radius: 44rpx;
    text-align: center;
    color: $uni-color-theme;;
    font-size: 28rpx;
    &.delete{
      border-color:#FA8181;
      background-color: #FA8181;
      color: #fff;
    }
    &.settle{
      background-color: $uni-color-theme;
      color: #fff;
      margin-left: 24rpx;
    }
  }
  .tag-item {
    margin-right: 20rpx;
    padding: 2rpx 14rpx;
    color: $uni-color-money;
    background: rgba(255, 118, 64, 0.1);
    font-size: 22rpx;
    border-radius: 18rpx;
  }
  &.can-back{
    .page_have{
      padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
      padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
    }
    .bottom{
      padding-bottom: calc(14rpx + constant(safe-area-inset-bottom));
      padding-bottom: calc(14rpx + env(safe-area-inset-bottom));
    }
  }
}
/deep/ .email-input{
  color:#959CA7 !important;
  z-index: 0;
  font-weight: normal;
  flex: 1;
  background:#F6F6F6;
}
/deep/ .checkbox-wrapper .van-checkbox__icon-wrap{
  padding: 40rpx 20rpx 40rpx 28rpx; // 增大icon区域
}
/deep/ .van-stepper__input{
  color: #242629 !important;
  font-size: 13px;
  background-color: #F6F6F6;
}
/deep/ .van-stepper__minus,
/deep/ .van-stepper__plus{
  background-color: #F6F6F6;
  border-radius: 4px;
  color: #242629;
  font-weight: 600;
}
/deep/ .van-stepper__minus--disabled{
  color: #959CA7;
}

/deep/ .van-swipe-cell__right {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 130rpx;
  height: 100%;
  font-size: 30rpx;
  color: #fff;
  text-align: center;
  background-color: #f44;
}
.invalid-btn {
  padding: 10rpx 16rpx;
  font-size: 22rpx;
  color: #C7CACF;
  background: #F0F1F2;
  line-height: 22rpx;
}
.stepperInput {
  width: 30px;
  height: 25px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  background: transparent;
  z-index: 999;
}
.border-bottom-green{
  border-bottom: 1px solid #34947c;
}
.empty {
  background:#fff;
  box-sizing:border-box;
  display: flex;
  flex-direction: column;
}
.receiveButton {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(0%, -50%);
  margin-left: 28rpx;
  background: linear-gradient(90deg, #FFC740 0%, #FF961E 100%);
  border-radius: 100rpx 0rpx 0rpx 100rpx;
  color: white;
  font-size: 28rpx;
  text-align: center;
  padding: 4rpx 14rpx;
}
.receiveItem {
  margin-left: 24rpx;
  font-size: 26rpx;
  color: #FF7640;
  border: 1px solid#FF7640;
  text-align: center;
  padding: 2rpx 8rpx;
  border-radius: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 33%;
}
.coupon {
  border-top: 10rpx solid #F0F1F2;
  border-bottom: 1rpx solid #F0F1F2
}
</style>
