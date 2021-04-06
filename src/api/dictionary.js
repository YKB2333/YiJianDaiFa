import http from '@/utils/http'

// 获取客服手机号
export function getCustomerPhone() {
  return http.get('/dictionary/code/customerService')
}

// 字典查询
export function getDictionaryByCode(code) {
  return http.get(`/dictionary/code/${code}`)
}
