---
title: Javascript 深拷贝 ( 抽取并分析 Jquery 中的 extend 方法 )
date: 2017-06-19 20:40:10
tags: javascript
categories: 对象的深拷贝
comments: true
---
随着各种前端框架和类库的发展，jquery 已经不再像它鼎盛时期那般，几乎清一色地在每次开发中都会引入，特别是在我们只需要用到其中很小一部分方法的时候，为了使用单一的一个方法而引入整个 jquery 文件有点得不偿失。这里我们抽取下 jquery 中的 extend 方法，以供单独使用，在遇到需要深拷贝的场景中，格外适用 !
<!-- more -->

## 抽取的 extend 方法 （这里用宽放大模式，重新包装了一下）
对于函数的实现解析，写在了注释中

```
var extend = (function (extend, undefined) {

        /**
         * 判断当前传入的参数是否是 window 对象
         * @param obj
         * @returns {*|boolean}
         */
        var isWindow = function (obj) {
            // 判断传入的 obj 是否是 window 对象
            // 当 obj 是 object 类型，且有 setInterval 属性时，认为其为 window 对象
            // 这是根据 window 对象的特性来判断的，虽然该特性可被覆写，但一般情况下认为此法可用
            return obj && typeof obj === "object" && "setInterval" in obj;
        };

        var class2type = {};

        // Object.prototype.toString.call(obj) 返回的结果类似 [object Array]
        // 可以根据此来判断传入参数的具体类型
        "Boolean Number String Function Array Date RegExp Object".split(" ").forEach(function (name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });

        /**
         * 判断当前传入的参数是否是一个纯粹的对象
         * 纯粹的对象是指由 {} 产生或是由 new Object() 产生的对象
         * @param obj
         * @returns {*}
         */
        var isPlainObject = function (obj) {
            // 首先排除 Node 节点 和 window 对象
            if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) return false;

            try {
                // 没有构造器的 obj 肯定是个纯对象
                if (obj.constructor &&
                    !Object.prototype.hasOwnProperty.call(obj, "constructor") &&
                    !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                // catch 此函数在 IE 8, 9 浏览器下的 bug
                return false;
            }

            // javascript 引擎会首先遍历私有属性，其次再会遍历继承过来的属性
            // 故而此处只需判断最后一个属性是否为私有属性，即可得知是否所有属性皆为私有属性
            var key;
            for (key in obj) {}
            return key === undefined || Object.prototype.hasOwnProperty.call(obj, key);
        };

        /**
         * 判断传入的参数是否是对象
         * @param obj
         * @returns {boolean}
         */
        var isFunction = function (obj) {
            return type(obj) === "function";
        };

        /**
         * 判断传入的对象是否为数组
         * @type {*}
         */
        var isArray = Array.isArray || function (obj) {
                return type(obj) === "array";
            };

        /**
         * 确定传入参数 obj 的具体类型
         * @param obj
         * @returns {*}
         */
        var type = function (obj) {
            return obj == null ?
                String(obj) :
                class2type[Object.prototype.toString.call(obj)] || "object";
        };

        extend.clone = function () {
            var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // 当第一个参数是 bool 值时
            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                i = 2;
            }

            // 处理传入参数是 string 或其他非 object 类型的情况（深拷贝中）
            if (typeof target !== "object" && !isFunction(target)) target = {};

            // 若是只传入一个参数，则置 target 为空
            if (length === i) {
                target = {};
                --i;
            }

            for (i ; i < length; i++) {
                // 排除对象是 null 的情况
                if ((options = arguments[i]) != null) {
                    // Extend the base object
                    for (name in options) {
                        src = target[name];
                        copy = options[name];

                        // 防止死循环
                        if (target === copy) continue;

                        // 递归复制 object 和 array 对象
                        if (deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) )) {
                            if (copyIsArray) {
                                // 数组对象
                                copyIsArray = false;
                                clone = src && isArray(src) ? src : [];
                            } else clone = src && isPlainObject(src) ? src : {};

                            // 递归复制
                            target[name] = extend.clone(deep, clone, copy);

                            // 忽略 undefined 对象
                        } else if (copy !== undefined) target[name] = copy;
                    }
                }
            }

            return target;
        };

        return extend;

    })(window.extend || {}, void 0);
```

## 使用方法
和 jquery 相同，举个例子（深拷贝）： 

```
var a = {a:1, b:[1,2,3]};
var b = {a:2, c:1};
var c = extend.clone(true, {}, a, b);  
// c 为 {a:2, b:[1,2,3], c:1}
// 此时无论对 c 如何操作，都不会影响 a 的值
```
