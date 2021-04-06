<template>
  <view class="page-container">
    <view class="content-container">
      <!-- 收货地址 -->
      <view class="address-container" @click="linkPage('ADDRESS_LIST', 'type=order')">
        <image :src="IMAGE['icon_order_address']" class="w-h64"/>
        <view class="flex-1 plr16" v-if="address" >
          <view class="mb14">
            <text class="fs28 fw600 mr24">{{ address.contact }}</text>
            <text class="fs26">{{ address.mobile }}</text>
          </view>
          <view>
            <text class="fs28 fc-gray">{{ `${address.province}${address.city}${address.district}${address.address}` }}</text>
          </view>
        </view>
        <view v-else class="fs32 fw500 flex-1 ml32">
          请添加收货地址
        </view>
        <van-icon name="arrow" class="w-h28" color="#C7CACF" />
      </view>

      <!-- sku列表 -->
      <view class="goods-container">
        <order-goods v-for="item in skuList" :key="item.id" :sku="item" res-type="order" />
        <van-field
          label-class="message-input-label"
          @change="(e) => { customerMessage = e.detail }"
          label="留言"
          placeholder="请输入备注"
          :border="false"
        />
      </view>
      <view class="order-info-container ptb30 plr28">
        <view class="row space-between fs26 mb30">
          <text>商品金额</text>
          <text>¥{{ orderDetails.productAmount | formatMoney }}</text>
        </view>
        <view class="row space-between fs26 mb30">
          <text>优惠券</text>
          <view class="row center" @click="linkCoupoonSelect">
            <text v-if="orderDetails.couponNum === 0" class="fw500 fs24 fc-grey">暂无可用优惠券</text>
            <text v-else-if="!orderDetails.discountAmount" class="coupon">{{ `${orderDetails.couponNum || 0}张可用`}}</text>
            <text v-else class="fw500 fs26">-{{ orderDetails.discountAmount }}</text>
            <van-icon name="arrow" color="#C7CACF" />
          </view>
        </view>
        <view class="row space-between fs26 mb30">
          <text>运费</text>
          <text>{{ 0 >= orderDetails.freightAmount ? '包邮' : `${orderDetails.freightAmount}元`}}</text>
        </view>
        <view class="text-right">
          <text class="fs24 fc-grey">共{{ quantity }}件  订单金额：</text>
          <text class="price-text">¥{{ orderDetails.totalAmount | formatMoney }}</text>
        </view>
      </view>
    </view>

    <!-- 支付按钮 -->
    <view class="bottom-container hairline-top">
      <text class="price-text">
        <text :class="moneyLabel">¥</text>
        <text :class="moneyClass">{{ orderDetails.totalAmount | formatMoney }}</text>
      </text>
      <button class="action-btn" @click="pay" >{{ userInfo.settleMethod === '月结' ? '确定订单' : '立即付款' }}</button>
    </view>

    <!-- 推荐官达标弹框 -->
    <shoppingSuccessPopup :show="shoppingVisible" @action="actionShoppingPopoup"/>

    <!-- 支付弹窗 -->
    <pay-popup :visible.sync="payPopupVisible" :balance="myBalance" :price="orderDetails.totalAmount" @confirm="confirmPay"></pay-popup>
  </view>
</template>

<script>
import { icon_order_address } from '@/image-config'
import OrderGoods from '../components/order-goods'
import { findDefaultAddress } from '@/api/address'
import { ordersPreview } from '@/api/order'
import { orderDeliveryReminder } from '@/config'
import { getCouponNums } from '@/api/coupon'
import {
  createOrder, initOrder, rechargeCreate, rechargeDetails, payOrderByWallet
} from '@/api/order.js'
import TYPES from '@/store/types'
import { throttles } from '@/utils'
import shoppingSuccessPopup from '@/components/shopping-success-popup'
import { getDictionaryByCode } from '@/api/dictionary'
import { STANDARD_PRICE, WXMP_COUPON_SHOP_CODE } from '@/const/dictionary'
import { mapGetters } from 'vuex'
import PayPopup from '@/pages/pay-popup/index'

export default {
  name: 'OrderConfirm',
  components: { OrderGoods, shoppingSuccessPopup, PayPopup },
  data() {
    return {
      IMAGE: { icon_order_address },
      skuList: [], // sku列表
      itemDtoList: [], // sku 列表信息
      quantity: 0,
      finished: false,
      orderDetails: {
        freightAmount: -1
      },
      options: {},
      shoppingVisible: false,
      payPopupVisible: false,
      orderInfo: null,
      couponListId: null,
      myBalance: 0,
      checkInterval: null,
      shopCode: {}
    }
  },
  computed: {
    ...mapGetters(['standardPrice', 'customerUserInfo', 'userInfo']),
    address() {
      const result = this.$store.getters.address
      if (result && this.itemDtoList.length) { // 当地址更新的时候 更新订单信息获取 价格变化
        this.updateOrderInfo()
      }
      return result
    },
    isInsideActivity() {
      return this.options.page === 'inside_shopping_activity'
    },
    goodsType() {
      return this.options.page === 'inside_shopping_activity' ? 'INNER' : 'PLATFORM'
    }
  },
  async onLoad(options) {
    uni.$off(this.$eventName.COUPON_ID_STATUS_REFRESH)
    uni.$on(this.$eventName.COUPON_ID_STATUS_REFRESH, (ids) => {
      this.couponListId = ids
      this.updateOrderInfo()
    })
    this.options = options
    this.itemDtoList = JSON.parse(options.itemDtoList)
    await this.fetchDictionary()
    this.init()
  },
  methods: {
    // 初始化订单
    async init() {
      try {
        uni.showLoading({ title: '加载中', mask: true });
        await this.initDefaultAddress() // 获取默认地址
        await this.initGoods()
        this.fetchOrderSum()
      } catch (error) {
        uni.hideLoading()
      } finally {
        uni.hideLoading()
      }
    },
    // 获取默认地址
    initDefaultAddress() {
      return new Promise((resolve) => {
        findDefaultAddress().then(({ result }) => {
          this.$store.commit(TYPES.SET_ADDRESS, result)
          resolve()
        })
      })
    },
    // 获取商品信息
    initGoods() {
      return new Promise((resolve) => {
        if (!this.itemDtoList) {
          return
        }
        const data = {
          customerMessage: this.customerMessage,
          deliAddress: this.address && this.address.address,
          deliCity: this.address && this.address.city,
          deliDistrict: this.address && this.address.district,
          deliName: this.address && this.address.contact,
          deliProvince: this.address && this.address.province,
          deliMobile: this.address && this.address.mobile,
          itemDtoList: this.itemDtoList,
          orderChannel: this.goodsType,
          couponCode: this.couponListId,
          shopCode: this.isInsideActivity ? this.shopCode.inside_shop_code : this.shopCode.shop_code
        }
        ordersPreview(data).then(({ result }) => {
          uni.hideLoading();
          this.orderDetails = result
          this.skuList = result.orderItems
          this.quantity = result.orderItems.map(e => e.skuQuantity).reduce((total, num) => total + num)
          resolve()
        }).catch((e) => {
          this.couponListId = null
          uni.hideLoading();
          uni.showToast({
            title: e.message,
            duration: 2000,
            icon: 'none'
          });
        })
      })
    },
    // 更新预览接口
    updateOrderInfo: throttles(function() {
      this.initGoods()
    }, 300),
    pay() {
      // 检查订单状态、是否填写收货地址
      const status = this.checkOrder()
      if (!status) {
        this.finished = false
        return
      }
      // 根据不同用户类型、选择不同支付方式
      if (this.userInfo.settleMethod === '月结') {
        this.orderMonthPay()
      } else if (this.userInfo.settleMethod === '现款现货') {
        this.openPayPopup()
      } else { // 现在的逻辑是如果没有结算方式、默认是微信结算方式
        this.openPayPopup()
      }
    },
    // 打开支付弹窗
    async openPayPopup() {
      try {
        uni.showLoading({ title: '加载中...', mask: true })
        await this.fetchBalance()
        if (this.myBalance === 0) {
          this.orderWxPay()
          return
        }
        this.payPopupVisible = true
      } finally {
        uni.hideLoading()
      }
    },
    // 获取我的余额
    fetchBalance() {
      return new Promise((resolve, reject) => {
        getCouponNums().then(({ result }) => {
          this.myBalance = result.balance || 0
          resolve(result)
        })
      })
    },
    // 点击确认支付
    async confirmPay(type) {
      if (this.finished) return
      this.finished = true
      if (type === 'balance') {
        this.payPopupVisible = false
        await this.$store.dispatch('fetchMessage', [orderDeliveryReminder])
        this.orderBalancePay()
      } else if (type === 'wx') {
        this.payPopupVisible = false
        this.orderWxPay()
      } else {
        this.finished = false
        uni.showToast({
          title: '请选择支付方式呦～',
          icon: 'none'
        })
      }
    },
    // 获取订单列表格式化对象
    fecthOrderList() {
      const itemDtoList = this.skuList.map(item => {
        return {
          spuId: item.spuId,
          skuId: item.skuId,
          number: item.skuQuantity,
          codeBar: item.codeBar
        }
      })
      const data = {
        customerMessage: this.customerMessage,
        deliAddress: this.address.address,
        deliCity: this.address.city,
        deliDistrict: this.address.district,
        deliName: this.address.contact,
        deliProvince: this.address.province,
        deliMobile: this.address.mobile,
        itemDtoList: itemDtoList,
        orderChannel: this.goodsType,
        couponCode: this.couponListId
      }
      return data
    },
    // 余额充值后钱包支付
    async orderBalancePay() {
      // 如果当前的余额大于 当前订单金额则使用余额支付
      if (this.myBalance >= this.orderDetails.totalAmount) {
        uni.showLoading({ mask: true, title: '支付中...' })
        const data = this.fecthOrderList()
        payOrderByWallet(data).then((res) => {
          this.orderInfo = res
          this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
          // 判断是否需要打开推荐官弹窗
          if (this.isOpenShoppingPopup()) {
            this.shoppingVisible = true
          } else {
            this.jumpType()
          }
        }).catch(e => {
          uni.redirectTo({
            url: `${this.$pageUrl.ORDER}?type=notPay`
          })
        }).finally(() => {
          this.finished = false
          uni.hideLoading();
        })
      // 如果还不够则去充值余额
      } else if (this.orderDetails.totalAmount > this.myBalance) {
        this.orderBalanceRecharge()
      }
    },
    // 余额充值
    async orderBalanceRecharge() {
      try {
        uni.showLoading({ mask: true, title: '加载中...' })
        // 获取code 获取订单信息
        const code = await this.$store.dispatch('getWxCode');
        const price = (this.orderDetails.totalAmount - this.myBalance).toFixed(2)
        // 生成微信支付信息
        rechargeCreate({
          amount: price,
          code: code
        }).then(async({ result }) => {
          // 完成后 检查 充值支付、检查充值状态、获取钱宝金额 再去吊起支付
          await this.$store.dispatch('requestPayment', { payment: result.wxPayMpOrderResult })
          this.checkBalanceStatus(result.recharge.id)
          uni.hideLoading()
        }).catch(e => {
          uni.hideLoading()
        })
      } catch (error) {
        uni.hideLoading()
        this.payPopupVisible = false
        uni.showToast({
          title: '余额支付失败、请稍后重试',
          icon: 'none'
        });
      } finally {
        this.finished = false
      }
    },
    // 检查余额充值状态
    checkBalanceStatus(id) {
      this.checkInterval = setInterval(async() => {
        rechargeDetails(id).then(async({ result }) => {
          if (result.status === 'APPROVED') {
            clearInterval(this.checkInterval)
            await this.fetchBalance()
            this.orderBalancePay()
          }
        })
      }, 1000)
    },
    // 现货现款结算模式、 支付
    async orderWxPay() {
      uni.showLoading({ mask: true, title: '加载中...' })
      // 获取code 获取订单信息
      const code = await this.$store.dispatch('getWxCode');
      const data = this.fecthOrderList()
      // 创建订单信息
      try {
        this.orderInfo = await createOrder(code, data)
        this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '生成订单失败、请稍后重试',
          icon: 'none'
        });
        this.setTimeBackPage()
      }
      // 获取后端返回订单信息、调起支付
      try {
        if (!this.orderInfo) return
        const payment = this.orderInfo.result.wxPayMpOrderResult
        await this.$store.dispatch('requestPayment', { payment: payment })
        uni.hideLoading()
        this.finished = false
        // 判断是否需要打开推荐官弹窗
        if (this.isOpenShoppingPopup()) {
          this.shoppingVisible = true
        } else {
          await this.$store.dispatch('fetchMessage', [orderDeliveryReminder])
          this.jumpType()
        }
      } catch (error) {
        this.finished = false
        uni.hideLoading()
        uni.redirectTo({
          url: `${this.$pageUrl.ORDER}?type=notPay`
        })
      }
    },
    // 月结模式 支付
    orderMonthPay() {
      if (this.finished) return
      this.finished = true
      uni.showModal({
        title: '提示',
        content: '是否确认提交订单？提交订单即下单成功，请谨慎操作。',
        success: async(res) => {
          if (res.confirm) {
            uni.showLoading({ title: '加载中' });
            const data = this.fecthOrderList()
            initOrder(data).then(() => {
              this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
              uni.hideLoading()
              this.toastMessage() // 获取订阅信息弹窗
            }).catch((error) => {
              uni.hideLoading();
              uni.showToast({
                title: error.message,
                icon: 'none'
              })
            }).finally(() => {
              this.finished = false
            })
          } else if (res.cancel) {
            this.finished = false
          }
        }
      })
    },
    // 月接类型订阅获取授权弹窗
    toastMessage() {
      uni.showModal({
        title: '提示',
        content: '订单提交成功',
        showCancel: false,
        success: async(res) => {
          if (res.confirm) {
            try {
              // 是否需要打开推荐官弹窗
              if (this.isOpenShoppingPopup()) {
                this.shoppingVisible = true
              } else {
              // 获取收获订阅消息
                this.$store.dispatch('fetchMessage', [orderDeliveryReminder])
                uni.navigateBack()
              }
            } catch (error) {
              this.jumpType()
            }
          }
        }
      })
    },
    // 是否需要打开推荐官弹窗
    isOpenShoppingPopup() {
      // 弹框逻辑： 非内购模式 、客户是否为非利润模式客户、购买前金额没有到标准200、超过两百不弹框
      if (!this.customerUserInfo || !this.customerUserInfo.attribute) return false
      const { distributorType, paidOrderSum } = this.customerUserInfo.attribute
      const currentPrice = this.orderDetails.totalAmount + paidOrderSum
      if (this.goodsType === 'PLATFORM' && distributorType === 'COMMISSION' && paidOrderSum <= this.standardPrice && currentPrice >= this.standardPrice) {
        return true
      }
    },
    // 关闭推荐官弹框事件
    async actionShoppingPopoup(type) {
      this.shoppingVisible = false
      try {
        await this.$store.dispatch('fetchMessage', [orderDeliveryReminder])
        if (type === 'confirm') {
          const path = `${this.$pageUrl.WORKBENCH}?type=${this.customerUserInfo.attribute.distributorType}`
          uni.redirectTo({ url: path })
          return
        }
        this.jumpType()
      } catch (error) {
        this.jumpType()
      }
    },
    jumpType() {
      if (this.userInfo.settleMethod === '月结') {
        uni.navigateBack()
      } else {
        const orderSn = this.orderInfo.result.hasOwnProperty('orderDetailApiVo') ? this.orderInfo.result.orderDetailApiVo.orderSn : this.orderInfo.result.orderSn
        uni.redirectTo({
          url: `${this.$pageUrl.PAY_SUCCESS}?money=${this.orderDetails.totalAmount}&orderId=${orderSn}`
        })
      }
    },
    // 检查订单
    checkOrder() {
      if (!this.address) {
        uni.showToast({ title: '请添加收货地址', icon: 'none' })
        return false
      }
      return true
    },
    // 跳转优惠卷页面
    linkCoupoonSelect() {
      let inside = ''
      if (this.isInsideActivity) {
        inside = '&page=inside_shopping_activity'
      }
      if (this.couponListId) {
        this.linkPage('SELECT', `number=${this.orderDetails.productAmount}&status=1&couponListId=${this.couponListId}${inside}`)
      } else {
        this.linkPage('SELECT', `number=${this.orderDetails.productAmount}&status=1${inside}`)
      }
    },
    // 获取 sku规格
    getAtbValues(sku) {
      const arr = []
      if (sku.firstAtbValue) {
        arr.push(sku.firstAtbValue)
      }
      if (sku.secondAtbValue) {
        arr.push(sku.secondAtbValue)
      }
      return arr.join('；')
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
    // 定时返回上一页面
    setTimeBackPage(duration = 2000) {
      setTimeout(() => {
        uni.navigateBack();
      }, duration)
    },
    // 获取字典 支付对比数额
    fetchOrderSum() {
      // 如果vuex 没有获取
      if (!this.standardPrice) {
        getDictionaryByCode(STANDARD_PRICE).then(({ result }) => {
          this.$store.commit(TYPES.SET_ORDER_SUM, result.value)
        })
      }
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
.page-container{
  height: 100vh;
  display: flex;
  flex-direction: column;
  .content-container{
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20rpx;
    .address-container{
      background-color: #ffffff;
      padding: 30rpx 28rpx;
      display: flex;
      align-items: center;
      border-top: 1px solid #F0F1F2;
    }
  }
  .goods-container,
  .order-info-container{
    background-color: #ffffff;
    border-radius: 10px;
    margin-top: 20rpx;
  }
  .bottom-container{
    background-color: #ffffff;
    padding: 22rpx 28rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: calc(22rpx+ constant(safe-area-inset-bottom)); //兼容 IOS<11.2
    padding-bottom: calc(22rpx + env(safe-area-inset-bottom)); //兼容 IOS>11.2
  }
}
/deep/ .van-field__label {
  color: #121314;
}
/deep/ .message-input-label{
  flex: none;
  min-width: 50px !important;
}
.coupon {
  color: #FF7640;
  font-size: 24rpx;
  background: rgba(255, 118, 64, 0.1);
  border-radius: 2rpx;
  padding: 4rpx 8rpx;
}
</style>
