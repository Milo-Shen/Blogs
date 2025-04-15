---
title: 分析 __proto__ 和 prototype 的区别
date: 2018-04-18 17:50:00
tags: javascript
categories: javascript
comments: true

---

前言： ES6 已经广泛运用于 nodejs 中，类的写法也由 Function 升级到了 Class。然而，Class 只是过往 ES5 环境中 Function 的语法糖，所以以往 function 写法构建类时候的很多操作和知识点，同样会延续到 es6 的类写法 class 中。故而，不妨重新回顾一下 ES5 中原型链的一些特性。

<!--more-->

## 准备知识

1. JavaScript 中，万物皆为对象，\_\_proto\_\_ 存在于每一个对象中
2. 方法 ( Function ) 是对象，方法的原型 ( Function.prototype ) 也同样是对象，对象具有属性 \_\_proto\_\_ ( 隐式原型 )，一个对象的隐式原型指向构造该对象的构造函数的原型，这保证了实例能够访问在构造函数原型中定义的属性和方法
3. Function 比较特殊，它除了和其他对象一样含有上述 \_\_proto\_\_ 以外，还具有期特有的原型属性 prototype ( 显式原型 )，该对象是一个指针，指向一个对象（原型对象），这个对象包含了所有实例共享的属性和方法。需要注意的是，在原型对象中，包含一个 constructor 的属性，该属性指回原构造函数

## \_\_proto\_\_ 和 prototype 关系图

![](//img.shenyujie.cc/2018-4-18-proto.jpg)

### new 方式产生的对象

```
// 定义函数 Foo
function Foo(){}
// 定义对象 f1, o1
var f1 = new Foo();
var o1 = new Object();

// f1 的 __proto__ 指向其构造函数 Foo 的 prototype
f1.__proto__ === Foo.prototype

// Foo.prototype 也是一个对象，同样具有 __proto__ 属性
// 其指向 Foo 的构造函数 Object 的原型，Object.prototype
Foo.prototype.__proto__  === Object.prototype

// Foo.prototype.constructor 指回原构造函数，即 Foo
Foo.prototype.constructor === Foo

// 类 Foo 本身也是被类 Function 构造出来的
// 故而 Foo.__proto__ 指向 Function.prototype
Foo.__proto__ === Function.prototype

// 由于 Object 是一切对象的起始
// 故而其 Object.prototype.__proto__ 指向 null (源头)
Object.prototype.__proto__ === null

// 由于 Object 本身也是一个函数对象( 由 Function 生成 )
// 故而其 Object.__proto__ 指向 Function.prototype
// 理论上所有自定义的函数都是由 Function 生成的函数对象
Object.__proto__ === Function.prototype

// Function.__proto__ 指回了它自身
// 构造函数自身是一个函数，它是被自身构造的
Function.__proto__ === Function.prototype

// Function.prototype的__proto__指向其构造函数Object的prototype
Function.prototype.__proto__ === Object.prototype
```

### 对象字面量方式产生的对象

```
var obj = {};

// 对象字面量创建的对象，实质上是由 Object 生成的
// 故而 obj.__proto__ 指向 Object.prototype
obj.__proto__ === Object.prototype

// 以下的例子按照上述规则，结合 new 方式产生的对象的原型链规则，结果如下：
obj.__proto__.__proto__ === null

obj.__proto__.constructor === Object

obj.__proto__.constructor.__proto__ === Function.prototype

obj.__proto__.constructor.__proto__.__proto__ === Object.prototype

obj.__proto__.constructor.__proto__.__proto__.__proto__ === null

obj.__proto__.constructor.__proto__.__proto__.constructor.__proto__ === Function.prototype 
```

### Object.create 方式产生的对象

我们首先看下 create 的内部实现(近似)

```
Object.create = function(p) {
    function f(){}
    // 此处丢失了构造器 
    f.prototype = p;
    return new f();
}
```

create 操作，实际是构建了一个新的函数，并且把该函数的 prototype 指向原始对象 p，再用 new 操作生成一个新对象，故而执行结果就很明了了，如下所示: 

```
var p1 = {};
var p2 = Object.create(p1);

// p2.__proto__ 指向生成它的构造函数的原型属性 
// 由于构造函数的 prototype 被强制指定为了 p ( 这里的 p1 )
// 故而 p2.__proto__ 指向 p1
p2.__proto__ === p1

// p1.constructor 为 Object，故而 p1.__proto__ 指向 Object.prototype
// 即 p1.__proto__ 指向 p1.constructor.prototype
p1.__proto__ === p1.constructor.prototype

// 由于 create 操作会丢失构造器，故而此处不等，如下图所示
p2.__proto__ !== p2.constructor.prototype
```

![](//img.shenyujie.cc/2018-4-18-constructor.PNG)
p2 由 create 而来，丢失了构造器，而 p1 则没有