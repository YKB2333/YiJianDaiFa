
<template>
  <view id="page">
    <view class="caseTitle" v-if="info.title">
      <view>{{ info.title }}</view>
      <view ><text class="mr20 " v-if="info.source" style='color:#5B6A91;'>{{ info.source }}</text>{{ showRecentTime(info.createTimestamp) }}</view>
    </view>
    <view class="richText" v-html="info.content"></view>
    <van-toast id="van-toast" />
  </view>
</template>

<script>
import { showRecentTime } from '@/utils'
import { getInfoById } from '@/api/cms'

export default {
  name: 'information',
  components: {},
  data() {
    return {
      info: {
        title: '',
        source: ''
      }
    }
  },
  computed: {},
  created() {
  },

  mounted() {
  },
  methods: {
    showRecentTime
  },
  onLoad: function(option) {
    uni.showLoading({
      mask: true,
      title: '加载中'
    })
    getInfoById(option.id).then((result) => {
      uni.hideLoading()
      this.info = result.result
      uni.setNavigationBarTitle({
        title: this.info.title //页面标题为路由参数
      })
    }).catch(err => {
      uni.hideLoading()
      uni.showToast({
        title: err.message,
        duration: 2000,
        icon: 'none'
      });
    })
  }
}
</script>

<style lang="scss" scoped>
#page {
  height: 100vh;
  background: white;
  overflow-y: scroll;
}
.caseTitle {
  width: 90%;
  margin: 0 auto;
  margin-top:10px;
  font-size: 20px;
  font-weight: 600;
  color: rgba(57, 60, 65, 1);
  line-height: 28px;
  view {
    margin: 0;
    padding: 0;
  }
  view:nth-child(2) {
    font-size: 14px;
    font-weight: 500;
    margin-top:10px;
    color: rgba(149, 156, 167, 1);
  }
}
.richText {
  overflow: hidden;
  width: 90%;
  margin: 0 auto;
  margin-top: 0.8rem;
  font-size: 15px;
  font-weight: 400;
  color: rgba(57, 60, 65, 1);
  line-height: 30px;
  image{
    max-width: 100% !important;
  }
  img{
    max-width: 100% !important;
  }
}
</style>
