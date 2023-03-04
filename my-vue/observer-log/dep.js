const remove = (arr, item) => {
  let index = arr.indexOf(item);
  item.splice(index, 1);
};

export class Dep {
  constructor() {
    this.subs = []; // this.subscribes = []  subscribes 订阅
  }
  // 添加一个订阅，即依赖实例
  addSub(sub) {
    this.subs.push(sub);
    console.log("-----添加依赖成功", this.subs);
  }
  // 移除一个依赖，remove 是移除一个数据中的一个元素
  removeSub(sub) {
    remove(this.subs, sub);
  }
  // 添加依赖 const dep = new Dep(); dep.depend()
  depend() {
    Dep.target && this.addSub(Dep.target);
  }
  // setter 后通知，遍历所有依赖，触发依赖更新
  notify() {
    const subs = this.subs.slice();
    console.log(">>>>>notify start");
    for (let i = 0, len = subs.length; i < len; i++) {
      console.log("-----notify update", JSON.stringify(subs[i].idInfo));
      subs[i].update();
    }
    console.log(">>>>>notify end");
  }
}
