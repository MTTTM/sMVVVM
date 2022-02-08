function Compile(el, vm) {
    //el表示替换的范围,和vm关联，方便后面调用
    vm.$el = document.querySelector(el);
    let fragment = document.createDocumentFragment();
    //通过文本碎片把真实dom转入内存,真实的dom就在页面看不到了
    while (child = vm.$el.firstChild) {
        fragment.appendChild(child);
    }
    replace(fragment);

    function replace(fragment) {
        Array.from(fragment.childNodes).forEach(function(node) {
            //循环每一层
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;
            //字符串类型
            if (node.nodeType === 3 && reg.test(text)) {
                console.log(RegExp.$1);
                let arr = RegExp.$1.split(".");
                let val = vm;
                //遍历匹配data的数据例如 a.a.a,一层一层的往下获取
                arr.forEach(function(k) {
                        //第一次之后读取val而不是vm,这样才能确保data能一层层的获取
                        val = val[k];
                    })
                    //============新增地方:数据修改时候同步到dom的地方
                new Wather(vm, RegExp.$1, function(newVal) {
                    //这个Wather里面吧Dep的对象指向了自己
                    console.log("wather", RegExp.$1)
                    if (RegExp.$1 == 'c') {
                        console.log("c======", newVal)
                    }
                    node.textContent = text.replace(reg, newVal);
                })
                node.textContent = text.replace(reg, val);

            }
            //双向数据绑定 例如input===新增===【
            if (node.nodeType === 1) {
                let nodeType = node.attributes;
                //console.log("nodeType",nodeType,node);
                Array.from(nodeType).forEach(function(attr) {
                    let name = attr.name;
                    let exp = attr.value;
                    if (name.indexOf("v-") == 0) {
                        node.value = vm[exp];
                    }
                    new Wather(vm, exp, function(newVal) {
                        node.value = newVal;
                    })
                    node.addEventListener("input", function(e) {
                        let newV = e.target.value;
                        vm[exp] = newV;
                    })
                })
            }
            //====================]
            console.log("node.childNodes", node.childNodes)
                //如果是节点对象，不断的递归,node的childNodes是一个类数组
            if (node.childNodes) {
                replace(node);
            }
        });
    }

    //再通过文本碎片放回真实ROOT DOM
    vm.$el.appendChild(fragment);

};