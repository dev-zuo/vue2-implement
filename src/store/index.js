import Vue from "vue";
// import Vuex from "vuex";
import Vuex from "./MyVuex.js";

Vue.use(Vuex);

// 为什么不是和 vue-router 一样 new Vuex()。而是 new Vuex.Store
// 当看到辅助函数 mapState 就知道为什么了
// import { mapState } from 'vuex'
export default new Vuex.Store({
  state: {
    count: 0,
    info: "我是状态管理state",
  },
  getters: {
    countPlusTwo: (state) => state.count + 2,
  },
  mutations: {
    add(state, n) {
      state.count += n;
    },
    setCount(state, data) {
      state.count = data;
    },
  },
  actions: {
    async getCount({ commit, state }, baseNum) {
      console.log(state);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      let countFormApi = baseNum * 100;
      commit("setCount", countFormApi);
    },
  },
  modules: {},
});
