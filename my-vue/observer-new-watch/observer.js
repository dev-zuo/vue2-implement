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
    // console.log("==================>", value);
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
      console.log("---set", data, key, val, newVal);
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

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set(target, key, val) {
  // 如果是数组，通过 splice 来添加/触发响应
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 如果设置的下标超了，延长数组长度
    target.length = Math.max(target.length, key);
    // 通过 splice 修改或设置值，触发 target 的 splice 方法拦截，通知更新，并把新增元素做响应式处理
    target.splice(key, 1, val);
    return val;
  }
  // 如果这个值已经存在了，直接设置值，返回
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val;
  }

  // 判断对象是否是 vue 响应式数据
  const ob = target.__ob__;
  // 如果不是 vue 响应式数据，直接设置值后返回。
  if (!ob) {
    target[key] = val;
    return val;
  }
  // 如果 target 是响应式数据，将新增的属性进行 getter/setter 拦截
  defineReactive(ob.value, key, val);
  // target 变更，通知依赖更新
  ob.dep.notify();
  return val;
}

export function isValidArrayIndex(val) {
  const n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del(target, key) {
  // 如果是数组，直接用 splice 删除
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return;
  }
  // 如果是对象
  const ob = target.__ob__;
  // 如果对象上不存在这个属性，返回
  if (!hasOwn(target, key)) {
    return;
  }
  // 删除这个属性
  delete target[key];
  // 非 vue 响应式数据，return
  if (!ob) {
    return;
  }
  // 如果是 vue 响应式数据，通知依赖更新
  ob.dep.notify();
}
