<template>
  <view>
    <van-tabs
      :active="currentTableKey"
      @change="onTabsChange"
      color="#FF7640"
      line-width='25'
      sticky
    >
      <van-tab
        v-for="tab in tabList"
        :key="tab.key"
        :title="tab.title"
        :name="tab.key"
      >
        <view v-if="orderTips && Object.keys(orderTips).length && userInfo && tab.key" class="fs24 plr28 ptb16" style="color:#C7CACF">{{ orderTips[userInfo.distributorType][tab.key] }}</view>
        <view class="order-item" v-for="(item, index) in orderList" :key="index" @click="linkPage(item)">
          <!-- order-header -->
          <view class="plr28 relative">
            <view v-if="['IN_TRADING', 'CAN_BE_SETTLED'].includes(tab.key)" class="row space-between center-y ptb32 hairline-bottom">
              <view class="fs28 fw500 fc-black">
                <view class="fw500" @tap="onCopy(item.orderSn, '订单号已复制')">订单号：{{ item.orderSn }}</view>
              </view>
              <view>
                <text :class="['fs28 fw500', ORDER_STATUS[item.orderStatus].class]">{{ ORDER_STATUS[item.orderStatus].label }}</text>
              </view>
            </view>
            <view v-if="isSettlementType" class="row space-between center-y ptb32 hairline-bottom">
              <view class="fs28">结算时间：{{ item.applyTime | formatDate('Y-M-D') }}</view>
              <van-icon name="arrow"/>
            </view>
          </view>
          <!-- goods content -->
          <view v-if="['IN_TRADING', 'CAN_BE_SETTLED'].includes(tab.key)">
            <view>
              <order-goods
                res-type="order"
                v-if="item.distributionDetailWxVos.length === 1"
                :sku="item.distributionDetailWxVos[0]"
                :border="false"
              />
              <order-goods-multiple
                v-if="item.distributionDetailWxVos.length > 1"
                :skus="item.distributionDetailWxVos"
              />
            </view>
            <!-- goods tips -->
            <view class="text-right fs24 fc-grey pr28 pb30">
              <text>共{{ item.skuNumber }}件  合计：¥{{ item.totalAmount }}</text>
            </view>
            <view class="plr28 row space-between center-y ptb30 hairline-bottom hairline-top">
              <view class="fc-money fs28">预计收益：¥{{ item.profitAmount | toThousandFilter }}</view>
              <view class="row space-between fs24 center-y">
                <image :src="item.customerHead || IMAGE['big_logo']" mode="widthFix" class="w70 h70 radius mr8"/>
                <text style="max-width:170rpx;" class="ellipsis">{{ item.customerName }}</text>
              </view>
            </view>
          </view>
          <!-- order-process -->
          <view v-if="isSettlementType" class="row space-between ptb60 order-process">
            <view class="flex-1 text-center col">
              <text class="fs26 fc-grey">订单数</text>
              <text class="fs56 fc-black mt16">{{ item.orderNumber | toThousandFilter }}</text>
            </view>
            <view class="flex-1 text-center col">
              <text class="fs26 fc-grey">收益金额</text>
              <text class="fs56 fc-black mt16">{{ item.profitAmount | toThousandFilter }}</text>
            </view>
          </view>
        </view>
      </van-tab>
    </van-tabs>

    <view v-if="['IN_TRADING', 'CAN_BE_SETTLED'].includes(currentTableKey)" class="footerFixed hairline-top">
      <view v-if="currentTableKey === 'IN_TRADING'" class="fc-grey fs24">共计：订单数<text class="fc-money fw500">{{ orderTotal.orderNumber || 0 }}笔</text>，预计收益总额 <text class="fc-money fw500">¥{{ orderTotal.profitAmountTotal || 0 }}</text></view>
      <view v-if="currentTableKey === 'CAN_BE_SETTLED'" class="row center-y space-between w-full">
        <view class="col" style="line-height: initial">
          <text>预计收益总额：<text class="fc-money fw500 fs28">¥{{ orderTotal.profitAmountTotal || 0 }}</text></text>
          <text>订单数：<text class="fc-money fw500">{{ orderTotal.orderNumber || 0 }}笔</text></text>
        </view>
        <!-- 每月22～30号可申请结算一次 时间不符合或次数超过1次则按钮置-->
        <view :class="['btn', {'disabled': !orderTotal.isApplyFor }]" @click="confirmOver" >申请结算</view>
      </view>
    </view>

    <empty-box
      :loading="query.loading"
      :finished="query.finished"
      :error="query.error"
      :is-empty="orderList.length === 0 && query.finished"
      :image="IMAGE['order_none']"
      label="暂无相关订单哦～"
      img-class="w430 h340 mt198"
      @error-click="onErrorClick"
      empty-class="empty-class"
    >
       <view slot="finished">
        <base-empty />
      </view>
    </empty-box>
  </view>
</template>

<script>
import OrderGoods from '@/pages/order/components/order-goods'
import OrderGoodsMultiple from '@/pages/order/components/order-goods-multiple'
import EmptyBox from '@/components/empty-box'
import BaseEmpty from '@/components/BaseEmpty';
import { mapGetters } from 'vuex'
import { order_none, big_logo } from '@/image-config'
import { distributionPage, distributionTotal, distributionCloseFee, distributionCloseRecord } from '@/api/workbench'
import { ORDER_STATUS } from '@/const/order-status';
import { WORKBENCH_ORDER_TIPS } from '@/const/dictionary'
import { getDictionaryByCode } from '@/api/dictionary'
import { authentication } from '@/mixins/auth'

export default {
  name: 'work-order-list',
  components: {
    OrderGoods,
    OrderGoodsMultiple,
    EmptyBox,
    BaseEmpty
  },
  mixins: [authentication],
  data() {
    return {
      IMAGE: {
        order_none,
        big_logo
      },
      ORDER_STATUS: ORDER_STATUS,
      tabList: [
        {
          title: '交易中',
          key: 'IN_TRADING'
        },
        {
          title: '待结算',
          key: 'CAN_BE_SETTLED'
        },
        {
          title: '结算中',
          key: 'IN_THE_SETTLEMENT'
        },
        {
          title: '已结算',
          key: 'HAVE_ALREADY_SETTLED'
        }
      ],
      query: {
        loading: false,
        error: false,
        finished: false,
        batchNo: '',
        orderStr: '',
        pageIndex: 1,
        pageSize: 10,
        status: '', // INVALID => 无效, IN_TRADING => 交易中, CAN_BE_SETTLED => 可结算, IN_THE_SETTLEMENT => 结算中, HAVE_ALREADY_SETTLED => 已结算
        applyStatus: '' // APPLYING, HAVE_ALREADY_SETTLED
      },
      currentTableKey: 'IN_TRADING', //默认key
      // 订单列表
      orderList: [],
      orderTotal: {}, // 订单总计
      orderTips: {}
    }
  },
  onLoad(options) {
    if (options.type) {
      this.currentTableKey = options.type
    }
    this.fetchWorkbenchTips()
    this.onChangeStatus()
    this.loadList()
    this.fetchOrderTotal()
  },
  computed: {
    ...mapGetters(['userInfo']),
    isSettlementType() {
      return ['IN_THE_SETTLEMENT', 'HAVE_ALREADY_SETTLED'].includes(this.currentTableKey)
    }
  },
  methods: {
    loadList() {
      const { loading, finished, error } = this.query
      if (loading || finished || error) return
      this.query.loading = true
      const api = {
        IN_TRADING: distributionPage,
        CAN_BE_SETTLED: distributionPage,
        IN_THE_SETTLEMENT: distributionCloseRecord,
        HAVE_ALREADY_SETTLED: distributionCloseRecord
      }
      api[this.currentTableKey](this.query).then(({ result }) => {
        const data = result.list || []
        // 这里为了兼容goods-item组件、其实就是我懒嘻嘻
        data.forEach(item => {
          if (item.distributionDetailWxVos && item.distributionDetailWxVos.length) {
            item.distributionDetailWxVos.forEach(e => { e.resType = 'order' })
          }
        });
        this.orderList = this.orderList.concat(data)
        if (data.length === 0 || this.orderList.length < this.query.pageSize) {
          this.query.finished = true
          return
        }
        this.query.pageIndex += 1
        this.query.error = false
      }).catch(() => {
        this.query.error = true
      }).finally(() => {
        this.query.loading = false
      })
    },
    // 获取订单总计算
    fetchOrderTotal() {
      distributionTotal({
        closeStatus: this.currentTableKey
      }).then(({ result }) => {
        this.orderTotal = result
      })
    },
    // 切换table 监听
    onTabsChange(e) {
      if (e && e.detail) {
        this.currentTableKey = e.detail.name
      }
      this.reset()
      this.onChangeStatus()
      this.fetchOrderTotal()
      this.loadList()
    },
    onChangeStatus() {
      const map = {
        INVALID: 'INVALID',
        IN_TRADING: 'IN_TRADING',
        CAN_BE_SETTLED: 'CAN_BE_SETTLED',
        IN_THE_SETTLEMENT: 'IN_THE_SETTLEMENT',
        HAVE_ALREADY_SETTLED: 'HAVE_ALREADY_SETTLED'
      }
      this.query.status = map[this.currentTableKey]
      if (this.isSettlementType) {
        const status = {
          IN_THE_SETTLEMENT: 'APPLYING',
          HAVE_ALREADY_SETTLED: 'HAVE_ALREADY_SETTLED'
        }
        this.query.applyStatus = status[this.currentTableKey]
      }
    },
    reset() {
      this.orderList = []
      this.orderTotal = {}
      this.query.pageIndex = 1
      this.query.loading = false
      this.query.finished = false
      this.query.error = false
    },
    // 点击错误刷新
    onErrorClick() {
      this.query.error = false
      this.loadList()
    },
    // 提价结算
    confirmOver(data) {
      uni.showModal({
        title: '提示',
        content: '是否结算？',
        confirmText: '结算',
        confirmColor: '#10967B',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '加载中',
              mask: true
            });
            distributionCloseFee().then(({ result }) => {
              this.onTabsChange()
              uni.hideLoading();
              uni.showToast({
                title: '提交成功',
                duration: 2000,
                icon: 'none'
              });
            }).catch((error) => {
              uni.hideLoading();
              uni.showToast({
                title: error.message || '提交失败、请稍后再试',
                duration: 2000,
                icon: 'none'
              });
            })
          }
        }
      });
    },
    // 获取字典的通知
    fetchWorkbenchTips() {
      getDictionaryByCode(WORKBENCH_ORDER_TIPS).then(({ result }) => {
        this.orderTips = JSON.parse(result.value)
      })
    },
    linkPage(item) {
      if (this.isSettlementType) {
        const path = `${this.$pageUrl.WORKBENCH_DETAILS_LIST}?type=${this.currentTableKey}&batchNo=${item.batchNo}`
        uni.navigateTo({
          url: path
        });
      }
    },
    onCopy(content, toast) {
      uni.setClipboardData({
        data: content,
        success() {
          uni.showToast({ title: toast, icon: 'none' })
        }
      })
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
}
/deep/ .van-tabs__line {
  background: #FF7640 !important;
}
@media screen and (min-width: 375px) and (max-height: 812px) {
  .footerFixed {
    padding-bottom: 44rpx !important;
    padding-top: 30rpx !important;
  }
}
.footerFixed {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120rpx;
  line-height: 120rpx;
  padding: 0 28rpx;
  background: white;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #71767D;
  background: white;
  z-index: 999;
  .btn {
    color: white;
    background: #FF7640;
    font-size: 28rpx;
    line-height: initial;
    padding: 16rpx 34rpx;
    border-radius: 44rpx;
  }
}
.disabled {
  pointer-events: none;
  opacity: 0.6;
}
.order-item{
  background: white;
  border-radius: 20rpx;
  margin-top: 20rpx;

  .border{
    border-bottom: 1px solid #F0F1F2;
  }
}
.order-process {
  position: relative;
  &::after{
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1px;
    height: 60rpx;
    background: #F4F4F4;
  }
}

</style>
