
<template>
  <view class="w-h-full" style="border-top:1px solid #f7f4f8">
    <view class="bg-white">
      <view class="wpct92 mauto" style="border-bottom:1px solid #f8f8f8">
        <view class="row center-y pt50">
          <image :src="IMAGE['icon_web_1']"  class="w44 h44 mr10"/>
          <text class="fs34">登录网址</text>
        </view>
        <view class="pt20 pb40 row">
          <text class="flex-1 textStyle mt8"  style="text-war;color:#72767E">{{ result.copyText }}</text>
          <view  @click="copyText" class="copyText">复制</view>
        </view>
      </view>
      <view class="wpct92 mauto">
        <view class="row center-y pt50">
          <image :src="IMAGE['icon_web_2']"  class="w44 h44 mr10"/>
          <text class="fs34">账号密码</text>
        </view>
        <view class="pt20 pb40 row">
          <text class="flex-1 textStyle"  style="text-war;color:#72767E">{{ result.Tips }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { CLIENT_WEB_DETAILS } from '@/const/dictionary'
import { getDictionaryByCode } from '@/api/dictionary'
import { icon_web_1, icon_web_2 } from '@/image-config.js'
export default {
  name: 'help',
  data() {
    return {
      result: {},
      IMAGE: {
        icon_web_1,
        icon_web_2
      },
      copyTextValue: 'http://df.ggjajggaplgfkd;pkf;//bp.chttp://df.ggjajggaplgfkd;pkf;//bp.c'
    };
  },
  components: {

  },
  created() {
  },
  mounted() {
    this.init()
  },
  onLoad(options) {
  },
  methods: {
    init() {
      getDictionaryByCode(CLIENT_WEB_DETAILS).then(({ result }) => {
        this.result = JSON.parse(result.value)
      })
    },
    copyText(e) {
      if (!this.result && !this.result.copyText) {
        wx.showToast({ title: '复制异常' })
        return
      }
      wx.setClipboardData({
        data: this.result.copyText,
        success: function(res) {
          wx.getClipboardData({
            success: function(res) {
              wx.showToast({ title: '网址已复制' })
            }
          })
        }
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.textStyle{
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  white-space: normal !important;
  // -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.copyText{
  width: 110rpx;
  height: 50rpx;
  line-height: 56rpx;
  background: #10967C;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 400;
  color: #FEFEFE;
  text-align: center;
  margin-left: 8px;
}
</style>