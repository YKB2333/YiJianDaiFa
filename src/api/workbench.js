import http from '../utils/http'

export function findWorkbenchData(data) { // 获取用户工作台数据
  return http.get(`/workbench/findWorkbenchData/${data}`)
}

export function distributionPage(data) { // 分销-分页获取订单明细
  return http.post('/distribution/page', data)
}

export function distributionTotal(data) { // 分销-订单明细统计
  return http.get('/distribution/total', data)
}

export function distributionCloseFee(data) { // 分销-申请结算
  return http.post('/distribution/close/fee', data)
}

export function distributionCloseRecord(data) { // 分销-结算记录
  return http.post('/distribution/close/record', data)
}

export function subordinatePage(data) { // 分销-推荐客户明细-分页列表
  return http.post('/customer/subordinate/page', data)
}

export function visitorPage(data) { // 分销-推荐客户明细-浏览记录分页
  return http.post('/visitor/page', data)
}
