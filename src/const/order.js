import { mine_all, mine_pay, mine_cart, mine_logistics, mine_success, icon_sign } from '@/image-config.js'

export const ORDER_TAB_LIST = [
  {
    title: '全部',
    icon: mine_all,
    key: 'all'
  },
  {
    title: '待付款',
    icon: mine_pay,
    key: 'notPay'
  },
  {
    title: '待发货',
    icon: mine_cart,
    key: 'notDelivered'
  },
  {
    title: '待收货',
    icon: mine_logistics,
    key: 'unreceived'
  },
  {
    title: '已签收',
    icon: icon_sign,
    key: 'goodsReceived'
  },
  {
    title: '已完成',
    icon: mine_success,
    key: 'success'
  }
]