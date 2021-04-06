import http from '@/utils/http'
import { SYS_TAG, CONTENT_TYPE } from '@/const/cms'
import { apiAgent } from '@/config'

// 获取商品详情数据
export const getGoodsDetail = (spuId) => http.get(`/goods/detail/${spuId}`)

// 获取内购商品详情数据
export const innerSpuDetail = (spuId) => http.get(`/innerActivityGoods/innerSpuDetail/${spuId}`)

// 加入购物车商品
export const addGoodsToCart = (data) => http.post('/coop-cart/save', data)

// 获取选品小车商品数量
export const getCartCount = (data) => http.post('/coop-cart/size', data)

// 改变选品车数量
export const changeCartQuantity = (data) => http.post('/coop-cart/update', data)

// 删除选品车中的选品
export const deleteCart = (data) => http.post('/coop-cart/remove', data)

// 收藏商品
export const favoriteGoods = (spuId) => http.post('/cms/info/favorite', { contentType: CONTENT_TYPE, sysTag: SYS_TAG, id: spuId })

// 取消收藏商品
export const cancelFavoriteGoods = (spuId) => http.put(`/cms/info/favorite/cancel/${spuId}?agent=${apiAgent}`)

// 查询该商品的收藏状态
export const checkFavoriteState = (spuId) => http.post(`/cms/isCollect/${spuId}`)

// spu商品上架客户端上架商品列表
export const goodsPutaway = (data) => http.post(`/putaway/put/${data}`)

// 内购商品列表查询
export const innerActivityGoods = (data) => http.post('/innerActivityGoods/page', data)

// 内购品牌列表
export const getAllBrand = (data) => http.get('/innerActivityGoods/getAllBrand', data)

// 内购类目列表
export const getAllCategory = (data) => http.get('/innerActivityGoods/getAllCategory', data)

// 调用ES快速检索_获取查询条件
export const search4Condition = (data) => http.post('/innerActivityGoods/search4Condition', data)