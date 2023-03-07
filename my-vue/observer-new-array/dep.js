const remove = (arr, item) => {
  let index = arr.indexOf(item);
  arr.splice(index, 1);
};

let uid = 0;
export class Dep {
  constructor(key) {
    this.key = key; // 用于标记这个 dep 是哪个 key
    this.id = uid++;
    this.subs = []; // this.subscribes = []  subscribes 订阅
  }
  // 添加一个订阅，即依赖实例
  addSub(sub) {
    this.subs.push(sub);
    // console.log("收集依赖成功", this.subs);
  }
  // 移除一个依赖，remove 是移除一个数据中的一个元素
  removeSub(sub) {
    remove(this.subs, sub);
  }
  // 添加依赖 const dep = new Dep(); dep.depend()
  depend() {
    if (Dep.target) {
      // 去重
      let curWatcher = Dep.target;
      // console.log(
      //   `---newDepIds:${[...curWatcher.newDepIds]},curId:${this.id}`,
      //   this.key
      // );
      // console.log(
      //   `---depIds: ${[...curWatcher.depIds]},dep id:${this.id}`,
      //   this.key
      // );
      if (!curWatcher.newDepIds.has(this.id)) {
        curWatcher.newDepIds.add(this.id);
        curWatcher.newDeps.push(this);
        if (!curWatcher.depIds.has(this.id)) {
          this.addSub(curWatcher);
        }
      }
    }
  }
  // setter 后通知，遍历所有依赖，触发依赖更新
  notify() {
    const subs = this.subs.slice();
    // console.log(`---notify`, subs);
    for (let i = 0, len = subs.length; i < len; i++) {
      subs[i].update();
    }
  }
}
