import http from '../utils/http'
import { apiAgent } from '@/config'

export function addInfoClick(infoId) { // 增加资讯点击数
  return http.put(`/cms/info/addClick?id=${infoId}`)
}

export function getInfoById(infoId) { // 根据资讯ID获取资讯
  return http.get(`/cms/info/getOne/${infoId}?agent=${apiAgent}`)
}

export function getAttaListByInfoId(infoId) { // 根据资讯ID获取资讯附件
  return http.get(`/cms/attachment/getByInfoId/${infoId}`)
}
export function getFavorite(data) { // 收藏分页
  return http.post('/cms/page', data)
}
export function cancelFavorite(id) { // 取消收藏
  return http.put(`/cms/info/favorite/cancel/${id}`)
}
export function addFavorite(id) { // 添加收藏
  return http.post(`/cms/info/favorite/${id}`)
}
export function getColumnIdList(id) { // 根据栏目id获取下级栏目id集合
  return http.get(`/cms/info/getColumnIdList/${id}`)
}
export function cmsSelectPage(data) { // 获取栏目下的资讯列表
  return http.post('/cms/info/selectPage', data)
}
