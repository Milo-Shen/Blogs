# JavasSript 设计模式 (8) 之混入模式 ( Mixin 工厂模式 )

前言：这一章我们来介绍一下 Mixin 混入模式，我们可以将 Mixin 看做一种扩展收集功能的方式。它可以为任意数量的对象实例定义属性，我们可以利用这一点来促进函数复用。

![](https://img.shenyujie.cc/2019-6-9-Mixins-Pattern.png)

## Mixin 模式的目的
Mixin 允许对象通过较低的复杂度借用（ 或继承 ）功能。该模式与 Javascipt 的对象原型配合地非常好，它为我们提供了一个相当灵活的方式，从不只一个 Mixin 中分享功能，但实际上很多功能是通过多重继承得到的。他们可以被视为具有可以在很多其他对象原型中轻松共享属性和方法的对象。

## 借助 Underscore 实现 Mixin 的一个例子
下面我们首先在一个标准对象字面量中定义一个包含实用函数的 Mixin

```
var myMixins = {
    moveUp: function () {
        console.log('move up');
    },
    moveDown: function () {
        console.log('move down');
    },
    stop: function () {
        console.log('stop');
    }
};
```

然后我们可以使用诸如 underscore 中的 _.extend 方法轻松扩展现有构造函数的原型，以将上述行为包含进来

```
// carAnimator 构造函数
function carAnimator() {
    this.moveLeft = function () {
        console.log('moveLeft');
    }
}

// personAnimator 构造函数
function personAnimator() {
    this.moveRandomly = function () {
        console.log('moveRandomly');
    }
}

// 使用 Mixin 扩展 2 个构造函数
_.extend(carAnimator.prototype, myMixins);
_.extend(personAnimator.prototype, myMixins);

// 创建 carAnimator 的新实例
var myAnimator = new carAnimator();
myAnimator.moveLeft();
myAnimator.moveDown();
myAnimator.stop();
```

正如上面的例子，这允许我们以通用的方式轻松 “混入” 对象构造函数。

## 脱离 Underscore 实现 Mixin 的一个例子
在下面的这个例子中，我们不借助 Underscore 来实现一个 Mixin 的例子。在下面的例子中，我们有 Car 和 Mixin 两个构造函数，我们要做的是扩展 Car，以便它可以继承 Mixin 中定义的特定方法 ( 在本例中为 driveForward 和 driveBackward ) ，代码如下: 

```
// 定义简单的 Car 构造函数
var Car = function (settings) {
    this.model = settings.model || "no model provided";
    this.color = settings.color || "no color provided";
};

// Mixin
var Mixin = function () {
};


Mixin.prototype = {

    driveForward: function () {
        console.log('drive forward');
    },

    driveBackward: function () {
        console.log('drive backward');
    },

    driveSideways: function () {
        console.log('drive sideways')
    }

};

// 通过一个方法将现有对象扩展到另外一个对象上
function augment(receivingClass, givingClass) {

    // 只提供特定方法
    if (arguments[2]) {
        for (var i = 0, len = arguments.length; i < len; i++) {
            receivingClass.prototype[arguments[i]] = givingClass.prototype[arguments[i]];
        }
    } else {
        for (var methodName in givingClass.prototype) {
            // 确保接收类不包含所处理方法的同名方法
            if (!receivingClass.prototype.hasOwnProperty(methodName)) {
                receivingClass.prototype[methodName] = givingClass.prototype[methodName];
            }
        }
    }

}

// 为 Car 构造函数增加 driveForward 和 driveBackward 两个方法
augment(Car, Mixin, "driveForward", "driveBackward");

// 创建一个新的 Car
var myCar = new Car({
    model: "Ford Escort",
    color: "blue"
});

// 确保新增的方法可用
// 输出: drive forward
myCar.driveForward();
// 输出: drive backward
myCar.driveBackward();

// 也可以不特定申明方法名，将 Mixin 的所有方法都添加到 Car 中去
augment(Car, Mixin);

var mySportsCar = new Car({
    model: "Porsche",
    color: "red"
});

// 输出: drive sideways
mySportsCar.driveSideways();
```

## Mixin 模式的优点
Mixin 模式有助于减少系统中重复的功能，增加函数复用。当一个应用程序可能需要在各种对象实例中共享行为时，我们可以通过在 Mixin 中维持这种贡献功能并专注于仅实现系统中真正不同的功能，来轻松避免冗余

## Mixin 的缺点
Mixin 可能导致原型污染和函数起源方面的不确定性。但是，话说回来，完整夯实的文档有助于将 Mixin 模式的缺点降低到最小，编写文档的时候需要多加注意。