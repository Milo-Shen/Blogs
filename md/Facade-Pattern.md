---
title: Javascript 设计模式之外观模式（ Facade 模式 ）
date: 2019-06-09 21:44:00
tags: [设计模式]
categories: [设计模式]
comments: true

---

前言：这一章我们主要介绍一下外观模式，该模式可为更大的代码体提供一个方便的高层次接口，隐藏底层实现的真实复杂性。通常该模式用于简化 API 来提供给其他开发人员，可提高可用性。

![](https://img.shenyujie.cc/2019-6-9-Factory-Pattern.png)

<!--more-->

## Facade 外观模式的作用与实际应用
Facade 外观模式是一种结构性模式，通常可以见与 jQuery 等库中，尽管一个 jQuery 方法的实现可能支持具有广泛行为的方法，但是却只有一个外观或这些方法的有限抽象能够提供给开发者使用。  
使用 Facade 外观模式后，我们可以直接与 Facade 交互，而不是与其幕后具体的系统交互。

## Facade 外观模式与 jQuery
Facade 外观模式大量应用于 jQuery 库以让其更容易被使用。譬如我们使用 jQuery 的 `$(el).css()` 或 `$(el).animate()` 方法时，其实就是在使用 Facade: 一种更简单的向外暴露的公有接口，使我们不必手动在 jQuery 内核中调用很多内部方法以便实现某些行为，也同时避免了手动与 DOM API 交互。  

Facade 模式既能简化类的接口，也可以使这个类从使用它的代码中解耦。这使得我们可以间接地与子系统交互，这种方式比直接访问子系统有时更加不容易犯错误。Facade 的优点还包括易于使用和实现该模式时占用的空间小。

## Facade 外观模式例子

下面是一个未经优化的示例，但在这里，我们使用 Facade 模式来简化监听浏览器事件的 API

```
var addMyEvent = function (el, ev, fn) {
    if (el.addEventListener) {
        el.addEventListener(ev, fn, false);
    } else if (el.attachEvent) {
        el.attachEvent("on" + ev, fn);
    } else {
        el["on" + ev] = fn;
    }
};

```

下面我们看一下 jQuery 中的 `$(document).ready()` 方法，该方法就采用了 Facade 模式屏蔽了内部实现的复杂性。同时在内部，它实际上使用了一个 称为 bindReady 的方法，实现如下：

```
bindReady: function () {
	...
	if (document.addEventListener) {
	    document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
	    window.addEventListener("load", jQuery.ready, false);
	} else if (document.attactEvent) {
	    document.attactEvent("onreadystatechange", DOMContentLoaded);
	    window.attactEvent("onload", jQuery.ready);
	}
	...
}
```

上述例子是另一个 Facade 示例，它仅仅暴露了 ready 方法，而把内部实现的复杂性隔绝在了视线之外

## Facade 模式可与其他设计模式合用
Facade 模式并非只能单独使用，还可以与其他设计模式合用。下面的例子，我们看一下 Facade 模式与 Module 模式合用的场景：

```
var module = (function () {
    var _private = {
        i: 5,
        get: function () {
            console.log("current value: " + this.i);
        },
        set: function (val) {
            this.i = val;
        },
        run: function () {
            console.log("running")
        },
        jump: function () {
            console.log("jumping")
        }
    };

    return {
        facade: function (args) {
            _private.set(args.val);
            _private.get();
            args.run && _private.run();
        }
    }
})();

module.facade({run: true, val: 10});
```

在这个示例中, module.facade 方法隔绝了其内部一系列私有方法，用户只要使用暴露在外的 facade 方法即可。如此一来我们让上面例子中的 facade 函数变成了一个特性去使用，而无需关注内部实现细节。

## Facade 的缺点
性能问题是 Facade 模式值得关注的一个点。我们使用 Facade 模式设计的 API 前需要注意下该抽象是否有隐形的冗余性能开销。举个例子，jQuery 为了兼容各大浏览器而编写的庞大的兼容代码就是此类开销之一。对于特性设备，譬如 mobile 端开发，很多兼容代码是没有必要的。