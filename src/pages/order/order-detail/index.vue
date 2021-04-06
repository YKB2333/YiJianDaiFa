<template>
  <view class="order-detail-page">
    <view class="content-container">
      <view class="header-container">
        <view class="pay-status-container">
          <view class="content">
            <view class="col">
              <text class="fc-white fs32 fw600 ">{{ orderStatus['text'] }}</text>
              <view v-if="['1', '5'].includes(order.status) && countDownTimeLength" class="mt10">
                <van-count-down use-slot :time="countDownTimeLength" @change="timeDataChange" >
                  <text class="fs26 fc-white" >{{ countDownText }}</text>
                </van-count-down>
              </view>
            </view>
            <image :src="orderStatus['img']" class="w204 h144" />
          </view>
          <image v-if="isInsideActivity" :src="IMAGE['inside_shopping_icon_green']" class="w-h78 absolute" style="left:2px;top:2px"></image>
        </view>
        <view class="address-container">
          <image :src="IMAGE['icon_order_address']" class="w-h64 mr16"></image>
          <view class="flex-1">
            <view class="mb16">
              <text class="fs28 fw700 mr24">{{ order.deliName }}</text>
              <text class="fs26">{{ order.deliMobile }}</text>
            </view>
            <view>
              <text class="fs28 fc-gray" v-if="order.orderSn">
                {{ `${order.deliProvince}${order.deliCity}${order.deliDistrict}${order.deliAddress}` }}
              </text>
            </view>
          </view>
        </view>
      </view>
      <view style="margin-top: -16px">
        <view v-if="isLogisticses">
          <!-- 包裹/拆分包裹 -->
          <view class="goods-container mb20" v-for="(item, index) in order.logisticses" :key="item.id">
            <view class="row space-between center-y mlr28 ptb24 hairline-bottom">
            <view class="fs28 fw600 row center-y"><image :src="IMAGE['icon_order_box']" class="w-h44 mr16">包裹{{ index + 1 }}</view>
              <view class="lookLogistics" v-if="item.logisticsOrderSn" @click="navigateToMiniProgram(item.logisticsOrderSn)">查看物流</view>
              <view class="fc-grey fs28" v-else>等待发货</view>
            </view>
            <order-goods v-for="child in item.logisticsItems" :key="child.id"
              res-type="order"
              :sku="child"
              @click="toGoodsDetail(child)"
            />
            <view class="mlr28 pb36" v-if="item.logisticsOrderSn || item.logisticsCompanyName">
              <view class="row space-between mt36" v-if="item.logisticsOrderSn">
                <view class="flex-1 fs26">
                  <text>物流单号：</text>
                  <text>{{ item.logisticsOrderSn }}</text>
                </view>
                <text class="copy-btn" @tap="onCopy(item.logisticsOrderSn, '物流单号已复制')">复制</text>
              </view>
              <view class="row space-between mt36" v-if="item.logisticsCompanyName">
                <view class="flex-1 fs26">
                  <text>物流公司：</text>
                  <text>{{ item.logisticsCompanyName }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 商品信息 单个-->
        <view class="goods-container" v-else>
          <order-goods v-for="item in order.orderItems" :key="item.id"
            res-type="order"
            :sku="item"
            @click="toGoodsDetail(item)"
          />
        </view>

        <!-- 订单信息 总信息-->
        <view class="order-info-container">
          <view class="ptb40">
            <view class="row space-between fs26 mb30">
              <text>商品金额</text>
              <text class="fw500">¥{{ order.productAmount | formatMoney }}</text>
            </view>
            <view class="row space-between fs26 mb30" v-if="order.discountAmount">
              <text>优惠券减免</text>
              <text class="fc-money">-{{ order.discountAmount | formatMoney }}</text>
            </view>
            <view class="row space-between fs26 mb30">
              <text>运费</text>
              <text>{{ 0 >= order.freightAmount ? '包邮' : `${order.freightAmount}元`}}</text>
            </view>
            <view class="text-right">
              <text class="fs24 fc-grey">共{{ skuCount }}件  订单金额：</text>
              <text class="price-text fs32">¥{{ order.totalAmount | formatMoney }}</text>
            </view>
          </view>
        </view>
        <view class="order-info-container">
          <view class="fw600 fs28 ptb30 hairline-bottom">订单信息</view>
          <view class="ptb40">
            <view class="row space-between">
              <view class="flex-1 fs26">
                <text>订单号：</text>
                <text>{{ order.orderSn }}</text>
              </view>
              <text class="copy-btn" @tap="onCopy(order.orderSn, '订单号已复制')">复制</text>
            </view>
            <view class="row space-between mt36" v-if="order.platOrderSn">
              <view class="flex-1 fs26">
                <text>平台单号：</text>
                <text>{{ order.platOrderSn }}</text>
              </view>
              <text class="copy-btn" @tap="onCopy(order.platOrderSn, '平台单号已复制')">复制</text>
            </view>
            <view class="row space-between mt36" v-if="logisticses.logisticsCompanyName && !isLogisticses">
              <view class="flex-1 fs26">
                <text>物流公司：</text>
                <text>{{ logisticses.logisticsCompanyName }}</text>
              </view>
            </view>
            <view class="row space-between mt36" v-if="order.logisticsOrderSn && !isLogisticses">
              <view class="flex-1 fs26">
                <text>物流单号：</text>
                <text>{{ order.logisticsOrderSn }}</text>
              </view>
              <text class="copy-btn" @tap="onCopy(order.logisticsOrderSn, '物流单号已复制')">复制</text>
            </view>
            <view class="row space-between mt36">
              <view class="flex-1 fs26">
                <text>创建时间：</text>
                <text>{{ order.createTimestamp | formatDate('Y-M-D h:m:s') }}</text>
              </view>
            </view>
            <view class="row space-between mt36">
              <view class="flex-1 fs26">
                <text>付款时间：</text>
                <text v-if="payInfos.payTimestamp">{{ payInfos.payTimestamp | formatDate('Y-M-D h:m:s') }}</text>
                <text v-else>未付款</text>
              </view>
            </view>
            <view class="row space-between mt36">
              <view class="flex-1 fs26">
                <text>支付方式：</text>
                <text v-if="payInfos.payType">{{ payInfos.payTypeName }}</text>
                <text v-else>未付款</text>
              </view>
            </view>
            <view class="row space-between mt36" v-if="logisticses.createTimestamp">
              <view class="flex-1 fs26">
                <text>{{ isLogisticses ? '首次发货时间：' : '发货时间：'}}</text>
                <text>{{ logisticses.createTimestamp | formatDate('Y-M-D h:m:s') }}</text>
              </view>
            </view>
            <view class="row space-between mt36" v-if="order.sellerRemark">
              <view class="flex-1 fs26 row">
                <text>卖家留言：</text>
                <text class="flex-1">{{ order.sellerRemark }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view>
      <view class="bottom-container hairline-top">
        <view>
          <text v-if="order.status === '1'" class="price-text">¥{{ order.totalAmount | formatMoney }}</text>
        </view>
        <view class="action-btn">
          <!-- 注释的原因是因为 oms还为对接、等到对接的时候恢复 -->
          <button v-if="['1', '2', '3'].includes(order.status) && !isDeliveryNopay" class="cancel" @tap="onCancel">取消订单</button>
          <button v-if="order.status === '1' && !order.isDeliveryNopay" class="pay" @tap="openPayPopup" >立即付款</button>
          <button v-if="['5', '6', '7', '8'].includes(order.status) && !isLogisticses" class="cancel" @tap="navigateToMiniProgram(order.logisticsOrderSn)">查看物流</button>
          <button v-if="['5'].includes(order.status)" class="pay" @tap="confirmReceipt">确认收货</button>
        </view>
      </view>
    </view>

     <!-- 推荐官达标弹框 -->
    <shoppingSuccessPopup :show="shoppingVisible" @action="actionShoppingPopoup"/>

    <!-- 支付弹窗 -->
    <pay-popup :visible.sync="payPopupVisible" :balance="myBalance" :price="order.totalAmount" @confirm="confirmPay"></pay-popup>
  </view>
</template>

<script>
import {
  order_img_pay, order_img_success,
  order_img_goods, order_img_car,
  order_img_cancle, icon_order_address,
  icon_complete, inside_shopping_icon_green,
  icon_order_box
} from '@/image-config'
import OrderGoods from '../components/order-goods'
import { getOrderById, cancelOrder, payOrder, signInOrder, rechargeCreate, rechargeDetails, payOrderByWallet } from '@/api/order'
import TYPES from '@/store/types'
import { mapGetters } from 'vuex'
import { orderDeliveryReminder, kd100AppId } from '@/config'
import shoppingSuccessPopup from '@/components/shopping-success-popup'
import { getDictionaryByCode } from '@/api/dictionary'
import { STANDARD_PRICE } from '@/const/dictionary'
import PayPopup from '@/pages/pay-popup/index'
import { getCouponNums } from '@/api/coupon'

export default {
  name: 'OrderDetail',
  components: { OrderGoods, shoppingSuccessPopup, PayPopup },
  data() {
    return {
      IMAGE: {
        icon_order_address,
        icon_order_box,
        inside_shopping_icon_green
      },
      orderSn: '', // 订单号
      order: {}, // 订单数据
      finished: false,
      countDownText: '', // 倒计时文案
      countDownTimeLength: '', // 倒计时时长
      shoppingVisible: false,
      isLogisticses: false,
      payPopupVisible: false,
      couponListId: null,
      myBalance: 0,
      checkInterval: null
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'customerUserInfo', 'standardPrice']),
    // 1:待付款 2:待发货 3:已取消 4:待收货 5:已完成
    orderStatus() {
      /**
      订单状态：（后台值）
      NEW("1", "初始"),
      PAY("2", "已付款"),
      CONFIRM("3", "已确认"),
      CANCEL("4", "已取消"),
      DELIVER("5", "已发货"),
      RECEIVE("7", "已签收"),
      FINISH("6", "已完成");

      显示逻辑：前台
      1.待支付：若该订单的结算方式为：现货现款，且订单状态为“初始==>1” ，则显示待支付”，右侧为对应的图标；
      2、待发货：若订单的状态为 已付款=2，已确认=3，则显示“待发货”；月结： 是否后付款 isDeliveryNopay && 初始=1
      4、待收货：若该订单状态为“已发货”，则显示“待收货”；
      5、已签收：若该订单状态为“已签收”，则显示“已签收”；
      6、已完成：若该订单状态为“已完成”，则显示“已完成”；
      7、已取消：若该订单状态为“已取消”，则显示“已取消”
      8、部分发货：若该订单状态为“已取消”，则显示“部分发货”
       * */
      const map = {
        1: { text: '待支付', img: order_img_pay },
        2: { text: '待发货', img: order_img_car },
        3: { text: '待发货', img: order_img_car },
        4: { text: '已取消', img: order_img_cancle },
        5: { text: '待收货', img: order_img_goods },
        6: { text: '已完成', img: icon_complete },
        7: { text: '已签收', img: order_img_success },
        8: { text: '部分发货', img: order_img_goods }
      }
      const { isDeliveryNopay, status } = this.order
      if ((isDeliveryNopay && status === '1') || status === '2' || status === '3') {
        return { text: '待发货', img: order_img_car }
      }
      return map[status] || {}
    },
    // 订单商品sku总数
    skuCount() {
      const arr = this.order.orderItems || []
      return arr.reduce((prev, cur) => prev + cur.skuQuantity, 0)
    },
    // 物流信息
    logisticses() {
      let info = {}
      const arr = this.order.logisticses || []
      if (arr.length) {
        info = arr[0]
      }
      return info
    },
    // 支付信息
    payInfos() {
      let info = {}
      const arr = this.order.payInfos || []
      if (arr.length) {
        const type = {
          cash: '账户余额',
          check: '支票',
          wechatpay: '微信支付',
          alipay: '支付宝支付'
        }
        info = arr[0]
        info.payTypeName = type[info.payType]
      }
      return info
    },
    isInsideActivity() {
      return this.order.type === 'INNER_BUY'
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderSn = options.id
      this.init()
    }
  },
  methods: {
    timeDataChange(e) {
      const timeData = e.detail
      if (this.order.status === '1') {
        this.countDownText = `还剩下${timeData.hours}小时${timeData.minutes}分自动取消`
      } else if (this.order.status === '5') {
        this.countDownText = `还剩下${timeData.days}天${timeData.hours}小时自动收货`
      }
    },
    init() {
      this.reset()
      uni.showLoading({ title: '加载中', mask: true })
      getOrderById(this.orderSn).then(({ result }) => {
        this.order = result
        let logisticsArray = []
        result.logisticses && result.logisticses.forEach(item => {
          logisticsArray = logisticsArray.concat(item.logisticsItems)
        });
        // 判断发货列表数量是否是多个对象、是则是 部分发货
        // 判断订单列表是否大于1个、并且与发货列表数量不想等、是则是 部分发货
        // data.status 8 则是部分发货
        if ((result.logisticses && result.logisticses.length > 1) || (result.orderItems.length > 1 && logisticsArray.lenth > 1 && logisticsArray.length !== result.orderItems.length) || result.status === 8) {
          this.isLogisticses = true
          if (result.notDeliveredItems && result.notDeliveredItems.length) {
            const notDeliveredItems = {
              logisticsItems: result.notDeliveredItems
            }
            this.order.logisticses = this.order.logisticses.concat(notDeliveredItems)
          }
        }
        const { isDeliveryNopay, status } = this.order
        if (status == '1' && isDeliveryNopay) return
        if (['1', '5'].includes(status)) {
          const timeKey = {
            1: 'voluntarilyCancelTime',
            5: 'voluntarilySignTime'
          }
          this.countDownTimeLength = result[timeKey[status]] - new Date().getTime()
        }
      }).finally(() => {
        uni.hideLoading()
      })
    },
    onCopy(content, toast) {
      uni.setClipboardData({
        data: content,
        success() {
          uni.showToast({ title: toast, icon: 'none' })
        }
      })
    },
    // 取消订单
    onCancel() {
      const tips = {
        1: '是否取消订单？',
        2: '是否取消订单?订单取消后,将会退款到您的账户余额。您可以使用余额支付新的订单，余额暂不支持提现。',
        3: '是否取消订单?订单取消后,将会退款到您的账户余额。您可以使用余额支付新的订单，余额暂不支持提现。'
      }
      uni.showModal({
        title: this.order.status == 1 ? '提示' : '是否取消订单?',
        content: tips[this.order.status],
        cancelText: '确认取消',
        confirmText: '想一想',
        confirmColor: '#10967B',
        cancelColor: '#b6bdc5',
        success: (t) => {
          if (t.cancel) {
            uni.showLoading({ title: '取消订单', mask: true })
            cancelOrder(this.order.orderSn).then(({ result }) => {
              this.init()
              uni.$emit(this.$eventName.CHANGE_ORDER_STATUS, { type: 'cancel', orderSn: this.order.orderSn })
            }).finally(() => {
              uni.hideLoading()
            })
          }
        }
      })
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
    // 余额充值后钱包支付
    async orderBalancePay() {
      // 如果当前的余额大于 当前订单金额则使用余额支付
      if (this.myBalance >= this.order.totalAmount) {
        uni.showLoading({ title: '加载中...', mask: true })
        payOrderByWallet({ orderSn: this.order.orderSn }).then(() => {
          uni.hideLoading()
          uni.showToast({
            title: '支付成功',
            icon: 'none'
          })
          if (this.isOpenShoppingPopup()) {
            this.shoppingVisible = true
          } else {
            this.init()
            uni.$emit(this.$eventName.CHANGE_ORDER_STATUS, { type: 'pay', orderSn: this.order.orderSn })
            this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
          }
        }).catch((e) => {
          uni.hideLoading()
          if (e && e.errMsg.includes('cancel')) return
          uni.showToast({ title: e.errMsg, icon: 'none' })
        }).finally(() => {
          this.finished = false
        })
      // 如果还不够则去充值余额
      } else if (this.order.totalAmount > this.myBalance) {
        this.orderBalanceRecharge()
      }
    },
    // 余额充值
    async orderBalanceRecharge() {
      try {
        uni.showLoading({ title: '加载中', mask: true })
        // 获取code 获取订单信息
        const code = await this.$store.dispatch('getWxCode');
        const price = (this.order.totalAmount - this.myBalance).toFixed(2)
        // 生成微信支付信息
        rechargeCreate({
          amount: price,
          code: code
        }).then(async({ result }) => {
          uni.hideLoading()
          // 完成后 检查 充值支付、检查充值状态、获取钱宝金额 再去吊起支付
          await this.$store.dispatch('requestPayment', { payment: result.wxPayMpOrderResult })
          this.checkBalanceStatus(result.recharge.id)
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
    // 去支付
    async orderWxPay() {
      if (this.finished) {
        return
      }
      this.finished = true
      uni.showLoading({ title: '加载中', mask: true })
      const code = await this.$store.dispatch('getWxCode')
      payOrder(this.order.orderSn, code).then(({ result }) => {
        const payment = result.wxPayMpOrderResult
        uni.hideLoading();
        // 吊起微信支付
        this.$store.dispatch('requestPayment', {
          payment: payment
        }).then(() => {
          if (this.isOpenShoppingPopup()) {
            this.shoppingVisible = true
          } else {
            this.$store.dispatch('fetchMessage', [orderDeliveryReminder])
            this.init()
            uni.$emit(this.$eventName.CHANGE_ORDER_STATUS, { type: 'pay', orderSn: this.order.orderSn })
            this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
          }
        }).catch((e) => {
          if (e && e.errMsg.includes('cancel')) return
          uni.showToast({ title: e.errMsg, icon: 'none' })
        }).finally(() => {
          this.finished = false
        })
      })
    },
    toGoodsDetail(item) {
      let url = `${this.$pageUrl.SPU}?spuId=${item.spuId}`
      if (this.isInsideActivity) {
        url = `${url}&page=inside_shopping_activity`
      }
      uni.navigateTo({
        url: url
      })
    },
    confirmReceipt() {
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
            signInOrder(this.order.orderSn).then(({ result }) => {
              uni.hideLoading();
              uni.showToast({
                title: '确认收货'
              });
              this.init()
            }).catch((e) => {
              uni.hideLoading();
              uni.showToast({
                title: e.message,
                duration: 2000,
                icon: 'none'
              });
            })
          }
        }
      });
    },
    navigateToMiniProgram(logisticsOrderSn) {
      uni.navigateToMiniProgram({
        appId: kd100AppId,
        path: `/pages/result/result?nu=${logisticsOrderSn}`
      })
    },
    reset() {
      this.order = {} // 订单数据
      this.finished = false
      this.countDownText = ''
    },
    // 是否需要打开推荐官弹窗
    isOpenShoppingPopup() {
      // 弹框逻辑： 非内购模式 、客户是否为非利润模式客户、购买前金额没有到标准200、超过两百不弹框
      if (!this.customerUserInfo || !this.customerUserInfo.attribute) return false
      const { distributorType, paidOrderSum } = this.customerUserInfo.attribute
      const currentPrice = this.order.totalAmount + paidOrderSum
      if (!this.isInsideActivity && distributorType === 'COMMISSION' && paidOrderSum <= this.standardPrice && currentPrice >= this.standardPrice) {
        return true
      }
    },
    // 关闭推荐官弹框事件
    async actionShoppingPopoup(type) {
      this.shoppingVisible = false
      this.$store.dispatch('fetchMessage', [orderDeliveryReminder])
      this.init()
      uni.$emit(this.$eventName.CHANGE_ORDER_STATUS, { type: 'pay', orderSn: this.order.orderSn })
      this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
      if (type === 'confirm') {
        const path = `${this.$pageUrl.WORKBENCH}?type=${this.customerUserInfo.attribute.distributorType}`
        uni.redirectTo({ url: path })
      }
    },
    fetchOrderSum() {
      // 如果vuex 没有获取
      if (!this.standardPrice) {
        getDictionaryByCode(STANDARD_PRICE).then(({ result }) => {
          this.$store.commit(TYPES.SET_ORDER_SUM, result.value)
        })
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.order-detail-page{
  height: 100vh;
  display: flex;
  flex-direction: column;
  .content-container{
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20rpx;
  }
  .pay-status-container{
    height: 126px;
    background-color: #54C77B;
    position: relative;
    .content{
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-left: 80rpx;
      padding-right: 60rpx;
      position: relative;
      top: -14px;
    }
  }
  .address-container{
    background-color: #ffffff;
    border-radius: 10px;
    padding: 30rpx 28rpx;
    display: flex;
    align-items: center;
    position: relative;
    top: -26px;
  }
  .bottom-container{
    background-color: #ffffff;
    padding: 28rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: calc(28rpx+ constant(safe-area-inset-bottom)); //兼容 IOS<11.2
    padding-bottom: calc(28rpx + env(safe-area-inset-bottom)); //兼容 IOS>11.2
    .action-btn{
      display: flex;
      button{
        width: 90px;
        height: 32px;
        line-height: 32px;
        border-radius: 22px;
        font-size: 28rpx;
        margin-left: 24rpx;
      }
      .cancel{
        border: 0.5px solid $uni-color-gray;
        background-color: transparent;
        color: $uni-color-gray;
      }
      .pay{
        border: 1px solid $uni-color-theme;
        background-color: $uni-color-theme;
        color: #ffffff;
      }
    }
  }
  .goods-container{
    background-color: #ffffff;
    border-radius: 10px;
  }
  .order-info-container{
    background-color: #ffffff;
    border-radius: 10px;
    padding: 0 28rpx;
    margin-top: 20rpx;
  }
  .copy-btn{
    display: inline-block;
    width: 38px;
    height: 17px;
    line-height: 17px;
    background-color: rgba(16, 150, 123, 0.1);
    border-radius: 20px;
    color: $uni-color-theme;
    font-size: 22rpx;
    border: none;
    padding: 0;
    text-align: center;
  }
}
.lookLogistics {
  color:#FF7640;
  padding: 6rpx 20rpx;
  text-align: center;
  border-radius: 44rpx;
  border: 1px solid #FF7640;
  font-size: 28rpx;
}
</style>
