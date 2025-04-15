---
title: Javascript 设计模式之适配器模式 ( Mediator 模式 )
date: 2019-01-15 14:44:00
tags: [设计模式]
categories: [设计模式]
comments: true

---

前言：在生活中，中介者的意思是指 “协助谈判和解决冲突的中立方”。在设计模式中，中介者模式通过公开一个统一的接口，允许系统的不同部分可以通过该接口进行通信。

![](https://img.shenyujie.cc/2018-10-30-Mediator-Pattern.png)

<!--more-->

## 中介者模式的概念
如前言中所述，中介者模式，通过公开一个统一的接口，允许系统的不同部分可以通过该接口进行通信，以促进系统解耦。Mediator 模式促进松散耦合的方式：确保组件的交互是通过这个中心点来处理的，而不是显式地引用彼此。中介者模式可以帮助我们解耦系统并提高组件的可重用性。

## 中介者模式与观察者模式的区别
Mediator 模式本质上是 Observer 模式的共享目标。它假设系统中对象或模块之间的订阅和发布关系被牺牲掉了，从而维护中心联络点。它也可能被认为是额外的应用程序间的通知，用于协调不同的系统。在实际的前端开发过程中，假设我们使用了事件冒泡和事件委托（假设都委托在 document 上），则 document 在此处有效地充当了中介者的角色。

## 中介者模式的基本实现

```
var mediator = (function () {

    // 存储可被广播或监听的 topic
    var topics = {};

    // 订阅一个 topic，提供一个回调函数，一旦 topic 会广播就执行该回调
    var subscribe = function (topic, fn) {

        if (!topics[topic]) topics[topic] = [];
        topics[topic].push({context: this, callback: fn});

        return this;
    };

    // 发布/广播事件到程序的剩余部分
    var publish = function (topic) {

        var args;
        if (!topics[topic]) return false;
        
        args = Array.prototype.slice.call(arguments, 1);

        // 执行该 topic 内所有的回调函数
        for (var i = 0, length = topics[topic].length; i < length; i++) {
            var subscription = topics[topic][i];
            subscription.callback.apply(subscription.context, args);
        }

        return this;
    };

    return {
        Publish: publish,
        Subscribe: subscribe,
        installTo: function (obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
        }
    }

})();
```

## 中介者模式的优点
Mediator 中介者模式最大的好处是，它能将系统中对象或组件间所需的通信渠道从多对多减少到多对一。  
同时，由于该自我解耦系统的另一大有点在于：如果模块之间直接相互通信，模块的改变（如另一个模块抛出一个异常）容易让应用程序的其余部分产生多米诺效应，这个问题对解耦系统来说就可以避免。  
最后由于应用之间的解耦，添加新发布者和订阅者相对也容易多了。

## 中介者模式的缺点
Mediator 中介者模式的最大缺点在于，它可能会引入单一故障点。将 Mediator 放置于模块之间可以导致性能下降，因为他们总是间接地进行通信。由于松耦合的性质，很难通过仅关注广播来确定一个系统如何做出反应。
