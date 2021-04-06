import { isEmpty } from '@/utils'

const getters = {
  userInfo: state => state.user.userInfo,
  baseInfo: state => state.user.baseInfo,
  token: state => state.user.token,
  systemInfo: state => state.app.systemInfo,
  // 状态栏高度
  statusBarHeight: (state) => {
    if (!isEmpty(state.app.systemInfo)) {
      return state.app.systemInfo.statusBarHeight || 20
    }
    return 20
  },
  isIOS: (state) => {
    if (!isEmpty(getters.systemInfo(state)) && ['devtools', 'ios'].includes(getters.systemInfo(state).platform)) {
      return true
    }
    return false
  },
  isAndroid: (state) => {
    return !getters.isIOS(state)
  },
  sessionKey: state => state.user.sessionKey,
  // 胶囊高度，单位px
  menuButtonHeight: (state) => {
    if (getters.isIOS(state)) return 44
    return 48
  },
  // baseInfoId用户判断用户是否注册并完善信息
  baseInfoId: (state) => {
    return state.user.userInfo.baseInfoId || null
  },
  ncCode: (state) => {
    return state.user.userInfo.ncCode || null
  },
  isEnable: (state) => {
    return state.user.userInfo.isEnable || null
  },
  needToCheckLogin: state => state.user.needToCheckLogin,
  address: state => state.user.address,
  cartSkuIds: state => state.user.cartSkuIds,
  activityObject: state => state.user.activity,
  temporaryUserInfo: state => state.user.temporaryUserInfo,
  CART_STATUS_REFRESH: state => state.user.CART_STATUS_REFRESH,
  shareInvitationCode: state => state.user.shareInvitationCode,
  posterStrategy: state => state.poster.posterStrategy,
  posterRecommend: state => state.poster.posterRecommend,
  posterTemplate: state => state.poster.posterTemplate,
  wxUserInfo: state => state.user.wxUserInfo,
  customerUserInfo: state => state.user.customerUserInfo,
  standardPrice: state => state.user.standardPrice,
  couponListId: state => state.pay.couponListId
}
export default getters
