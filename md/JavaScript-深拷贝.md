---
title: JavaScript 深拷贝
date: 2016-07-26 10:55:47
tags: javascript
categories: javascript
comments: true
---

为了防止变量被污染，我们需要对对象（或数组）进行拷贝，由于JS不像 C 等高级语言一般，可以指定传值或是传地址，故而我们需要对 JS 手工扩展深拷贝的方法
<!--more-->
## 最为简单的深拷贝方式
深拷贝的方式有很多，我们先看一种最为简单的方式：

> 注意：它能正确处理的对象只有 Number, String, Boolean, Array, 扁平对象，即那些能够被 json 直接表示的数据结构

```
var cloneObj = JSON.parse(JSON.stringify(obj));
```
这种方式简单实用，但是会丢失对象的constructor，深拷贝之后无论原先的构造函数是什么，都会变为 Object 类型，另外 RegExp 对象也无法通过这种方式深拷贝

## 单纯深拷贝数组或是JSON（亦或是两者混合嵌套）
#### 描述 : 递归实现深拷贝
之前写过一个简易的数组(对象)的深拷贝方法，使用时较为繁琐的是得首先判断原数据是 `array` 还是 `object` ； 本方法采用递归的方式一一复制原数据里边的内容

```
function deepCopy(destination, source) {
    for (var p in source) {
        if (getType(source[p]) == "array" || getType(source[p]) == "object") {
            destination[p] = getType(source[p]) == "array" ? [] : {};
            arguments.callee(destination[p], source[p]);
        }
        else destination[p] = source[p];
    }
}
```
变量`destination` 使用引用的方式带出最终的拷贝结果，使用时，`destination `的数据类型要和原数据 `source ` 保持一致。  
#### 使用方式 :

```
var src = [1, 2, a: [1, 2]}];
var des = getType(src) == "array" ? [] : {};
deepCopy(des, src);
console.log(des);
```
#### getType 的实现方式：

```
function getType(o) {
    var _t = null, _s = null;
    // 当数据属于 Object 超类的时候,再分析其具体类型
    if ((_t = typeof(o)) == "object") {
        // 若是 null 类型,则直接返回 null
        if (o == null) _s = 'null';
        // Object.prototype.toString.call(o) 返回类似 [object Array] 信息
        // 获取数据的具体类型, 截取类似 [object Array] 中的 Array, 以明确具体类型
        else _s = Object.prototype.toString.call(o).slice(8, -1);
    } else _s = _t;
    return _s.toLowerCase();
}
```

也可以采用操作符的优先级规则对以上代码进行简写:

```
function getType(o) {
    var _t = null;
    return ((_t = typeof(o)) == "object" ? o == null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
}
```

#### PS : 若是只想对一维数组进行拷贝可直接使用 `arr.slice(0)` 方法，`arr` 为待拷贝的数组  

# 以下是针对对象的深拷贝

> 上面探讨的大多是针对 Array 或是 Object ( 针对于 JSON ) 的深拷贝方式, 下面我们探讨下如何对一个对象 ( Object ) 进行深拷贝

#### 深拷贝的先决条件 ： 
1. 对于任何对象，它可能的类型有 Boolean, Number, Date, String, RegExp, Array, Object
2. 我们需要保存对象的构造函数信息，从而使新的对象可以使用 prototype 上的函数

## underScore.js 中的拷贝方式

```
_.clone = function(obj) {
  if (!_.isObject(obj)) return obj;
  return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
}
```


严格来说，underScore 中的拷贝方式只能称之为浅拷贝 ( shallow-copy )，因为对于数组的拷贝部分`slice()` 函数只能拷贝一位数组，数组中若有嵌套定义，则嵌套部分仍为引用关系。故而若有高维数组的拷贝需求，请使用以上自己编写的 `deepCopy`函数

## jquery.js 中的拷贝方式

```
var src = {
    a: [1, 2, {a: 1}],
    b: {a: [1, 2, 3]}
};

// shallow copy
var x = $.extend({}, src);
// deep copy
var y = $.extend(true, {}, src);

x.b.a === y.b.a  // false
```

jquery 中的 `extend()`方法，原本是为了给某个对象拓展方法或是属性，这里我们讨巧一下，给一个空的对象 `{}`，然后把待拷贝的对象的信息扩展给这个空对象, 就完成了拷贝。值得注意的是，`extend()`函数的第一个参数为 `true` 时，为深拷贝，否则默认为浅拷贝

