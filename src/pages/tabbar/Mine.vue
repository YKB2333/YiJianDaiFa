<template>
  <view class="mine-page">
    <view class="header" :style="{ '--status-height': statusBarHeight, '--menu-button-height': menuButtonHeight }">
      <image :src="IMAGE['bg_mine']" mode="widthFix" class="bg-image"/>
      <view class="container">
        <view class="user-info">
          <view class="avatar-wrapper">
            <view class="image">
              <open-data type="userAvatarUrl"></open-data>
            </view>
          </view>
          <view class="info-wrapper" @click="nextPage('CUSTOMER_DETAILS')">
            <view class="col">
              <view :class="{'mb0': userStatus === 'enable'}">
                <open-data type="userNickName"></open-data>
              </view>
              <text v-if="userStatus === 'enable' && userInfo.mobile" class="tel fs28 fw500 mt10">{{ userInfo.mobile }}</text>
            </view>
            <!-- 审批中 -->
            <image v-if="userStatus === 'underReview'" :src="IMAGE['status_audit']" class="status-img" />
            <!-- 已认证 -->
            <image v-else-if="userStatus === 'enable'" :src="IMAGE['status_auth']" class="status-img" />
            <!-- 未认证 -->
            <image v-else-if="userStatus === 'notEnable'" :src="IMAGE['status_unauth']" class="status-img" />
          </view>
        </view>
      </view>
    </view>
    <view class="mine_tab" >
      <!-- 我的订单 -->
      <view v-if="tabList.length" class="radius20 bg-white">
        <view class="row space-between ptb24 mlr28 hairline-bottom" @tap="nextPage('ORDER')">
          <view class="fs32 fw500">我的订单</view>
          <view class="fs26 fc-grey row center-y">查看全部<van-icon name="arrow" color="#C7CACF"/></view>
        </view>
        <view class="row space-between ptb40 plr60 mb20">
          <view class="col center-y relative" v-for="item in tabList" :key="item.key" @tap="nextPage('ORDER', `?type=${item.key}`)">
            <image :src="item.icon" class="w-h48" />
            <text class="fs24 mt8 color-black">{{ item.title }}</text>
            <text class="info_number" v-if="orderNum(item.key) > 0">{{ orderNum(item.key) > 99 ? '99+' : orderNum(item.key) }}</text>
          </view>
        </view>
      </view>

      <!-- 我的资产 -->
      <view class="radius20 bg-white">
      <view class="row space-between ptb24 mlr28 hairline-bottom">
          <view class="fs32 fw500">我的资产</view>
        </view>
        <view class="myBalance">
          <view class="item mr10" @click="nextPage('COUPON')">
            <view><text class="fs36 fw500 mr2">{{ myAssets.unUse || 0 }}</text>张</view>
            <view class="mt8">优惠券</view>
            <image :src="IMAGE['mine_coupon_left']" mode="heightFix" class="icon h90"/>
          </view>
          <view class="item ml10" @click="nextPage('MY_BALANCE')">
            <view><text class="fs36 fw500 mr2">{{ myAssets.balance | toThousandFilter(2, 7) }}</text></view>
            <view class="mt8">我的余额</view>
            <image :src="IMAGE['mine_balance_right']" mode="heightFix" class="icon h90"/>
          </view>
        </view>
      </view>

      <!-- 员工内购 倒计时-->
      <view v-if="isShowCountDown && countDownTimeLength && insideActivityVisible && userStatus === 'enable'" class="w-full radius20 hidden bg-white mb20 row relative" @click="handleNextPage">
        <image :src="IMAGE['mine_inner_shopping']" mode="widthFix" class="w-full"/>
        <view class="downTime">
          <van-count-down use-slot :time="countDownTimeLength" @change="timeDataChange" @finish="isShowCountDown = false">
            <view class="fs26 fc-white" >
              距结束仅剩
              <text class="item">{{ time.days }}</text>天
              <text class="item">{{ time.hours }}</text>时
              <text class="item">{{ time.minutes }}</text>分
              <text class="item">{{ time.seconds }}</text>秒
            </view>
          </van-count-down>
        </view>
      </view>

      <!-- 我的工具 -->
      <view class="radius20 bg-white">
        <view class="row space-between ptb24 mlr28 hairline-bottom">
          <view class="fs32 fw500">我的工具</view>
        </view>
        <view class="toolBox">
          <view class="item" @click="nextPage('WORKBENCH')">
            <image :src="IMAGE['mine_customer_work']" class="w-h48"/>
            <text class="title">{{ workStatus.label }}</text>
            <text class="tips" style="right: -26rpx" v-if="workStatus.value">{{ workStatus.value }}</text>
          </view>
          <view class="item" @click="nextPage('RECEIVE')">
            <image :src="IMAGE['icon_coupon']" class="w-h48"/>
            <text class="title">{{ '领券中心' }}</text>
          </view>
          <view class="item" @click="nextPage('GROUND_GOODSD')">
            <image :src="IMAGE['icon_shop']" class="w-h48"/>
            <text class="title">{{ '上架商品' }}</text>
          </view>
          <view class="item" @click="nextPage('CUSTOMER_DETAILS')">
            <image :src="getAuthIcon" class="w-h48"/>
            <text class="title">{{ '认证资料' }}</text>
            <text class="tips authTips" v-if="userStatus !== 'enable'">{{ userStatusText }}</text>
          </view>
          <view class="item" @click="nextPage('CLIENT_WEB')">
            <image :src="IMAGE['icon_client']" class="w-h48"/>
            <text class="title">{{ '商家后台' }}</text>
          </view>
          <view class="item" @click="nextPage('MY_FAVORITE')">
            <image :src="IMAGE['icon_favorite']" class="w-h48"/>
            <text class="title">{{ '我的收藏' }}</text>
          </view>
          <view class="item" @click="nextPage('ADDRESS_LIST')">
            <image :src="IMAGE['mine_address']" class="w-h48"/>
            <text class="title">{{ '我的地址' }}</text>
          </view>
          <view class="item" @click="nextPage('HELP')">
            <image :src="IMAGE['icon_help']" class="w-h48"/>
            <text class="title">{{ '帮助中心' }}</text>
          </view>
          <view class="item" @click="nextPage('ABOUT_ZS')">
            <image :src="IMAGE['icon_zs']" class="w-h48"/>
            <text class="title">{{ '关于众上' }}</text>
          </view>
        </view>
      </view>
    </view>
    <!-- 获取授权弹窗 -->
    <auth-popup :visible.sync="authPopupVisible"/>
  </view>
</template>

<script>
import {
  bg_mine, status_audit, status_auth, status_unauth,
  icon_auth, icon_favorite, icon_zs, icon_shop,
  icon_help, icon_client, mine_address, mine_customer_work,
  icon_coupon, icon_auth_not_enable, mine_inner_shopping,
  mine_coupon_left, mine_balance_right
} from '@/image-config.js'
import { mapGetters } from 'vuex'
import { ORDER_TAB_LIST } from '@/const/order'
import { getUserOrderCount, checkInnerbuyStatus } from '@/api/order'
import TYPES from '@/store/types'
import { authentication } from '@/mixins/auth'
import { getDictionaryByCode } from '@/api/dictionary'
import { STANDARD_PRICE } from '@/const/dictionary'
import authPopup from '@/pages/auth/auth-popup';
import { getCouponNums } from '@/api/coupon'

export default {
  name: 'Mine',
  mixins: [authentication],
  components: { authPopup },
  data() {
    return {
      IMAGE: {
        bg_mine,
        status_audit,
        status_auth,
        status_unauth,
        icon_auth,
        icon_favorite,
        icon_zs,
        icon_shop,
        icon_help,
        icon_client,
        mine_address,
        mine_customer_work,
        icon_coupon,
        icon_auth_not_enable,
        mine_inner_shopping,
        mine_coupon_left,
        mine_balance_right
      },
      tabList: [], // tab 5个选择
      orderNumResult: {},
      insideActivityVisible: false, // 内购活动开关
      paidOrderSum: -1,
      authPopupVisible: false,
      countDownTimeLength: '', // 倒计时时长
      time: null,
      isShowCountDown: false,
      myAssets: {} // 我的余额
    }
  },
  computed: {
    ...mapGetters(['statusBarHeight', 'menuButtonHeight', 'userInfo', 'customerUserInfo', 'shareInvitationCode']),
    userStatusText() {
      const userStatusMap = {
        enable: '已认证',
        underReview: '审核中',
        notEnable: '未认证',
        disabled: '已禁用'
      }
      return userStatusMap[this.userStatus]
    },
    workStatus() {
      const data = {
        PROFIT: {
          label: '贸易官',
          value: ''
        },
        COMMISSION: {
          label: '推荐官',
          value: `${this.userInfo.comissionRate}%返现`
        },
        COMMISSION_NOT: {
          label: '推荐官',
          value: ''
        }
      }
      // 战略客户类型+利润模式才是客户
      if (this.isStrategy && this.isStrategy === 'PROFIT') {
        return data.PROFIT
      } else if (this.userInfo.distributorType === 'COMMISSION') {
        return data.COMMISSION
      } else {
        return data.COMMISSION_NOT // // 防备是一般客户但是又是佣金模式的问题
      }
    },
    invitationCode() {
      if (this.customerUserInfo && this.customerUserInfo.attribute && this.customerUserInfo.attribute.invitationCode) {
        return this.customerUserInfo.attribute.invitationCode
      }
      return false
    },
    getAuthIcon() {
      return this.IMAGE[this.userStatus === 'enable' ? 'icon_auth' : 'icon_auth_not_enable']
    }
  },
  onShow() {
    this.getWxUserInfo()
    this.getInnerActivityState()
    this.init()
    this.fetchCouponNums()
  },
  methods: {
    // 获取优惠卷数量or余额
    fetchCouponNums() {
      if (this.userStatus === 'enable') {
        getCouponNums().then(({ result }) => {
          this.myAssets = result
        })
      }
    },
    timeDataChange(e) {
      this.time = e.detail
    },
    init() {
      // 用户订单列表 只有认证才能显示
      if (this.userStatus === 'enable') {
        const { settleMethod } = this.userInfo
        const orderTableMap = {
          月结: ['notPay', 'all'],
          现款现货: ['all', 'success'],
          default: ['all', 'success']
        }
        const notShownArray = orderTableMap[settleMethod] || orderTableMap.default
        this.tabList = ORDER_TAB_LIST.filter(e => !notShownArray.includes(e.key))

        // 获取订单数量
        getUserOrderCount().then(({ result }) => {
          this.orderNumResult = result
        })
        // 获取订单比较额度
        getDictionaryByCode(STANDARD_PRICE).then(({ result }) => {
          this.paidOrderSum = result.value
          this.$store.commit(TYPES.SET_ORDER_SUM, result.value)
        })
      }
    },
    // 获取用户授权
    handleNextPage() {
      this.nextPage('GOODS_LIST', '?title=内购活动&page=inside_shopping_activity')
    },
    nextPage(page, query) {
      const auth = ['CUSTOMER_INFO', 'CUSTOMER_DETAILS', 'MY_FAVORITE', 'GROUND_GOODSD',
        'WORKBENCH', 'COUPON', 'MY_BALANCE', 'RECEIVE', 'ADDRESS_LIST']
      const notEnable = ['underReview', 'notEnable', 'disabled']
      let path = this.$pageUrl[page]
      // 跳转数组页面、并且状态为启用 =》 跳转认证页面
      if (auth.includes(page) && notEnable.includes(this.userStatus)) {
        const pathName = this.userInfo.customerId ? 'CUSTOMER_DETAILS' : 'AUTH_RIGHTS'
        this.linkPage(`${this.$pageUrl[pathName]}`)
        return
      }
      // 如果是跳转工作台页面
      if (page === 'WORKBENCH') {
        const { distributorType, paidOrderSum } = this.customerUserInfo.attribute
        path = `${this.$pageUrl[page]}?type=${distributorType}`
        // 如果是推荐官、并且消费金额达到200则进入推荐官页面、否则进入新人推荐官礼品页面
        if (!this.isStrategy && paidOrderSum < this.paidOrderSum) {
          path = this.$pageUrl.NEW_GIFT_BAG
        }
        this.linkPage(path)
        return
      }
      // 如果有参数
      if (query) {
        path = `${this.$pageUrl[page]}${query}`
      }
      this.linkPage(path)
    },
    linkPage(path) {
      uni.navigateTo({ url: path })
    },
    orderNum(key) {
      // 全部，已完成不显示红点
      const map = {
        // 'all': 'allNum',
        notPay: 'noPayNum',
        notDelivered: 'deliverNum',
        unreceived: 'noReceiveceNum'
        // 'success': 'successNum'
      }
      const k = map[key]
      return this.orderNumResult[k] || 0
    },
    getWxUserInfo() {
      //通过邀请码进入的才可以弹框 凸^-^凸
      if (this.shareInvitationCode && this.userInfo && !this.userInfo.userHead && this.userInfo.userId) {
        this.authPopupVisible = true
      }
    },
    async getInnerActivityState() {
      if (!this.userInfo || !this.userInfo.customerId) return
      const userBaseInfo = await this.$store.dispatch('getBaseInfo')
      if (userBaseInfo && userBaseInfo.innerPerson && this.userStatus === 'enable') {
        checkInnerbuyStatus().then(({ result }) => {
          this.$store.commit(TYPES.SET_INSIDE_SHOPPING_ACTIVITY, result)
          this.insideActivityVisible = (result && result.status === 'STARTING')
          this.countDownTimeLength = result && result.endTime - new Date().getTime()
          this.isShowCountDown = true
        }).catch(error => {
          this.insideActivityVisible = false
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  .header {
    position: relative;
    z-index: 1;
    .bg-image {
      width: 100%;
    }
    .container {
      position: absolute;
      left: 50%;
      width: 100%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .user-info {
      display: flex;
      padding: 20px 0 20px 16px;
    }
    .avatar-wrapper {
      background-color: #ffffff;
      border-radius: 50%;
      border: 6rpx solid rgba(255, 255, 255, 0.5);
      width: 140rpx;
      height: 140rpx;
      .image {
        overflow:hidden;
        width: 140rpx;
        height: 140rpx;
        border-radius: 50%;
      }
    }
    .info-wrapper {
      display: flex;
      flex: 1;
      justify-content: space-between;
      align-items: center;
      padding-left: 16px;
      view {
        color: #242629;
        font-size: 18px;
        font-weight: 600;
      }
      .status-img {
        width: 160rpx;
        height: 50rpx;
      }
    }
    .tel {
      color: #959CA7;
    }
  }
  .mine_tab {
    position: relative;
    border-radius: 20px;
    margin-top: -116rpx;
    padding: 0 28rpx;
    z-index: 2;
    overflow: hidden;
    background-color: #F5F5F5;
  }
}
.info_number {
  position: absolute;
  top: -15rpx !important;
  right: -10rpx !important;
  background: #ff3838;
  border-radius: 10px;
  color: white;
  font-size: 12px;
  text-align: center;
  min-width: 38rpx;
  min-height: 38rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 3px;
  box-sizing: border-box;
  border: 2rpx solid #FFFFFF;
}
.top0 {
  top: 0px !important;
}

.toolBox {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx 28rpx;
  margin-bottom: 30rpx;
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    width: 25%;
    padding: 24rpx 0;
  }
  .title {
    font-size: 24rpx;
    margin-top: 10rpx;
    color: #242629;
  }
  .tips {
    position: absolute;
    top: 0rpx !important;
    background: #ff3838;
    border-radius: 15px 15px 15px 0px;
    color: white;
    font-size: 12px;
    text-align: center;
    min-width: 16px;
    padding: 0 3px;
    box-sizing: border-box;
  }
  .authTips {
    background: linear-gradient(138deg, #FFA965 0%, #FD893E 100%);
    right: 0rpx ;
  }
}
.myBalance {
  display: flex;
  justify-content: space-between;
  padding: 40rpx 28rpx;
  margin-bottom: 20rpx;
  .item {
    border-radius: 28rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 28rpx;
    font-size: 24rpx;
    flex: 1;
    background: #F6F6F6;
    color:#393C41
  }
  .icon {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
.downTime {
  position: absolute;
  left: 50%;
  width: 100%;
  bottom: 30rpx;
  transform: translate(-50%, 0);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #FFECDB;
  text-shadow: 0px 2px 2px rgba(212, 19, 4, 0.83);
  .item {
    width: 30rpx;
    height: 30rpx;
    line-height: 30rpx;
    padding: 3rpx;
    margin: 0 4rpx;
    border-radius: 4rpx;
    font-size: 24rpx;
    text-align: center;
    align-items: center;
    background: #FFFFFF;
    color: #E04536;
    display: inline-block;
    text-shadow: none;
  }
}
@media screen and (min-width: 375px) and (max-height: 812px) {
  .container {
    padding-top: 20rpx;
  }
}
</style>
1
