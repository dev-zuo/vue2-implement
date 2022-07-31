let _Vue = null;

class MyVueRouter {
  // Vue.use(VueRouter) 执行
  static install(Vue) {
    _Vue = Vue; // 保存 Vue，其他地方需要, vue-router 包里面不用包含 Vue

    Vue.mixin({
      beforeCreate() {
        // new Vue() 时，router 参数，仅在根组件执行一次
        if (this.$options.router) {
          Vue.prototype.$router = this.$options.router; // $route 同理
          this.$options.router.init();
        }
      },
    });
  }

  constructor(options) {
    this.options = options;
    this.routeMap = {};

    // 利用 Vue 双向绑定、监听到 url 切换后，改变这个值，router-view 组件直接切换
    this.app = new _Vue({
      data: {
        curRoute: "",
      },
    });
  }

  init() {
    this.createRouteMap(); // 根据 routes 拿到 url => 组件 对应关系
    this.initComponent(); // install 在 new Vue() 之前，双向绑定 curRoute 数据在 new Vue 创建，挪到 init 中处理
    this.listenUrlChange();
  }

  createRouteMap() {
    // const routes = [
    //   {
    //     path: "/",
    //     name: "home",
    //     component: HomeView,
    //   },
    //   {
    //     path: "/about",
    //     name: "about",
    //     component: () => import("../views/AboutView.vue"),
    //   },
    // ];
    this.options.routes.forEach((route) => {
      this.routeMap[route.path] = route.component;
    });
  }

  initComponent() {
    // <router-view></router-view>
    _Vue.component("RouterView", {
      render: (h) => {
        let component = this.routeMap[this.app.curRoute];
        return h(component);
      },
    });

    // <router-link to="/about">foo</router-link>
    _Vue.component("RouterLink", {
      props: { to: String },
      render(h) {
        // h(tag, options, children) 子元素使用默认插槽，这里使用简单 hash 模式 #/about
        let options = { attrs: { href: `#${this.to}` } };
        return h("a", options, [this.$slots.default]);
      },
    });
  }

  listenUrlChange() {
    // 首次进入
    window.addEventListener("load", () => {
      this.app.curRoute = window.location.hash.slice(1) || "/";
    });
    // hash 改变
    window.addEventListener("hashchange", (e) => {
      console.log(e);
      // 除了 location 外，还可以用 HashChangeEvent 中的参数 { newURL: "http://localhost:8080/#/about" }
      let hashPath = new URL(e.newURL).hash;
      hashPath = hashPath[0] === "#" ? hashPath.substring(1) : "/"; // http://localhost:8080/#/
      this.app.curRoute = hashPath;
    });
  }
}

export default MyVueRouter;
