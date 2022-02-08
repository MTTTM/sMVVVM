//发布订阅模式
//先有订阅，后有发布[fn1,fn2,fn3]
//发布就是便利之前的订阅函数
function Dep() {
    this.subs = [];
}
//订阅
Dep.prototype.addSub = function(sub) {
    this.subs.push(sub);
};
Dep.prototype.notify = function() {
    this.subs.forEach((sub) => sub.update());
};

//观察对象给对象正价Object.DefineProperty
function Observe(data) {
    //新增====就一个发布器
    let dep = new Dep();
    for (let key in data) {
        let val = data[key];
        //通过data属性object.defineProperty的方式定义属性
        observe(val);
        Object.defineProperty(data, key, {
            enumerable: true,
            get() {
                //====新增
                Dep.target && dep.addSub(Dep.target);
                console.log("get", dep);
                return val;
            },
            set(newVal) {
                console.log("修改");
                //更改值得时候,如果同样，不做处理
                if (newVal === val) {
                    return;
                }

                val = newVal;
                //防止赋值一个对象
                observe(newVal);
                dep.notify(); //让所有watcher的 update函数执行
            },
        });
    }
}
//给对象类型的创建监听对象
function observe(data) {
    //如果不是对象的时候不需要监听,英文Object.definePrototy是对象的属性，不是常亮或者数值类型的属性
    //而且数值类型本来监听就是通过他父级的对象提供的监听
    if (typeof data !== "object") {
        return;
    }
    return new Observe(data);
}