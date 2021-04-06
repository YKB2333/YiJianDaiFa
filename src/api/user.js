import http from '../utils/http'

export function login(data) { // 微信小程序登录
  return http.put(`/account/login?code=${data}`)
}

export function register(data) { // 注册并绑定微信
  return http.post('/account/register', data)
}

export function updateWxInfo(data) { // 更新用户微信信息
  return http.post('/account/update/wxInfo', data)
}

export function getUserCategory() { // 获取感兴趣分类
  return http.get('/account/userCategory')
}

export function bindCategory(data) { // 关联客户感兴趣的分类
  return http.post('/account/bindCategory', data)
}

export function cateList() { // 可用一级分类
  return http.get('/account/cateList')
}

export function addSlave(data) { // 添加子账号
  return http.post('/account/addSlave', data)
}

export function companyUpload(data) { // 企业客户认证资料上传
  return http.post('/account/certificate/company/upload', data)
}

export function personalUpload(data) { // 个人身份认证资料上传
  return http.post('/account/certificate/personal/upload', data)
}

export function certificationCheck(data) { // 客户认证前校验
  return http.post('/account/certification/check', data)
}

export function certificationCompany(data) { // 企业客户提交认证
  return http.post('/account/certification/company', data)
}

export function certificationPersonal(data) { // 个人客户认证
  return http.post('/account/certification/personal', data)
}

export function modifyInfo(data) { // 修改用户基础信息
  return http.post('/account/modify/info', data)
}

export function accountPage(data) { // 账号列表
  return http.post('/account/page', data)
}

export function accountRemoveSlave(data) { // 移除子账号
  return http.delete(`/account/removeSlave/${data}`)
}

export function getBaseInfo() { // 获取当前用户信息接口
  return http.get('/account/current')
}

export function getCustomerInfo() { // 获取当前客户信息
  return http.get('/customer/current')
}

export function fetchQrCode(data) { // 生成邀请二维码
  return '/customer/qrcode' // 使用wx原生请求了所以返回纯地址
}

export function visitCount(data) { // 统计通过二维码客户访问次数
  return http.post('/visitor/visitCount', data)
}
export function visitorVisit(data) { // 记录浏览记录
  return http.post('/visitor/visit', data)
}
