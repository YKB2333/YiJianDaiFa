import http from '../utils/http'
export function addressAdd(data) { // 新增收货地址
  return http.post('/address/add', data)
}

export function addressDelete(data) { // 删除收货地址
  return http.delete(`/address/delete/${data}`)
}

export function findAddressList(data) { // 收货地址列表
  return http.get('/address/findAddressList', data)
}

export function findDefaultAddress(data) { // 查询默认收货地址
  return http.get('/address/findDefaultAddress')
}

export function addressUpdate(data) { // 修改收货地址
  return http.post('/address/update', data)
}
export function addressDefault(data) { // 设置默认地址
  return http.post(`/address/default/${data}`)
}