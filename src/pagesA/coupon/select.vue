<template>
  <view class="page-container">
    <van-checkbox-group :value="checkLists">
      <view v-for="(item, index) in list" :key="index" @click="onSelectGoods(item)">
        <coupon-item
          :application="item.application"
          parent-class="mt20 mb8"
          :status="fetchCurrentStatus(item)"
          :price="item.faceAmount"
          :condition="`满${item.priceLimit}元可用`"
          name="全场通用"
          :time="`${formatDate(item.startTime, 'M月D日')}-${formatDate(item.endTime, 'M月D日')}有效`"
          :description="item.reason"
        >
          <template v-slot:button>
            <view class="mr30">
              <van-checkbox :value="checkLists.find(e => e === item.couponCodeId)" :disabled="false" checked-color="#10967B"></van-checkbox>
            </view>
          </template>
        </coupon-item>
      </view>
    </van-checkbox-group>
    <empty-box
      :loading="query.loading"
      :finished="query.finished"
      :error="query.error"
      :is-empty="list.length === 0 && query.finished"
      :image="IMAGE['img_coupon_null']"
      label="暂时还没有可领取的优惠券哦～"
      img-class="w400 h400 mt280"
      @error-click="onErrorClick"
      empty-class="empty-class"
    >
      <view slot="finished">
        <base-empty />
      </view>
    </empty-box>
    <view class="bottom-container hairline-top">
      <text class="price-text">
      </text>
      <button class="action-btn" @click="confirm">确定</button>
    </view>
  </view>
</template>

<script>
import {
  big_logo, img_coupon_null
} from '@/image-config'
import EmptyBox from '@/components/empty-box'
import BaseEmpty from '@/components/BaseEmpty'
import couponItem from '@/components/coupon-item'
import { formatDate } from '@/utils'
import { getMyCouponByOrder } from '@/api/coupon'
import { getDictionaryByCode } from '@/api/dictionary'
import { WXMP_COUPON_SHOP_CODE } from '@/const/dictionary'

export default {
  name: 'couponSelect',
  components: { EmptyBox, BaseEmpty, couponItem },
  data() {
    return {
      IMAGE: {
        big_logo, img_coupon_null
      },
      query: {
        loading: false,
        error: false,
        finished: false,
        pageIndex: 1,
        pageSize: 10
      },
      currentTableKey: 'notUsed',
      list: [], // 订单列表
      status: 'enable',
      banner: '',
      checkLists: [],
      options: {},
      shopCode: {}
    }
  },
  computed: {
    isInsideActivity() {
      return this.options.page === 'inside_shopping_activity'
    }
  },
  async onLoad(options) {
    this.options = options
    this.query.productAmount = options.number
    this.query.status = options.status
    await this.fetchDictionary()
    await this.loadList()
    if (options.couponListId) {
      setTimeout(() => {
        this.onSelectGoods({
          status: true,
          couponCodeId: options.couponListId
        })
      })
    }
  },
  methods: {
    formatDate,
    loadList() {
      return new Promise((resolve, reject) => {
        const { loading, finished, error } = this.query
        if (loading || finished || error) return
        this.query.loading = true
        this.query.shopCode = this.isInsideActivity ? this.shopCode.inside_shop_code : this.shopCode.shop_code
        getMyCouponByOrder(this.query).then(({ result }) => {
          resolve()
          const data = this.formatCoupon(result)
          this.list = this.list.concat(data)
          this.query.finished = true
        }).catch(err => {
          console.log(err);
          this.query.error = true
          reject()
        }).finally(() => {
          this.query.loading = false
        })
      })
    },
    // 点击错误刷新
    onErrorClick() {
      this.query.error = false
      this.loadList()
    },
    formatCoupon(data) {
      return data.map(item => {
        let application = null
        if (item.couponShopVos && item.couponShopVos.length) {
          application = item.couponShopVos.map(item => {
            return item.shopName
          }).join('、')
        } else {
          item.application = '适用条件：全平台'
          return item
        }
        item.application = item.couponShopVos && item.couponShopVos.every(e => e.effective) ? `适用条件：${application}` : `不适用条件：${application}`
        return item
      })
    },
    onSelectGoods(item) {
      if (!item.status) return
      const checkedIndex = this.checkLists.findIndex(e => e === item.couponCodeId)
      if (checkedIndex === -1) {
        this.checkLists = [item.couponCodeId]
      } else {
        this.checkLists.splice(checkedIndex, 1)
      }
      uni.$emit(this.$eventName.COUPON_ID_STATUS_REFRESH, this.checkLists[0])
    },
    fetchCurrentStatus({ status }) {
      return status ? 'enable' : 'disabled'
    },
    confirm() {
      uni.navigateBack();
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
}
</script>

<style lang="scss" scoped>
.bottom-container {
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: #ffffff;
  padding: 22rpx 28rpx;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/deep/ .empty-class {
  height: calc(100vh - 70px);
}
</style>
