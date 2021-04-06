import http from '../utils/http'

export function searchGoods(data, isCancel = false) { // 搜索商品数据
  return http.post('/goods/search', data, { isCancel })
}

export function searchGoodsSort(data) { // 搜索商品数据排序
  return http.post('/goods/page/lable', data)
}

export function getDictionary() { // 获取所有数据字典
  return http.post('/dictionary/getDictionary')
}

export function getDictionaryCode(code) { // 获取所有数据字典
  return http.get(`/dictionary/code/${code}`)
}

export function cmsSelectPage(cateId, data = {}) { // 获取栏目下的资讯列表
  return http.post('/cms/info/selectPage', {
    pageIndex: 1,
    pageSize: 20,
    status: 1,
    infoCategoryId: cateId,
    ...data
  })
}
