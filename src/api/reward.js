
import http from '../utils/http'

export function bonusCount(data) { // 奖励统计
  return http.get('/bonus/count')
}

export function invitationPage(data) { // 邀请记录
  return http.post('/bonus/invitation/page', data)
}

export function bonusPage(data) { // 奖励金记录分页
  return http.post('/bonus/page', data)
}

export function withdraw(data) { // 申请提现
  return http.post('/bonus/withdraw', data)
}

export function withdrawGet(data) { // 获取当前用户钱包
  return http.get('/wallet/current', data)
}

export function balanceList(data) { // 我的余额列表
  return http.post('/distribution/balanceList', data)
}
