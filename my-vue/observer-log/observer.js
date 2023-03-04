import { Dep } from "./dep.js";

export class Observer {
  constructor(value) {
    this.value = value;
    if (!Array.isArray(value)) {
      this.walk(value); // 如果是非数组，即对象
    }
  }
  // walk 将对象的每一个属性都转换成 getter/setter 形式来侦测变化
  // 只有在数据类型为 Object 时调用
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }
}

function defineReactive(data, key, val) {
  // 如果对象的属性也是对象，递归 Observer
  if (typeof val === "object") {
    new Observer(val);
  }
  let dep = new Dep();
  Object.defineProperty(data, key, {
    enumerable: true, // /ɪˈnjuːm(ə)rəb(ə)l/
    configurable: true,
    get: function () {
      console.log("-----触发 get", key, val, "对应watch: ", Dep.target?.idInfo);
      dep.depend(); // 将依赖存到 Dep 中
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }
      val = newVal;
      console.log("-----触发 set", key, val, dep);
      dep.notify(); // 通过 Dep 通知依赖更新
    },
  });
}
