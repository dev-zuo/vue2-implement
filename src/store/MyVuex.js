let _Vue = null;

// Vue.use(Vuex) 执行
function install(Vue) {
  _Vue = Vue; // 保存 Vue，其他地方需要, vuex 包里面不用包含 Vue

  Vue.mixin({
    beforeCreate() {
      // new Vue({ store }) 时，store 参数，仅在根组件执行一次
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store; // $route 同理
        //   this.$options.router.init();
      }
    },
  });
}

class MyStore {
  constructor(options) {
    this.options = options;

    // 利用 Vue 双向绑定、监听到 url 切换后，改变这个值，router-view 组件直接切换
    this.state = new _Vue({
      data: {
        ...options.state, // { count: 0 }
      },
    });

    this.getters = {};
    this.initGetters(options, this.state);
  }

  commit(mutationType, data) {
    console.log("commit", mutationType, data);
    console.log("curThis", this);
    let curMethod = this.options.mutations[mutationType];
    if (curMethod) {
      curMethod(this.state, data);
    } else {
      console.warn(`MyVuex: 不存在 ${mutationType} 方法`);
    }
  }

  initGetters(options, state) {
    Object.keys(this.options.getters).forEach((prop) => {
      Object.defineProperty(this.getters, prop, {
        get() {
          return options.getters[prop](state);
        },
      });
    });
  }

  dispatch(action, data) {
    let curMethod = this.options.actions[action];
    if (curMethod) {
      curMethod(
        {
          commit: this.commit.bind(this),
          state: this.state,
          getters: this.getters,
        },
        data
      );
    } else {
      console.warn(`MyVuex: action 不存在 ${action} 方法`);
    }
  }
}

// ...mapState(["count", "info"]), // { count: () => this.$store.state.count}
// 函数前面不要随便加 async 不然其他地方拿到的是一个 promise
export const mapState = (array) => {
  let result = {};
  array.forEach((prop) => {
    // 注意，这里使用普通函数， this 指向 vue 实例
    result[prop] = function () {
      return this.$store.state[prop];
    };
  });
  console.log("result", result, { ...result });
  return result;
};

export default { Store: MyStore, install };
