<template>
  <view>
    <!-- 分享资讯 富文本 -->
    <view v-html="info.content"></view>
    <!-- 分享资讯商品 -->
    <view class="bg-white col center mt20 pb40 pt26 text-center" @click="linkPageType" v-if="activity && Object.keys(activity).length">
      <image :src="IMAGE['client_icon_gift']" mode="widthFix" class="w152 h70"/>
      <view style="border: 3px solid #DAB87B;" class="mlr40">
        <view class="mt64 mb20 fw500 fs36">{{ activity.title }}</view>
        <view class="icon-arrow">
          <text class="line"></text>
          <text class="triangle"></text>
          <text class="line"></text>
        </view>
        <view class="mt40">
          <image :src="activity.titleImage" mode="widthFix" class="w424 h320"/>
        </view>
        <view class="mt40 fs24 fc-white btn radius8 ptb4 plr10" style="display: inline-block">
          {{ activity.tag }}
        </view>
        <view class="mtb20 row center-y center">
          <text class="fs46 fw500 fc-money mr6">¥{{ activity.price }}</text>
          <text class="fc-grey fs24" style="text-decoration:line-through">¥{{ activity.originalPrice }}</text>
        </view>
        <view class="btn fc-white radius44 ptb20 plr50" style="display: inline-block">
          {{ activity.button }}
        </view>
        <view class="text-center fs24 fc-grey plr70 ptb30">
          {{ activity.tips }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { cmsInfoIds } from '@/config'
import { getInfoById } from '@/api/cms'
import { client_icon_gift } from '@/image-config'
import { linkPage } from '@/utils'
import { getDictionaryByCode } from '@/api/dictionary'
import { WXMP_NEW_GIFT_BAG_ACTIVITY } from '@/const/dictionary'

export default {
  name: 'new-gift-bag',
  data() {
    return {
      IMAGE: {
        client_icon_gift
      },
      activity: {},
      info: {}
    }
  },
  onLoad(options) {
    this.fetchCmsInfo()
  },
  methods: {
    fetchCmsInfo() {
      uni.showLoading({
        title: '加载中'
      });
      getInfoById(cmsInfoIds.new_gift_bag).then(({ result }) => {
        this.info = result
        uni.hideLoading();
      })
      getDictionaryByCode(WXMP_NEW_GIFT_BAG_ACTIVITY).then(({ result }) => {
        this.activity = JSON.parse(result.value)
        uni.hideLoading();
      })
    },
    linkPage,
    linkPageType() {
      const data = this.activity
      if (!data) return
      // 如果是有跳转类型的、有跳转链接的
      if (data.infoKeyword && data.skipUrl) {
        // 特殊处理一下https请求的
        if (data.infoKeyword == 'https') {
          uni.navigateTo({
            url: `${this.$pageUrl.HTTPS_PAGE}?url=${data.skipUrl}`
          })
          return
        }
        // 普通跳转路由
        this.linkPage(data.infoKeyword, data.skipUrl)
        return
      }
      if (data.content) {
        // 默认跳转资讯类型
        this.linkPage('navigateTo', this.$pageUrl.INFORMATION, `id=${data.id}`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.richText {
  overflow: hidden;
  width: 90%;
  margin: 0 auto;
  margin-top: 0.8rem;
  font-size: 15px;
  font-weight: 400;
  color: rgba(57, 60, 65, 1);
  line-height: 30px;
}
.icon-arrow{
  display: flex;
  justify-content: center;
  .line {
    height: 2px;
    width: 112rpx;
    background: #242629;
  }
  .triangle {
    width: 0;
    height: 0;
    border-top: 5px solid #242629;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    margin: 0 5px;
  }
}
.btn {
  background: #DAB87B;
}
</style>