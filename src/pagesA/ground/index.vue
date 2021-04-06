<template>
  <view id="page">
    <view class="page_have" v-if="cartList.length>0">
      <view class="plr28">
        <van-checkbox-group :value="checkLists" @change="onSelectGoods">
          <view
            v-for="(item,index) in goodsOnSaleList"
            :key="index"
            class="ptb24 mb20 bg-white br8 row center-y"
          >
            <van-checkbox checked-color="#10967B" :name="item.id" class="pl28 pr16"></van-checkbox>
            <view @tap="linkPage('navigateTo', $pageUrl.SPU,`spuId=${item.id}`)" class="row center-y ellipsis bg-white">
              <view>
                <img class="w200 h200 " :src="item.titleImage" alt  mode="aspectFit" />
              </view>
              <view class="hidden col space-around ml16">
                <view class="fs28 ellipsis fw600 mb10">{{ item.name }}</view>
                <view class="fs24 ellipsis fc-gray mb10">{{ item.productDescribe }}</view>
                <view class="fs22 mb10">
                  <text
                    class="tag-list ellipsis"
                    v-show="indexs<=2"
                    v-for="(items,indexs) in item.tag"
                    :key="items"
                  >{{items}}</text>
                </view>
                <view class="fc-money row center-y">
                  <auth-money :money="priceTypeReturnValue(item.lowestStrategyPrice, item.lowestPrice)" moneyLabel="fs26" moneyClass="fs36 fw600"/>
                  <text class="fs22 fc-gray ml12">一件代发价</text>
                </view>
              </view>
            </view>
          </view>
        </van-checkbox-group>
        <!-- 已下架商品 -->
        <view class="row space-between bg-white ptb20 plr20 fc-gray fs28 hairline-bottom br8" v-if="goodsOnStopList.length">
          <view>失效商品({{ goodsOnStopList.length }})</view>
        </view>
        <view
          v-for="(item,index) in goodsOnStopList"
          :key="index"
          class="ptb24 mb20 bg-white br8 row center-y"
        >
          <view class="invalid-btn mlr30">失效</view>
          <view  class="row center-y ellipsis bg-white flex-1">
            <view>
              <img class="w200 h200 " :src="item.titleImage" alt  mode="aspectFit" />
            </view>
            <view class="hidden col space-around ml16">
              <view class="fs28 ellipsis fw600 mb10">{{item.name}}</view>
              <view class="fs24 ellipsis fc-gray mb10">{{item.productDescribe}}</view>
              <view class="fs22 mb10">
                <text
                  class="tag-list ellipsis"
                  v-show="indexs<=2"
                  v-for="(items,indexs) in item.tag"
                  :key="items"
                >{{items}}</text>
              </view>
              <view class="fc-money row center-y">
                <auth-money :money="priceTypeReturnValue(item.lowestStrategyPrice, item.lowestPrice)" moneyLabel="fs26" moneyClass="fs36 fw600"/>
                <text class="fs22 fc-gray ml12">一件代发价</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="bottom">
        <!-- <text class="fc-gray">已选：{{checkLists.length}}个</text> -->
        <van-checkbox checked-color="#10967B" @change="checkAllClick" v-model="checkAll">
          <text class="fc-gray">全选</text>
        </van-checkbox>
        <view>
          <text class="btn" @click="onDownload()">下载资料</text>
          <text
            @click="goodsSync()"
            style="border-color:#10967B;"
            class="bg-theme btn fc-white ml30"
          >一键同步</text>
        </view>
      </view>
    </view>
    <view style="background:#fff;min-height:100vh;box-sizing:border-box;" v-else-if="cartList.length == 0 && finished">
      <view class="center-x mb26 pt120">
        <img class="w430 h340" :src="IMAGE.img_car_none3" alt />
      </view>
      <view class="fc-gray fs26 center-x">哎这么多好货，您竟然还没有上架！</view>
      <view style="padding:120rpx 180rpx 0;">
        <view @tap="link" class="h88 l-h88 center-x fc-white br44 bg-theme">去逛逛</view>
      </view>
    </view>
    <van-popup
      custom-style="width:560rpx;border-radius:16rpx;z-index:1000;"
      overlay-style="background:rgba(0,0,0,1);z-index:999;opacity:0.4;"
      title="提示"
      :show="showEmail"
      @close="closeEmail"
    >
      <view class="fw600 center-x pt50 fs36">
        提示
      </view>
      <view class="center-x mt30 mb40 fs30 fc-gray">
        资料将发送至邮箱，请及时下载
      </view>
      <view class="plr40 center-x pb60">
        <input v-model="dataVo.email" class="h68 br16" style="background:#F6F6F6" placeholder="请输入您的邮箱" placeholder-style="color:#D8D8D8;" type="text">
      </view>
      <view @click="confirmEmail" class="ptb28 fs32 fw600 center-x fc-theme" style="border-top:2rpx solid #E5E5E5;">
        确定
      </view>
    </van-popup>
    <van-toast id="van-toast" />
  </view>
</template>
<script>
import { download, coopSpu, sync } from '@/api/cart.js';
import { img_car_none3 } from '@/image-config.js';
import { linkPage } from '@/utils'
import Toast from '@/wxcomponents/vant/toast/toast';
import { mapGetters } from 'vuex'
import { authentication } from '@/mixins/auth'

export default {
  name: 'Ground',
  data() {
    return {
      showEmail: false,
      loading: true,
      finished: false,
      IMAGE: {
        img_car_none3
      },
      checkAll: false,
      checkLists: [],
      cartList: [],
      searchVo: {
        status: '1',
        pageIndex: 1,
        pageSize: 10
      },
      dataVo: {
        email: null
      },
      goodsOnSaleList: [],
      goodsOnStopList: []
    };
  },
  mixins: [authentication],
  onShow() {
    if (!this.$store.getters.userInfo.ncCode) { //我的页面已有跳转逻辑，这里保留
      uni.redirectTo({
        url: this.$pageUrl.AUTH_RIGHTS
      });
    }
  },
  computed: {
    ...mapGetters(['customerUserInfo'])
  },
  created() {
    this.getList();
  },
  methods: {
    //一键同步
    linkPage,
    goodsSync() {
      if (this.checkLists.length == 0) {
        wx.showToast({ title: '请选择商品', icon: 'none' });
        return;
      }
      wx.showLoading({
        title: '同步中',
        mask: true
      })
      this.dataVo.spuIds = this.checkLists;
      this.dataVo.email = this.$store.getters.userInfo.email
      sync(this.dataVo).then(res => {
        wx.showToast({ title: res.message || '同步成功', icon: 'none' });
      }).catch(e => {
        wx.showToast({ title: e.message || '同步失败', icon: 'none' });
      })
    },
    closeEmail() {
      this.showEmail = false
    },
    //下载资料
    onDownload() {
      if (this.checkLists.length == 0) {
        wx.showToast({ title: '请选择商品', icon: 'none' });
        return;
      }
      this.dataVo.email = this.$store.getters.userInfo.email
      this.dataVo.spuIds = this.checkLists;
      this.showEmail = true
    },
    confirmEmail() {
      const regEmail = /^[A-Za-z0-9]+([_.][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,6}$/;
      if (!this.dataVo.email) {
        uni.showToast({ title: '请输入邮箱', icon: 'none' });
        return;
      } else if (!regEmail.test(this.dataVo.email)) {
        uni.showToast({ title: '请输入正确邮箱', icon: 'none' });
        return;
      }
      wx.showLoading({
        mask: true,
        title: '下载中'
      })
      this.showEmail = false
      download(this.dataVo).then(res => {
        wx.hideLoading()
        Toast({ message: `资料已发送至邮箱 ${this.dataVo.email} ，请及时下载并添加到您的商品库`, duration: 5000 })
      }).catch(e => {
        wx.hideLoading()
        wx.showToast({ title: e.message || '下载失败', icon: 'none' });
      });
    },
    onSelectGoods(event) {
      this.checkLists = event.detail;
      if (this.goodsOnSaleList.length === 0) {
        this.checkAll = false
        return
      }
      this.checkAll = this.checkLists.length === this.goodsOnSaleList.length;
    },
    checkAllClick(e) {
      this.checkLists = [];
      this.checkAll = e.detail;
      if (e.detail) {
        this.checkLists = this.goodsOnSaleList.map(item => item.id);
      }
    },
    reset() {
      this.searchVo.pageIndex = 1
      this.checkLists = []
      this.checkAll = false
      this.finished = false
      this.loading = false
      this.cartList = []
    },
    getList() {
      if (this.finished) return
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      coopSpu(this.searchVo).then(({ result }) => {
        if (!result || !result.list.length) {
          this.finished = true
          this.loading = true
          return
        }

        this.searchVo.pageIndex++
        const list = result.list
        list.forEach(item => {
          if (item && item.tag) {
            item.tag = item.tag.split('|').filter(e => e);
          }
        })
        this.cartList = this.cartList.concat(list)
        this.goodsOnSaleList = this.cartList.filter(e => e.isOnSale)
        this.goodsOnStopList = this.cartList.filter(e => !e.isOnSale)
      }).finally(() => {
        this.loading = true
        wx.hideLoading()
      });
    },
    link() {
      uni.switchTab({ url: this.$pageUrl.HOME });
    },
    // 不同状态下的价格关系
    priceTypeReturnValue(streategy, price) {
      return this.isStrategy ? streategy : price
    }
  },
  onReachBottom() {
    if (!this.finished) {
      this.getList()
    }
  }
};
</script>

<style lang="scss" scoped>
#page {
  min-height: 100%;
  .page_have{
    min-height: 100%;
    background: #f6f6f6;
    padding-top: 24rpx;
    padding-bottom: 120rpx;
    padding-bottom: calc(120rpx+ constant(safe-area-inset-bottom)); //兼容 IOS<11.2
    padding-bottom: calc(120rpx + env(safe-area-inset-bottom)); //兼容 IOS>11.2
    box-sizing: border-box;
  }
  .top {
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: #fff;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    padding-left: 56rpx;
    padding-right: 28rpx;
    align-items: center;
    height: 98rpx;
  }
  .bottom {
    box-sizing: border-box;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background: #fff;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    padding: 14rpx 28rpx;
    align-items: center;
    padding-bottom: calc(14rpx+ constant(safe-area-inset-bottom)); //兼容 IOS<11.2
    padding-bottom: calc(14rpx + env(safe-area-inset-bottom)); //兼容 IOS>11.2
  }
  .del {
    padding: 24rpx 68rpx;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 44rpx;
    background-color: #fa8181;
    color: #fff;
  }
  .btn {
    // box-sizing: border-box;
    display: inline-block;
    font-weight: bold;
    width: 200rpx;
    line-height: 80rpx;
    color: $uni-color-theme;
    border: 2rpx solid $uni-color-theme;
    border-radius: 44rpx;
    text-align: center;
    color: #10967b;
    font-size: 28rpx;
  }

  .tag-list {
    margin-right: 20rpx;
    padding: 2rpx 14rpx;
    color: $uni-color-money;
    background: rgba(255, 118, 64, 0.1);
    font-size: 22rpx;
    border-radius: 18rpx;
  }
}
/deep/ input{
  color:#959CA7 !important;
  z-index: 0;
  font-weight: normal;
  // display:inline-block;
  flex:1;
}
.invalid-btn {
  padding: 10rpx 16rpx;
  font-size: 22rpx;
  color: #C7CACF;
  background: #F0F1F2;
  line-height: 22rpx;
}
</style>
