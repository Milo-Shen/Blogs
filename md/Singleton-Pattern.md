---
title: Javascript 设计模式之（单例模式）
date: 2018-11-07 21:44:00
tags: [设计模式]
categories: [设计模式]
comments: true

---

前言：设计模式作为编程实践中很重要的一个部分，能为我们的代码提供更优雅简介的实现方式。模式作为已经被验证了的解决方案，具有很强的复用性和表达力。下面我们将分篇章依次介绍 JavaScript 中存在的 20 多种设计模式

## 单例模式的介绍
单例模式限制了类的实例化次数为 1 次。从经典的意义上来说，Singleton 模式，在该实例不存在的情况下，可以通过一个方法创建一个类来创建类的新实例，如果实力已经存在，它会简单地返回该对象的引用。Singleton 模式不同于静态类（ 或对象 ），我们可以推迟其初始化。（ 这通常是因为他们需要一些信息，而这些信息在初始化期间可能无法获得 ）

## 单例模式的适用场景
+ 当类只能有一个实例，且有一个公共的访问点可以访问它
+ 该唯一的实例应该是通过子类化可扩展的，并且用户可以无需修改代码就可以使用一个扩展的实例

## 对象字面量实现单例模式

```
var mySingleton = {
    property1: "something",
    method1: function () {
        console.log('mySingleton method 1');
    }
};
```

## 延迟执行版单例模式实现

```
var mySingleton = (function () {

    // 实例保持了一个对 singleton 的引用
    var instance;

    function init() {
        // 私有方法和变量
        function privateMethod() {
            console.log('I am private');
        }

        var privateVariable = 'Im also private';
        var privateRandomNumber = Math.random();

        return {
            // 共有方法和变量
            publicProperty: "I am also public",
            getRandomNumber: function () {
                return privateRandomNumber;
            }
        }
    }

    return {
        // 获取 singleton 的实例，若是存在则返回, 不存在就创建新实例
        getInstance: function () {
            if (!instance) instance = init();
            return instance;
        }
    }
})();

// 直到第一次使用到单例模式编写的类时，该类才会生成实例，而不是程序执行时就生成
var singleA = mySingleton.getInstance();
var singleB = mySingleton.getInstance();
// 下面的语句输出 true
console.log(singleA.getRandomNumber() === singleB.getRandomNumber());
```

上面 `mySingleton` 类直到执行 `var singleA = mySingleton.getInstance();` 才会被实例化，在此之前不占用内存或 cpu 资源。由于是单例模式，故而 singleA 和 singleB 指向同一个 `mySingleton` 类的实例，故而返回 true。  
单例模式的延迟执行可以让类在被使用到之前，不使用资源和内存，（在 C++ 中，Singleton 模式负责隔绝动态初始化顺序的不可预知性，将控制权归还给程序员）  

## 单例模式可以用于系统间各种模式的通信协调上
当系统中需要一个对象来协调其他对象时，单例模式将起到很大的作用，下面代码是一个简单的最佳实践：

```
var SingletonTester = (function () {

    // options: 包含 singleton 所需配置信息的对象
    function Singleton(options) {
        options = options || {};
        this.name = "singletonTester";
        this.pointX = options.pointX || 0;
        this.pointY = options.pointY || 0;
    }

    // 实例持有者
    var instance;

    // 静态变量和方法的模拟
    var _static = {
        name: "singletonTester",
        // 获取实例的方法，要返回 singleton 对象的 singleton 实例
        getInstance: function (options) {
            if (!instance) instance = new Singleton(options);
            return instance;
        }
    };

    return _static;

})();

var singletonTest = SingletonTester.getInstance({
    pointX: 5
});

// 记录 pointX 的输出以便验证
// 以下输出：5
console.log(singletonTest.pointX);
```

我们可以使用单例 SingletonTester 来在各个模式和函数间共享同一个 Singleton 类的实例，来共享该实例的 name, pointX, pointY 等信息。

本文学习引用自 [JavaScript 设计模式] 一书，感谢作者 Addy Osmani 和译者徐涛的贡献。
