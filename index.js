function MVVM(options = {}) {
    this.$options = options; //将所有竖向挂着在￥options
    var data = (this._data = this.$options.data);
    this.$methods = options.methods ? options.methods : {};
    observe(data); //添加监听
    this.proxyData(data, "data"); //通过this直接访问data里面的数据
    this.proxyData(this.$methods, "methods"); //通过this直接访问data里面的数据
    //新增computed
    initComputed.call(this);
    //为什么initComputed要放在Compile前面呢，这是有讲究的
    new Compile(options.el, this);
}

MVVM.prototype = {
    proxyData: function(data, type) {
        //把data的属性给当前对象添加，这样就可以通过this访问
        for (let key in data) {
            if (this.$methods[key] && type !== "methods") {
                throw "data属性不能和menthods重名";
            }
            Object.defineProperty(this, key, {
                enumerable: true,
                get() {
                    if (type == "methods") {
                        return this.$methods[key];
                    } else {
                        return this._data[key];
                    }
                },
                set(newVal) {
                    if (type !== "methods") {
                        this._data[key] = newVal;
                    }
                },
            });
        }
    },
};

function initComputed() {
    let vm = this;
    let computed = this.$options.computed;
    //Object.keys {name:1,name:2}=>[name,age]
    console.log("Object.keys(computed)", Object.keys(computed));
    //为什么这里能够监听到依赖的变量变动后当前computed属性就变动呢，我这里指的的是非初始化时候的第一次获取
    //暂时没明白
    //Compile 里面有一个属于c的wather,只有有任意一个变量变动都会触发所有订阅者！！（已经解答疑惑）
    //无语哦，是直接更新所有订阅，也就是所有dom都会刷新一遍
    //怪不得，需要虚拟dom
    Object.keys(computed).forEach(function(key) {
        Object.defineProperty(vm, key, {
            get: typeof computed[key] === "function" ? computed[key] : computed[key].get,
            set() {
                console.warn("computed element cant't set");
            },
        });
    });
}