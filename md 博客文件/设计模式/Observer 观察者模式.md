# JavasSript 设计模式 (2) 之观察者模式 (Oberver 模式)

前言：Observer ( 观察者 ) 是一种设计模式，其中，一个对象（ 称之为 subject ）维持一系列依赖于它（ 观察者 ）的对象，将有关状态的任何变更自动通知给他们。
<!--more>

## 观察者模式的机制
一个或多个观察者对目标的状态感兴趣，他们通过将自己依附在目标对象上以便注册所感兴趣的内容。目标状态发生改变并且观察者可能对这些改变感兴趣，就会发送一个通知，调用每个观察者的更新方法。当观察者不再对目标状态感兴趣时，他们可以简单地将自己从中分离。

![](https://img.shenyujie.cc/2018-10-30-Observer-Pattern.png)

## 观察者模式的组成部分
1. Subject (目标)：维护一系列的观察者，方便添加或删除观察者
2. Observer（观察者）：为那些在目标状态发生改变时需要获得通知的对象提供一个更新接口
3. ConcreteSubject（具体目标）：状态发生改变时，向 Observer 发出通知，储存 ConcreteObserver 的状态
4. ConcreteObserver（具体观察者）：存储一个指向 ConcreteSubject 的引用，实现 Observer 的更新接口，以使自身状态与目标状态保持一致。

## Observer 实现
首先，我们来具体实现观察者的 Observer 部分。下面我们将模拟一个目标可能拥有的一系列依赖 Observer

```

function ObserverList() {
    this.observerList = [];
}

ObserverList.prototype.Add = function (obj) {
    return this.observerList.push(obj);
};

ObserverList.prototype.Empty = function () {
    return this.observerList = [];
};

ObserverList.prototype.Count = function () {
    return this.observerList.length;
};

ObserverList.prototype.Get = function (index) {
    if (index > -1 && index < this.observerList.length) {
        return this.observerList[index];
    }
};

ObserverList.prototype.Insert = function (obj, index) {
    var pointer = -1;
    if (index === 0) {
        this.observerList.unshift(obj);
        pointer = index;
    } else if (index === this.observerList.length) {
        this.observerList.push(obj);
        pointer = index;
    }
    return pointer;
};

ObserverList.prototype.IndexOf = function (obj, startIndex) {
    var i = startIndex, pointer = -1;
    while (i < this.observerList.length) {
        if (this.observerList[i] === obj) pointer = i;
        i++;
    }
    return pointer;
};

ObserverList.prototype.removeIndexAt = function (index) {
    if (index === 0) {
        this.observerList.shift();
    }
    else if (index === this.observerList.length - 1) {
        this.observerList.pop();
    }
};

// 使用 extension 扩展对象
function extend(obj, extension) {
    for (var key in obj) {
        extension[key] = obj[key];
    }
}
```

## Subject 实现
接下来，我们模拟目标和在观察者列表上添加删除或通知观察者的能力

```
// 模拟目标 Subject 和在观察者列表上添加，删除或通知观察者的能力
function Subject() {
    this.observers = new ObserverList();
}

Subject.prototype.addObserver = function (observer) {
    this.observers.Add(observer);
};

Subject.prototype.removeObserver = function (observer) {
    this.observers.removeIndexAt(this.observers.IndexOf(observer, 0));
};

Subject.prototype.Notify = function (context) {
    var observerCount = this.observers.Count();
    for (var i = 0; i < observerCount; i++) {
        // 此处的 Update 将在后文介绍并实现
        this.observers.Get(i).Update(context);
    }
};
```

## 观察者模式举例

描述：

1. 添加一个目标 (subject) checkbox，通知其他 checkbox 进行检查
2. 添加观察者 ( observer ) checkbox，用于接收目标 checkbox 发送的通知

### 具体代码 - html 部分

```
<button id="addNewObserver">Add New Observer checkbox</button>
<input type="checkbox" id="mainCheckbox"/>
<div id="observersContainer"></div>
```

### 具体代码 - Js 部分

```
cript type="text/javascript">
    var controlCheckbox = document.getElementById("mainCheckbox");
    var addBtn = document.getElementById("addNewObserver");
    var container = document.getElementById("observersContainer");

    // 具体目标 Subject，利用 Subject 扩展 controlCheckbox
    extend(new Subject(), controlCheckbox);

    // 点击 checkbox 会触发通知到观察者上
    controlCheckbox.onclick = new Function("controlCheckbox.Notify(controlCheckbox.checked)");
    addBtn.onclick = AddNewObserver;

    // 具体观察者
    function AddNewObserver() {
        // 创建需要添加的新 checkbox
        var check = document.createElement("input");
        check.type = "checkbox";

        // 利用 Observer 类扩展 checkbox;
        extend(new Observer(), check);

        // 重写自定义的更新行为
        check.Update = function (value) {
            this.checked = value;
        };

        // 为主 subject 的观察者添加新的观察者
        controlCheckbox.addObserver(check);

        // 将观察者附到容器上
        container.appendChild(check);
    }
```

[预览地址](https://html.shenyujie.cc/Observer.html)
