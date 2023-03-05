const arrayProto = Array.prototype;
// 自定义 arrayMethods，继承 Array.prototype，并重写 7 种方法
let arrayMethodsTemp = Object.create(arrayProto);

const methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method];
  def(arrayMethodsTemp, method, function mutator(...args) {
    const result = original.apply(this, args);
    console.log("拦截方法", method, this);
    const ob = this.__ob__; // observer
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2); // splice(0, 1, ad, xxx)
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change 触发依赖、通知更新
    ob.dep.notify();
    return result;
  });
});

console.log("arrayMethods", arrayMethodsTemp);
export const arrayMethods = arrayMethodsTemp;
