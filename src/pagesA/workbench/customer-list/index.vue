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
        <view class="bg-white mt20 radius10">
          <view class="order-item" v-for="(item, index) in list" :key="index">
            <view class="row center-y flex-1 hidden">
              <image :src="item.customerHead || item.visitorHead || IMAGE['big_logo']" mode="widthFix" class="w88 h88 radius mr16 hidden"/>
              <text class="fs32 flex-1 ellipsis">{{ item.customerName  || item.visitorName }}</text>
            </view>
            <view>
              <view class="col text-right" v-if="currentTableKey === 'purchased'">
                <text class="fs32">{{ item.paidOrderSum | toThousandFilter }}</text>
                <text class="fs24 fc-grey mt8">下单金额</text>
              </view>
              <view v-else class="fs24 fc-grey">{{ item.createDate | formatDate('Y-M-D h:m:s') }}</view>
            </view>
          </view>
        </view>
      </van-tab>
    </van-tabs>

    <empty-box
      :loading="query.loading"
      :finished="query.finished"
      :error="query.error"
      :is-empty="list.length === 0 && query.finished"
      :image="IMAGE[tabList.find(e => e.key === currentTableKey).empty]"
      :label="tabList.find(e => e.key === currentTableKey).tips"
      img-class="w430 h340 mt280"
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
import {
  order_none, big_logo, customer_shopping_null,
  customer_registered_null, customer_look_null
} from '@/image-config'
import EmptyBox from '@/components/empty-box'
import BaseEmpty from '@/components/BaseEmpty';
import { subordinatePage, visitorPage } from '@/api/workbench'
export default {
  name: 'work-order-list',
  components: { EmptyBox, BaseEmpty },
  data() {
    return {
      IMAGE: {
        order_none,
        big_logo,
        customer_shopping_null,
        customer_registered_null,
        customer_look_null
      },
      tabList: [
        {
          title: '已购买',
          key: 'purchased',
          empty: 'customer_shopping_null',
          tips: '您还没有购买客户哦~'
        },
        {
          title: '已注册',
          key: 'registered',
          empty: 'customer_registered_null',
          tips: '您还没有注册客户哦~'
        },
        {
          title: '浏览客户',
          key: 'browse_customers',
          empty: 'customer_look_null',
          tips: '您还没有浏览客户哦~'
        }
      ],
      query: {
        loading: false,
        error: false,
        finished: false,
        pageIndex: 1,
        pageSize: 10,
        bought: null
      },
      currentTableKey: 'purchased', //
      list: [] // 订单列表
    }
  },
  onLoad(options) {
    if (options.type) {
      this.currentTableKey = options.type
    }
    this.loadList()
  },
  methods: {
    loadList() {
      const { loading, finished, error } = this.query
      if (loading || finished || error) return
      this.query.loading = true
      const api = {
        purchased: subordinatePage,
        registered: subordinatePage,
        browse_customers: visitorPage
      }
      this.query.bought = this.currentTableKey === 'purchased'
      api[this.currentTableKey](this.query).then(({ result }) => {
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
    linkPage(item) {
      if (this.isSettlementType) {
        const path = `${this.$pageUrl.WORKBENCH_DETAILS_LIST}?type=${this.currentTableKey}&batchNo=${item.batchNo}`
        uni.navigateTo({
          url: path
        });
      }
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
.order-item {
  background: white;
  margin: 0 28rpx;
  border-bottom: 1px solid #F0F1F2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 0;
}
</style>
