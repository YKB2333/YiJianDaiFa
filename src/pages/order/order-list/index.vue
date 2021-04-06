<template>
  <view>
    <!-- 搜索 -->
    <van-search
      :value="searchValue"
      placeholder="收货人/手机号/订单号/物流单号/商品名称/平台单号"
      shape="round"
      @search="onSearch"
      :show-action="showCancelSearchBtn"
      @cancel="cancelSearch"
    />
    <van-tabs
      sticky
      :active="tabActive"
      @change="onTabsChange"
      color="#429881"
      line-width='25'>
      <van-tab v-for="tab in tabList" :key="tab.key" :title="tab.title" :name="tab.key">
        <order-item
          v-for="item in orderList" :key="item.orderSn"
          :value="item"
          :receiver="item.deliName"
          :status="item.status"
          :is-delivery-nopay="item.isDeliveryNopay"
          :sku-length="getOrderListNumber(item.orderItems)"
          :total-price="item.totalAmount"
          :isInsideActivity="item.type === 'INNER_BUY'"
          @click="toOrderDetail(item.orderSn)"
          @action="action">
          <view slot="goods">
            <order-goods
              res-type="order"
              v-if="item.orderItems.length === 1"
              :sku="item.orderItems[0]"
              :border="false"
            />
            <order-goods-multiple
              v-if="item.orderItems.length > 1"
              :skus="item.orderItems"
            />
          </view>
        </order-item>
      </van-tab>
    </van-tabs>
    <empty-box
      :loading="loading"
      :finished="finished"
      :error="error"
      :is-empty="orderList.length === 0 && finished"
      :image="IMAGE['order_none']"
      label="暂无相关订单，去挑几件中意的商品吧"
      img-class="w430 h340 mt80"
      @error-click="onErrorClick"
      empty-class="empty-class">
        <view class="row pt120 center-x" v-if="orderList.length === 0 && finished">
          <view class="w340 l-h88 center-x fc-white br44 bg-theme" @tap="toHome">去逛逛</view>
        </view>
    </empty-box>
    <!-- 推荐官达标弹框 -->
    <shoppingSuccessPopup :show="shoppingVisible" @action="actionShoppingPopoup"/>

     <!-- 支付弹窗 -->
    <pay-popup
      :visible.sync="payPopupVisible"
      :balance="myBalance"
      :price="currentPrice"
      @select="select"
      @confirm="confirmPay"
    ></pay-popup>
  </view>
</template>

<script>
import OrderGoods from '../components/order-goods'
import OrderItem from '../components/order-item'
import OrderGoodsMultiple from '../components/order-goods-multiple'
import EmptyBox from '@/components/empty-box'
import { ORDER_TAB_LIST } from '@/const/order'
import { mapGetters } from 'vuex'
import { order_none } from '@/image-config'
import { getOrderList, payOrder, signInOrder, rechargeCreate, rechargeDetails, payOrderByWallet } from '@/api/order'
import { kd100AppId, orderDeliveryReminder } from '@/config';
import { authentication } from '@/mixins/auth'
import TYPES from '@/store/types'
import shoppingSuccessPopup from '@/components/shopping-success-popup'
import { getDictionaryByCode } from '@/api/dictionary'
import { STANDARD_PRICE } from '@/const/dictionary'
import { getCouponNums } from '@/api/coupon'
import PayPopup from '@/pages/pay-popup/index'

export default {
  name: 'OrderList',
  components: {
    OrderItem,
    OrderGoods,
    OrderGoodsMultiple,
    EmptyBox,
    shoppingSuccessPopup,
    PayPopup
  },
  data() {
    return {
      IMAGE: {
        order_none
      },
      payFinished: false,
      finished: false, //
      loading: false, //
      error: false, //
      query: {
        status: [], // 1:待付款 2-3:待发货 4:已取消 5:待收货 6:已完成 7已签收
        pageIndex: 1,
        pageSize: 20,
        orderStr: 'createTimestamp desc',
        orderSn: '', // 订单号
        keyword: ''
      },
      searchValue: '', // 搜索值
      tabActive: 'all', //
      tabList: [],
      // 订单列表
      orderList: [],
      showCancelSearchBtn: false,
      shoppingVisible: false,
      payPopupVisible: false,
      myBalance: 0,
      checkInterval: null,
      currentPrice: 0,
      currentPaymentData: null
    }
  },
  mixins: [authentication],
  onLoad(options) {
    if (options.type) {
      this.tabActive = options.type
    }
    this.setTabToStatus()
    this.fetchOrderSum()
    if (this.userStatus === 'enable') {
      if (this.userInfo.settleMethod === '月结') {
        this.tabList = ORDER_TAB_LIST.filter(e => e.key !== 'notPay')
      } else if (this.userInfo.settleMethod === '现款现货') {
        this.tabList = ORDER_TAB_LIST
      } else { // 现在如果没有结算方式 默认使用微信支付方式
        this.tabList = ORDER_TAB_LIST
      }
    }
    this.loadList()
    uni.$off(this.$eventName.CHANGE_ORDER_STATUS)
    uni.$on(this.$eventName.CHANGE_ORDER_STATUS, (data) => {
      this.reset()
      this.loadList()
    })
  },
  computed: {
    ...mapGetters(['userInfo', 'customerUserInfo', 'standardPrice'])
  },
  methods: {
    action(type, data) {
      if (type === 'pay') {
        this.currentPaymentData = data
        this.currentPrice = data.totalAmount
        this.openPayPopup(data)
      }
      if (type === 'logistics' && data && data.logisticsOrderSn) {
        let logisticsArray = []
        data.logisticses.forEach(item => {
          logisticsArray = logisticsArray.concat(item.logisticsItems)
        });
        // 判断发货列表数量是否是多个对象、是则是 部分发货
        // 判断订单列表是否大于1个、并且与发货列表数量不想等、是则是 部分发货
        // data.status 8 则是部分发货
        if ((data.logisticses && data.logisticses.length > 1) || (data.orderItems.length > 1 && logisticsArray.lenth > 1 && logisticsArray.length !== data.orderItems.length) || data.status === 8) {
          this.toOrderDetail(data.orderSn)
          return
        }
        uni.navigateToMiniProgram({
          appId: kd100AppId,
          path: `/pages/result/result?nu=${data.logisticsOrderSn}`
        })
      }
      if (type === 'confirm') {
        this.confirmReceipt(data)
      }
    },
    loadList() {
      if (this.loading || this.finished || this.error) return
      this.loading = true
      getOrderList(this.query).then(({ result }) => {
        let data = result.list || []
        // 如果是代付款 过滤订单后付款的 因为会有两个订单切换的可能
        if (this.query.status == 1) {
          data = data.filter(e => !e.isDeliveryNopay)
        }
        if (data.length === 0) this.finished = true
        this.orderList = this.orderList.concat(data)
        this.error = false
        this.query.pageIndex += 1
      }).catch(err => {
        this.error = true
      }).finally(() => {
        this.loading = false
      })
    },
    onSearch({ detail }) {
      if (detail) {
        this.showCancelSearchBtn = true
        this.query.keyword = detail
        this.reset()
        this.loadList()
      }
    },
    onTabsChange({ detail }) {
      this.tabActive = detail.name
      this.setTabToStatus()
      this.reset()
      this.loadList()
    },
    setTabToStatus() {
      const map = {
        all: [],
        notPay: ['1'],
        notDelivered: ['2', '3'],
        unreceived: ['5'],
        success: ['6'],
        goodsReceived: ['7']
      }
      this.query.status = map[this.tabActive]
    },
    reset() {
      this.query.pageIndex = 1
      this.orderList = []
      this.loading = false
      this.finished = false
      this.error = false
    },
    // 返回首页
    toHome() {
      uni.switchTab({
        url: this.$pageUrl.HOME
      })
    },
    onErrorClick() {
      this.error = false
      this.loadList()
    },
    toOrderDetail(orderSn) {
      uni.navigateTo({
        url: `${this.$pageUrl.ORDER_DETAIL}?id=${orderSn}`
      })
    },
    // 打开支付弹窗
    async openPayPopup() {
      try {
        uni.showLoading({ title: '加载中...', mask: true })
        await this.fetchBalance()
        if (this.myBalance === 0) {
          this.orderWxPay(this.currentPaymentData)
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
      if (this.payFinished) {
        return
      }
      this.payFinished = true
      if (type === 'balance') {
        this.payPopupVisible = false
        await this.$store.dispatch('fetchMessage', [orderDeliveryReminder])
        this.orderBalancePay()
      } else if (type === 'wx') {
        this.payPopupVisible = false
        this.orderWxPay(this.currentPaymentData)
      } else {
        this.finished = false
        uni.showToast({
          title: '请选择支付方式呦～',
          icon: 'none'
        })
      }
    },
    // 余额充值后钱包支付
    async orderBalancePay() {
      // 如果当前的余额大于 当前订单金额则使用余额支付
      if (this.myBalance >= this.currentPrice) {
        uni.showLoading({ mask: true, title: '支付中...' })
        payOrderByWallet({
          orderSn: this.currentPaymentData.orderSn
        }).then((res) => {
          uni.hideLoading()
          uni.showToast({
            title: '支付成功',
            icon: 'none'
          });
          if (this.isOpenShoppingPopup(this.currentPaymentData)) {
            this.shoppingVisible = true
          } else {
            this.reset()
            this.loadList()
            this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
          }
        }).catch((e) => {
          uni.hideLoading();
          if (e && e.errMsg.includes('cancel')) {
            return
          }
          uni.showToast({
            title: e.errMsg,
            icon: 'none'
          });
        }).finally(() => {
          this.payFinished = false
        })
      // 如果还不够则去充值余额
      } else if (this.currentPrice > this.myBalance) {
        this.orderBalanceRecharge()
      }
    },
    // 余额充值
    async orderBalanceRecharge() {
      try {
        uni.showLoading({ mask: true, title: '加载中...' })
        // 获取code 获取订单信息
        const code = await this.$store.dispatch('getWxCode');
        const price = (this.currentPrice - this.myBalance).toFixed(2)
        // 生成微信支付信息
        rechargeCreate({
          amount: price,
          code: code
        }).then(async({ result }) => {
          uni.hideLoading();
          // 完成后 检查 充值支付、检查充值状态、获取钱宝金额 再去吊起支付
          await this.$store.dispatch('requestPayment', { payment: result.wxPayMpOrderResult })
          this.checkBalanceStatus(result.recharge.id)
        }).catch(e => {
          uni.hideLoading();
        })
      } catch (error) {
        uni.hideLoading()
        this.payPopupVisible = false
        uni.showToast({
          title: '余额支付失败、请稍后重试',
          icon: 'none'
        });
      } finally {
        this.payPopupVisible = false
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
    // 去支付
    async orderWxPay(item) {
      if (this.payFinished) {
        return
      }
      this.payFinished = true
      uni.showLoading({
        title: '加载中',
        mask: true
      });
      const code = await this.$store.dispatch('getWxCode');
      payOrder(item.orderSn, code).then(async({ result }) => {
        const payment = result.wxPayMpOrderResult
        // 吊起微信支付
        this.$store.dispatch('requestPayment', {
          payment: payment
        }).then(res => {
          if (this.isOpenShoppingPopup(item)) {
            this.shoppingVisible = true
          } else {
            this.$store.dispatch('fetchMessage', [orderDeliveryReminder])
            this.reset()
            this.loadList()
            this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
          }
          uni.hideLoading()
          uni.showToast({
            title: '支付成功',
            icon: 'none'
          });
        }).catch((e) => {
          uni.hideLoading()
          if (e && e.errMsg.includes('cancel')) {
            return
          }
          uni.showToast({
            title: e.errMsg,
            icon: 'none'
          });
        }).finally(() => {
          this.payFinished = false
        })
      }).catch(err => {
        uni.hideLoading()
        uni.showModal({ title: '支付失败', content: err.resInfo, showCancel: false });
      })
    },
    confirmReceipt(data) {
      uni.showModal({
        title: '提示',
        content: '是否确认收货？',
        confirmText: '确认收货',
        confirmColor: '#10967B',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '加载中',
              mask: true
            });
            signInOrder(data.orderSn).then(({ result }) => {
              uni.hideLoading();
              uni.showToast({
                title: '确认收货'
              });
              this.reset()
              this.loadList()
            }).catch((e) => {
              uni.hideLoading();
            })
          }
        }
      });
    },
    // 是否需要打开推荐官弹窗
    isOpenShoppingPopup(item) {
      // 弹框逻辑： 非内购模式 、客户是否为非利润模式客户、购买前金额没有到标准200、超过两百不弹框
      if (!this.customerUserInfo || !this.customerUserInfo.attribute) return false
      const { distributorType, paidOrderSum } = this.customerUserInfo.attribute
      const currentPrice = item.totalAmount + paidOrderSum
      if (item.type !== 'INNER_BUY' && distributorType === 'COMMISSION' && paidOrderSum <= this.standardPrice && currentPrice >= this.standardPrice) {
        return true
      }
      return false
    },
    // 关闭推荐官弹框事件
    async actionShoppingPopoup(type) {
      this.shoppingVisible = false
      this.$store.dispatch('fetchMessage', [orderDeliveryReminder])
      this.reset()
      this.loadList()
      this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
      if (type === 'confirm') {
        const path = `${this.$pageUrl.WORKBENCH}?type=${this.customerUserInfo.attribute.distributorType}`
        uni.redirectTo({ url: path })
      }
    },
    cancelSearch() {
      this.showCancelSearchBtn = false
      this.query.orderSn = ''
      this.query.keyword = ''
      this.reset()
      this.loadList()
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
    getOrderListNumber(result = []) {
      return result.map(e => e.skuQuantity).reduce((total, num) => total + num)
    }
  },
  onReachBottom() {
    this.loadList()
  }
}
</script>

<style lang="scss" scoped>
/deep/ .empty-class{
  height: calc(100vh - 88px);
  margin-top: 10px;
}
/deep/ .van-tabs__line {
  background: #429881 !important;
}
</style>
