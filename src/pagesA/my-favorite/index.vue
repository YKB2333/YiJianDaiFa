<template>
  <view id="page">
    <view v-if="list.length" class="row space-between wrap p28">
      <view
        v-for="(item,index) in list"
        :key="index"
        class="goodsItem"
        @touchend="touchend($event,item)"
        @touchmove="touchmove"
        @touchstart="touchstart($event,item)"
      >
        <goods-item
          type='50'
          :title="item.name"
          :tagTitle="getTagTitle(item)"
          :price="priceTypeReturnValue(item)"
          :originPrice="originPrice(item)"
          :saleEnd="item.yjdfStock == 0"
          :img="item.titleImage"
          :intro="item.productDescribe"
          @link="navigateTo($pageUrl.SPU, `spuId=${item.id}`)"
        ></goods-item>
      </view>
    </view>
    <empty-box
      :loading="query.loading"
      :finished="query.finished"
      :error="query.error"
      :is-empty="list.length === 0 && query.finished"
      :image="IMAGE['img_car_none2']"
      label="您暂未收藏众上好货！"
      img-class="w430 h340 mt280"
      empty-class="empty-class"
    >
      <view slot="finished">
        <base-empty />
      </view>
    </empty-box>
    <!-- sku弹窗 -->
    <sku-popup :spu-id="currentSpuId" :visible.sync="visible" />
  </view>
</template>
<script>
import { img_car_none2 } from '@/image-config.js'
import { navigateTo } from '@/utils'
import { getFavorite } from '@/api/cms'
import { cancelFavoriteGoods } from '@/api/goods'
import SkuPopup from '@/pages/sku-popup/index'
import { authentication } from '@/mixins/auth'
import { goods } from '@/mixins/goods'
import goodsItem from '@/components/GoodsItem';
import BaseEmpty from '@/components/BaseEmpty'
import EmptyBox from '@/components/empty-box'

export default {
  name: 'MyFavorite',
  components: { SkuPopup, goodsItem, EmptyBox, BaseEmpty },
  mixins: [goods, authentication],
  data() {
    return {
      Loop: null, // 定时器
      IMAGE: {
        img_car_none2
      },
      list: [],
      query: {
        loading: false,
        error: false,
        finished: false,
        pageIndex: 1,
        pageSize: 10,
        sysTag: 'yjdf'
      },
      loading: false,
      finished: false,
      flag: 1,
      visible: false,
      currentSpuId: '' // 弹窗spuId
    }
  },
  onShow() {
    this.loadList()
  },
  onReachBottom() {
    if (!this.finished) {
      this.loadList()
    }
  },
  methods: {
    touchstart(e, item) {
      this.flag = 1
      this.touch_start = e.timeStamp
      clearInterval(this.Loop)
      this.Loop = setTimeout(() => {
        if (this.flag == 2) return
        uni.showModal({
          content: '确认要取消收藏吗？',
          success: (res) => {
            if (res.confirm) {
              cancelFavoriteGoods(item.id).then(res => {
                this.list = this.list.filter(e => e.id !== item.id)
                uni.showToast({ title: '操作成功', duration: 2000, icon: 'none' });
              }).catch(e => {
                uni.showToast({ title: e.message || '操作失败', duration: 2000, icon: 'none' });
              })
            }
          }
        });
      }, 300);
    },
    touchmove() {
      this.flag = 2
    },
    touchend(e, item) {
      if (this.flag == 1) {
        this.touch_end = e.timeStamp
        const time = this.touch_end - this.touch_start
        if (time < 600) {
          navigateTo(this.$pageUrl.SPU, `spuId=${item.id}`)
        }
      }
      clearInterval(this.Loop)
    },
    // 添加入选品车
    addCart(item) {
      this.currentSpuId = item.id
      this.visible = true
    },
    // 跳转首页
    linkHome() {
      uni.switchTab({ url: '/pages/tabbar/Home' });
    },
    loadList() {
      const { loading, finished, error } = this.query
      if (loading || finished || error) {
        return
      }
      this.query.loading = true
      getFavorite(this.query).then(({ result }) => {
        const data = (result && result.list) || []
        this.list = this.list.concat(data)
        this.query.error = false
        if (data.length === 0 || this.list.length < this.query.pageSize) {
          this.query.finished = true
          return
        }
        this.query.pageIndex += 1
      }).catch(err => {
        this.query.error = true
      }).finally(() => {
        this.query.loading = false
      })
    },
    // 不同状态下原价格价格 1活动 2代发
    originPrice(data) {
      const { highestActivityGeneralPrice, highestActivityStrategyPrice, highestStrategyPrice, highestPrice } = data
      if (highestActivityGeneralPrice || highestActivityStrategyPrice) {
        return this.isStrategy ? highestStrategyPrice : highestPrice
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.goodsItem {
  width: 49%;
  margin-bottom: 2%;
  background: white;
  border-radius: 8rpx;
  overflow: hidden;
}
.empty {
  padding-top:120rpx;
  height:100vh;
  box-sizing:border-box;
  background: white;
}
/deep/ .empty-class{
  height: 100vh
}
</style>
