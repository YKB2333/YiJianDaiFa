<template>
  <view>
    <view v-if="activityCouponType === 'COUPON_CENTER'" class="row cneter">
      <image :src="banner.value" mode="widthFix" class="w-full"/>
    </view>
    <view v-for="(item, index) in list" :key="index">
      <coupon-item
        :application="item.application"
        :value="item"
        parent-class="mt20 mb8"
        :status="fetchCurrentStatus(item)"
        :price="item.couponValue"
        :condition="`满${item.amount}元可用`"
        name="全场通用"
        :time="`${formatDate(item.effectiveTime, 'M月D日')}-${formatDate(item.invalidTime, 'M月D日')}有效`"
        @action="action"
      ></coupon-item>
    </view>
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
  </view>
</template>

<script>
import { big_logo, img_coupon_null } from '@/image-config'
import EmptyBox from '@/components/empty-box'
import BaseEmpty from '@/components/BaseEmpty'
import couponItem from '@/components/coupon-item'
import { getDictionaryByCode } from '@/api/dictionary'
import { WXMP_COUPON_RECEIVE, WXMP_COUPON_SHOP_CODE } from '@/const/dictionary'
import { getCouponTemplateVo, acquire } from '@/api/coupon'
import { formatDate } from '@/utils'

export default {
  name: 'couponReceice',
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
      list: [], // 订单列表
      status: 'enable',
      banner: '',
      activityCouponType: 'COUPON_CENTER',
      shopCode: {},
      options: {}
    }
  },
  computed: {
    isInsideActivity() {
      return this.options.page === 'inside_shopping_activity'
    }
  },
  async onLoad(options) {
    this.options = options
    if (options.type) {
      this.activityCouponType = options.type
      uni.setNavigationBarTitle({
        title: options.title || '领取优惠券'//页面标题为路由参数
      })
      await this.fetchDictionary()
    }
    this.fetchBannber()
    this.loadList()
  },
  methods: {
    formatDate,
    // 获取字典内的红包图片
    fetchBannber() {
      getDictionaryByCode(WXMP_COUPON_RECEIVE).then(({ result }) => {
        this.banner = result && JSON.parse(result.value)
      })
    },
    loadList() {
      const { loading, finished, error } = this.query
      if (loading || finished || error) return
      this.query.loading = true
      const data = {
        activityCouponType: this.activityCouponType // 领券中心;
      }
      if (this.options.type) {
        data.shopCode = this.isInsideActivity ? this.shopCode.inside_shop_code : this.shopCode.shop_code
      }
      getCouponTemplateVo(data).then(({ result }) => {
        const data = this.formatCoupon(result)
        this.list = this.list.concat(data)
        this.query.finished = true
      }).catch(err => {
        this.query.error = true
      }).finally(() => {
        this.query.loading = false
      })
    },
    formatCoupon(data) {
      return data.map(item => {
        let application = null
        if (item.couponShopList && item.couponShopList.length) {
          application = item.couponShopList.map(item => {
            return item.shopName
          }).join('、')
        } else {
          item.application = '适用条件：全平台'
          return item
        }
        item.application = item.couponShopList && item.couponShopList.every(e => e.effective) ? `适用条件：${application}` : `不适用条件：${application}`
        return item
      })
    },
    // 点击错误刷新
    onErrorClick() {
      this.query.error = false
      this.loadList()
    },
    fetchCurrentStatus(item) {
      // 优惠券模板状态, 10=已创建, 20=已激活, 30=已停用, 40=已作废
      if (item.isReceive) {
        return 'received'
      }
      const map = {
        30: 'disabled',
        20: 'notReceived',
        40: 'expired'
      }
      return map[item.couponTemplateStatus]
    },
    action(type, item) {
      if (type === 'notReceived') {
        uni.showLoading({
          title: '领取中...',
          mask: true
        });
        acquire({
          activityId: item.activityId,
          couponTemplateId: item.id
        }).then(({ result }) => {
          this.list.find(e => e.id == item.id).isReceive = true
          uni.$emit(this.$eventName.COUPON_STATUS_REFRESH)
          uni.$emit(this.$eventName.COUPON_CAR_REFRESH)
          uni.hideLoading();
          uni.showToast({
            title: '领取成功',
            duration: 2000
          });
        }).catch(error => {
          uni.hideLoading();
          uni.showToast({
            title: error.message || '领取失败、请稍后重试',
            duration: 2000,
            icon: 'none'
          });
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
}
</script>

<style lang="scss" scoped>
/deep/ .empty-class{
  height: calc(100vh - 88px);
}
</style>
