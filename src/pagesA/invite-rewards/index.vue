<template>
  <view class="page">
    <view v-if="ruleImage" class="row relative">
      <image :src="ruleImage" mode="widthFix" class="w-full"/>
      <view class="ruleDescription" @click="openRuleLisPopup" v-if="rule_explain && rule_explain.content">
        规则说明
        <van-icon name="arrow" color="#ffffff"/>
      </view>
    </view>
    <!-- 我的奖励 -->
    <view class="bg-white mlr28 mt16 radius16 hidden">
      <view class="title">
        <text class="title-text">我的奖励</text>
      </view>
      <view class="row space-between ptb60 reward">
        <view class="flex-1 text-center col center">
          <text class="fs26 fc-grey">邀请交易成功人数</text>
          <text class="fs28 mtb18"><text class="fs56 fw500">{{ userBonusCount.gainCount | toThousandFilter }}</text>人</text>
          <text class="btn w200 h60" @click="fetchMessage">立即邀请</text>
        </view>
        <view class="flex-1 text-center col center">
          <text class="fs26 fc-grey">获得奖励</text>
          <text class="fs28 mtb18"><text class="fs56 fw500">{{ userBonusCount.gainSum | toThousandFilter }}</text>元</text>
          <text class="btn w200 h60" v-if="userInfo && userInfo.isMaster" @click="linkPage('EXTRACT')">提现</text>
        </view>
      </view>
    </view>
    <!-- 邀请记录 -->
    <view class="bg-white m28 radius16 hidden">
      <view class="title">
        <text class="title-text">邀请记录</text>
      </view>
      <view class="mt8 col">
        <view class="plr28 row mt48 center-y" v-for="(item, index) in invitationRecordList" :key="index">
          <view>
            <image :src="item.customerHead || IMAGE['big_logo']" mode="widthFix" class="w88 h88 radius mr16 hidden"/>
          </view>
          <view class="col flex-1 hidden">
            <text class="fs28 ellipsis" >{{ item.customerName }}</text>
            <text class="fs24 fc-grey">{{ item.createDate | formatDate('Y-M-D h:m:s') }}</text>
          </view>
          <view :class="['fs24 flex-1 text-right', userStateMap[item.gained ? 'success' : 'await'].class]">{{ userStateMap[item.gained ? 'success' : 'await'].text }}</view>
        </view>
        <empty-box
          :loading="query.loading"
          :finished="query.finished"
          :error="query.error"
          :is-empty="invitationRecordList.length === 0 && query.finished"
          :image="IMAGE['customer_registered_null']"
          label="暂无邀请记录呦～"
          img-class="w430 h340 mt20"
          empty-class="p100"
        >
          <view slot="finished">
            <base-empty />
          </view>
        </empty-box>
      </view>
    </view>

    <!-- 规则说明 -->
    <van-popup
      :show="ruleListVisible"
      custom-style="width: 90%; background: transparent;"
    >
    <view class="w-full relative">
      <rich-text :nodes="rule_explain.content"></rich-text>
      <view @click="ruleListVisible = false" class="absolute pt30 pr30" style="right: 0;top: 0">
        <van-icon name="close" color="#ffffff" size="21px"/>
      </view>
      <view @click="ruleListVisible = false" class="absolute popup-btn" style="bottom:56rpx;left: 50%; transform: translate(-50%, 0);">我知道了</view>
    </view>
    </van-popup>
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
import { big_logo, reward_null, customer_registered_null } from '@/image-config'
import { cmsInfoIds, invitationResultNotice, rewardToAccountNotice } from '@/config'
import { getInfoById } from '@/api/cms'
import { bonusCount, invitationPage } from '@/api/reward'
import { mapGetters } from 'vuex'
import { save } from '@/mixins/save'
import { icon_close_black } from '@/image-config.js'

import EmptyBox from '@/components/empty-box'
import BaseEmpty from '@/components/BaseEmpty';
import { authentication } from '@/mixins/auth'

export default {
  name: 'reward',
  components: { EmptyBox, BaseEmpty },
  mixins: [authentication, save],
  data() {
    return {
      IMAGE: {
        big_logo,
        icon_close_black,
        reward_null,
        customer_registered_null
      },
      ruleImage: '',
      ruleListVisible: false,
      rule_explain: {},
      customStyle: 'position:absolute; left:-1000%;', // 海报样式
      sharePosterVisible: false, // 分享海报是否可见
      posterPath: '', // 海报图片地址
      userStateMap: {
        success: {
          class: 'success',
          text: '交易成功，获得奖励'
        },
        await: {
          class: 'await',
          text: '注册成功，等待交易'
        }
      },
      query: {
        loading: false,
        error: false,
        finished: false,
        pageIndex: 1,
        pageSize: 10
      },
      invitationRecordList: [],
      userBonusCount: {} // 我的奖励信息
    }
  },
  computed: {
    ...mapGetters(['posterTemplate', 'posterStrategy', 'posterRecommend', 'baseInfo', 'userInfo', 'customerUserInfo', 'standardPrice']),
    isStrategyType() {
      return this.isStrategy && this.isStrategy === 'PROFIT'
    },
    isPoster() {
      return Object.keys(this.posterStrategy).length || Object.keys(this.posterRecommend).length
    }
  },
  async onLoad(options) {
    this.fetchRuleExplain()
    this.init()
    this.loadList()
    // 获取海报对象、如果已经存在则取消
    if (!this.isPoster && !Object.keys(this.posterTemplate).length) {
      const apiName = this.isStrategyType ? 'fetchPosterStrategy' : 'fetchPosterRecommend'
      await this.$store.dispatch(apiName)
      const code = await this.$store.dispatch('fetchQrCode')
      await this.$store.dispatch('initSharePoster', {
        qrCode: code,
        isStrategy: this.isStrategyType
      })
    }
  },
  methods: {
    init() {
      bonusCount().then(({ result }) => {
        this.userBonusCount = result
      })
    },
    // 打开分享弹窗
    async openSharePopup() {
      if (!Object.keys(this.posterTemplate).length) {
        uni.showToast({ title: '缺少海报对象、生成海报失败', icon: 'none' })
        return
      }
      uni.showToast({
        title: '长按图片，可直接发送给好友',
        duration: 2000,
        icon: 'none'
      });
      this.sharePosterVisible = true
    },
    openRuleLisPopup() {
      this.ruleListVisible = true
    },
    linkPage(path) {
      if (this.rule_explain && this.rule_explain.keyword === 'invitationDisabled') {
        uni.showModal({
          content: this.rule_explain.infoKeyword || '次月22号可提现, 请耐心等候。',
          showCancel: false
        })
        return
      }
      uni.navigateTo({
        url: `${this.$pageUrl[path]}`
      });
    },
    fetchRuleExplain() {
      getInfoById(cmsInfoIds.rule_explain).then(({ result }) => {
        this.ruleImage = result.titleImage
        this.rule_explain = result
      })
    },
    //海报加载完
    onImgComplete(e) {
      this.posterPath = e.detail.path;
    },
    // 关闭分享海报弹框
    onCloseSharePoster() {
      this.sharePosterVisible = false
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
    loadList() {
      const { loading, finished, error } = this.query
      if (loading || finished || error) return
      this.query.loading = true
      invitationPage(this.query).then(({ result }) => {
        const data = result.list || []
        this.invitationRecordList = this.invitationRecordList.concat(data)
        if (data.length === 0 || this.invitationRecordList.length < this.query.pageSize) {
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
    }
  },
  onReachBottom() {
    this.loadList()
  }
}
</script>

<style lang="scss" scoped>
.page {
  background-color: #FFF5E6;
  .ruleDescription {
    position: absolute;
    display: flex;
    align-items: center;
    right: 0;
    top: 30rpx;
    color: white;
    font-size: 28rpx;
    background: linear-gradient(90deg, #FFC740 0%, #FF961E 100%);
    border-radius: 100rpx 0px 0px 100rpx;
    padding: 8rpx 20rpx;
  }
}
.title {
  position: relative;
  text-align: center;
  margin-top: 64rpx;
  margin-bottom: 14rpx;
  height: 20rpx;
}
.title-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;
  font-size: 34rpx;
  color: #242629;
  text-align: center;
  z-index: 99;
  font-weight: 500;
}
.title::before {
  content: '';
  position: absolute;
  width: 184rpx;
  height: 20rpx;
  background: #FFEADA;
  border-radius: 10rpx;
  left: 50%;
  top: 94%;
  transform: translate(-50%, 0%);
  z-index: 1;
}

.reward {
  position: relative;
  &::after{
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1px;
    height: 160rpx;
    background: #F4F4F4;
  }
  .btn {
    color: white;
    text-align: center;
    background: linear-gradient(180deg, #FFC191 0%, #FF8E58 100%);
    border-radius: 44rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 28rpx;
  }
}
.popup-btn {
  width: 360rpx;
  height: 72rpx;
  color: white;
  text-align: center;
  background: linear-gradient(124deg, #FFA95A 0%, #FF8757 100%);
  border-radius: 44rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
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
.success {
  color: #00B578;
}
.await {
  color: #FF7640;
}
</style>
