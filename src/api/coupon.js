import http from '@/utils/http'

export function getMyCoupon(data) { // 我的优惠券查询接口
  return http.post('/coupon/getMyCoupon', data)
}

export function getCouponTemplateVo(data) { // 查询所有活动下优惠券模板
  return http.post('/coupon/getCouponTemplateVo', data)
}

export function acquire(data) { // 领取优惠券
  return http.post('/coupon/acquire', data)
}

export function getCouponNums(data) { // 获取优惠券数量
  return http.post('/coupon/getCouponNums', data)
}

export function getMyCouponByOrder(data) { // 根据订单金额查询可用优惠券
  return http.post('/coupon/getMyCouponByOrder', data)
}
