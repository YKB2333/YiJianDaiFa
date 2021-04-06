<template>
  <view :class="['page', {'bg-white':!addressList.length}]">
    <!-- 收货地址 -->
    <van-radio-group @change="onChangeRadioIndex" :value="currentRadioIndex">
      <view class=" bg-white mt2 plr58 boder-bottom20" v-for="(item, index) in addressList" :key="item.id">
        <view @tap="selectedAddress(item,index)">
          <view class="row pt56 center-y">
            <text class="fw600 mr80 fs32 fw500">{{ item.contact }}</text>
            <text class="list-color-gary fs26">{{ item.mobile }}</text>
          </view>
          <view class="hairline-bottom ptb30 list-color-gary">
            <text style="word-wrap: break-word;">{{ `${item.province}${item.city}${ item.district}${item.address}` }}</text>
          </view>
        </view>
        <view class="row space-between h100 l-h100 ">
          <view class="row space-between center-y">
            <van-radio :name="index" checked-color="#10967B" icon-size="16px" class="mr16">
              <text style="font-size: 26rpx;" >默认地址</text>
            </van-radio>
          </view>
          <view>
            <text class="btn-black mr30" @tap="linkPage('edit', item)">编辑</text>
            <text class="btn-red" @tap="onDelete(item, index)">删除</text>
          </view>
        </view>
      </view>
    </van-radio-group>
      <null-data
        :loading="loading"
        :finished="finished"
        :children="addressList"
        img="order_none"
        size="w430 h340 pt200"
        tips="您还没有收货地址，请点击下方添加"
      ></null-data>
    <view class="fixedBottom" @tap="linkPage('add')">
      <text style="color:white">添加收货地址</text>
    </view>
  </view>
</template>

<script>
import { findAddressList, addressDefault, addressDelete } from '@/api/address'
import NullData from '@/components/NullData';
import TYPES from '@/store/types'

export default {
  name: 'AddressList',
  components: { NullData },
  data() {
    return {
      type: '',
      loading: false,
      finished: false,
      addressList: [], // 获取收货地址
      currentRadioIndex: -1
    }
  },
  onShow() {
    this.init()
  },
  onLoad(options) {
    this.type = options.type
  },
  computed: {},
  methods: {
    // 切换默认地址
    onChangeRadioIndex(event) {
      if (event.detail == this.currentRadioIndex) return
      this.fetchSetDefaultAddress(this.addressList[event.detail].id)
    },
    // 获取收货地址列表
    init() {
      findAddressList().then(({ result }) => {
        this.addressList = result
        this.currentRadioIndex = String(result.findIndex(e => e.isDefault))
      }).finally(() => {
        this.loading = true
        this.finished = true
      })
    },
    // 删除地址
    onDelete(item, index) {
      uni.showModal({
        title: '确认删除？',
        content: '删除收货地址',
        success: (res) => {
          if (res.confirm) {
            this.addressList.splice(index, 1)
            addressDelete(item.id).then(({ result }) => {
            })
            //  删除最后一个的时候
            if (this.addressList.length == 0) {
              this.$store.commit(TYPES.SET_ADDRESS, '')
            } else if (this.currentRadioIndex == index) {
              this.$store.commit(TYPES.SET_ADDRESS, this.addressList[0])
              this.fetchSetDefaultAddress(this.addressList[0].id)
            }
          }
        }
      })
    },
    // 设置默认地址
    fetchSetDefaultAddress(id, index) {
      return new Promise((resolve, reject) => {
        addressDefault(id).then(({ result }) => {
          this.currentRadioIndex = String(this.addressList.findIndex(e => e.id == id))
          resolve()
        })
      })
    },
    linkPage(type, item) {
      if (type === 'add') {
        uni.navigateTo({
          url: `/pagesA/address/edit?type=add&update=${this.addressList.length == 0}`
        })
      } else if (type === 'edit') {
        const index = String(this.addressList.findIndex(e => e.id == item.id))
        const str = JSON.stringify(item)
        uni.navigateTo({
          url: `/pagesA/address/edit?type=edit&address=${str}&update=${this.currentRadioIndex === index}`
        })
      }
    },
    // 选择地址（从确定订单页面进来有效）/ 进入编辑
    async selectedAddress(item, index) {
      if (this.type === 'order') {
        this.$store.commit(TYPES.SET_ADDRESS, item)
        wx.navigateBack()
      } else {
        this.linkPage('edit', item)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page{
  height: 100vh;
  overflow-y: auto;
  background: #F6F6F6;
  padding-bottom: 100rpx;
}
.integral{
  position: absolute;
  left: 12%;
  top: 50%;
  transform: translate(0,-50%)
}
.btn-red{
  display: inline-block;
  width:110rpx;
  height:48rpx;
  line-height: 48rpx;
  text-align: center;
  background:rgba(157,160,164,0);
  border:2rpx solid #FF5F23;
  color: #FF5F23;
  border-radius:24rpx;
  font-size: 12px;
}
.btn-black{
  display: inline-block;
  text-align: center;
  width:110rpx;
  height:48rpx;
  line-height: 48rpx;
  background:rgba(157,160,164,0);
  font-size: 12px;
  border:2rpx solid #121314;
  color: #121314;
  border-radius:24rpx;
}
.list-color-gary{
  color: #80868F;
}
.list-btn-red{
  color: #FF5F23;
}
.boder-bottom20{
  border-bottom: 20rpx solid #F6F6F6;
}

.fixedBottom {
  position: fixed;
  height: 94rpx;
  line-height: 94rpx;
  width: 100%;
  bottom: 0;
  text-align: center;
  background: $uni-color-theme;
}
@media screen and (min-width: 375px) and (max-height: 812px) {
  .fixedBottom {
    padding-bottom: 15rpx;
  }
}

</style>
