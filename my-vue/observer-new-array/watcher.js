import { Dep } from "./dep.js";

// 解析简单路径
export function parsePath(path) {
  const bailRE = /[^\w.$]/;
  // \w 是 [0-9a-zA-Z_] 的简写，表示数字、字母、下划线
  // . 匹配除 \n 外的任意一个字符，表示匹配非数字字母下划线的字符，即非法字符
  if (bailRE.test(path)) {
    return;
  }
  const segments = path.split("."); // 例如 ['a', 'b', 'c']
  // 返回一个函数，即上面 this.getter 函数，
  // parsePath('a.b.c')(this.vm)，这里的 obj 就是组件实例 vm，即 this.a.b.c
  return function (obj) {
    for (let i = 0, len = segments.length; i < len; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}

// Watcher 是对 template/watch/computed 中依赖的一个抽象
// <template>{{ name }}</template>
// vm.$watch('a.b,c', function(newVal, oldVal) {
//     // a.b.c 变化后，执行一些操作
// })

let uid = 0;
export class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.getter = parsePath(expOrFn); // parsePath('a.b.c')，可以理解为获取 data.a.b.c 的值
    this.cb = cb; // function(newVal, oldVal) { // a.b.c 变化后，执行一些操作 }

    // 去重标记
    this.id = ++uid;
    this.deps = [];
    this.depIds = new Set();
    this.newDeps = [];
    this.newDepIds = new Set();

    this.idInfo = {
      id: Math.floor(Math.random() * 999) + 1, // 1 - 1000
      expOrFn,
    };
    this.value = this.get();
  }

  // this.value = this.get()
  get() {
    // 下面三句话，不好理解，需要结合 Dep 类，Observer 类，parsePath 的实现来理解
    // 后面将 Observer 介绍完后，再来看这里的代码就好理解了
    console.log(`---get准备开始收集依赖, ${JSON.stringify(this.idInfo)}`);
    Dep.target = this;
    let value = this.getter.call(this.vm, this.vm);
    Dep.target = undefined;
    console.log("---收集依赖完成，清理依赖");
    this.cleanupDeps();
    return value;
  }

  update() {
    const oldVal = this.value;
    console.log(`---触发dep.update, 获取新值${JSON.stringify(this.idInfo)}`);
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldVal);
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        console.log("---cleanupDeps ", dep.id);
        dep.removeSub(this);
      }
    }
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }
}
