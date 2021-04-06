<template>
  <view id="page">
    <view :style="{'height': (statusBarHeight + menuButtonHeight) + 'px'}"></view>
    <view class="fs60 ptb20 center-x">选择感兴趣的内容</view>
    <view class="fs28 pb60 center-x">可以让众上更了解您的需求</view>
    <view class="plr40 center-x">
      <button @tap="choose(item,index)" v-for="(item,index) in categoryList" :key="index" :class="['tag',category.includes(item)?'tag-active':'']">
        <view v-if="category.includes(item)" class="actives"><van-icon name="success" size="20rpx"/></view>
        {{item.cateName}}
      </button>
    </view>
    <view class="plr100">
      <view @tap="link" class="h88 l-h88 center-x fc-white br44 bg-theme">选好了，进入首页</view>
    </view>
  </view>
</template>
<script>
import { bindCategory, cateList } from '@/api/user'
import { mapGetters } from 'vuex'
export default {
  name: 'category',
  data() {
    return {
      categoryList: [],
      category: []
    }
  },
  computed: {
    ...mapGetters(['statusBarHeight', 'menuButtonHeight'])
  },
  onLoad() {
    this.getList()
  },
  methods: {
    getList() {
      wx.showLoading({
        mask: true
      })
      cateList().then(res => {
        this.categoryList = res.result.map(item => ({
          cateName: item.name,
          cateCode: item.code
        }))
      }).finally(() => {
        wx.hideLoading()
      })
    },
    choose(item) {
      if (this.category.includes(item)) {
        this.category.splice(this.category.findIndex(e => e == item), 1)
      } else {
        this.category.push(item)
      }
    },
    link() {
      if (this.category.length > 0) {
        wx.showLoading({ mask: true })
        bindCategory(JSON.stringify(this.category)).then(res => {
          wx.hideLoading()
          uni.switchTab({ url: this.$pageUrl.HOME });
          uni.showToast({ title: '操作成功', duration: 2000, icon: 'none' });
        }).catch(e => {
          wx.hideLoading()
          uni.switchTab({ url: this.$pageUrl.HOME });
          uni.showToast({ title: e.message ? e.message : '操作失败', duration: 2000, icon: 'none' });
        })
      } else {
        uni.showToast({ title: '请最少选择一个感兴趣的内容', duration: 2000, icon: 'none' });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
*{
  line-height: 1;
  box-sizing: border-box;
}
#page{
  background-color: #fff;
  min-height: 100vh;
  color:#242629;
}
.tag{
  margin: 0 ;
  margin-right: 24rpx;
  margin-bottom: 50rpx;
  background-color: #fff;
  display: inline-block;
  color:#71767D;
  font-size: 28rpx;
  padding:18rpx 28rpx;
  line-height: 1;
  border:2rpx solid #F0F1F2;
  border-radius:32rpx;
  overflow: visible;
}
/*我们可以使用::after的方式去覆盖默认值*/
button::after {
  border: none;
}
.tag-active{
  color:$uni-color-theme;
  border-color:$uni-color-theme;
  background:rgba(16,150,123,0.1);
  position: relative;
  .actives{
    position: absolute;
    width: 28rpx;
    height: 28rpx;
    right:0;
    top:0;
    text-align: center;
    line-height: 28rpx;
    color:#fff;
    background-color: $uni-color-theme;
    border-radius: 50%;
  }
}
</style>