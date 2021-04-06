<template>
  <view class="wrapper">
    <common-cart :page="options.page" ref="common-cart"/>
  </view>
</template>

<script>
import CommonCart from '../cart/common'
import { mapGetters } from 'vuex'
import { authentication } from '@/mixins/auth'
import { debounce } from '@/utils'
import TYPES from '@/store/types'

export default {
  name: 'Cart',
  components: { CommonCart },
  data() {
    return {
      options: {}
    };
  },
  onLoad(options) {
    uni.setNavigationBarTitle({
      title: options.title || '选品小车'//页面标题为路由参数
    })
    this.options = options
    this.$nextTick(() => {
      this.loadList()
      this.$refs['common-cart'].fetchCouponList()
    })
  },
  mixins: [authentication],
  computed: {
    ...mapGetters(['userInfo', 'CART_STATUS_REFRESH'])
  },
  onShow() {
    if (['notEnable', 'underReview', 'disabled'].includes(this.userStatus)) {
      const pathName = this.userInfo.customerId ? 'CUSTOMER_DETAILS' : 'AUTH_RIGHTS'
      uni.redirectTo({
        url: `${this.$pageUrl[pathName]}`
      });
      return
    }
    if (this.CART_STATUS_REFRESH.page_cart_status) {
      this.$nextTick(() => {
        this.loadList()
        this.$refs['common-cart'].fetchCouponList()
      })
      this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'page_cart')
    }
  },
  methods: {
    loadList: debounce(function() {
      this.$refs['common-cart'].loadList()
    }, 100)
  },
  onReachBottom() {
    this.$refs['common-cart'].loadList(false)
  }
};
</script>

<style lang="scss" scoped>
.wrapper{
  min-height: 100%;
}
</style>
