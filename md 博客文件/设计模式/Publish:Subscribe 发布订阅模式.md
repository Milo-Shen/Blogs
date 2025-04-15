# JavasSript 设计模式 (3) 之发布订阅模式 (Publish/Subscribe 模式)

前言：发布订阅模式是 Javascript 中最常用的设计模式之一。它虽然和观察者模式非常相似，但是两者之间也有其特定的差异，Publish/Subscribe 模式多了一个主题/事件通道
<!--more>

## 观察者模式与发布订阅模式的区别
![](https://img.shenyujie.cc/2018-10-30-Publish-Subscribe-Pattern.png)

+ Observer 模式要求希望接收到主题通知的观察者（ 或对象 ）必须订阅内容改变的事件
+ Publish/Subscribe 模式，使用了一个主题/事件通道，这个通道介于订阅者（希望接收到通知的一方）和订阅者（发布事件的对象）之间。该事件系统允许代码定义应用程序的特定事件，这些事件可以传递包含订阅者所需要的值的自定义参数，以避免订阅者和发布者之间产生依赖关系
+ Publish/Subscribe 模式允许任何订阅者执行适当的事件处理程序来注销和接收发布者发出的通知

## 发布订阅模式的例子
下面例子，展示了一个发布订阅模式的例子，其中我们选用了，PubSub 库来进行以下例子。

```
// 引入 PubSub 库
const PubSub = require('pubsub-js');

// 简单的 mail 处理程序

// 接收到的消息数量
let mailCount = 0;

// 新建一个订阅，订阅名称是 inbox/newMessage
let subscriber_1 = PubSub.subscribe("inbox/newMessage", (topic, data) => {
    // 输出接收到的主题为 inbox/newMessage 的信息
    console.log("subscriber_1 received msg: ", data);
});

// 新建另一个订阅，接收同样的 topic 但是，对接收到的 data 做不同的处理
let subscriber_2 = PubSub.subscribe("inbox/newMessage", (topic, data) => {
    // 统计接收到的邮件数
    mailCount++;
    console.log("message count: " + mailCount);
});

// 发布消息
PubSub.publishSync("inbox/newMessage", "hello world");

// 之后可以通过 unsubscribe 来取消订阅
PubSub.unsubscribe(subscriber_1);
PubSub.unsubscribe(subscriber_2);
```

输出结果：

```
subscriber_1 received msg:  hello world
message count: 1
```

这个模拟接收邮件的代码片段的中心思想是促进松散耦合。通过订阅另一个对象的特定任务或活动，当任务/活动发生改变时获得通知，而不是单个对象直接调用其他对象的方法

## 发布订阅模式的优点

1. 帮助我们将应用程序分解成更小，更松散的块，以改进代码管理和潜在的复用，实现系统解耦
2. 无需紧密耦合的情况下，维护相关对象之间的一致性
3. 当使用任何一种模式时，动态关系可以在观察者和目标之间存在

## 发布订阅模式的缺点

1. 若是订阅者需要记录或输出一些与应用程序相关的错误日志。如果此时订阅者崩溃了，由于系统解耦的特性，发布者就不会看到这一点
2. 订阅者之间无视彼此的存在，且对变化发布者产生的成本视而不见。且由于订阅者和发布者之间的动态关系，很难依赖更新

## 一个简单的 PubSub 的实现

```
let PubSub = {};

(function (q) {

    // 订阅事件的主题列表
    let topics = {},
        subUid = -1;

    // 发布或广播事件，包含特定的 topic 名称和参数（ 比如传递的数据 ）
    q.publish = (topic, args) => {

        // 若是订阅的主题不在列表中，则返回
        if (!topics[topic]) return false;

        // 若主题存在列表中，则返回主题包含的订阅者的长度
        let subscribers = topics[topic];
        let len = subscribers ? subscribers.length : 0;

        while (len--) {
            subscribers[len].func(topic, args);
        }

        // 返回 publish 对象本身
        return this;

    };

    // 通过特定的名称和回调函数订阅事件，topic/event 触发时执行事件
    q.subscribe = (topic, func) => {

        // 对订阅的主题进行初始化
        if (!topics[topic]) topics[topic] = [];

        let token = (++subUid).toString();

        // 将订阅者加入，对应主题的订阅者队列中
        topics[topic].push({
            token: token,
            func: func
        });

        // 返回订阅 token
        return token;

    };

    // 基于订阅上的引用标记，通过特定的 topic 取消订阅
    q.unsubscribe = token => {
        for (let m in topics) {
            if (topics.hasOwnProperty(m) && topics[m]) {
                for (let i = 0, length = topics[m].length; i < length; i++) {
                    if (topics[m][i].token === token) {
                        topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }

        // 返回 unsubscribe 对象本身
        return this;
    };

})(PubSub);
```

## 使用上述实现

```
// 新建一个订阅，订阅名称是 inbox/newMessage
let subscriber = PubSub.subscribe("inbox/newMessage", (topic, data) => {
    // 输出接收到的主题为 inbox/newMessage 的信息
    console.log("subscriber_1 received msg: ", data);
});

// 输出：hello world
PubSub.publish("inbox/newMessage", "hello world");

```

## 使用 publish/subscribe 解耦 ajax 应用

```
<script type="text/javascript">
    let subscriber = PubSub.subscribe("inbox/ajax", (topic, data) => {
        // 输出接收到的主题为 inbox/ajax 的信息
        console.log(data);
    });

    let url = "https://sug.so.360.cn/suggest?callback=suggest_so&encodein=utf-8&encodeout=utf-8&format=json&fields=word";
    $.ajax({
        //请求360搜索的公开接口
        url: url,
        type: 'get',
        dataType: 'jsonp',
        data: {word: 'apple'},
        jsonp: "callback",
        jsonpCallback: "suggest_so"
    }).done(function (data) {
        PubSub.publish("inbox/ajax", data);
    }).fail(function () {
        console.log("error");
    });
</script>
```

如此 ajax 的回调便可和业务代码解耦分离开来。