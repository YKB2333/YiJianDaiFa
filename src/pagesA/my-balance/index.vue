<template>
  <view>
    <view class="relative">
      <image :src="IMAGE['my_money_bg']" mode="widthFix" class="w-full"/>
      <view class="head">
        <view class="fs28 fw500 mb10">总金额(元)</view>
        <view class="fs72 fw500">{{ myAssets.balance | toThousandFilter(2, 7) }}</view>
      </view>
    </view>
    <view class="mlr28 radius16 hidden bg-white relative pt10" style="margin-top: -72rpx">
      <van-tabs
        :active="currentTableKey"
        @change="onTabsChange"
        color="#FF7640"
        line-width='25'
      >
        <van-tab v-for="tab in tabList" :key="tab.key" :title="tab.title" :name="tab.key"></van-tab>
        <view class="hairline-top h-full plr28">
          <view v-for="item in list" :key="item.id" class="row ptb40 center-y hairline-bottom">
            <view class="col flex-1 hidden">
              <text class="fs28 fw500">{{ `${tabList.find(e=>e.key === currentTableKey).subTitle} ${item.transactionSn}` }}</text>
              <text class="fs24 fc-grey mt4">{{ item.createDate | formatDate('Y-M-D h:m:s') }}</text>
            </view>
            <view :class="['fs28 fw600 row center-y', {'fc-money': item.changeAmount > 0}]">{{ item.changeAmount > 0 ? '+' : '' }}{{ item.changeAmount | toThousandFilter(2, 7) }}</view>
          </view>
        </view>
      </van-tabs>
      <empty-box
        :loading="query.loading"
        :finished="query.finished"
        :error="query.error"
        :is-empty="list.length === 0 && query.finished"
        :image="IMAGE[tabList.find(e => e.key === currentTableKey).empty]"
        :label="tabList.find(e => e.key === currentTableKey).tips"
        img-class="w430 h340 mt180"
        empty-class="empty-class mb180"
        @error-click="onErrorClick"
      >
        <view slot="finished">
          <base-empty />
        </view>
      </empty-box>
    </view>
    <view class="bottom-container">
      <view class="fc-grey flex-1">注:可到电脑端的"商家后台"进行充值</view>
      <button class="btn" @click="linkPage('CLIENT_WEB')">去电脑端使用</button>
    </view>
  </view>
</template>

<script>
import { big_logo, img_my_balance_null, my_money_bg } from '@/image-config'
import EmptyBox from '@/components/empty-box'
import BaseEmpty from '@/components/BaseEmpty'
import { balanceList } from '@/api/reward'
import { getCouponNums } from '@/api/coupon'

export default {
  name: 'myBalance',
  components: { EmptyBox, BaseEmpty },
  data() {
    return {
      IMAGE: {
        big_logo, img_my_balance_null, my_money_bg
      },
      currentTableKey: 'SALES_OUT',
      tabList: [
        {
          title: '支出记录',
          key: 'SALES_OUT',
          empty: 'img_my_balance_null',
          tips: '暂无支出记录哦～',
          subTitle: '销售出账交易单号'
        },
        {
          title: '充值记录',
          key: 'RECHARGE_INNER',
          empty: 'img_my_balance_null',
          tips: '暂无充值记录哦～',
          subTitle: '充值入账单号'
        },
        {
          title: '退款记录',
          key: 'REFUND_INNER',
          empty: 'img_my_balance_null',
          tips: '暂无退款记录哦～',
          subTitle: '销售退款入账单号'
        }
      ],
      query: {
        loading: false,
        error: false,
        finished: false,
        status: null,
        pageIndex: 1,
        pageSize: 10
      },
      list: [], // 订单列表
      myAssets: {}
    }
  },
  onLoad(options) {
    if (options.type) {
      this.currentTableKey = options.type
    }
    this.loadList()
    this.fetchCouponNums()
  },
  methods: {
    // 获取余额
    fetchCouponNums() {
      getCouponNums().then(({ result }) => {
        this.myAssets = result
      })
    },
    loadList() {
      const { loading, finished, error } = this.query
      if (loading || finished || error) return
      this.query.loading = true
      this.query.type = this.currentTableKey
      balanceList(this.query).then(({ result }) => {
        const data = result.list || []
        this.list = this.list.concat(data)
        if (data.length === 0 || this.list.length < this.query.pageSize) {
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
    // 切换table 监听
    onTabsChange({ detail }) {
      if (detail) {
        this.currentTableKey = detail.name
      }
      this.reset()
      this.loadList()
    },
    reset() {
      this.list = []
      this.query.bought = null
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
    // 跳转页面
    linkPage(path, params) {
      let url = `${this.$pageUrl[path]}`
      if (params) {
        url = `${url}?${params}`
      }
      uni.navigateTo({
        url: url
      });
    }
  },
  onReachBottom() {
    console.log('触发触底')
    this.loadList()
  }
}
</script>

<style lang="scss" scoped>
.head {
  position: absolute;
  left: 50%;
  top: 50rpx;
  transform: translate(-50%, 0);
  text-align: center;
  color: white;
}

/deep/ .van-hairline--top-bottom::after {
  border: none;
}

.fixedButtom {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  color: white;
  height: 120rpx;
  line-height: 120rpx;
  font-size: 28rpx;
  padding: 0 28rpx;
  background: white;
  box-sizing: border-box;
  .btn {
    padding: 8rpx 14rpx;
    background: #FF7640;
    border-radius: 44rpx;
  }
}

.bottom-container {
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: #ffffff;
  padding: 22rpx 28rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .btn {
    background-color: #FF7640;
    color: #ffffff;
    border-radius: 22px;
    font-weight: 600;
    padding: 22rpx 44rpx;
    font-size: 28rpx;
    line-height: 1;
    margin: 0;
  }
}
@media screen and (min-width: 375px) and (max-height: 812px) {
  .bottom-container {
    padding-bottom: 56rpx !important;
  }
}
</style>
