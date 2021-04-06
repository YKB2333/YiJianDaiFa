import http from '../utils/http'

export function getCategoryList() { // 获取分类列表
  return http.get('/goods/category')
}
