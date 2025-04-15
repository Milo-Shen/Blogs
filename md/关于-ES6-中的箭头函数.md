---
title: 关于 ES6 中的箭头函数
date: 2017-04-28 16:42:42
tags: ['箭头函数','javascript','ES6']
categories: ES6
comments: true
---

最近在看 ES6 的内容，遇到箭头函数（Arrow Function），便忍不住做些尝试，其实箭头函数在 c# 和 java 8.0 中早已普及，也就是所谓的 lambda 表达式，接下去我们会尝试一些箭头函数的定义和使用，若是有错误的地方，还请大家不吝赐教~
<!--more-->

## 箭头函数（Arrow Function） 的兼容性
ios safari 从版本 10 以后都支持，chrome 从版本 49 以后都支持，故而本文示例需要在较新的浏览器或是 nodejs 环境中运行，一下附上 caniuse 中关于箭头函数的详细兼容性列表  

![箭头函数（Arrow Function） 的兼容性](//img.shenyujie.cc/2017-4-28-array-function.PNG)
## 箭头函数（Arrow Function） 的语法
### 一般语法
```
// 一般写法
(param1, param2, …, paramN) => { statements }
param => expression  等价于 param => { return expression }

// 如果是单个参数，那个圆括号可以省略
(singleParam) => { statements }
singleParam => { statements }

// 无参数的函数需要使用圆括号
() => { statements }

// 对于函数体，箭头表达式支持多行语句或者是单行表达式作为函数体
// 多行语句需要使用 { } 括起来，单行语句不需要且会作为函数返回值
x => x＋x;               // 返回 x + x
x => { return x + x };   // 返回 x + x
x => { x + x }           // 返回 undefined，因为没有 return 返回值
x => return x + x;       // 语法错误，{ } 不能省略
```

### 高阶语法
```
// 返回文字表达式，此处需要用 () 将表达式包起来
params => ({foo: bar})

// 支持剩余参数和默认参数
(param1, param2, ...rest) => { statements }
(param1 = defaultValue1, param2, …, paramN = defaultValueN) => { statements }

// 参数列表中支持解构赋值
var f = ([a, b] = [1, 2]) => a + b;

f() 为 3
```

## 箭头函数（Arrow Function） 的用途和特性
### 更短的语法
```
var array = [1,2,3,4];

// 普通写法
var array_1 = array.map( function(x) { return x + 1 } );

// 箭头表达式写法
var array_2 = array.map( x => x + 1 );
```

### 箭头表达式会捕获定义时其上下文的 this 值作为自己的 this
我们先看一个例子，在 ES3 和 ES5 的语法中，每个新定义的函数都有自己的 this  

+  构造函数的 this 指向一个构造出来的新的对象
+  函数作为对象的方法来调用，则 this 指向调用者

这样的行为会为我们的编程造成一些困惑，譬如：  

```
var count = {
        current: 0,
        counting: function () {
            setInterval(function myCount() {
                this.current++;
            }, 1000);
        }
    }
    
count.counting();   // NAN
```

此处输出 NAN 是因为执行 setInterval 时，this 指针指向 myCount，而不再是 count，故而 this.current 的值变成了 undefined，执行 ++ 操作后，就变为了 NAN，我们可以手动保存 count 的 this 值去修正这个问题：    

```
var count = {
        current: 0,
        counting: function () {
            var _this = this;
            setInterval(function myCount() {
                _this.current++;
            }, 1000);
        }
    }
    
count.counting();
```

在函数内部使用了事先保存好的 this 值，这样就不会有问题了，或是也可以用 ES5 中的 bind 函数，强制改变 this 的指向：  

```
var count = {
        current: 0,
        counting: function () {
            setInterval(function myCount() {
                this.current++;
            }.bind(this), 1000);
        }
    }
    
count.counting();
```

有了箭头函数以后，我们就可以如下写法：  

```
var count = {
        current: 0,
        counting: function () {
            setInterval(() => { this.current++ }, 1000);
        }
    };
    
count.counting();
```
箭头函数的 this 始终指向函数定义时的 this，且之后不会发生改变，故而以上写法是可以的

```
var current = 1;
var count = {
        current : 10,
        play : () => this.current
    };
    
o.play();              // 1
o.play.call(o);        // 1
```

此处箭头函数定义时，this 值为全局对象 window，故而 this.current 为 1 ，用 call 手动改变箭头函数的 this 指向无效，其会始终指向定义时的捕获的上下文的 this 值，故而输出的 this.current 仍旧是 1  

### 没有内部 arguments
箭头表达式内部没有暴露 arguments 参数，若是在箭头函数中使用了 arguments 它则会指向箭头函数所在作用域中名为 arguments 的值，若没有，则为 undefined  

```
var arguments = 1;
var fn = () => arguments;

fn(); // 输出 1
```

针对这个问题，我们可以用 rest 参数代理：  

```
function foo() {
    var f = (...args) => args[0];
    return f(arguments);
}

foo(1,2,3)  // 输出: [1, 2, 3, callee: function, Symbol(Symbol.iterator): function]
```

此处我们用 (...rest) 剩余参数和外层包裹的 foo 函数对 arguments 进行了代理，但是这么做没有必要，因为内外层的函数只是为了完成同一个函数的作用，部分失去了箭头函数便利性的特点。  

### 不能使用 new 操作符
箭头函数由于没有构造器 constructor，故而不能使用 new 操作符  

```
var Foo = () => {};
var foo = new Foo();  // TypeError: Foo is not a constructor
```

### 没有原型属性

```
var Foo = () => {};
console.log(Foo.prototype);   // 输出 undefined
```

### 返回文字表达式
{} 里面的代码会被解析为序列语句( foo 被认为是一个标签, 而非文字表达式的组成部分 )，所以使用文字表达式时一定要加 ( )

```
var func = () => ({ foo: 1 });  // 正确
var func = () => { foo: 1 };    // 错误
```
