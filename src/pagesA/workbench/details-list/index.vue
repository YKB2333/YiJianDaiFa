<template>
  <view>
    <view class="order-item" v-for="item in orderList" :key="item.orderSn">
      <!-- order-header -->
      <view class="plr28 relative">
        <view class="row space-between center-y ptb32 hairline-bottom">
          <view class="fs28 fw500 fc-black">
            <view class="fw500"  @tap="onCopy(item.orderSn, '订单号已复制')">订单号：{{ item.orderSn }}</view>
          </view>
          <view>
            <text :class="['fs28 fw500', ORDER_STATUS[item.orderStatus].class]">{{ ORDER_STATUS[item.orderStatus].label }}</text>
          </view>
        </view>
      </view>
      <!-- goods content -->
      <view>
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
          <view class="fc-money fs28">{{ currentTableKey === 'HAVE_ALREADY_SETTLED' ? '收益' : '预计收益' }}：¥{{ item.profitAmount | toThousandFilter }}</view>
          <view class="row space-between fs24 center-y">
            <image :src="item.customerHead || IMAGE['big_logo']" mode="widthFix" class="w70 h70 radius mr8"/>
            <text style="max-width:170rpx;" class="ellipsis">{{ item.customerName }}</text>
          </view>
        </view>
      </view>
    </view>
    <empty-box
      :loading="query.loading"
      :finished="query.finished"
      :error="query.error"
      :is-empty="orderList.length === 0 && query.finished"
      :image="IMAGE['order_none']"
      label="暂无相关订单哦～"
      img-class="w430 h340 mt80"
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
import OrderGoodsMultiple from '@/pages/order/components/order-goods-multiple'
import OrderGoods from '@/pages/order/components/order-goods'
import EmptyBox from '@/components/empty-box'
import BaseEmpty from '@/components/BaseEmpty';
import { mapGetters } from 'vuex'
import { order_none, big_logo } from '@/image-config'
import { distributionPage } from '@/api/workbench'
import { ORDER_STATUS } from '@/const/order-status';

export default {
  name: 'work-order-list',
  components: {
    OrderGoods, EmptyBox, BaseEmpty, OrderGoodsMultiple
  },
  data() {
    return {
      IMAGE: {
        order_none,
        big_logo
      },
      ORDER_STATUS: ORDER_STATUS,
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
      currentTableKey: '', //默认key
      // 订单列表
      orderList: []
    }
  },
  onLoad(options) {
    const { type, batchNo } = options
    if (!type || !batchNo) {
      uni.showToast({
        title: '查询参数丢失、请稍后重试',
        duration: 2000,
        icon: 'none'
      });
      uni.navigateBack();
      return
    }
    uni.setNavigationBarTitle({
      title: this.currentTableKey === 'IN_THE_SETTLEMENT' ? '结算中订单明细' : '已结算订单明细'
    })
    this.currentTableKey = type
    this.query.batchNo = batchNo
    this.onChangeStatus()
    this.loadList()
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  methods: {
    loadList() {
      const { loading, finished, error } = this.query
      if (loading || finished || error) return
      this.query.loading = true
      const api = {
        IN_TRADING: distributionPage,
        CAN_BE_SETTLED: distributionPage,
        IN_THE_SETTLEMENT: distributionPage,
        HAVE_ALREADY_SETTLED: distributionPage
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
      }).catch(err => {
        this.query.error = true
      }).finally(() => {
        this.query.loading = false
      })
    },
    onTabsChange({ detail }) {
      this.currentTableKey = detail.name
      this.reset()
      this.onChangeStatus()
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
    },
    reset() {
      this.orderList = []
      this.query.pageIndex = 1
      this.query.loading = false
      this.query.finished = false
      this.query.error = false
    },
    onErrorClick() {
      this.query.error = false
      this.loadList()
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
/deep/ .empty-class {
  height: calc(100vh - 88px);
  margin-top: 10px;
}
/deep/ .van-tabs__line {
  background: #FF7640 !important;
}
.order-item {
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
