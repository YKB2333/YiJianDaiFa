import Vue from 'vue';
import Vuex from 'vuex';

import user from './modules/user';
import app from './modules/app';
import pay from './modules/pay';
import address from './modules/address';
import poster from './modules/poster';
import getters from './getters';
Vue.use(Vuex);

// 导出 store 对象
export default new Vuex.Store({
  getters,
  modules: {
    user,
    app,
    pay,
    address,
    poster
  },
  state: {
  },
  mutations: {
  },
  actions: {
  }
});
