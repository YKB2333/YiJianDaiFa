import types from '../types.js';

export default {
  state: {
    couponListId: null
  },
  mutations: {
    [types.SET_COUPON_LIST_ID](state, ids) {
      state.couponListId = ids;
    }
  },
  actions: {
    // 获取微信code
    getWxCode() {
      return new Promise((resolve, reject) => {
        uni.login({
          success: (res) => {
            resolve(res.code)
          },
          fail: () => {
            reject('error')
          }
        })
      })
    },
    // 调起微信支付
    requestPayment({ dispatch, commit, state }, { payment }) {
      return new Promise((resolve, reject) => {
        wx.requestPayment({
          timeStamp: payment.timeStamp,
          nonceStr: payment.nonceStr,
          package: payment.packageValue,
          signType: payment.signType,
          paySign: payment.paySign,
          success: function(wxRes) {
            resolve(wxRes)
          },
          fail: function(wxRes) {
            console.info('支付失败', wxRes);
            reject(wxRes)
          }
        });
      })
    }
  }
}
