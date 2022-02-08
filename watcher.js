//监听者,其实他就是发布数组里面的函数
function Wather(vm, exp, fn) {
    this.fn = fn;
    this.vm = vm;
    this.exp = exp; //添加到订阅中
    Dep.target = this;
    let val = vm;
    let arr = this.exp.split(".");
    //触发Oberve的get,得到被修改的数据的路径
    arr.forEach(function(k) {
        //这里会触发Obser的get,触发Dep的assSubs，很关键的地方！！！！
        val = val[k];
    });
    Dep.target = null;
}
Wather.prototype.update = function() {
    let val = this.vm;
    let arr = this.exp.split(".");
    //触发Oberve的get
    arr.forEach(function(k) {
        val = val[k];
    });
    console.log("update", val);
    this.fn(val); //传入新值
};