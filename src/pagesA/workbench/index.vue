<template>
  <view class="page">
    <view v-if="(workbench && Object.keys(workbench).length) || isHightThanStandardPrice">
      <!-- 总计 -->
      <view class="header">
        <image :src="IMAGE['bg_top']" class="bg-image"/>
        <view class="container col space-between">
          <view class="row space-between">
            <view class="col">
              <view class="text-shadow fs26">{{ '可结算收益(元)' }}</view>
              <view class="fs50 mt10 fw500 text-shadow">
                {{ workbench.profitSum | toThousandFilter(2, 8) }}
              </view>
            </view>
            <view class="col text-right">
              <view class="text-shadow fs26">{{ '已结算收益(元)' }}</view>
              <view class="fs50 mt10 fw500 text-shadow">
                {{ workbench.finishProfit | toThousandFilter(2, 8) }}
              </view>
            </view>
          </view>
          <view class="h92 l-h92 tips-hairline-top text-shadow fs26" v-if="tips.header_tips">
            {{ tips.header_tips }}
          </view>
        </view>
      </view>
      <!-- 红包 -->
      <view class="row cneter" v-if="Object.keys(red_gift).length && userInfo && userInfo.distributorType === 'COMMISSION'"  @click="linkPage('INVITE_REWARDS')">
        <image :src="red_gift.value" mode="widthFix" class="w-full"/>
      </view>
      <!-- 7天、全部 -->
      <view class="mlr28 mb28 radius16 hidden" style="box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.05);">
        <van-tabs
          :active="currentTableKey"
          color="#FF7640"
          line-width='25'
          @change="onTabsChange"
        >
          <van-tab title="近7天" name="sevenDays"></van-tab>
          <van-tab title="全部" name="all"></van-tab>
          <view class="bg-white ptb40">
            <van-grid column-num="3" :border="false" :gutter="4">
              <van-grid-item
                v-for="(item, index) in tab_item_list"
                :key="index"
                use-slot
              >
                <view class="fc-money fs32" v-if="item.hasOwnProperty('isNotFilter') && item.isNotFilter">{{ item.value }}</view>
                <view class="fc-money fs32" v-else>{{ item.value | toThousandFilter(item.floatNumber) }}</view>
                <view class="fc-grey fs24 mt6">{{ item.label }}</view>
              </van-grid-item>
            </van-grid>
          </view>
          <view class="plr40 bg-white" v-if="tips.sum_tips">
            <view class="sum-hairline-top h92 l-h92 text-shadow fs24 fc-grey">
              {{ tips.sum_tips }}
            </view>
          </view>
        </van-tabs>
      </view>
      <!-- 明细 -->
      <view class="row m28 space-between">
        <view class="relative flex-1" @click="linkPage('WORKBENCH_ORDER_LIST')">
          <image :src="IMAGE['bg_order_details']" mode="widthFix" class="w-full mr10 radius18 hidden"  style="box-shadow: 5px 5px 10px -1px rgba(249, 204, 178, 0.4)"/>
          <view class="col absolute" style="left: 10%;top: 16%">
            <view class="fs26 fc-gray">推荐订单明细</view>
            <view class="fs24 fc-black mt14"><text class="fs36 fw500">{{ workbench.recommendedOrderNums | toThousandFilter }}</text>笔</view>
          </view>
        </view>
        <view class="relative flex-1" @click="linkPage('WORKBENCH_CUSTOMER_LIST')">
          <image :src="IMAGE['bg_customer']" mode="widthFix" class="w-full ml10 radius18 hidden"  style="box-shadow: 5px 5px 10px -1px rgba(204, 239, 237, 0.7)"/>
          <view class="col absolute" style="left: 10%;top: 16%">
            <view class="fs26 fc-gray">推荐客户明细</view>
            <view class="fs24 fc-black mt14"><text class="fs36 fw500">{{ workbench.recommendedCustomerNums | toThousandFilter }}</text>人</view>
          </view>
        </view>
      </view>
    </view>
    <!-- 缺省页 满200不显示 -->
    <empty-box
      v-else-if="finished"
      :is-empty="true"
      :image="IMAGE['customer_registered_null']"
      label="您还没推荐客户哦～"
      img-class="w430 h340 mt280"
      empty-class="empty-class">
    </empty-box>
    <!-- 分享按钮 -->
    <view class="row space-between share">
      <view class="btn col center fw500 copy-btn"  @click="copyInvitationCode">
        <text style="line-height: initial;" class="fs26" v-if="invitationCode">{{ invitationCode }}</text>
        <text style="line-height: initial;" class="fs26">复制邀请码</text>
      </view>
      <view class="btn" @click="fetchMessage">
        <view v-if="baseInfo && baseInfo.userHead">
          分享邀请海报
        </view>
        <button
          v-else
          @getuserinfo="fetchUserInfo"
          open-type="getUserInfo"
          class="removeDefaultClass fc-white fs32 fw600"
        >
          分享邀请海报
        </button>
      </view>
    </view>
    <!-- 分享海报弹框 -->
    <van-popup :show="sharePosterVisible" @close="onCloseSharePoster" custom-style="min-width: 80%; background: transparent">
      <view class="relative text-center">
        <!-- 海报图 -->
        <image v-if="posterPath" :src="posterPath" mode="widthFix" show-menu-by-longpress class="radius4" />
        <view v-else  class="ptb100 row center h-full bg-white">
          <van-loading size="24px">海报生成中...</van-loading>
        </view>
        <!-- 关闭按钮 -->
        <view class="absolute m28" style="right:0; top:0" @click="sharePosterVisible = false">
          <image :src="IMAGE['icon_close_black']" mode="widthFix" class="w44 h44"/>
        </view>
      </view>
      <view style="background: transparent" class="mt36 w-full">
        <view class="defaultButton w-full" @click="saveImage(posterPath)">保存到手机</view>
      </view>
    </van-popup>
    <!-- 生成海报对象 -->
    <painter
      :customStyle="customStyle"
      @imgOK="onImgComplete"
      :palette="posterTemplate"
    />
  </view>
</template>
<script>
import {
  bg_customer, bg_order_details, bg_top,
  icon_close_black, customer_registered_null
} from '@/image-config.js'
import { mapGetters } from 'vuex'
import { updateWxInfo } from '@/api/user'
import { save } from '@/mixins/save'
import TYPES from '@/store/types'
import { findWorkbenchData } from '@/api/workbench'
import EmptyBox from '@/components/empty-box'
import { getDictionaryByCode } from '@/api/dictionary'
import { WORKBENCH_INDEX_TIPS_LIST, WXMP_WORKBENCH_RED_REWARD, STANDARD_PRICE } from '@/const/dictionary'
import { authentication } from '@/mixins/auth'
import { invitationResultNotice, rewardToAccountNotice } from '@/config'

export default {
  name: 'workbench',
  data() {
    return {
      IMAGE: {
        bg_customer,
        bg_order_details,
        bg_top,
        customer_registered_null,
        icon_close_black
      },
      workbench: {}, // 工作台对象
      customStyle: 'position:absolute; left:-1000%;', // 海报样式
      options: {},
      tips: {},
      currentTableKey: 'sevenDays',
      sharePosterVisible: false, // 分享海报是否可见
      posterPath: '', // 海报图片地址
      qrCode: '',
      tab_item_list: {
        paidOrderSum: {
          label: '推荐销售额',
          value: 0
        },
        anticipatedProfit: {
          label: '预计收益',
          value: 0
        },
        paidOrderCount: {
          label: '已付款订单',
          floatNumber: 0,
          value: 0
        },
        visitorCount: {
          label: '分享访问人数',
          floatNumber: 0,
          value: 0
        },
        visitCount: {
          label: '分享访问次数',
          floatNumber: 0,
          value: 0
        }
      },
      refresh: false,
      finished: false,
      red_gift: {}
    }
  },
  components: {
    EmptyBox
  },
  mixins: [save, authentication],
  computed: {
    ...mapGetters(['posterTemplate', 'posterStrategy', 'posterRecommend', 'baseInfo', 'userInfo', 'customerUserInfo', 'standardPrice']),
    invitationCode() {
      if (this.customerUserInfo && this.customerUserInfo.attribute && this.customerUserInfo.attribute.invitationCode) {
        return this.customerUserInfo.attribute.invitationCode
      }
      return false
    },
    // 是否大于标准价格
    isHightThanStandardPrice() {
      if (!this.customerUserInfo || !this.customerUserInfo.attribute) return false
      const { paidOrderSum } = this.customerUserInfo.attribute
      return paidOrderSum >= this.standardPrice
    },
    isStrategyType() {
      return this.isStrategy && this.isStrategy === 'PROFIT'
    },
    isPoster() {
      return Object.keys(this.posterStrategy).length || Object.keys(this.posterRecommend).length
    }
  },
  async onLoad(options) {
    this.options = options
    uni.setNavigationBarTitle({
      title: this.isStrategyType ? '贸易官工作台' : '推荐官工作台'
    })
    // 获取海报对象、如果已经存在则取消
    if (!this.isPoster && !Object.keys(this.posterTemplate).length) {
      this.createdPoster()
    }
    this.init()
    this.fetchOrderSum()
  },
  methods: {
    init() {
      this.fetchWorkbench()
      this.fetchWorkbenchTips()
      this.fetchWorkbenchRedGift()
    },
    fetchWorkbench() {
      const data = {
        sevenDays: 1,
        all: 2
      }
      // 获取工作台信息
      findWorkbenchData(data[this.currentTableKey]).then(({ result }) => {
        const state = result && Object.keys(result).length && Object.keys(result).some(item => result[item])
        if (state) {
          this.workbench = result
          // 填充tab 对象数据
          Object.keys(result).forEach(item => {
            if (Object.prototype.hasOwnProperty.call(this.tab_item_list, item)) {
              this.tab_item_list[item].value = result[item]
            }
          })
          // 推荐官显示佣金比例
          if (!this.isStrategy && this.userInfo.distributorType === 'COMMISSION') {
            this.tab_item_list.comissionRate = {
              label: '我的佣金比例',
              isNotFilter: true,
              value: `${this.userInfo.comissionRate}%`
            }
          }
        }
      }).finally(() => {
        this.finished = true
        if (this.refresh) {
          // 如果开启了下拉刷新，结束下拉刷新
          uni.stopPullDownRefresh()
          this.refresh = false
        }
      })
    },
    // tab 切换
    onTabsChange({ detail }) {
      this.currentTableKey = detail.name
      this.tab_item_list = Object.assign({}, this.$options.data().tab_item_list) // 回复默认的tab对象
      this.fetchWorkbench()
    },
    linkPage(path) {
      uni.navigateTo({
        url: `${this.$pageUrl[path]}`
      });
    },
    // 初始化海报
    async createdPoster() {
      const apiName = this.isStrategyType ? 'fetchPosterStrategy' : 'fetchPosterRecommend'
      await this.$store.dispatch(apiName)
      const code = await this.$store.dispatch('fetchQrCode')
      await this.$store.dispatch('initSharePoster', {
        qrCode: code,
        isStrategy: this.isStrategyType
      })
    },
    //获取授权用户信息
    async fetchUserInfo({ detail }) {
      uni.hideLoading();
      if (detail.errMsg === 'getUserInfo:fail auth deny') {
        uni.showToast({ title: '授权失败', duration: 2000, icon: 'none' });
        return
      }
      updateWxInfo({
        userHead: detail.userInfo.avatarUrl,
        userName: detail.userInfo.nickName
      }).then(async({ result }) => {
        await this.$store.dispatch('getBaseInfo')
        await this.createdPoster() // 生成海报
        this.$nextTick(() => {
          this.openSharePopup()
        })
      })
    },
    // 获取用户授权
    fetchMessage() {
      return new Promise(async(resolve, reject) => {
        try {
          await this.$store.dispatch('fetchMessage', [invitationResultNotice, rewardToAccountNotice])
          this.openSharePopup()
        } catch (error) {
          this.openSharePopup()
        }
        resolve()
      })
    },
    // 打开分享弹窗
    async openSharePopup() {
      // 未授权
      if (!this.baseInfo.userHead) {
        uni.showLoading({
          title: '未获取授权',
          mask: true
        });
        return
      }
      if (!this.invitationCode) {
        uni.showToast({ title: '邀请码不存在', icon: 'none' })
        return
      }
      if (!this.posterPath) {
        uni.showLoading({
          title: '海报生成中',
          mask: true
        });
      }
      uni.showToast({
        title: '长按图片，可直接发送给好友',
        duration: 2000,
        icon: 'none'
      });
      this.sharePosterVisible = true
    },
    // 关闭分享海报弹框
    onCloseSharePoster() {
      this.sharePosterVisible = false
    },
    //海报加载完
    onImgComplete(e) {
      this.posterPath = e.detail.path;
      uni.hideLoading();
    },
    // 查看大图
    onPreviewImage(data) {
      uni.previewImage({
        urls: [data]
      })
    },
    // 复制邀请码
    copyInvitationCode() {
      if (!this.invitationCode) {
        uni.showToast({ title: '邀请码不存在', icon: 'none' })
        return
      }
      uni.setClipboardData({
        data: this.invitationCode,
        success: () => {
          uni.showToast({ title: '复制邀请码成功', icon: 'none' })
        },
        fail: () => {
          uni.showToast({ title: '复制失败，请重试', icon: 'none' })
        }
      })
    },
    // 获取字典内的提示
    fetchWorkbenchTips() {
      getDictionaryByCode(WORKBENCH_INDEX_TIPS_LIST).then(({ result }) => {
        this.tips = JSON.parse(result.value)
      })
    },
    // 获取字典内的红包图片
    fetchWorkbenchRedGift() {
      getDictionaryByCode(WXMP_WORKBENCH_RED_REWARD).then(({ result }) => {
        this.red_gift = JSON.parse(result.value) || {}
      })
    },
    // 获取字典 支付对比数额
    fetchOrderSum() {
      // 如果vuex 没有获取
      if (!this.standardPrice) {
        getDictionaryByCode(STANDARD_PRICE).then(({ result }) => {
          this.$store.commit(TYPES.SET_ORDER_SUM, result.value)
        })
      }
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.refresh = true
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.page {
  background-color: #F6F6F6;
  padding-bottom: 100rpx;
  .header {
    position: relative;
    z-index: 1;
    margin: 28rpx;
    color: white;
    height: 300rpx;
    box-shadow:0px 2px 11px 0px rgba(238, 148, 106,0.16),0px 1px 11px 0px rgba(238, 148, 106,0.58);
    .bg-image{
      width: 100%;
      height: 300rpx;
    }
    .container {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      box-sizing: border-box;
      padding: 60rpx 40rpx 0rpx 40rpx;
      .text-shadow {
        color: white;
        text-shadow: 0px 2px 8px rgba(255, 118, 64, 0.5);
      }
      .tips-hairline-top {
        border-top: 1rpx solid rgba(255,255,255, 0.5);
      }
    }
  }

  .share {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 2.3% 3%;
    box-sizing: border-box;
    background: white;
    .btn {
      color: white;
      text-align: center;
      font-size: 32rpx;
      font-weight: 600;
      border-radius: 60rpx;
      background: #FF7640;
      border: 1rpx solid #FF7640;
      width: 48%;
      height: 88rpx;
      line-height: 90rpx;
    }
  }
@media screen and (min-width: 375px) and (max-height: 812px) {
    .share {
      padding-bottom: 44rpx !important;
    }
  }
  .defaultButton {
    color: white;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 60rpx;
    width: 48%;
    height: 90rpx;
    line-height: 90rpx;
    background:#FFC53D
  }
}
.sum-hairline-top {
  border-top: 1rpx solid rgba(214, 214, 214, 0.5);
}
.removeDefaultClass {
  position: relative;
  line-height: inherit;
  background-color: transparent;
}
button::after{ border: none; }
/deep/ .van-tabs__line {
  background: #FF7640 !important;
}

/deep/ .empty-class{
  height: calc(100vh - 88px);
  margin-top: 10px;
}
/deep/ .van-grid-item__content {
  padding: 16rpx 16rpx;
}
.copy-btn {
  color: #FF7640 !important;
  background: white !important;
}
</style>
