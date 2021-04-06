<template>
  <view class="page">
    <van-cell-group>
      <van-cell>
        <view slot="title">
          <view class="van-cell-text row center-y">
            <text class="vanTitle">姓名</text>
            <input type="text" v-model="form.contact" placeholder="请填写收货人姓名" placeholder-style="color:#C7C9CF" />
          </view>
        </view>
      </van-cell>
      <van-cell>
        <view slot="title">
          <view class="van-cell-text row center-y">
            <text class="vanTitle">手机号</text>
            <input type="number" v-model="form.mobile" placeholder="请填写收货人手机号" placeholder-style="color:#C7C9CF"/>
          </view>
        </view>
      </van-cell>
      <van-cell>
        <view slot="title">
          <view class="van-cell-text row center-y">
            <text class="vanTitle">所在地区</text>
            <picker
              class="w-full flex-1 text-right fs32 center-y row flex-end"
              mode="region"
              @change="bindRegionChange"
              :value="region"
              :custom-item="customItem"
            >
              <view class="fs24 flex-1 w-full center-y" :style="region ? 'color:black' : 'color:#C7C9CF'">{{ region.join(',') || '请选择所在地区'}} <van-icon name="arrow" class="w-h28 ml8" color="#C7CACF" /></view>
            </picker>
          </view>
        </view>
      </van-cell>
      <van-cell>
        <view slot="title">
          <view class="van-cell-text row center-y">
            <text class="vanTitle">详细地址</text>
             <textarea
              v-model="form.address"
              auto-height
              placeholder="详细收货地址: 如道路 门牌号 小区 楼栋号等"
              :class="['w-full flex-1', {'text-right': form.address}]"
              placeholder-style="color:#C7C9CF"
            />
          </view>
        </view>
      </van-cell>
      <van-cell>
        <view slot="title">
          <view class="mt30 mb20 fs28 fw500" style="color:#10967B">智能填写</view>
          <view style="background:#F6F6F6" class="radius10 hidden plr10 ptb20">
            <textarea
              auto-height
              placeholder="粘贴地址信息，可自动识别并填写，如：一件达，1XXXXXXXXX，XX省XX市XX区XX街道XXXX"
              class="w-full flex-1"
              v-model="addressSmart"
              placeholder-style="color:#C7C9CF"
              style="min-height:50px"
            />
          </view>
          <view class="row flex-end ptb20 center-y fs26">
            <text style="color:#009285" @click="clearForm">清除</text>
            <text class="ml30 plr16 ptb4 fc-white radius44" style="background:#009285" @click="smart">自动填写</text>
          </view>
        </view>
      </van-cell>
      <van-cell>
        <view slot="title">
          <view class="van-cell-text row center-y">
            <text class="vanTitle">默认地址</text>
            <switch :checked="form.isDefault" @change="switch1Change"
              class="w-full flex-1 text-right fs32"
            />
          </view>
        </view>
      </van-cell>
    </van-cell-group>
    <view class="save" @click="save">保存</view>
  </view>
</template>

<script>
import { addressAdd, addressUpdate } from '@/api/address'
import { validPhone } from '@/utils'
import TYPES from '@/store/types'
import AddressParse from 'address-parse';
export default {
  name: 'AddressEdit',
  components: {},
  data() {
    return {
      type: '',
      username: '',
      customItem: '',
      region: [],
      switch1Checked: '',
      update: '',
      form: {
        contact: '', // 收货人
        mobile: '', // 手机
        province: '', // 省名称
        city: '', // 市名称
        district: '', // 区名称
        address: '', // 详细地址
        isDefault: 0 // 1：默认地址, 0非默认
      },
      addressSmart: ''
    };
  },
  onShow() {},
  onLoad(options) {
    this.type = options.type
    this.update = options.update
    if (options.type === 'add') {
      uni.setNavigationBarTitle({
        title: '添加收货地址'
      });
    }
    if (options.type === 'edit') {
      const data = JSON.parse(options.address)
      this.form = data
      this.region = [data.province, data.city, data.district]
    }
  },
  methods: {
    bindRegionChange(e) {
      this.form.province = e.detail.value[0]
      this.form.city = e.detail.value[1]
      this.form.district = e.detail.value[2]
      this.region = e.detail.value // 省市区名称数组
    },
    switch1Change(e) {
      this.form.isDefault = Number(e.detail.value)
    },
    save() {
      if (this.checkList()) {
        if (this.type === 'add') { // 添加地址
          this.onClickAddress()
        } else if (this.type == 'edit') {
          this.editAddress()
        }
      }
    },
    checkList() {
      if (!this.form.contact) {
        uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
        return false
      }
      if (!this.form.mobile) {
        uni.showToast({ title: '请输入手机号', icon: 'none' })
        return false
      }
      if (!validPhone(this.form.mobile)) {
        uni.showToast({ title: '请输入正确的手机号码', icon: 'none' })
        return false
      }
      if (this.region.length < 3 && !this.form.province && !this.form.city && !this.form.district) {
        uni.showToast({ title: '请选择收货地址', icon: 'none' })
        return false
      }
      if (!this.form.address) {
        uni.showToast({ title: '请输入详细地址', icon: 'none' })
        return false
      }
      return true
    },
    onClickAddress() {
      uni.showLoading({ mask: true })
      addressAdd(this.form).then(({ result }) => {
        // 添加成功后返回
        this.saveAddress(result)
        uni.navigateBack()
      }).finally(() => {
        uni.hideLoading()
      })
    },
    editAddress() {
      uni.showLoading({ mask: true })
      addressUpdate(this.form).then(({ result }) => {
        this.saveAddress(result)
        // 添加成功后返回
        uni.navigateBack()
      }).finally(() => {
        uni.hideLoading()
      })
    },
    saveAddress(address) {
      if (this.update == 'true') {
        this.$store.commit(TYPES.SET_ADDRESS, address)
      }
    },
    smart() {
      if (this.addressSmart) {
        const [data] = AddressParse.parse(this.addressSmart);
        if (data.province && data.city && data.area) {
          this.region = [data.province, data.city, data.area]
          this.form.province = data.province // 省市区
          this.form.city = data.city
          this.form.district = data.area
        }
        this.form.contact = data.name // 收货人
        this.form.mobile = data.mobile || data.phone // 手机
        this.form.address = data.details // 详细地址
        this.form.isDefault = 0 // 1：默认地址, 0非默认
      }
    },
    clearForm() {
      this.form.contact = '' // 收货人
      this.form.mobile = '' // 手机
      this.form.province = '' // 省名称
      this.form.city = '' // 市名称
      this.form.district = '' // 区名称
      this.form.address = '' // 详细地址
      this.form.isDefault = 0 // 1：默认地址, 0非默认
      this.addressSmart = ''
      this.region = []
    }
  }
};
</script>

<style lang="scss" scoped>
.page {
  background: white;
  min-height: 100vh;
  /deep/ .van-field__label {
    color: black !important;
  }
  /deep/ .van-cell {
    padding: 36rpx 36rpx;
  }
  /deep/ .van-cell-text {
    font-weight: normal;
    text-align: left;
  }
  /deep/ .van-cell:after {
    border-bottom: 2rpx solid #eff1f1;
  }
  /deep/ .van-cell-text {
    font-weight: normal;
  }
  /deep/ input {
    text-align: right;
    color: black !important;
    flex: 1;
  }
  .vanTitle {
    display: inline-block;
    width: 120rpx;
    overflow: hidden;
    font-weight: bold;
    margin-right: 28rpx;
    margin-left: 8rpx;
  }
  .save{
    position: fixed;
    bottom: 5%;
    left: 50%;
    transform: translate(-50%,0);
    width: 686rpx;
    height: 88rpx;
    line-height: 88rpx;
    background: #0F957B;
    border-radius: 44rpx;
    font-size: 28rpx;
    font-weight: bold;
    color: white;
    text-align: center;
  }
}
</style>
