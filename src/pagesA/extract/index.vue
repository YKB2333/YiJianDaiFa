<template>
  <view class="page">
    <view class="bg-white m28 radius16 plr40 ptb60">
      <view class="fs28 mb48">提现金额</view>
      <view class="row pb32" style="border-bottom:1rpx solid #F0F1F2">
        <text class="fs60">¥</text>
        <input
          :value="money"
          @input="({detail:{value}}) => removerSpaces(value)"
          @blur="() => removerSpaces(String(Number(money)))"
          type="digit"
          :class="['flex-1 h80 l-h80 fs80 ml10', {'warningTips': money > bonus}]"
        >
        <view class="w60 row center" @click.stop="clearMoney">
          <van-icon name="clear" color="#8a8a8a" v-show="money"/>
        </view>
      </view>
      <view v-if="money > bonus" :class="['fs24 fc-grey mt28', {'warningTips': money > bonus}]">{{ tips['warning'] }}</view>
      <view v-else class="fs24 fc-grey mt28">
        <view class="mb4">可提现金额¥{{ bonus }}, <text class="ml16" style="color: #5A6E97" @click="onClickAllExtract(bonus)">全部提现</text></view>
        <view>{{ tips['primary'] }}</view>
      </view>
      <view class="row center mt48" @click="submit">
        <view :class="['btn', { 'disabled': !money || (money > bonus || money <= 0) }]">提现</view>
      </view>
    </view>
    <!-- 邀请记录 -->
    <view class="bg-white m28 radius16 hidden">
      <van-tabs
        :active="query.operateType"
        color="#FF7640"
        line-width='25'
        @change="onTabsChange"
      >
        <van-tab v-for="tab in tabList" :key="tab.key" :title="tab.title" :name="tab.key"></van-tab>
      </van-tabs>
      <!-- table item 为什么不放入van-tab 因为不想渲染两次 -->
      <view class="mt6">
        <view class="plr28 row mt48 center-y" v-for="(item, index) in recordList" :key="index">
          <view>
            <image :src="item.head || IMAGE['big_logo']" mode="widthFix" class="w88 h88 radius mr16 hidden"/>
          </view>
          <view class="col flex-1 hidden">
            <text class="fs28 ellipsis">{{ item.name }}</text>
            <text class="fs24 fc-grey mt4">{{ item.createDate  | formatDate('Y-M-D h:m:s') }}</text>
          </view>
          <view :class="['fs28 fw600', {'fc-money': query.operateType === 'GAIN'}]">{{ query.operateType === 'GAIN' ? `+${item.amount}` : item.amount }}</view>
        </view>
      </view>
      <empty-box
        :loading="query.loading"
        :finished="query.finished"
        :error="query.error"
        :is-empty="recordList.length === 0 && query.finished"
        :image="IMAGE[tabList.find(e => e.key === query.operateType).empty]"
        :label="tabList.find(e => e.key === query.operateType).tips"
        img-class="w430 h340 mt20"
        empty-class="p100"
      >
        <view slot="finished" >
          <base-empty />
        </view>
      </empty-box>
    </view>
  </view>
</template>

<script>
import EmptyBox from '@/components/empty-box'
import BaseEmpty from '@/components/BaseEmpty';
import { big_logo, money_null, reward_null } from '@/image-config'
import { withdraw, bonusPage, withdrawGet } from '@/api/reward'
import { WXMP_EXTRACT_TIPS } from '@/const/dictionary'
import { getDictionaryByCode } from '@/api/dictionary'
export default {
  name: 'rights',
  data() {
    return {
      IMAGE: {
        big_logo, money_null, reward_null
      },
      money: '',
      bonus: 0,
      options: {},
      invitation_tips: {},
      recordList: [],
      tips: {},
      query: {
        loading: false,
        error: false,
        finished: false,
        operateType: 'WITHDRAW',
        pageIndex: 1,
        pageSize: 10
      },
      tabList: [
        {
          title: '提现记录',
          key: 'WITHDRAW',
          empty: 'money_null',
          tips: '暂无提现记录哦~'
        },
        {
          title: '奖励收入记录',
          key: 'GAIN',
          empty: 'reward_null',
          tips: '暂无奖励收入哦~'
        }

      ]
    }
  },
  components: {
    EmptyBox, BaseEmpty
  },
  onLoad(options) {
    this.options = options
    this.init()
    this.loadList()
    this.fetchExtractTips()
  },
  methods: {
    init() {
      withdrawGet().then(({ result }) => {
        if (result) {
          this.bonus = result.bonus || 0
        }
      })
    },
    loadList() {
      const { loading, finished, error } = this.query
      if (loading || finished || error) return
      this.query.loading = true
      bonusPage(this.query).then(({ result }) => {
        const data = result.list || []
        this.recordList = this.recordList.concat(data)
        if (data.length === 0 || this.recordList.length < this.query.pageSize) {
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
    reset() {
      this.recordList = []
      this.query.pageIndex = 1
      this.query.loading = false
      this.query.finished = false
      this.query.error = false
    },
    // tab 切换
    onTabsChange(e) {
      if (e && e.detail) {
        this.query.operateType = e.detail.name
      }
      this.reset()
      this.loadList()
    },
    onClickAllExtract(value) {
      this.money = value
    },
    submit() {
      if (!this.money || (this.money > this.bonus || this.money <= 0)) return
      uni.showLoading({
        title: '提现中',
        mask: true
      });
      withdraw({
        amount: Number(this.money)
      }).then((result) => {
        this.money = ''
        this.init()
        this.onTabsChange()
        uni.hideLoading();
        uni.showToast({
          title: '提现成功',
          duration: 2000
        });
      }).catch((error) => {
        uni.hideLoading();
        uni.showToast({
          title: error.message || '提现失败、请稍后再试',
          duration: 2000,
          icon: 'none'
        });
      })
    },
    clearMoney() {
      this.money = ''
    },
    clearNumber(value) {
      value = value.replace(/[^\d.]/g, ''); //清除"数字"和"."以外的字符
      value = value.replace(/^\./g, ''); //验证第一个字符是数字
      value = value.replace(/\.{2,}/g, '.'); //只保留第一个, 清除多余的
      value = value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
      value = value.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
      if (value.indexOf('.') < 0 && value != '') { //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
        if (value.substr(0, 1) == '0' && value.length == 2) {
          value = parseFloat(value);
        }
      }
      return value
    },
    // 清除空格\字符
    removerSpaces(value) {
      const clearNumber = this.clearNumber(value)
      if (clearNumber !== value) {
        this.money = null
        this.$nextTick(() => { this.money = clearNumber })
      } else {
        this.money = value
      }
    },
    fetchExtractTips() {
      getDictionaryByCode(WXMP_EXTRACT_TIPS).then(({ result }) => {
        this.tips = JSON.parse(result.value)
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
  background-color: #F6F6F6;
  .btn {
    width: 240rpx;
    height: 72rpx;
    line-height: 72rpx;
    background: #FF7640;
    border-radius: 36rpx;
    color: white;
    text-align: center;
    font-size: 28rpx;
  }
}
.disabled {
  pointer-events: none;
  background: #F0F1F2 !important;
  color: #C7CACF !important;
}
.warningTips {
  color: #FA8181 !important;
}

</style>
