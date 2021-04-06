<template>
  <view class="category-page">
    <!-- 左边栏 -->
    <view class="side-bar">
      <van-sidebar :active-key="activeIndex" @change="onChange">
        <van-sidebar-item v-for="item in categoryList" :key="item.id" :title="item.name"/>
      </van-sidebar>
    </view>
    <!-- 列表栏 -->
    <view class="container-wrapper">
      <view class="container">
        <view class="cate-title" v-if="categoryList[activeIndex].name">一&nbsp;&nbsp;{{ categoryList[activeIndex].name }}&nbsp;&nbsp;一</view>
        <van-grid column-num="3" :border="false" :gutter="10">
          <van-grid-item
            use-slot
            v-for="cate in curCateList"
            :key="cate.id"
            @click="navigateTo($pageUrl.GOODS_LIST, `cateOne=${categoryList[activeIndex].id}&cateTwo=${cate.id}&title=${cate.name}`)"
          >
            <image :src="cate.icon || IMAGE['big_logo']" class="cate-img"/>
            <text class="cate-text">{{ cate.name }}</text>
          </van-grid-item>
        </van-grid>
      </view>
    </view>
    <!-- 获取授权弹窗 -->
    <auth-popup :visible.sync="authPopupVisible"/>
  </view>
</template>

<script>
import { navigateTo } from '@/utils'
import { icon_auth, big_logo } from '@/image-config.js'
import { getCategoryList } from '@/api/category'
import authPopup from '@/pages/auth/auth-popup';
import { mapGetters } from 'vuex'
import { authentication } from '@/mixins/auth'

export default {
  name: 'Category',
  mixins: [authentication],
  components: { authPopup },
  data() {
    return {
      IMAGE: {
        icon_auth,
        big_logo
      },
      activeIndex: 0, // sidebar当前索引
      categoryList: [], // 分类请求数据
      refresh: false, // 下拉刷新标志
      authPopupVisible: false
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'shareInvitationCode']),
    // 对于一级分类的二级分类
    curCateList() {
      return (this.categoryList[this.activeIndex] && this.categoryList[this.activeIndex].supCategoryYjdfVo) || []
    }
  },
  onLoad() {
    this.init()
  },
  onShow() {
    this.getWxUserInfo()
  },
  methods: {
    navigateTo,
    getWxUserInfo() {
      //通过邀请码进入的才可以弹框 凸^-^凸
      if (this.shareInvitationCode && this.userInfo && !this.userInfo.userHead && this.userInfo.userId) {
        this.authPopupVisible = true
      }
    },
    init() {
      uni.showLoading()
      getCategoryList().then((res) => {
        this.categoryList = res.result || []
      }).finally(() => {
        uni.hideLoading()
        if (this.refresh) {
          // 如果开启了下拉刷新，结束下拉刷新
          uni.stopPullDownRefresh()
          this.refresh = false
        }
      })
    },
    onChange({ detail }) {
      this.activeIndex = detail
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
.category-page{
  height: 100vh;
  display: flex;
  background-color: #ffffff;
  .side-bar{
    width: 200rpx;
    overflow-y: auto;
    background-color: #F6F5F8;
    /deep/ .van-sidebar{
      width: 100%;
      .van-sidebar-item--selected{
        border: none;
        position: relative;
        color: #242629 !important;
        font-weight: 600;
        &::before{
          content: ' ';
          display: inline-block;
          border-left: 3px solid #10967B;
          height: 20px;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }
      }
      .van-sidebar-item{
        padding-top: 15px;
        padding-bottom: 15px;
        text-align: center;
        color: #959CA7;
      }
    }
  }
  .container-wrapper{
    flex: 1;
    height: 100%;
    overflow-y: auto;
    .cate-title{
      padding: 18px 0;
      text-align: center;
      font-size: 28rpx;
      color: #242629;
    }
    .cate-img{
      width: 150rpx;
      height: 150rpx;
    }
    .cate-text{
      color: #242629;
      font-size: 26rpx;
      margin-top: 16rpx;
    }
    /deep/ .van-grid-item__content{
      padding-bottom: 4px;
      padding-top: 4px;
    }
  }
}
</style>
