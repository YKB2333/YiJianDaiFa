import http from '@/utils/http'

// 创建单
export const createOrder = (code, data) => http.post(`/orders/addOrder/${code}`, data)

// 订单列表查询
export const getOrderList = (data) => http.post('/orders/page', data)

// 获取订单详情
export const getOrderById = (id) => http.get(`/orders/detail/${id}`)

// 取消订单
export const cancelOrder = (id) => http.post(`/orders/cancalOrder/${id}`)

// 确认收货
export const confirmReceiveOrder = (id) => http.get(`/orders/confirmOrder/${id}`)

// 支付订单
export const payOrder = (orderSn, code) => http.post(`/orders/payOrder/${orderSn}/${code}`)

// 生成初始化订单
export const initOrder = (data) => http.post('/orders/initOrder', data)

// 订单数量统计
export const getUserOrderCount = () => http.get('/orders/countOrder')

// 确认收货
export const signInOrder = (orderSn) => http.get(`/orders/signInOrder/${orderSn}`)

// 当前是否内购时间
export const checkInnerbuyStatus = () => http.get('/innerbuyActivity/checkInnerbuyStatus')

// 订单预览
export const ordersPreview = (data) => http.post('/orders/preview', data)

// 充值余额
export const rechargeCreate = (data) => http.post('/recharge/create', data)

// 充值明细
export const rechargeDetails = (data) => http.get(`/recharge/details/${data}`)

// 充值列表
export const rechargePage = (data) => http.post('/recharge/page', data)

// 钱包支付订单
export const payOrderByWallet = (data) => http.post('/orders/payOrderByWallet', data)
