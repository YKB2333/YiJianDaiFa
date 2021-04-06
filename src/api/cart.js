import http from '../utils/http'

export function getSelection(data) { // 获取购物车商品数据
  return http.post('/coop-cart/page', data)
}

export function download(data) { // 下载资料
  return http.post('/goods/download', data)
}

export function coopSpu(data) { // 获取合作上架商品Spu数据
  return http.post('/putaway/page', data)
}

export function sync(data) { // 合作商品数据同步
  return http.post('/putaway/push', data)
}
