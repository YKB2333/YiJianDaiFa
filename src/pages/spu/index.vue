
<template>
  <scroll-view
    @scroll="onScroll"
    :scroll-y="canScroll"
    :scroll-top="scrollTop"
    :scroll-anchoring="true"
    style="height:100vh"
  >
    <view class="spu-page">
      <!-- 图标组合 -->
      <image v-show="!showIconBack && !isInsideActivity" :src="IMAGE['icon_phone']" class="icon-phone" @tap="onCall" mode="widthFix" />
      <view class="icon-back-top col">
        <view class="col" v-if="userStatus === 'enable'">
          <view class="col" v-if="downloadMethodSwitch">
            <image :src="IMAGE['product_detail_download']" @tap="saveImage" mode="widthFix" />
            <image :src="IMAGE['product_detail_push']" @tap="goodsPush" mode="widthFix" v-if="!isInsideActivity"/>
          </view>
          <!-- 返回按钮 -->
          <image v-if="!downloadMethodSwitch" :src="IMAGE['product_detail_down']" @click.stop="downloadMethodSwitch = true" mode="widthFix" />
          <image v-else :src="IMAGE['product_detail_back']" @click.stop="downloadMethodSwitch = false" mode="widthFix" />
        </view>
        <!-- 回到顶部 -->
        <image v-if="showIconBack" :src="IMAGE['product_detail_top']" @tap="backToTop" />
      </view>

      <!-- 轮播图 -->
      <view class="swiper-wrapper relative">
        <swiper
          class="swiper-container"
          :autoplay="!isInVideo"
          interval="4000"
          :current="swiperCurrent"
          @change="onSwiperChange">
          <!-- 视频 -->
          <swiper-item v-if="spu.videos.length">
            <video
              :id="vid"
              :show-center-play-btn="false"
              :src="spu.videos[0].attaUrl"
              :enable-progress-gesture="false"
              @ended="onEnded"
              style="width:100vw;height:100vw;"
            />
          </swiper-item>
          <!-- 图片 -->
          <swiper-item v-for="(item, index) in swiperImgs" :key="index">
            <van-image :src="item.imagePath || IMAGE.big_logo" @tap="onPreviewImage(swiperImgs, index)" fit="contain" lazy-load  use-loading-slot width="100%" height="100%">
              <van-loading slot="loading" type="spinner" size="20" vertical />
            </van-image>
          </swiper-item>
          <image :src="IMAGE['video_play_btn']" class="play-btn" @tap="onPlay" v-show="showPlayBtn" />
        </swiper>
        <!-- 指示点 -->
        <view class="swiper-dot-contanier" v-if="!isInVideo">
          <view v-for="(dot, cur) in swiperImgs" :key="dot.id" class="dot" :class="{ 'active': cur == swiperCurrent }"></view>
          <view v-if="spu.videos.length" class="dot" :class="{ 'active': swiperImgs.length == swiperCurrent }"></view>
        </view>
        <!-- 已售罄-图标 -->
        <view class="sale_end" v-if="spu.yjdfStock === 0">
          <image :src="IMAGE['sale_end']"  class="w-h-full"/>
        </view>
      </view>

      <!-- 商品活动价格倒计时 -->
      <view class="relative row bg-light-grey" style="min-height: 80rpx" v-if="isVisibleActivity">
        <image :src="IMAGE['goods_details_activity']" mode="widthFix" class="w-full"/>
        <view class="absolute pos-center row space-between center-y w-full fs20 fc-white plr28 border-box">
          <!-- 价格 -->
          <view class="col">
            <text v-if="userStatus === 'enable'" class="mb8" style="line-height: 1">
              <text class="fs26 mr10">
                ¥<text class="fs40 fw500">{{ activityGoods.money }}</text>
                <text>.{{ activityGoods.floatMoney }}</text>
              </text>
              <text style="text-decoration:line-through; opacity: 0.7">¥{{ activityGoods.originalPrice }}</text>
            </text>
            <text v-else class="fs26 fc-white mb8">认证后查看价格</text>

            <view class="bg-white radius14 plr8 spu-color-money" style="align-self: baseline">{{ isStrategy ? '战略抢购价' : '抢购价' }}</view>
          </view>
          <!-- 零售价 -->
          <view class="col"  >
            <text class="fs26 mr8 mb8" style="line-height: 1">
              ¥<text class="fs40 fw500">{{ String(currentSku.msrp || spu.lowerMsrp || '00').split('.')[0] }}</text>
              <text>.{{ String(currentSku.msrp || spu.lowerMsrp || '0.00').split('.')[1] || '00' }}</text>
            </text>
            <text>建议零售价</text>
          </view>
          <view class="goodsActivityTime">
            <view>距离结束仅剩:</view>
            <van-count-down use-slot :time="countDownTimeLength" @change="timeDataChange" @finish="isShowCountDown = false">
              <text class="fs24 pr6 fw500 spu-color-money">{{ time.days }}天</text>
              <text class="box">{{ time.hours }}</text>
              <text class="plr6 inline-block spu-color-money">:</text>
              <text class="box">{{ time.minutes }}</text>
              <text class="plr6 inline-block spu-color-money">:</text>
              <text class="box">{{ time.seconds }}</text>
            </van-count-down>
          </view>
        </view>
      </view>

      <!-- 商品名称、价格 -->
      <view class="bg-white mb24 plr28 pt40 pb16">
        <view class="row space-between">
          <text class="fc-black fw600 fs32 mb16">{{ spu.name }}</text>
          <image :src="IMAGE['icon_copy']" class="w-h48" @tap="copyContent" />
        </view>
        <view class="fc-grey fs26" v-if="spu.productDescribe">{{ spu.productDescribe }}</view>
        <view class="row mt20 wrap" v-if="!isVisibleActivity">
          <!-- 是战略客户属性、并且不是内购活动，显示 -->
          <view class="flex-1" v-if="isStrategy && !isInsideActivity">
            <price-item
              title="战略代发价"
              :is-enable="userStatus === 'enable'"
              :isFocus="hasSelectAttr"
              :price="currentSkuStrategyPrice || 0"
              :lowest-price="spu.lowestStrategyPrice || 0"
              :higher-price="spu.highestStrategyPrice || 0"
            />
          </view>
          <!-- 战略客户属性不是佣金模式、 或者是内购活动，显示 -->
          <view class="flex-1" v-if="isStrategy !== 'COMMISSION' || isInsideActivity">
            <price-item
              :title="priceTypeReturnValue('内购价', '一般代发价', '一件代发价')"
              :is-enable="userStatus === 'enable'"
              :isFocus="hasSelectAttr"
              :price="currentSkuPrice || 0"
              :lowest-price="lowestPrice || 0"
              :higher-price="higherPrice || 0"
            />
          </view>
          <view class="flex-1">
            <price-item
              title="建议零售价"
              :is-enable="true"
              :isFocus="hasSelectAttr"
              :price="currentSku.msrp || 0"
              :lowest-price="spu.lowerMsrp || 0"
              :higher-price="spu.higherMsrp || 0"
            />
          </view>
        </view>
        <view class="row flex-end">
          <image :src="IMAGE['icon_more']" class="icon-more" @tap="openPopup(1)" style="z-index:2"/>
        </view>
      </view>

      <!-- 优惠 -->
      <view class="bg-white mb24 plr28 ptb32 row center-y w-full border-box hidden" @tap="openPopup(5)" v-if="couponList && couponList.length">
        <view class="fc-black fs32 fw600">优惠</view>
        <view class="row flex-1 relative hidden" v-if="couponListReceiveStatus">
          <view class="receiveButton">领券</view>
          <view class="receiveItem" v-for="(item, index) in couponListSlice" :key="index">{{ getCouponName(item) }}</view>
        </view>
        <view v-else class="fs26 flex-1 ml28" style="color: #FF7640">
          已领取优惠券,现在下单可享受优惠哦～
        </view>
        <view>
          <image :src="IMAGE['icon_more']" class="icon-more" style="z-index:2"/>
        </view>
      </view>

      <!-- 属性规格 -->
      <view class="bg-white mb24" v-if="spu.firstAtbKey">
        <view class="hairline-bottom plr28 ptb32">
          <text class="fc-black fs32 fw600">属性规格</text>
          <text v-if="currentSku.miniQuantity > 1 && hasSelectAttr" class="fs24 pl20 fc-grey">起订量：{{ currentSku.miniQuantity }}</text>
          <text v-else-if="!hasSelectAttr" class="fs24 pl20" style="color: #dd524d;">请选择规格</text>
        </view>
        <view class="plr28 ptb40">
          <!-- 主属性 -->
          <view class="row" v-if="spu.firstAtbKey">
            <text class="fs28 fc-black mr40 pt6">{{ spu.firstAtbKey }}</text>
            <view class="flex-1 row wrap">
              <sku-button
                v-for="value in firstAtbValueArr"
                :key="value"
                :active="isSkuActive(value, 'firstAtbKey')"
                :disabled="isSkuDisabled(value, 'firstAtbKey')"
                @click="onSkuClick(value, 'firstAtbKey')">
                {{ value }}
              </sku-button>
            </view>
          </view>
          <!-- 副属性 -->
          <view class="row mt20" v-if="spu.secondAtbKey">
            <text class="fs28 fc-black mr40 pt6">{{ spu.secondAtbKey }}</text>
            <view class="flex-1 row wrap">
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
          <view class="row flex-end">
            <image :src="IMAGE['icon_more']" class="icon-more" @tap="openPopup(2)" style="margin-top: -20rpx;z-index:2" />
          </view>
        </view>
      </view>

      <!-- 商品参数 -->
      <view class="bg-white mb24">
        <view class="fc-black fs32 fw600 hairline-bottom plr28 ptb32">商品参数</view>
        <view class="form-item" v-if="spu.producePlace">
          <view class="form-label">产地</view><view class="form-value">{{ spu.producePlace }}</view>
        </view>
        <view class="form-item">
          <view class="form-label">条码</view><view class="form-value">{{ currentSku.codeBar || spu.codeBar }}</view>
        </view>
        <view class="form-item">
          <view class="form-label">产品分类</view><view class="form-value">{{ cateNames }}</view>
        </view>
        <view class="row center-y pr28">
          <view class="form-item flex-1">
            <view class="form-label">保质期</view><view class="form-value">{{ spu.shelfLife ? `${spu.shelfLife}天` : '-' }}</view>
          </view>
          <image :src="IMAGE['icon_more']" class="icon-more" @tap="openPopup(3)" style="z-index:2" />
        </view>
      </view>

      <!-- 仓库库存 -->
      <view class="bg-white mb24 plr28 ptb32 row space-between center-y">
        <view class="fc-black fs32 fw600">仓库库存</view>
        <view>
          <text class="fc-gray fs26 pr20">可发货库存: {{ totalStock }}</text>
          <image :src="IMAGE['icon_more']" class="icon-more" @tap="openPopup(4)" style="z-index:2"/>
        </view>
      </view>

      <!-- 物流信息 -->
      <view class="bg-white mb24" v-if="logistics">
        <view class="hairline-bottom plr28 ptb32" v-if="logistics.title">
          <text class="fc-black fs32 fw600 ellipsis2">{{ logistics.title }}</text>
        </view>
        <view class="flex-1 hidden fs26 plr28 ptb38" v-if="logistics.value">
          <rich-text :nodes="logistics.value"></rich-text>
        </view>
      </view>

      <!-- 内购详情 -->
      <view class="bg-white mb24 innerSaleBox" v-if="isInsideActivity && spu.remark || spu.imagesList.length || spu.videoList.length">
        <view class="hairline-bottom plr28 ptb32">
          <text class="fc-black fs32 fw600 ellipsis2">内购详情</text>
        </view>
        <view class="flex-1 hidden fs26 plr28 pb40">
          <view class="row center-y relative" v-if="spu.remark">
            <view class="dot"></view>
            <view class="title">内购备注</view>
          </view>
          <view v-if="spu.remark">{{ spu.remark }}</view>

          <view class="row center-y relative" v-if="spu.imagesList && spu.imagesList.length">
            <view class="dot"></view>
            <view class="title">内购图片</view>
          </view>
          <view class="mb16 row wrap" v-if="spu.imagesList && spu.imagesList.length">
            <view  v-for="(item, index) in spu.imagesList" :key="index" :class="['innerSaleGoodsImage', {'mr0': (index+1) %3 == 0}]">
              <van-image :src="item.url"  @tap="onPreviewImage(spu.imagesList, index, 'url')" fit="cover" lazy-load  use-loading-slot width="100%" height="100%">
                <van-loading slot="loading" type="spinner" size="20" vertical />
              </van-image>
            </view>
          </view>

          <view class="row center-y relative" v-if="spu.videoList && spu.videoList.length">
            <view class="dot"></view>
            <view class="title">内购视频</view>
          </view>
          <view class="mb16 row wrap">
            <view  v-for="(item, index) in spu.videoList" :key="index" :class="['innerSaleGoodsImage relative', {'mr0': (index+1) %3 == 0}]">
              <video
                :show-center-play-btn="false"
                :src="item.url"
                :enable-progress-gesture="false"
                class="w-h-full"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 商品详情图 -->
      <view class="bg-white" v-if="detailImgs.length">
        <view class="text-center ptb32 hairline-bottom"><image :src="IMAGE['goods_detail_title']" style="width: 170px;" mode="widthFix"  /></view>
        <!-- 详情图 -->
        <view>
          <van-image
            v-for="(item, index) in detailImgs"
            :key="item.id"
            :src="item.imagePath"
            @tap="onPreviewImage(detailImgs, index)"
            fit="widthFix" lazy-load  use-loading-slot width="100%" height="100%"
          >
            <van-loading slot="loading" type="spinner" size="20" vertical />
          </van-image>
        </view>
      </view>

      <!-- 底部 -->
      <view class="bottom-bar">
        <!-- 默认正常销售渠道 -->
        <view :class="['row pr60 center-y', {'pl38': isInsideActivity}]" >
          <view class="col center-y mr60" @tap="onFavorite" v-if="!isInsideActivity">
            <image :src="isFavorite ? IMAGE['icon_heart_active'] : IMAGE['icon_heart']" class="icon" />
            <text class="fs22 fc-gray">收藏</text>
          </view>
          <customer-service >
            <view class="col center-y mr60" >
              <image :src="IMAGE['icon_msg']" class="icon" />
              <text class="fs22 fc-gray">询单</text>
            </view>
          </customer-service >
          <view class="col center-y relative" @tap="toCartPage">
            <image :src="IMAGE['icon_cart']" class="icon" />
            <text class="fs22 fc-gray">{{ isInsideActivity ? '购物车' : '选品车' }}</text>
            <text class="cart-badge" v-if="cartCount">{{ cartCount > 9 ? '9+' : cartCount }}</text>
          </view>
        </view>
        <view class="flex-1" @click="addShoppingTips">
          <button :class="['add-button', {'disabled-btn': !spu.isOnSale || spu.yjdfStock == 0}]" :loading="addLoading" @tap="onAddCart" >{{ isInsideActivity ? '加入内购购物车' : '加入选品车' }}</button>
        </view>
      </view>

      <!-- 弹窗 -->
      <van-popup
        :show="showPopup"
        round closeable
        :close-on-click-overlay="true"
        position="bottom"
        :custom-style="[5].includes(popupType) ? 'height: 77vh' : 'max-height: 77vh'"
        :close-icon="IMAGE['icon_close']"
        @close="closePopup">
        <view class="h-full col">
          <view class="text-center fc-black fw600 fs32 ptb40 hairline-bottom" v-if="popupType !== 2">
            <text v-if="popupType === 1">价格</text>
            <text v-if="popupType === 3">商品参数</text>
            <text v-if="popupType === 4">库存</text>
            <text v-if="popupType === 5">领取优惠券</text>
          </view>

          <!-- 价格 -->
          <view v-if="popupType === 1" class="flex-1 hairline-bottom" style="overflow-y: auto;min-height:40vh">
            <view class="ptb32 ml40 hairline-bottom row center-y dot-before">
              <text class="fc-black fs32 fw600">{{ priceTypeReturnValue('内购价格：', '战略代发价格：', '一件代发价格：') }}</text>
              <view class="row center-y fc-money">
                <view>
                  <auth-money :money="priceTypeReturnValue(lowestPrice, spu.lowestStrategyPrice, lowestPrice)" moneyLabel="fs26" moneyClass="fs36"/>
                </view>
                <block v-if="priceTypeReturnValue(lowestPrice, spu.lowestStrategyPrice, lowestPrice) !== priceTypeReturnValue(higherPrice, spu.highestStrategyPrice, higherPrice)">
                  <view class="mlr8">~</view>
                  <view>
                    <auth-money :money="priceTypeReturnValue(higherPrice, spu.highestStrategyPrice, higherPrice)" moneyLabel="fs26" moneyClass="fs36"/>
                  </view>
                </block>
              </view>
            </view>
            <view v-if="isCurrentProductActivity && !isInsideActivity" class="ptb32 ml40 hairline-bottom row center-y dot-before">
              <text class="fc-black fs32 fw600">{{ isStrategy ? '战略抢购价：' : '抢购价：' }}</text>
              <view class="row center-y fc-money">
                <view>
                  <auth-money :money="isStrategy ? spu.lowestActivityStrategyPrice : spu.lowestActivityGeneralPrice" moneyLabel="fs26" moneyClass="fs36"/>
                </view>
                <block v-if="isStrategy ? spu.lowestActivityStrategyPrice : spu.lowestActivityGeneralPrice !== isStrategy ? spu.highestActivityStrategyPrice : spu.highestActivityGeneralPrice">
                  <view class="mlr8">~</view>
                  <view>
                    <auth-money :money="isStrategy ? spu.highestActivityStrategyPrice : spu.highestActivityGeneralPrice" moneyLabel="fs26" moneyClass="fs36"/>
                  </view>
                </block>
              </view>
            </view>
            <view class="ptb32 mlr40 hairline-bottom row center-y dot-before normal fs28" v-for="(item, index) in skus" :key="index">
              <view class="flex-1 fc-black">{{ item.firstAtbValue || '-' }}{{ item.secondAtbValue ? '；' + item.secondAtbValue : '' }}</view>
              <view v-if="item.activityPrice && !isInsideActivity" class="flex-1 row center-y flex-end" >
                <view class="fc-gray">{{ isStrategy ? '战略抢购价：' : '抢购价：' }}</view>
                <view class="fc-money">
                  <auth-money :money="item.price" moneyLabel="fs26" moneyClass="fs36"/>
                </view>
              </view>
              <view v-else class="flex-1 row center-y flex-end">
                <view class="fc-gray">{{ priceTypeReturnValue('内购价：', '战略价：', '代发价：') }}</view>
                <view class="fc-money">
                  <auth-money v-if="isInsideActivity" :money="item.price" moneyLabel="fs26" moneyClass="fs36"/>
                  <auth-money v-else-if="isStrategy" :money="item.strategyPrice" moneyLabel="fs26" moneyClass="fs36"/>
                  <auth-money v-else :money="item.price" moneyLabel="fs26" moneyClass="fs36"/>
                </view>
              </view>
            </view>
          </view>
          <!-- 规格 -->
          <view v-if="popupType === 2" class="flex-1 hairline-bottom" style="overflow-y: auto;">
            <view class="row center-y hairline-bottom ptb40 pr40 ml40">
              <view class="relative">
                <image :src="skuImg" class="popup-sku-img" mode="aspectFit"/>
                <view class="sale_end w136 h136" v-if="currentSku && currentSku.yjdfStock == 0" >
                  <image :src="IMAGE['sale_end']"  class="w-h-full" mode="widthFix"/>
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
                    <auth-money :money="priceTypeReturnValue(currentSkuPrice, currentSkuStrategyPrice, currentSkuPrice)" moneyLabel="fs26" moneyClass="fs36 fw600"/>
                  </view>
                  <view class="fs22 fc-grey pl10">{{ priceTypeReturnValue('内购价','战略价','代发价') }}</view>
                </view>
                <view class="fs22 fc-grey mtb10">库存：{{ currentSku.yjdfStock || 0 }}件</view>
                <view v-if="hasSelectAttr" class="fs22 fc-grey">已选：{{ currentSelect.map(e => e.value).join('、') }} </view>
                <view v-else class="fs24" style="color: #dd524d;">请选择规格</view>
              </view>
            </view>
            <view class="hairline-bottom ml40 ptb20" v-if="spu.firstAtbKey">
              <view class="mb32 row center-y">
                <text class="fc-black fs28">{{ spu.firstAtbKey }}</text>
                <text v-if="currentSelect.some(e => e.key === 'firstAtbKey' && !e.value)" class="fs24 pl20" style="color: #dd524d;">请选择</text>
              </view>
              <view class="row wrap">
                <sku-button
                  v-for="value in firstAtbValueArr"
                  :key="value"
                  :active="isSkuActive(value, 'firstAtbKey')"
                  :disabled="isSkuDisabled(value, 'firstAtbKey')"
                  @click="onSkuClick(value, 'firstAtbKey')">
                  {{ value }}
                </sku-button>
              </view>
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
          <!-- 商品参数 -->
          <view v-if="popupType === 3" class="flex-1" style="overflow-y: auto;min-height:40vh">
            <view class="form-item form-item-border" v-if="spu.producePlace">
              <view class="form-label">产地</view><view class="form-value">{{ spu.producePlace }}</view>
            </view>
            <view class="form-item form-item-border">
              <view class="form-label">条码</view><view class="form-value">{{ spu.codeBar }}</view>
            </view>
            <view class="form-item form-item-border">
              <view class="form-label">产品分类</view><view class="form-value">{{ cateNames }}</view>
            </view>
            <view class="form-item form-item-border" v-if="spu.shelfLife">
              <view class="form-label">保质期</view><view class="form-value">{{ spu.shelfLife }}天</view>
            </view>
            <view class="form-item form-item-border">
              <view class="form-label">尺寸（长*宽*高）</view><view class="form-value">{{ skuSize }}</view>
            </view>
            <view class="form-item form-item-border" v-if="currentSku.wholesaleMinOrder">
              <view class="form-label">批发起订量</view><view class="form-value">{{ currentSku.wholesaleMinOrder  }}</view>
            </view>
          </view>
          <!-- 库存 -->
          <view v-if="popupType === 4" class="flex-1 hairline-bottom" style="overflow-y: auto;min-height:40vh">
            <view class="ptb32 ml40 hairline-bottom row center-y dot-before">
              <text class="fc-black fs32 fw600">可发库存：{{ totalStock }}</text>
            </view>
            <view class="ptb32 ml40 hairline-bottom row center-y dot-before normal fs28" v-for="(item, index) in skus" :key="index">
              <view class="flex-1 fc-black">{{ item.firstAtbValue || '-' }}{{ item.secondAtbValue ? '；' + item.secondAtbValue : '' }}</view>
              <view class="flex-1 fc-gray text-center">库存：{{ item.yjdfStock || 0 }}</view>
            </view>
          </view>
          <!-- 领取优惠券 -->
          <view v-if="popupType === 5" class="flex-1 hairline-bottom" style="overflow-y: auto;min-height:40vh">
            <view v-for="(item, index) in couponList" :key="index">
              <coupon-item
                :value="item"
                :application="item.application"
                parent-class="mt20 mb8 coupon_box"
                :status="fetchCurrentStatus(item)"
                :price="item.couponValue"
                :condition="`满${item.amount}元可用`"
                name="全场通用"
                :time="`${formatDate(item.effectiveTime, 'M月D日')}-${formatDate(item.invalidTime, 'M月D日')}有效`"
                @action="action"
              ></coupon-item>
            </view>
          </view>
          <!-- 按钮 -->
          <block v-if="popupType === 2">
            <button :class="['popup-close-btn', {'disabled-btn':!spu.isOnSale || (currentSku && !currentSku.yjdfStock)}]" @tap="fetchAddGoodsCart">{{ isInsideActivity ? '加入内购购物车' : '加入选品车' }}</button>
          </block>
          <block v-else-if="popupType === 5">
            <button class="popup-close-btn" @tap="closePopup">{{ '关闭' }}</button>
          </block>
          <button v-else class="popup-close-btn" @tap="closePopup">知道了</button>
        </view>
      </van-popup>
    </view>

    <!-- 去认证 -->
    <to-authenticate style-string="bottom:30%"></to-authenticate>
  </scroll-view>
</template>

<script>
import {
  icon_phone, icon_more, goods_detail_title, icon_heart, icon_heart_active,
  icon_msg, icon_cart, icon_close, icon_back_top, video_play_btn, big_logo,
  icon_download, icon_copy, product_detail_top, product_detail_down, product_detail_push,
  product_detail_download, product_detail_back, sale_end, goods_details_activity
} from '@/image-config.js'
import SkuButton from './sku-button'
import { throttles, isEmpty, debounce, formatDate, toThousandFilter } from '@/utils'
import {
  getGoodsDetail, addGoodsToCart, getCartCount, favoriteGoods,
  cancelFavoriteGoods, checkFavoriteState, goodsPutaway, innerSpuDetail
} from '@/api/goods'
import { getCustomerPhone, getDictionaryByCode } from '@/api/dictionary'
import { mapGetters } from 'vuex'
import customerService from '@/components/customer-service'
import { uniDonwloadFile, uniSaveImage } from '@/const/promise-client-api'
import toAuthenticate from '@/components/to-authenticate';
import { ORDER_POSTAGE, WXMP_COUPON_SHOP_CODE } from '@/const/dictionary'
import { authentication } from '@/mixins/auth'
import { share } from '@/mixins/share'
import TYPES from '@/store/types'
import priceItem from '@/pages/spu/components/price-item'
import { checkInnerbuyStatus } from '@/api/order'
import couponItem from '@/components/coupon-item';
import { getCouponTemplateVo, acquire } from '@/api/coupon'

export default {
  name: 'Spu',
  mixins: [authentication, share],
  components: { SkuButton, customerService, toAuthenticate, priceItem, couponItem },
  data() {
    return {
      IMAGE: {
        icon_phone,
        icon_more,
        goods_detail_title,
        icon_heart,
        icon_heart_active,
        icon_msg,
        icon_cart,
        icon_close,
        icon_back_top,
        video_play_btn,
        icon_download,
        icon_copy,
        product_detail_top,
        product_detail_down,
        product_detail_push,
        product_detail_download,
        product_detail_back,
        sale_end,
        goods_details_activity
      },
      spuId: '', // 页面参数spuId
      paramSkuId: '', // 页面参数skuId
      canScroll: true,
      isFavorite: false, // 是否已收藏
      cartCount: 0, // 选品车数量
      showPopup: false, // 是否显示弹窗
      popupType: 1, // 弹窗：1价格，2规格，3商品参数，4库存
      showIconBack: false, // 是否显示返回顶部图标
      scrollTop: 0,
      spu: {
        name: '', // 商品名称
        productDescribe: '', // 商品描述
        lowerMsrp: 0, // 建议零售价-低
        higherMsrp: 0, // 建议零售价-高
        lowestPrice: 0, // 一件代发-低
        highestPrice: 0, // 一件代发-高
        lowestGeneralPrice: 0, // 一般客户最低价
        highestGeneralPrice: 0, // 一般客户最高价
        lowestStrategyPrice: 0, // 战略客户最低价
        highestStrategyPrice: 0, //战略客户最高价
        producePlace: '', // 产地
        codeBar: '', // 条码
        firstCateName: '', // 一级分类名称
        secondCateName: '', // 二级分类名称
        cateName: '', // 三级分类名称
        shelfLife: '', // 保质期
        retailUnit: '', // 零售单位
        firstAtbKey: '', // 主属性
        secondAtbKey: '', // 副属性
        videos: [], // 视频
        yjdfStock: -1,
        remark: '',
        attachments: '',
        imagesList: '',
        videoList: [], // 内购视频
        isOnSale: false,
        lowestActivityGeneralPrice: '',
        highestActivityGeneralPrice: '',
        lowestActivityStrategyPrice: '',
        highestActivityStrategyPrice: ''
      },
      swiperSupImgs: [], // spu 轮播图
      swiperImgs: [], // 轮播图
      detailImgs: [], // 详情图
      skus: [], // sku列表
      currentSku: {}, // 当前sku
      currentSelect: [], // 当前选择的sku属性
      addLoading: false, // 添加选品按钮loading
      vid: 'vid', // 视频组件id
      videoContext: null, // 视频组件上下文
      isInVideo: false,
      showPlayBtn: false,
      swiperCurrent: 0,
      logistics: '', // 物流信息
      steppedNumber: 1, // 选择数量
      setppedNumberCopy: null,
      downloadMethodSwitch: false, // 下载方法开关
      options: {}, // 传入页面的参数
      couponList: [], // 优惠券列表
      couponListReceiveStatus: false, // 优惠券列表是否都已经被领取
      couponListSlice: [],
      countDownTimeLength: '', // 倒计时时长
      time: null,
      isShowCountDown: false,
      isCurrentProductActivity: '', // 当前商品是否开启了活动
      activityGoods: {}, // 活动栏目对象
      spuTitleImage: '',
      shopCode: {}
    }
  },
  onShow() {
    // 获取选品车数量
    this.fetchCartCount()
    // 获取用户信息
    if (this.userStatus === 'enable' && (!this.userInfo || !this.customerUserInfo || !Object.keys(this.customerUserInfo).length)) {
      this.$store.dispatch('getBaseInfo')
    }
  },
  async onLoad(options) {
    this.options = options
    if (options.page === 'inside_shopping_activity') {
      uni.setNavigationBarTitle({
        title: '内购商品详情'
      })
    }
    if (options.spuId) {
      this.spuId = options.spuId
      if (options.skuId) {
        this.paramSkuId = options.skuId
      }
      this.init()
      // 通过字典查询物流信息
      this.fetchLogistics()
      await this.fetchDictionary()
      this.fetchCouponList()
    }
  },
  watch: {
    //  监听当前sku
    currentSku: {
      handler(newValue, oldValue) {
        if (Object.keys(newValue).length) {
          this.activityGoods = {
            money: String(newValue.price).split('.')[0] || '0',
            floatMoney: String(newValue.price).split('.')[1] || '00',
            originalPrice: newValue.goodsPrice
          }
        } else {
          const money = this.isStrategy ? this.spu.lowestActivityStrategyPrice : this.spu.lowestActivityGeneralPrice;
          const originalPrice = this.isStrategy ? this.spu.lowestStrategyPrice : this.spu.lowestPrice
          this.activityGoods = {
            money: String(money).split('.')[0] || '0',
            floatMoney: String(money).split('.')[1] || '00',
            originalPrice: originalPrice || '0'
          }
        }
        // 获取当前商品时间
        this.countDownTimeLength = (newValue && newValue.activityEndDate && newValue.activityEndDate - new Date().getTime()) || ''
        // 当前商品数量
        if (newValue && newValue.miniQuantity) {
          this.steppedNumber = newValue.miniQuantity
        }
        // 当前商品图片
        if (newValue && newValue.images && newValue.images.length) {
          const newValueFilter = newValue.images.filter(e => e.imageType === '1')
          this.swiperImgs = newValueFilter.concat(this.swiperSupImgs)
        } else {
          this.swiperImgs = this.swiperSupImgs || [big_logo]
        }
        this.isInVideo = this.swiperImgs.length <= 1
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    ...mapGetters(['customerUserInfo', 'userInfo', 'activityObject']),
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
    // 分类显示一级/二级/三级
    cateNames() {
      const arr = [this.spu.firstCateName, this.spu.secondCateName, this.spu.cateName]
      return arr.filter(e => e).join('/')
    },
    // sku尺寸
    skuSize() {
      const arr = []
      if (!isEmpty(this.currentSku)) {
        arr.push(`${this.currentSku.skuLength || 0}mm`, `${this.currentSku.skuWeight || 0}mm`, `${this.currentSku.skuHeight || 0}mm`)
      }
      return arr.join('*')
    },
    // 总库存
    totalStock() {
      return this.skus.reduce((acc, cur) => acc + cur.yjdfStock || 0, 0)
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
      return this.options.page === 'inside_shopping_activity' ? 'INNER_GOODS' : 'COMMON_GOODS'
    },
    // 是否内购活动
    isInsideActivity() {
      return this.options.page === 'inside_shopping_activity'
    },
    // 商品最低价
    lowestPrice() {
      return this.priceTypeReturnValue(this.spu.lowestPrice, this.spu.lowestGeneralPrice, this.spu.lowestPrice)
    },
    // 商品最高价
    higherPrice() {
      return this.priceTypeReturnValue(this.spu.highestPrice, this.spu.highestGeneralPrice, this.spu.highestPrice)
    },
    // 当前sku价格
    currentSkuPrice() {
      return this.priceTypeReturnValue(this.currentSku.price, this.currentSku.generalPrice, this.currentSku.price)
    },
    currentSkuStrategyPrice() {
      return this.currentSku.strategyPrice
    },
    // 判断是否显示活动栏目
    isVisibleActivity() {
      return Boolean(!this.isInsideActivity && this.currentSku.activityPrice)
    }
  },
  methods: {
    formatDate,

    // 获取当前优惠卷状态
    fetchCurrentStatus(item) {
      // 优惠券模板状态, 10=已创建, 20=已激活, 30=已停用, 40=已作废
      if (item.isReceive) {
        return 'received'
      }
      const map = {
        30: 'disabled',
        20: 'notReceived',
        40: 'expired'
      }
      return map[item.couponTemplateStatus]
    },

    // 获取优惠卷列表
    fetchCouponList() {
      const data = {
        activityCouponType: 'GOOD_DETAIL', // 商品详情;
        shopCode: this.shopCode.shop_code
      }
      if (this.isInsideActivity) {
        data.shopCode = this.shopCode.inside_shop_code
      }
      getCouponTemplateVo(data).then(({ result }) => {
        if (result && result.length) {
          this.couponList = this.formatCoupon(result)
          this.couponListSlice = result.filter(e => !e.isReceive).slice(0, 2)
          this.couponListReceiveStatus = result.some(e => !e.isReceive)
        }
      })
    },
    formatCoupon(data) {
      return data.map(item => {
        let application = null
        if (item.couponShopList && item.couponShopList.length) {
          application = item.couponShopList.map(item => {
            return item.shopName
          }).join('、')
        } else {
          item.application = '适用条件：全平台'
          return item
        }
        item.application = item.couponShopList && item.couponShopList.every(e => e.effective) ? `适用条件：${application}` : `不适用条件：${application}`
        return item
      })
    },
    // 获取优惠卷名称
    getCouponName(item) {
      if (item.amount === 0) {
        return `无门槛减${toThousandFilter(item.couponValue)}元`
      }
      return `满${toThousandFilter(item.amount)}减${toThousandFilter(item.couponValue)}`
    },

    // 领取优惠卷
    action(type, item) {
      if (type === 'notReceived') {
        uni.showLoading({
          title: '领取中...',
          mask: true
        });
        acquire({
          activityId: item.activityId,
          couponTemplateId: item.id
        }).then(({ result }) => {
          this.couponList.find(e => e.id == item.id).isReceive = true
          this.couponListSlice = this.couponList.filter(e => !e.isReceive).slice(0, 2)
          this.couponListReceiveStatus = this.couponList.some(e => !e.isReceive)
          uni.hideLoading();
          uni.showToast({
            title: '领取成功',
            duration: 2000
          });
        }).catch(error => {
          uni.hideLoading();
          uni.showToast({
            title: error.message || '领取失败、请稍后重试',
            duration: 2000,
            icon: 'none'
          });
        })
      }
    },

    // 商品信息初始化
    init() {
      this.reset()
      uni.showLoading({ mask: true })
      // 内购禁止分享
      if (this.isInsideActivity) {
        wx.hideShareMenu()
      }
      const api = {
        INNER_GOODS: innerSpuDetail,
        COMMON_GOODS: getGoodsDetail
      }
      api[this.goodsType](this.spuId).then(({ result }) => {
        uni.hideLoading()
        // 判断返回值是否为空
        if (isEmpty(result)) {
          uni.showToast({ title: '商品已下架', icon: 'none' })
          uni.navigateBack()
          return
        }
        // 赋值spu、sku
        Object.keys(this.spu).forEach(key => {
          this.spu[key] = result[key]
        })
        this.skus = result.skus
        this.spuTitleImage = result.titleImage
        if (this.spu.attachments) {
          this.spu.imagesList = this.spu.attachments.filter(e => e.type === 0)
          this.spu.videoList = this.spu.attachments.filter(e => e.type === 1)
        }

        //获取商品图片banner 商品详情
        if (result.images) {
          this.swiperImgs = result.images.filter(e => e.imageType === '1').sort((a, b) => Boolean(b.isTitleImage) - Boolean(a.isTitleImage))
          this.detailImgs = result.images.filter(e => e.imageType === '2')
          if (this.swiperImgs && this.swiperImgs.length) {
            this.swiperSupImgs = this.swiperImgs
          } else {
            this.swiperSupImgs = [{ imagePath: big_logo }]
          }
        }
        // 如果页面传参有skuId，从sku列表找到对应的sku
        if (this.paramSkuId) {
          this.currentSku = this.skus.find(e => e.id === this.paramSkuId) || {}
        }
        // 如果只有一个规格默认选中
        if (result.skus.length === 1) {
          this.currentSku = this.skus[0]
        }
        // 判断是否sku列表内是否有活动的
        this.isCurrentProductActivity = result.skus.find(e => e.activityPrice)
        if (this.isCurrentProductActivity) {
          this.currentSku = this.isCurrentProductActivity
        }
        /**
         * 1.判断是否有活动、如果有活动默认选择第一个活动sku
         * 4.如果当前sku没有活动价格显示原来价格
         * 需求说明：
         * 1、原来的价格区域不显示，在商品图下方显示活动价格模块。
         * 2、一般客户：抢购价为活动时间的一件代发价；建议零售价为原来
         * 的建议零售价。距结束仅剩时间为活动结束倒计时，精确到秒。
         * 3、战略客户：战略客户抢购价为活动时间的战略客户代发价。建议零
         * 售价为原来的建议零售价，结束倒计时一样。
         *
        */

        // 生成主属性 / 副属性
        if (this.spu.firstAtbKey) {
          this.currentSelect.push({ key: 'firstAtbKey', value: this.currentSku.firstAtbValue })
        }
        if (this.spu.secondAtbKey) {
          this.currentSelect.push({ key: 'secondAtbKey', value: this.currentSku.secondAtbValue })
        }
        //  是否存在视频
        if (isEmpty(this.spu.videos)) {
          this.showPlayBtn = false
          this.isInVideo = this.swiperImgs.length <= 1
        } else {
          this.showPlayBtn = true
          this.isInVideo = true
          this.videoContext = uni.createVideoContext(this.vid)
        }
      }).catch((e) => {
        uni.hideLoading()
        uni.navigateBack();
        uni.showToast({ title: e.message || '商品数据异常、请稍后再试', icon: 'none' })
      })
      this.fetchFavoriteState() // 查询收藏状态
    },

    // 获取-物流
    fetchLogistics() {
      getDictionaryByCode(ORDER_POSTAGE).then(({ result }) => {
        const arr = JSON.parse(result.value) || {}
        if (this.goodsType === 'INNER_GOODS') {
          arr.value = arr.inside_shooping_goods
          arr.title = arr.inside_title
        } else {
          arr.value = arr.shopping_goods
          arr.title = arr.goods_title
        }
        this.logistics = arr
      })
    },

    // 查看大图
    onPreviewImage(data, index, keyNmae = 'imagePath') {
      const urls = data.map(e => e[keyNmae])
      uni.previewImage({
        urls: urls,
        current: index
      })
    },

    // 拨打电话
    onCall() {
      uni.showLoading()
      getCustomerPhone().then(({ result }) => {
        uni.hideLoading()
        if (result && result.value) {
          uni.makePhoneCall({
            phoneNumber: result.value
          })
        } else {
          uni.showToast({ title: '查无数据，请稍后重试', icon: 'none' })
        }
      }).catch((e) => {
        uni.hideLoading()
      })
    },

    // 打开弹窗
    openPopup(type) {
      this.canScroll = false
      this.popupType = type // 1价格，2规格，3商品参数，4库存, 5优惠卷
      if ([5].includes(type) && this.checkUserAuth()) {
        return
      }
      this.showPopup = true
      this.addLoading = false
    },

    // 关闭弹窗
    closePopup() {
      this.canScroll = true
      this.showPopup = false
    },

    // 重置数据
    reset() {
      this.swiperImgs = []
      this.detailImgs = []
      this.skus = []
      this.currentSelect = []
    },

    // 滚动监听
    onScroll: throttles(function({ detail }) {
      const { scrollTop } = detail
      if (scrollTop >= 600) {
        this.showIconBack = true
      } else {
        this.showIconBack = false
      }
    }, 200),

    // 回到顶部
    backToTop() {
      this.scrollTop = 1
      this.showIconBack = false
      // 需要两次设置的值不一样才能生效
      setTimeout(() => {
        this.scrollTop = 0
      }, 300)
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
      }
      if (key === 'secondAtbKey') {
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

    // 添加商品提示
    addShoppingTips() {
      if (!this.spu.isOnSale && this.isInsideActivity) {
        uni.showToast({
          title: '商品不在内购活动中',
          icon: 'none'
        });
      }
    },

    onSkuClick(value, key) {
      // 是否禁用不可以点击
      if (this.isSkuDisabled(value, key)) return
      // 判断是否激活sku-button ？取消选中 ： 赋值当前点击
      if (this.isSkuActive(value, key)) {
        this.currentSelect[this.currentSelect.findIndex(e => e.key === key)].value = ''
      } else {
        this.currentSelect[this.currentSelect.findIndex(e => e.key === key)].value = value
      }
      // 赋值当前的sku
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

    // 添加选品
    onAddCart() {
      const status = this.checkUserAuth()
      if (status) return
      this.openPopup(2)
    },

    // 加入选品车
    fetchAddGoodsCart() {
      const status = this.checkUserAuth()
      if (status) return

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
        const title = this.isInsideActivity ? '加入内购购物车' : '加入选品车'
        uni.showToast({ title: `${title}`, icon: 'none' })
        this.fetchCartCount()
        this.closePopup()
        this.$store.commit(TYPES.SET_CART_STATUS_REFRESH, 'refresh')
      }).finally(() => {
        this.addLoading = false
      })
    },

    // 轮播切换时
    onSwiperChange({ detail }) {
      this.swiperCurrent = detail.current
      if (!isEmpty(this.spu.videos)) {
        if (detail.current == 0) {
          this.isInVideo = true
          this.showPlayBtn = true
        } else {
          this.isInVideo = false
          this.showPlayBtn = true
          this.videoContext.pause()
        }
      }
    },

    // 点击播放视频
    onPlay() {
      // 播放，同时隐藏自定义播放按钮
      this.videoContext.play()
      this.showPlayBtn = false
    },

    // 视频结束
    onEnded() {
      // 显示播放按钮
      this.showPlayBtn = true
    },

    // 请求选品车数量
    fetchCartCount() {
      if (this.userStatus === 'enable') {
        const data = {
          goodsType: this.goodsType,
          pageIndex: 1,
          pageSize: 999
        }
        getCartCount(data).then(({ result }) => {
          this.cartCount = Number(result)
        })
      }
    },

    // 跳转选品车页面
    async toCartPage() {
      // 是否为内购
      if (this.isInsideActivity && this.userStatus === 'enable') {
        if (!this.userInfo.innerPerson) {
          uni.showToast({ title: '非内购员工', duration: 2000, icon: 'none' });
          return
        }
        // 判断有无内购对象、如果没有重新请求
        if (this.activityObject && Object.keys(this.activityObject).length === 0) {
          await this.fetchInsideActivity()
        }
        if (!this.activityObject || this.activityObject.status !== 'STARTING') { //活动状态是 开始中
          uni.showToast({ title: '非内购时间无法进入', duration: 2000, icon: 'none' });
          return
        }
        uni.navigateTo({
          url: `${this.$pageUrl.CART_PAGE}?page=inside_shopping_activity&&title=内购购物车`
        })
        return
      }
      if (this.userStatus === 'enable') {
        uni.navigateTo({
          url: `${this.$pageUrl.CART_PAGE}`
        })
      } else {
        this.checkUserAuth()
      }
    },

    // 获取内购活动数据
    fetchInsideActivity() {
      return new Promise(async(resolve, reject) => {
        checkInnerbuyStatus().then(({ result }) => {
          this.$store.commit(TYPES.SET_INSIDE_SHOPPING_ACTIVITY, result)
          resolve(result)
        }).catch((e) => {
          this.goBack(e.message || '活动信息错误')
          reject(e)
        })
      })
    },

    // 查询收藏状态
    fetchFavoriteState() {
      if (this.userStatus === 'enable') {
        checkFavoriteState(this.spuId).then(res => {
          this.isFavorite = res.result || false
        })
      }
    },

    // 收藏
    onFavorite() {
      const status = this.checkUserAuth()
      if (status) return

      if (this.isFavorite) {
        // 取消收藏
        this.isFavorite = false
        cancelFavoriteGoods(this.spuId).then(res => {
        })
          .catch(err => {
            this.isFavorite = true
          })
      } else {
        // 收藏
        this.isFavorite = true
        favoriteGoods(this.spuId).then(res => {
        })
          .catch(err => {
            this.isFavorite = false
          })
      }
    },

    // 保存图片
    saveImage: debounce(function() {
      uni.getSetting({
        success: (res) => {
          if (res.authSetting['scope.writePhotosAlbum']) { // 有保存权限
            this.startSave()
          } else { // 没有保存权限
            uni.authorize({ // 权限授权申请
              scope: 'scope.writePhotosAlbum',
              success: () => { // 授权成功
                this.startSave()
              },
              fail: () => { // 未授权
                this.errorAuth()
              }
            })
          }
        }
      })
    }, 300),

    // 没有保存图片权限提示、去获取权限授权
    errorAuth() {
      uni.showModal({
        title: '未开启保存权限',
        content: '开启保存权限才可以保存哦',
        confirmText: '去开启',
        success: t => {
          if (t.confirm) {
            uni.openSetting({ // 打开设置页面
              success(settingData) {
                if (settingData.authSetting['scope.writePhotosAlbum']) {
                  uni.showToast({ title: '开启权限成功，再次保存即可', icon: 'none' })
                } else {
                  uni.showToast({ title: '未开启权限', icon: 'none' })
                }
              }
            })
          }
        }
      })
    },

    // 保存图片当前手机中
    async startSave() {
      try {
        uni.showLoading({ title: '保存中', mask: true })
        let skusImgs = this.skus.map(item => {
          return item.images
        })
        skusImgs = skusImgs.flat()
        const arr = [...this.swiperSupImgs, ...this.detailImgs, ...skusImgs] // 商品主图+该spu的所有展示图片+所有产品商品详情图
        for (const item of arr) {
          const tempFilePathImg = await uniDonwloadFile(item.imagePath.replace('http', 'https'))
          await uniSaveImage(tempFilePathImg)
        }
        uni.hideLoading() // 没有放在finally的原因是 想关闭loadging 后还有提示
        uni.showToast({ title: '图片已保存到手机相册', icon: 'none' })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: `${error}`, icon: 'none' })
      }
    },

    // 复制商品名称
    copyContent() {
      uni.setClipboardData({
        data: this.spu.name,
        success: () => {
          uni.showToast({ title: '商品名称已复制', icon: 'none' })
        },
        fail: () => {
          uni.showToast({ title: '复制失败，请重试', icon: 'none' })
        }
      })
    },

    // 数量选择器- 增加
    onQuantityPlus() {
      if (this.checkHasSelectAttr()) return
      const num = this.steppedNumber
      if ((num + 1) > this.currentSku.yjdfStock) {
        uni.showToast({ title: '库存不足', icon: 'none' })
        return
      }
      ++this.steppedNumber
    },

    // 数量选择器- 减少
    onQuantityMinus() {
      if (this.checkHasSelectAttr()) return
      --this.steppedNumber
    },

    // 数量选择器变化
    onQuatityChange({ detail }) {
      if (this.checkHasSelectAttr()) {
        this.exchangeData()
        return
      }
      if (this.currentSku.miniQuantity > detail) {
        return
      }
      if (detail > this.currentSku.yjdfStock) {
        this.exchangeData()
        uni.showToast({ title: '库存不足', icon: 'none' })
        return
      }
      this.setppedNumberCopy = detail
    },

    // 数量选择器聚焦
    onQuantityFocus() {
      this.setppedNumberCopy = this.steppedNumber
    },

    // 赋值给数量选择数量-异步
    exchangeData() {
      this.steppedNumber = null
      this.$nextTick(() => {
        this.steppedNumber = this.setppedNumberCopy
      })
    },

    // 从数量选择框离开
    onQuantityBlur() {
      this.steppedNumber = null
      this.$nextTick(() => {
        this.steppedNumber = this.setppedNumberCopy
      })
    },

    // 检查是否选择了规格
    checkHasSelectAttr() {
      if (!this.hasSelectAttr) {
        uni.showToast({ title: '请选择规格', icon: 'none' })
        return true
      }
    },

    // 商品上架操作
    goodsPush() {
      uni.showLoading({ title: '加载中', duration: 4000, mask: true })
      goodsPutaway(this.spuId).then((result) => {
        uni.hideLoading();
        uni.showToast({
          title: '加入上架商品成功，请到“我的-上架商品”查看，列表可批量下载商品资料',
          duration: 3000,
          icon: 'none'
        });
      }).catch((e) => {
        uni.hideLoading();
        uni.showToast({ title: e.message, duration: 3000, icon: 'none' })
      })
    },

    // 不同状态下的价格关系
    priceTypeReturnValue(inside, streategy, price) {
      if (this.isInsideActivity) {
        return inside
      } else {
        return this.isStrategy ? streategy : price
      }
    },

    // 判断价格是否不相等
    isEqualPrice(numberA, numberB) {
      return numberA !== numberB
    },

    // 返回分享信息的配置
    returnShareConfig() {
      // 是 战略客户、和推荐官客户才有邀请码
      let path = null
      if (this.invitationCode) {
        path = `${this.createdSharePage()}&${this.createdInvitationCode()}`
      }
      return this.shareMessage({
        title: this.spu.name,
        path: path,
        imageUrl: this.swiperImgs[0].imagePath
      })
    },

    // 倒计时监听
    timeDataChange(e) {
      this.time = e.detail
    },
    fetchDictionary() {
      return new Promise((resolve, reject) => {
        getDictionaryByCode(WXMP_COUPON_SHOP_CODE).then(({ result }) => {
          this.shopCode = result && JSON.parse(result.value)
          resolve()
        })
      })
    }
  },

  // 自定义转发
  onShareAppMessage() {
    return this.returnShareConfig()
  },

  // 分享到朋友圈
  onShareTimeline() {
    return this.returnShareConfig()
  }
}
</script>

<style lang="scss" scoped>
.spu-page{
  padding-bottom: calc(70px+ constant(safe-area-inset-bottom)); //兼容 IOS<11.2
  padding-bottom: calc(70px + env(safe-area-inset-bottom)); //兼容 IOS>11.2
  .icon-phone{
    position: fixed;
    top: 14px;
    right: 14px;
    // width: 30px;
    // height: 30px;
    width: 98rpx;
    height: 98rpx;
    padding: 3rpx;
    box-sizing: border-box;
    z-index: 1;
  }
  .icon-download{
    position: fixed;
    top: 13px;
    right: 54px;
    width: 34px;
    height: 34px;
    z-index: 5;
  }
  .icon-back-top{
    position: fixed;
    bottom: 22%; //兼容 IOS>11.2
    right: 3.5%;
    z-index: 5;
    image{
      width: 98rpx;
      height: 98rpx;
      margin-bottom: 16rpx;
    }
  }
  .swiper-container{
    width: 100vw;
    height: 100vw;
    border-bottom: 1px solid #F0F1F2;
    position: relative;
    image{
      width: 100%;
      height: 100%;
    }
  }
  .icon-more{
    width: 44rpx;
    height: 44rpx;
    vertical-align: middle;
  }
  .form-item{
    display: flex;
    padding: 20rpx 0;
    // margin-left: 20px;
    align-items: center;
    .form-label{
      width: 120rpx;
      color: #71767D;
      font-size: 26rpx;
      padding-left: 30rpx;
    }
    .form-value{
      flex: 1;
      color: #242629;
      font-size: 28rpx;
      font-weight: 600;
      padding: 0 20rpx;
      word-break: break-all;
    }
    &-border{
      border-bottom: 1px solid #F0F1F2;
      padding: 32rpx 0;
      margin-left: 40rpx;
      .form-label{
        padding-left: 0 !important;
      }
    }
  }
  .bottom-bar{
    background-color: #ffffff;
    // height: 64px;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    padding: 10px 14px;
    // constant与env顺序不能改变，先constant再env
    padding-bottom: calc(10px+ constant(safe-area-inset-bottom)); //兼容 IOS<11.2
    padding-bottom: calc(10px + env(safe-area-inset-bottom)); //兼容 IOS>11.2
    border-top: 1px solid #F0F1F2;
    image.icon{
      width: 24px;
      height: 24px;
    }
    .add-button{
      background-color: #10967B;
      color: #ffffff;
      font-weight: 600;
      border-radius: 22px;
    }
    .cart-badge{
      position: absolute;
      z-index: 10;
      top: -12rpx;
      right: -8rpx;
      display: inline-block;
      background-color: #FA8181;
      color: #ffffff;
      border-radius: 50%;
      // padding: 0 10rpx;
      width: 34rpx;
      height: 34rpx;
      font-size: 24rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 2px solid #ffffff;
    }
  }
  .popup-close-btn{
    background-color: #10967B;
    border-radius: 22px;
    margin: 14px 10px;
    color: #ffffff;
    font-weight: 600;
  }
  .dot-before{
    &::before{
      content: "";
      width: 6px;
      height: 6px;
      display: inline-block;
      border-radius: 50%;
      background: #10967B;
      vertical-align: middle;
      margin-right: 8px;
    }
    &.normal{
      &::before{
        background:rgba(16,150,123, 0.2);
      }
    }
  }
  .popup-sku-img{
    width: 220rpx;
    height: 220rpx;
    border-radius: 6px;
    border: 1px solid #F0F1F2;
  }
  .play-btn {
    width: 60px !important;
    height: 60px !important;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }
  /deep/ .van-popup__close-icon{
    font-size: 22px;
  }
}
.swiper-wrapper{
  background: white;
  position: relative;
  .swiper-dot-contanier{
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9;
    .dot{
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: rgba(16,150,123, 0.2);
      margin-right: 8px;
      &.active{
        background-color: rgba(16,150,123, 1);
      }
    }
  }
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
.opacity0{
  pointer-events: none;
  opacity: 0;
  z-index: -1 !important;
}
.sale_end{
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  width: 27%;
  height: 27%;
  z-index:1;
}
.innerSaleGoodsImage {
  width: 218rpx;
  height: 218rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  margin-top: 10rpx;
  margin-bottom: 10rpx;
}
.innerSaleBox {
  .dot{
    width: 9rpx;
    height: 9rpx;
    background: #71767D;
    border-radius: 50%;
    margin-top: 48rpx;
    margin-bottom: 28rpx;
  }
  .title {
    color: #71767D;
    font-size: 26rpx;
    margin-left: 18rpx;
    margin-top: 48rpx;
    margin-bottom: 28rpx;
  }
}
.disabled-btn {
  pointer-events: none;
  opacity: 0.6;
  color:rgba(255,255,255,0.6) !important
}
.receiveButton {
  margin-left: 28rpx;
  background: linear-gradient(90deg, #FFC740 0%, #FF961E 100%);
  border-radius: 8rpx;
  color: white;
  font-size: 28rpx;
  text-align: center;
  padding: 2rpx 14rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.receiveItem {
  margin-left: 24rpx;
  font-size: 26rpx;
  color: #FF7640;
  border: 1px solid#FF7640;
  text-align: center;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 33%;
}
.goodsActivityTime {
  font-size: 22rpx;
  font-weight: 500;
  color: #FF2D2A;
  text-align: center;
  .box {
    background: #FF2D2A;
    color: white;
    min-width: 38rpx;
    text-align: center;
    border-radius: 4rpx;
    font-size: 24rpx;
    display: inline-block;
  }
}
.spu-color-money {
  color: #FF2D2A;
}
</style>
