import { mapGetters } from 'vuex'

export const authentication = {
  computed: {
    ...mapGetters(['userInfo', 'ncCode', 'isEnable', 'customerUserInfo']),
    userStatus() {
      // userCheckStatus 账号审批状态 ：NON 待审批, APPROVED 审批通过, REJECTED审批不通过
      const { customerId, userCheckStatus } = this.userInfo
      if (customerId && this.ncCode && this.isEnable && userCheckStatus === 'APPROVED') {
        return 'enable' // 启用
      } else if ((customerId && !this.ncCode && !this.isEnable) || (customerId && this.ncCode && !this.isEnable) || userCheckStatus === 'NON') {
        return 'underReview' // 审核中
      } else if ((!customerId && !this.isEnable && !this.ncCode) || userCheckStatus === 'REJECTED') {
        return 'notEnable' // 未认证
      } else if (customerId && !this.isEnable) {
        return 'disabled' // 禁用
      }
    },
    isPROFIT() {
      const { distributorType } = this.userInfo
      return distributorType === 'PROFIT'
    },
    isStrategy() {
      const { distributorType, customerGradeEnum } = this.userInfo
      if (distributorType && customerGradeEnum && customerGradeEnum === 'STRATEGY_CUSTOMER' && ['PROFIT', 'COMMISSION'].includes(distributorType)) {
        return distributorType
      }
      return false
    }
  },
  methods: {
    checkUserAuth() {
      if (['underReview', 'notEnable', 'disabled'].includes(this.userStatus)) {
        // 如果存在 customerId 并且没有ncCode => 审核中
        // 如果没有 customerId 则是没有注册过的用户 => 认证权益页面
        const pathName = this.userInfo.customerId ? 'CUSTOMER_DETAILS' : 'AUTH_RIGHTS'
        uni.navigateTo({
          url: `${this.$pageUrl[pathName]}`
        });
        return true
      }
      return false
    }
  }
}
