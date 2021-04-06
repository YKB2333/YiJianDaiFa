<template>
  <view class="pb120">
    <van-tabs
      :active="currenTabKey"
      @change="onTabsChange"
      color="#FF7640"
      line-width='25'
      sticky
    >
      <van-tab v-for="tab in tabList" :key="tab.key" :title="tab.title" :name="tab.key"></van-tab>
      <view v-for="(item, index) in list" :key="index">
        <coupon-item
          :value="item"
          parent-class="mt20 mb8"
          :application="item.application"
          :status="fetchCurrentStatus(item)"
          :price="item.faceAmount"
          :condition="`满${item.priceLimit}元可用`"
          name="全场通用"
          :time="`${formatDate(item.startTime, 'M月D日')}-${formatDate(item.endTime, 'M月D日')}有效`"
          :description="item.reason"
          @action="action"
        ></coupon-item>
      </view>
    </van-tabs>
    <empty-box
      :loading="query.loading"
      :finished="query.finished"
      :error="query.error"
      :is-empty="list.length === 0 && query.finished"
      :image="IMAGE[tabList.find(e => e.key === currenTabKey).empty]"
      :label="tabList.find(e => e.key === currenTabKey).tips"
      img-class="w400 h400 mt280"
      empty-class="empty-class bg-light-grey"
      @error-click="onErrorClick"
    >
      <view slot="finished">
        <base-empty />
      </view>
    </empty-box>
    <view class="fixedButton" @click="linkPage('RECEIVE')">领券中心>></view>
  </view>
</template>

<script>
import { big_logo, img_coupon_null } from '@/image-config'
import EmptyBox from '@/components/empty-box'
import BaseEmpty from '@/components/BaseEmpty'
import couponItem from '@/components/coupon-item'
import { getMyCoupon, getCouponNums } from '@/api/coupon'
import { formatDate } from '@/utils'
import { getDictionaryByCode } from '@/api/dictionary'
import { WXMP_COUPON_SHOP_CODE } from '@/const/dictionary'
import { checkInnerbuyStatus } from '@/api/order'
import { mapGetters } from 'vuex'
import TYPES from '@/store/types'

export default {
  name: 'couponIndex',
  components: { EmptyBox, BaseEmpty, couponItem },
  data() {
    return {
      IMAGE: {
        big_logo, img_coupon_null
      },
      tabStatusMap: {
        enable: '1',
        used: '2',
        expired: '3'
      },
      tabList: [
        {
          title: '未使用',
          key: 'enable',
          empty: 'img_coupon_null',
          tips: '暂时还没有未使用的优惠券哦～'
        },
        {
          title: '已使用',
          key: 'used',
          empty: 'img_coupon_null',
          tips: '暂时还没有已使用的优惠券哦～'
        },
        {
          title: '已过期',
          key: 'expired',
          empty: 'img_coupon_null',
          tips: '暂时还没有已过期的优惠券哦～'
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
      currenTabKey: 'enable',
      list: [], // 订单列表
      insideShopCode: ''
    }
  },
  computed: {
    ...mapGetters(['activityObject', 'userInfo'])
  },
  onLoad(options) {
    uni.$off(this.$eventName.COUPON_STATUS_REFRESH)
    uni.$on(this.$eventName.COUPON_STATUS_REFRESH, () => {
      this.reset()
      this.loadList()
      this.fetchCouponNums()
    })
    if (options.type) {
      this.currenTabKey = options.type
    }
    this.fetchCouponNums()
    this.loadList()
    this.fetchShopCdoe()
  },
  methods: {
    formatDate,
    // 获取优惠卷数量
    fetchCouponNums() {
      getCouponNums().then(({ result }) => {
        const tabNameMap = {
          unUse: 'enable',
          used: 'used',
          abanod: 'expired'
        }
        Object.keys(result).forEach(item => {
          const data = this.$options.data().tabList
          const status = this.tabList.find(e => e.key === tabNameMap[item])
          if (status) {
            status.title = `${data.find(e => e.key === tabNameMap[item]).title}(${result[item]})`
          }
        })
      })
    },
    loadList() {
      const { loading, finished, error } = this.query
      if (loading || finished || error) {
        return
      }
      this.query.loading = true
      this.query.status = this.tabStatusMap[this.currenTabKey]
      getMyCoupon(this.query).then(({ result }) => {
        const data = this.formatCoupon(result.list)
        this.list = this.list.concat(data)
        this.query.error = false
        if (data.length === 0 || this.list.length < this.query.pageSize) {
          this.query.finished = true
          return
        }
        this.query.pageIndex += 1
      }).catch(err => {
        console.log(err);
        this.query.error = true
      }).finally(() => {
        this.query.loading = false
      })
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
    // 切换table 监听
    onTabsChange({ detail }) {
      if (detail) {
        this.currenTabKey = detail.name
      }
      this.reset()
      this.loadList()
    },
    reset() {
      this.list = []
      this.query.pageIndex = 1
      this.query.loading = false
      this.query.finished = false
      this.query.error = false
    },
    linkPage(path) {
      uni.navigateTo({
        url: `${this.$pageUrl[path]}`
      });
    },
    // 点击错误刷新
    onErrorClick() {
      this.query.error = false
      this.loadList()
    },
    // 获取当前coupoon状态
    fetchCurrentStatus({ status }) {
      if (this.currenTabKey === 'enable') {
        return status ? this.currenTabKey : 'disabled'
      }
      return this.currenTabKey
    },
    // 默认跳转到首页
    async action(type, item) {
      if (type === 'enable') {
        if (item.couponShopVos && item.couponShopVos.length === 1 && item.couponShopVos[0].shopCode === this.insideShopCode) {
          if (!this.userInfo.innerPerson) {
            uni.showToast({ title: '非内购员工', duration: 2000, icon: 'none' });
            return
          }
          // 判断有无内购对象、如果没有重新请求
          if (this.activityObject && Object.keys(this.activityObject).length === 0) {
            await this.fetchInsideActivity()
          }
          if (!this.activityObject || this.activityObject.status !== 'STARTING') { //活动状态是 开始中
            uni.showToast({ title: '当前没有內购活动,请內购开始后使用', duration: 2000, icon: 'none' });
            return
          }
          uni.navigateTo({
            url: `${this.$pageUrl.GOODS_LIST}?title=内购活动&page=inside_shopping_activity`
          })
          return
        }
        uni.switchTab({
          url: `${this.$pageUrl.HOME}`
        });
      }
    },
    // 获取内购活动数据
    fetchInsideActivity() {
      return new Promise(async(resolve, reject) => {
        checkInnerbuyStatus().then(({ result }) => {
          this.$store.commit(TYPES.SET_INSIDE_SHOPPING_ACTIVITY, result)
          resolve(result)
        }).catch((e) => {
          this.goBack(e.message || '活动信息错误')
          reject(e)
        })
      })
    },
    //  获取内购店铺编码
    fetchShopCdoe() {
      getDictionaryByCode(WXMP_COUPON_SHOP_CODE).then(({ result }) => {
        this.insideShopCode = result && JSON.parse(result.value).inside_shop_code
      })
    }
  },
  onReachBottom() {
    this.loadList()
  }
}
</script>

<style lang="scss" scoped>
.fixedButton {
  position: fixed;
  bottom: 0;
  left: 0;
  background: white;
  color: #FF7640;
  font-size: 28rpx;
  text-align: center;
  width: 100%;
  height: 120rpx;
  line-height: 120rpx;
}
/deep/ .empty-class{
  height: calc(100vh - 88px);
}
/deep/ .van-tabs__line {
  background: #FF7640 !important;
}
</style>
