let $Vue = null;

class MyVueRouter {
  // Vue.use(VueRouter)
  static install(Vue) {
    $Vue = Vue; // 保存 Vue，其他地方需要, vue-router 包里面不用包含 Vue

    // router-view, 渲染函数实现组件，参考 https://cn.vuejs.org/v2/guide/render-function.html
    Vue.component("router-view", {
      render: (h) => {
        return h(
          "h" + this.level, // 标签名称
          this.$slots.default // 子节点数组
        );
      },
      props: {
        level: {
          type: Number,
          required: true,
        },
      },
    });
  }

  constructor(options) {
    this.$options = options;
    this.$routes = options.$routes;

    // 根据 routes 拿到 url => 组件 对应关系

    // 利用 Vue 双向绑定、监听到 url 切换后，改变这个值，组件直接切换
    this.$data = new $Vue({
      data: {
        curRoute: "",
      },
    });
  }
}

export default MyVueRouter;
