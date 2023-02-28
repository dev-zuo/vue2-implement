import { Observer } from "./observer/observer.js";
import { Watcher } from "./observer/watcher.js";

class MyVue {
  constructor(options) {
    this.data = options.data();
    // 1、遍历 data，调用 Observer 转换为 getter/setter, 拦截处理
    const observerData = new Observer(this.data);
    console.log("observerData", observerData);

    // 2、收集依赖（模板、watch哪些地方用到了 data 数据，每一个地方就是一个依赖实例
    // > 2.1 template 处理，省略 complier 部分，模板里面有使用 name, a 两个变量
    const domUpdate = (name) => {
      return (val, oldVal) => {
        console.log(
          `${name} 数据变化，新值: ${val}, 旧值: ${oldVal} 假装执行dom更新`
        );
      };
    };
    new Watcher(this.data, "name", domUpdate("name"));
    new Watcher(this.data, "a", domUpdate("a"));
    // > 2.2 watch 处理
    Object.keys(options.watch).forEach((prop) => {
      let val = options.watch[prop];
      // new Watcher(this.data, 'a.b.c', options.watch['a.b.c'].handler)
      new Watcher(this.data, prop, val?.handler || val);
    });
  }
}

// observer 功能测试
const app = new MyVue({
  template: "<div>{{ name }}</div><div>{{ a }}</div>",
  data() {
    return {
      a: { b: { c: 1 } },
      name: "123",
    };
  },
  watch: {
    "a.b.c": {
      handler(val, oldVal) {
        console.log("监听到 a.b.c 改动", val, oldVal);
      },
    },
  },
});

console.log("app", app);

// 修改数据，看是否侦测到数据变更
app.data.a.b.c = 123;
app.data.name = "test";
app.data.a = { b: { c: 777 } };
