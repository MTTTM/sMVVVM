function Compile(el, vm) {
    //el表示替换的范围,和vm关联，方便后面调用
    vm.$el = document.querySelector(el);
    this.vm = vm;
    this.$fragment = this.nodeToFragment();
    this.init(this.$fragment);
    //再通过文本碎片放回真实ROOT DOM
    vm.$el.appendChild(this.$fragment);
}
Compile.prototype = {
    init: function(fragment) {
        let _this = this;
        Array.from(fragment.childNodes).forEach((node) => {
            //循环每一层
            let reg = /\{\{(.*)\}\}/;
            //字符串类型
            if (_this.isTextNode(node, reg)) {
                _this.compileText(node, reg);
            }
            //双向数据绑定 例如input===新增===【
            if (this.isElementNode(node)) {
                let nodeType = node.attributes;
                //console.log("nodeType",nodeType,node);
                Array.from(nodeType).forEach((attr) => {
                    let name = attr.name;
                    let exp = attr.value;
                    if (Directive.isDirective(name)) {
                        let directiveFun = directiveCallback[directiveCallback.init(name)];
                        directiveFun && directiveFun.bind(this)(node, exp, name);
                    }
                });
            }
            //====================]
            console.log("node.childNodes", node.childNodes);
            //如果是节点对象，不断的递归,node的childNodes是一个类数组
            if (node.childNodes) {
                _this.init(node);
            }
        });
    },
    nodeToFragment() {
        let fragment = document.createDocumentFragment();
        //通过文本碎片把真实dom转入内存,真实的dom就在页面看不到了
        while ((child = this.vm.$el.firstChild)) {
            fragment.appendChild(child);
        }
        return fragment;
    },
    compileText: function(node, reg) {
        console.log(RegExp.$1);
        let arr = RegExp.$1.split(".");
        let val = this.vm;
        let text = node.textContent;
        //遍历匹配data的数据例如 a.a.a,一层一层的往下获取
        arr.forEach(function(k) {
            //第一次之后读取val而不是vm,这样才能确保data能一层层的获取
            val = val[k];
        });
        //============新增地方:数据修改时候同步到dom的地方
        new Wather(this.vm, RegExp.$1, function(newVal) {
            //这个Wather里面吧Dep的对象指向了自己
            console.log("wather", RegExp.$1);
            if (RegExp.$1 == "c") {
                console.log("c======", newVal);
            }
            node.textContent = text.replace(reg, newVal);
        });
        node.textContent = text.replace(reg, val);
    },
    compileElement: function() {},
    compileEvent: function() {},
    compileModel: function() {},
    // isDirective: function(attr) {
    //     return attr.indexOf("v-") == 0;
    // },
    // isEventDirective: function(attr) {
    //     return attr.indexOf("@") === 0;
    // },
    // isModelDirective: function(attr) {
    //     return attr.indexOf("v-model") === 0;
    // },
    // isTextDirective: function(attr) {
    //     return attr.indexOf("v-text") === 0;
    // },
    // isHtmlDirective: function(attr) {
    //     return attr.indexOf("v-html") === 0;
    // },
    // isIfDirective: function(attr) {
    //     return attr.indexOf("v-if") === 0;
    // },
    isElementNode: function(node) {
        return node.nodeType === 1;
    },
    isTextNode: function(node, reg) {
        return node.nodeType === 3 && reg.test(node.textContent);
    },
};
//指令判断
var Directive = {
    isDirective: function(attr) {
        return attr.indexOf("v-") == 0;
    },
    isEventDirective: function(attr) {
        return attr.indexOf("v-on:") === 0;
    },
    isModelDirective: function(attr) {
        console.log("attr?", attr, attr.indexOf("v-model") === 0);
        return attr.indexOf("v-model") === 0;
    },
    isTextDirective: function(attr) {
        return attr.indexOf("v-text") === 0;
    },
    isHtmlDirective: function(attr) {
        return attr.indexOf("v-html") === 0;
    },
    isIfDirective: function(attr) {
        return attr.indexOf("v-if") === 0;
    },
};
//指令更新函数
var directiveCallback = {
    init: function(attrs) {
        let cb = null;
        let attr = attrs.split(":")[0];
        console.log("attr", attr);
        switch (attr) {
            //事件指令
            case "v-on":
                cb = "EventDirective";
                break;
                //v-model指令
            case "v-model":
                cb = "ModelDirective";
                break;
                //v-text指令
            case "v-text":
                cb = "TextDirective";
                break;
                //v-html 指令
            case "v-html":
                cb = "HtmlDirective";
                break;
                // v-if指令
            case "v-if":
                cb = "IfDirective";
                break;
        }
        console.log("cb", cb);
        return cb;
    },
    EventDirective: function(node, funcName, name) {
        let eventName = name.split(":")[1];
        node.addEventListener(eventName, () => {
            this.vm[funcName](node.value);
        });
    },
    ModelDirective: function(node, exp, name) {
        // if (name.indexOf("v-") == 0) {
        node.value = this.vm[exp];
        // }
        new Wather(this.vm, exp, function(newVal) {
            node.value = newVal;
        });
        node.addEventListener("input", (e) => {
            let newV = e.target.value;
            this.vm[exp] = newV;
        });
    },
    TextDirective: function(attr) {
        return attr.indexOf("v-text") === 0;
    },
    HtmlDirective: function(attr) {
        return attr.indexOf("v-html") === 0;
    },
    IfDirective: function(attr) {
        return attr.indexOf("v-if") === 0;
    },
};