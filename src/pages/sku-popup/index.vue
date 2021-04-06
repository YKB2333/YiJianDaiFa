<template>
  <block>
    <van-popup
      :show="showPopup"
      round
      closeable
      :close-on-click-overlay="true"
      position="bottom"
      custom-style="max-height: 94vh; overflow: hidden; display: flex; flex-direction: column"
      :close-icon="IMAGE['icon_close']"
      @close="closePopup"
      :z-index="1000">
      <view class="h-full col" style="overflow: auto">
         <view class="row center-y hairline-bottom ptb40 pr40 ml40">
            <view class="relative">
              <image :src="skuImg" class="popup-sku-img" mode="aspectFit"/>
              <view class="sale_end" v-if="currentSku && currentSku.yjdfStock == 0">
                <image :src="IMAGE['sale_end']"  class="w-h-full"/>
              </view>
            </view>
            <view class="ml20">
              <view v-if="currentSku.activityPrice && !isInsideActivity" class="row center-y">
                <view class="fc-money">
                  <auth-money :money="currentSku.price" moneyLabel="fs26" moneyClass="fs36 fw600"/>
                </view>
                <view class="fs22 fc-grey pl10">{{ isStrategy ? '战略抢购价' : '抢购价' }}</view>
              </view>
              <view v-else class="row center-y">
                <view class="fc-money">
                  <auth-money :money="priceTypeReturnValue(currentSkuPrice, currentSkuStrategyPrice, currentSkuPrice)" moneyLabel="fs26" moneyClass="fs36"/>
                </view>
                <view class="fs22 fc-grey pl10">{{ priceTypeReturnValue('内购价','战略价','代发价') }}</view>
              </view>
              <view class="fs22 fc-grey mtb10">库存：{{ currentSku.yjdfStock || 0 }}件</view>
              <view v-if="currentSelect.some(e => e.value)" class="fs22 fc-grey">已选：{{ currentSelect.map(e => e.value).join('、') }}</view>
              <view v-else class="fs22 fc-grey" style="color: #dd524d;">请选择</view>
            </view>
          </view>
        <!-- 商品信息 -->
        <view class="flex-1 hairline-bottom" style="overflow-y: auto;">
          <!-- 规格 -->
          <view class="hairline-bottom ml40 ptb20" v-if="spu.firstAtbKey">
            <view class="mb32 row center-y">
              <text class="fc-black fs28">{{ spu.firstAtbKey }}</text>
              <text v-if="currentSelect.some(e => e.key === 'firstAtbKey' && !e.value)" class="fs24 pl20" style="color: #dd524d;">请选择</text>
            </view>
            <div class="row wrap">
              <sku-button
                v-for="value in firstAtbValueArr"
                :key="value"
                :active="isSkuActive(value, 'firstAtbKey')"
                :disabled="isSkuDisabled(value, 'firstAtbKey')"
                @click="onSkuClick(value, 'firstAtbKey')">
                {{ value }}
              </sku-button>
            </div>
          </view>
          <view class="ml40 ptb20" v-if="spu.secondAtbKey">
            <view class="mb32 row center-y">
              <text class="fc-black fs28">{{ spu.secondAtbKey }}</text>
              <text v-if="currentSelect.some(e => e.key === 'secondAtbKey' && !e.value)" class="fs24 pl20" style="color: #dd524d;">请选择</text>
            </view>
            <view class="row wrap">
              <sku-button
                v-for="value in secondAtbValueArr"
                :key="value"
                :active="isSkuActive(value, 'secondAtbKey')"
                :disabled="isSkuDisabled(value, 'secondAtbKey')"
                @click="onSkuClick(value, 'secondAtbKey')">
                {{ value }}
              </sku-button>
            </view>
          </view>
          <!-- 数量 -->
          <view class="row space-between mlr40 ptb20">
            <view class="row center-y">
              数量
              <text
                v-if="currentSku.miniQuantity > 1 && hasSelectAttr"
                class="fs24 fc-grey inline-block pl10"
              >
                (起订量：{{ currentSku.miniQuantity }})
              </text>
            </view>
            <view class="relative">
              <van-stepper
                async-change
                :min="currentSku.miniQuantity || 1"
                :value="steppedNumber"
                @plus="onQuantityPlus"
                @minus="onQuantityMinus"
                @change="onQuatityChange"
                @focus="onQuantityFocus"
                @blur="onQuantityBlur"
                button-size="25px"
                input-width="40px"
              />
            </view>
          </view>
        </view>
        <!-- 按钮 -->
        <view>
          <button
            :class="['popup-action-btn', {'disabled-btn' : currentSku && currentSku.yjdfStock <= 0}]"
            @tap="onAdd"
            :loading="addLoading"
          >{{ isInsideActivity ? '加入内购购物车' : '加入选品车' }}</button>
        </view>
      </view>
    </van-popup>

  </block>
</template>

<script>
import { icon_close, big_logo, sale_end } from '@/image-config.js'
import SkuButton from '../spu/sku-button'
import { isEmpty } from '@/utils'
import { getGoodsDetail, addGoodsToCart, innerSpuDetail } from '@/api/goods'
import TYPES from '@/store/types'
import { mapGetters } from 'vuex'
import { authentication } from '@/mixins/auth'

export default {
  name: 'SkuPopup',
  components: { SkuButton },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    spuId: {
      type: String,
      required: true
    },
    skuId: {
      type: String
    },
    paramSkuId: {
      type: String
    },
    page: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      IMAGE: {
        icon_close,
        big_logo,
        sale_end
      },
      showPopup: false,
      spu: {
        firstAtbKey: '', // 主属性
        secondAtbKey: '' // 副属性
      },
      skus: [], // sku列表
      currentSku: {}, // 当前sku
      currentSelect: [], // 当前选择的sku属性
      swiperImgs: [],
      swiperSupImgs: [],
      addLoading: false,
      steppedNumber: 1, // 选择数量
      setppedNumberCopy: 0,
      spuTitleImage: ''
    }
  },
  mixins: [authentication],
  computed: {
    ...mapGetters(['customerUserInfo', 'userInfo']),
    // 主属性-value数组
    firstAtbValueArr() {
      const arr = this.skus.map(e => e.firstAtbValue)
      return [...new Set(arr)]
    },
    // 副属性-value数组
    secondAtbValueArr() {
      const arr = this.skus.map(e => e.secondAtbValue)
      return [...new Set(arr)]
    },
    skuImg() {
      const skuImage = (this.currentSku && this.currentSku.images && this.currentSku.images.filter(e => e.imageType === '1')) || []
      return this.currentSku.titleImage || (skuImage.length && skuImage[0].imagePath) || this.currentSku.spuTitleImage || this.spuTitleImage || this.IMAGE.big_logo
    },
    // 是否已选择属性规格
    hasSelectAttr() {
      return this.currentSelect.every(e => e.value)
    },
    goodsType() {
      return this.page === 'inside_shopping_activity' ? 'INNER_GOODS' : 'COMMON_GOODS'
    },
    // 是否内购活动
    isInsideActivity() {
      return this.page === 'inside_shopping_activity'
    },
    // 当前sku价格
    currentSkuPrice() {
      return this.priceTypeReturnValue(this.currentSku.price, this.currentSku.generalPrice, this.currentSku.price)
    },
    currentSkuStrategyPrice() {
      return this.currentSku.strategyPrice
    }
  },
  watch: {
    currentSku: {
      handler(newValue, oldValue) {
        if (newValue && newValue.miniQuantity) {
          this.steppedNumber = newValue.miniQuantity
        }
        if (newValue && newValue.images && newValue.images.length) {
          const newValueFilter = newValue.images.filter(e => e.imageType === '1')
          this.swiperImgs = newValueFilter.concat(this.swiperSupImgs)
        } else {
          this.swiperImgs = this.swiperSupImgs
        }
      },
      immediate: true,
      deep: true
    },
    visible(val) {
      if (val) {
        this.init()
      }
    }
  },
  methods: {
    init() {
      this.reset()
      uni.showLoading({ mask: true })
      const api = {
        INNER_GOODS: innerSpuDetail,
        COMMON_GOODS: getGoodsDetail
      }
      api[this.goodsType](this.spuId).then(({ result }) => {
        uni.hideLoading()
        if (!isEmpty(result)) {
          this.spuTitleImage = result.titleImage
          this.skus = []
          this.skus = result.skus
          this.showPopup = true
          Object.keys(this.spu).forEach(key => {
            this.spu[key] = result[key]
          })
          this.swiperImgs = [] // 先清空
          if (result.images && result.images.length) {
            result.images.forEach(e => {
              if (e.imageType === '1') {
                if (e.isTitleImage) {
                  this.swiperImgs.unshift(e)
                } else {
                  this.swiperImgs.push(e)
                }
              }
            })
          }
          this.swiperSupImgs = this.swiperImgs
          // 如果页面传参有skuId，从sku列表找到对应的sku
          if (this.paramSkuId) {
            this.currentSku = this.skus.find(e => e.id === this.paramSkuId) || {}
          }
          // 如果只有一个规格默认选中
          if (result.skus.length === 1) {
            this.currentSku = this.skus[0]
          }
          this.currentSelect = []
          if (this.spu.firstAtbKey) {
            this.currentSelect.push({ key: 'firstAtbKey', value: this.currentSku.firstAtbValue })
          }
          if (this.spu.secondAtbKey) {
            this.currentSelect.push({ key: 'secondAtbKey', value: this.currentSku.secondAtbValue })
          }
        } else {
          this.closePopup()
          uni.showToast({ title: '商品数据为空', icon: 'none' })
        }
      }).catch(err => {
        uni.hideLoading()
        uni.showToast({ title: err.message, icon: 'none' })
        this.closePopup()
      })
    },
    reset() {
      Object.assign(this.$data, this.$options.data())
    },
    // 关闭弹窗
    closePopup() {
      this.showPopup = false
      this.$emit('update:visible', false)
    },
    // 判断是否激活sku-button
    isSkuActive(value, key) {
      return this.currentSelect.some(e => e.key === key && e.value === value)
    },
    // 是否禁用不可点击
    isSkuDisabled(value, key) {
      let flag = false
      if (key === 'firstAtbKey') {
        if (this.currentSelect.find(e => e.key === 'secondAtbKey') && !this.currentSelect.find(e => e.key === 'secondAtbKey').value) {
          flag = false
        } else {
          const arr = this.skus.filter(e => e.firstAtbValue == value)
          const target = this.currentSelect.find(e => e.key === 'secondAtbKey')
          if (target) {
            flag = arr.every(e => e.secondAtbValue !== target.value)
          }
        }
      } else if (key === 'secondAtbKey') {
        if (this.currentSelect.find(e => e.key === 'firstAtbKey') && !this.currentSelect.find(e => e.key === 'firstAtbKey').value) {
          flag = false
        } else {
          const arr = this.skus.filter(e => e.secondAtbValue == value)
          const target = this.currentSelect.find(e => e.key === 'firstAtbKey')
          if (target) {
            flag = arr.every(e => e.firstAtbValue !== target.value)
          }
        }
      }
      return flag
    },
    onSkuClick(value, key) {
      if (this.isSkuDisabled(value, key)) return

      if (this.isSkuActive(value, key)) {
        this.currentSelect[this.currentSelect.findIndex(e => e.key === key)].value = ''
      } else {
        this.currentSelect[this.currentSelect.findIndex(e => e.key === key)].value = value
      }

      if (this.currentSelect.every(e => e.value)) {
        const values = this.currentSelect.map(e => e.value)
        if (values.length === 1) {
          this.currentSku = this.skus.find(e => e.firstAtbValue === values[0])
        } else if (values.length === 2) {
          this.currentSku = this.skus.find(e => e.firstAtbValue === values[0] && e.secondAtbValue === values[1])
        }
      } else {
        this.currentSku = {}
      }
    },
    //
    onAdd() {
      if (!this.hasSelectAttr) {
        uni.showToast({ title: '请选择规格', icon: 'none' })
        return
      }
      if (this.currentSku.yjdfStock <= 0) {
        uni.showToast({ title: '库存不足', icon: 'none' })
        return
      }
      if (this.addLoading) return
      this.addLoading = true
      addGoodsToCart({
        goodsType: this.goodsType,
        skuId: this.currentSku.id,
        skuQuantity: this.steppedNumber,
        spuId: this.currentSku.spuId
      }).then(({ result }) => {
        uni.showToast({ title: this.isInsideActivity ? '已加入内购购物车' : '已加入选品车', icon: 'none' })
        this.closePopup()
        this.$emit('confirm')
        this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
      }).finally(() => {
        this.addLoading = false
      })
    },
    onQuantityPlus() {
      if (this.checkHasSelectAttr()) return

      if ((this.steppedNumber + 1) > this.currentSku.yjdfStock) {
        uni.showToast({ title: '库存不足', icon: 'none' })
        return
      }
      ++this.steppedNumber
    },
    onQuantityMinus() {
      if (this.checkHasSelectAttr()) return
      --this.steppedNumber
    },
    onQuantityFocus() {
      this.setppedNumberCopy = this.steppedNumber
    },
    onQuantityBlur() {
      this.steppedNumber = null
      this.$nextTick(() => {
        this.steppedNumber = this.setppedNumberCopy
      })
    },
    exchangeData() {
      this.steppedNumber = null
      this.$nextTick(() => {
        this.steppedNumber = this.setppedNumberCopy
      })
    },

    onQuatityChange({ detail }) {
      if (this.checkHasSelectAttr()) {
        this.exchangeData()
        return
      }
      if (this.currentSku.miniQuantity > detail) {
        // 起订量
        return
      }
      if (detail > this.currentSku.yjdfStock) {
        this.exchangeData()
        uni.showToast({ title: '库存不足', icon: 'none' })
        return
      }
      this.setppedNumberCopy = detail
    },
    checkHasSelectAttr() {
      if (!this.hasSelectAttr) {
        uni.showToast({ title: '请选择规格', icon: 'none' })
        return true
      }
    },
    // 不同状态下的价格关系
    priceTypeReturnValue(inside, streategy, price) {
      if (this.isInsideActivity) {
        return inside
      } else {
        return this.isStrategy ? streategy : price
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.popup-action-btn{
  background-color: #10967B;
  border-radius: 22px;
  margin: 14px 10px;
  color: #ffffff;
  font-weight: 600;
}
.popup-sku-img{
  width: 220rpx;
  height: 220rpx;
  border-radius: 6px;
  border: 1px solid #F0F1F2;
}
.disabledBackground{
  background-color: #5d6670 !important;
}
.stepperInput {
  width: 30px;
  height: 25px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  background: transparent;
  z-index: 999;
}
.border-bottom-green{
  border-bottom: 1px solid #34947c;
}
/deep/ .van-stepper__input{
  color: #242629 !important;
  font-size: 13px;
  background-color: #F6F6F6;
}
/deep/ .van-stepper__minus,
/deep/ .van-stepper__plus{
  background-color: #F6F6F6;
  border-radius: 4px;
  color: #242629;
  font-weight: 600;
}
/deep/ .van-stepper__minus--disabled{
  color: #959CA7;
}
.disabled-btn {
  pointer-events: none;
  opacity: 0.6;
}
.sale_end{
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  width: 136rpx;
  height: 136rpx;
  z-index: 2;
}
</style>
