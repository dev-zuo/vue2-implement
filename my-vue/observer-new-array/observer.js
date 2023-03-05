import { Dep } from "./dep.js";
import { arrayMethods, def } from "./array.js";

// can we use __proto__?
const hasProto = "__proto__" in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);
function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

export class Observer {
  constructor(value) {
    this.value = value;
    // 新增 dep，有两个好处，1、避免重复侦测，2、方便数组拦截方法获取实例
    this.dep = new Dep();
    def(value, "__ob__", this); // 为每个侦测的数据加上 __ob__ 属性
    console.log("==================>", value);
    if (Array.isArray(value)) {
      if (hasProto) {
        value.__proto__ = arrayMethods;
      } else {
        copyAugment(value, arrayMethods, arrayKeys);
      }
      // 侦测数组元素变化
      this.observeArray(value);
    } else {
      this.walk(value); // 如果是非数组，即对象
    }
  }

  // 侦测数组中的每一项
  observeArray(items) {
    for (let i = 0, len = items.length; i < len; i++) {
      observe(items[i]);
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
  // val 为数组、或对象时，递归，childOb 为当前 Observer 实例
  let childOb = observe(val);
  // 这个 dep 是 defineReactive，childOb.dep 是 Observer 实例上的
  let dep = new Dep(key);
  Object.defineProperty(data, key, {
    enumerable: true, // /ɪˈnjuːm(ə)rəb(ə)l/
    configurable: true,
    get: function () {
      dep.depend(); // 将依赖存到 Dep 中
      // 数组依赖，或 val 为对象
      if (childOb) {
        childOb.dep.depend();
      }
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }
      val = newVal;
      childOb = observe(newVal); // 防止 app.data.list = [] 后，丢失 __ob__ 依赖等
      dep.notify(); // 通过 Dep 通知依赖更新
    },
  });
}

/**
 * Attempt to create an observer instance for a value,
 * 尝试为 value 创建一个 Observer 实例
 * returns the new observer if successfully observed,
 * 如果创建成功，直接返回新创建的 Observer 实例
 * or the existing observer if the value already has one.
 * 如果已经存在一个 Observer 实例，则直接返回
 */
export function observe(value) {
  if (!isObject(value)) {
    return;
  }
  let ob;
  // 这里 __ob__ 参见下一节内容，表示已经侦测过该值
  if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  return ob;
}

function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}
