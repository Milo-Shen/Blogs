---
title: Javascript 设计模式之原型模式 ( Prototype 模式 )
date: 2019-02-04 14:44:00
tags: [设计模式]
categories: [设计模式]
comments: true

---

前言：原型模式是一种基于现有对象模板，通过克隆方式创建对象的模式。

![](https://img.shenyujie.cc/2019-2-9-Prototype-Pattern.png)

<!--more-->

## Prototype 模式的定义
Prototype 模式是基于原型继承的模式，可以在其中创建对象，作为其他对象的原型。Prototype 对象本身实际上是用作构造函数创建每个对象的蓝图。(ps: 所用构造函数原型包含的属性，会被继承到由其创建的每个对象中)

在 Javascript 中，原型继承避免和类一起使用，理论上没有 “定义的对象”，也没有核心的对象，我们仅仅是创建现有功能对象的拷贝。使用 Prototype 模式的一个好处是，我们获得的是 Javascript 其本身所具有的原型优势，而不是试图模仿其他语言的特性

## 使用 Object.create 实现原型继承

```
let myCar = {
    name: "Ford Escort",

    drive: function () {
        console.log("Weeee. I'm driving !")
    },

    panic: function () {
        console.log("Wait. How do you stop this thing?")
    }
};

// 使用 Object.create 实例化一个新 Car
let yourCar = Object.create(myCar);

// 如此 myCar 便是 yourCar 的原型
// 输出：Ford Escort
console.log(yourCar.name);

// 输出：false
console.log(myCar === yourCar);
```

## 使用 Object.create 实现差异继承
Object.create 还可以帮助我们实现差异继承.通过差异继承，对象可以直接继承自其他对象(继承的相同部分)，同时 Object.create 允许我们使用第二个参数来初始化对象的属性（差异化部分）。

```
let vehicle = {
    getModel: function () {
        console.log("the module of this vehicle")
    }
};

let car = Object.create(vehicle, {

    "id": {
        value: 1,
        enumerable: true
    },

    "module": {
        value: "Ford",
        enumerable: true
    }

});

// 输出：1
console.log(car.id);
```

## 不使用 Object.create 实现原型模式

```
let vehiclePrototype = {
    init: function (carModel) {
        this.model = carModel;
    },
    getModel: function () {
        console.log("the module of this vehicle")
    }
};

function vehicle(model) {
    function F() { }
    F.prototype = vehiclePrototype;
    let f = new F();
    f.init(model);
    return f;
}

let car = vehicle("Ford Escort");
car.getModel();
```

这个方案不允许用户以同样的方式定义只读属性（因为如果不小心，vehiclePrototype 可能会被改变）

## 可供选择的 Prototype 模式实现

```
let beget = (function () {

    function F() { }
    return function (proto) {
        F.prototype = proto;
        return new F();
    }

})();
```