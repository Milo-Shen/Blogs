---
title: Javascript 设计模式之发布订阅模式的 pubsub.js 实现
date: 2018-12-25 21:30:00
tags: [设计模式]
categories: [设计模式]
comments: true

---

前言：上一章，我们介绍了发布订阅模式的实现和其与观察者模式之间的联系。这一章我们来看一下 npm 上比较优秀的 pubsub-js 库的内部实现。

![](https://img.shenyujie.cc/2019-6-9-PubSub.png)

<!--more-->

## pubsub-js 的 API 总和

| API | 功能 |
| ------ | ------ |
|        subscribe      | 订阅一个主题，并绑定事件处理函数      |
|     subscribeOnce     | 订阅一个主题，执行一次后，立即注销订阅 |
|         publish       | 异步发布消息 |
|       publishSync     | 同步发布消息 |
|   clearSubscriptions  | 中等文本 |
| clearAllSubscriptions | 中等文本 |
|       unsubscribe     | 注销订阅特定主题 |

下面我们将逐一分析上述 api 的实现，此处为[pubsub-js 的 npm 地址](https://www.npmjs.com/package/pubsub-js)

## 总体数据结构

```
// messages 同于存储 topic 主题与和主题相关的事件处理函数
// lastUid 用于生成唯一标识 token
var messages = {}, lastUid = -1;
```

## subscribe 实现

```
/**
 * 订阅一个事件主题
 * @param message
 * @param func
 * @returns {*}
 */
PubSub.subscribe = function (message, func) {

    // 若是订阅的 func 参数不是一个函数则退出
    if (typeof func !== 'function') return false;

    // 若是 message 为 symbol 类型，也转换成 string
    // 此举也是为了支持 ES6 内置的 Symbol 语法
    message = (typeof message === 'symbol') ? message.toString() : message;

    // 若是当前订阅的主题未曾被订阅过，则初始化
    if (!messages.hasOwnProperty(message)) {
        messages[message] = {};
    }

    // 为当前订阅生成唯一 token
    var token = 'uid_' + String(++lastUid);
    messages[message][token] = func;

    // 返回的 token 可供注销订阅时使用
    return token;
};
```

## subscribeOnce 实现

```
/**
 * 只订阅一次
 * @param message
 * @param func
 * @returns {*}
 */
PubSub.subscribeOnce = function (message, func) {
    var token = PubSub.subscribe(message, function () {
        // 首次捕捉到 publish 对应的主题，立即注销订阅
        PubSub.unsubscribe(token);
        // 立即执行一次注册到该主题的事件回调
        func.apply(this, arguments);
    });
    return PubSub;
};

```

## publish & publishSync 实现

```

/**
 * 同步发布事件
 * @param message
 * @param data
 * @returns {boolean}
 */
PubSub.publishSync = function( message, data ){
    return publish( message, data, true, PubSub.immediateExceptions );
};

/**
 * 异步发布事件
 * @param message
 * @param data
 * @returns {boolean}
 */
PubSub.publish = function (message, data) {
    return publish(message, data, false, PubSub.immediateExceptions);
};

/**
 * 发布特定主题的消息
 * @param message
 * @param data
 * @param sync
 * @param immediateExceptions
 * @returns {boolean}
 */
function publish(message, data, sync, immediateExceptions) {

    // 若是主题 message 为 symbol
    message = (typeof message === 'symbol') ? message.toString() : message;

    // 高阶函数，返回一个主题发布函数
    var deliver = createDeliveryFunction(message, data, immediateExceptions),
        // 检测发布的消息主题是否被订阅过
        hasSubscribers = messageHasSubscribers(message);

    // 若是待发布的主题没有被订阅过则退出
    if (!hasSubscribers) {
        return false;
    }

    // 同步 publish
    if (sync === true) deliver();
    // 异步 publish
    else setTimeout(deliver, 0);
    return true;
}
    
```

## clearSubscriptions 实现

```
 /**
 * 清空特定订阅主题
 * @param topic
 */
PubSub.clearSubscriptions = function clearSubscriptions(topic) {
    var m;
    for (m in messages) {
        if (messages.hasOwnProperty(m) && m.indexOf(topic) === 0) {
            delete messages[m];
        }
    }
};
```

## clearAllSubscriptions 实现

```
/**
 * 清空所有订阅主题
 */
PubSub.clearAllSubscriptions = function clearAllSubscriptions() {
    messages = {};
};
```

## unsubscribe 实现

```
/**
 * 注销特定的订阅主题
 *
 * - 当参数是 token 时，注销该 token 的订阅
 *
 * - 当参数是一个函数，则注销涉及这函数的所有订阅
 *
 * - 若传输的是一个主题，则注销与该主题相关的所有订阅
 * @function
 * @public
 * @alias subscribeOnce
 * @param { String | Function } value A token, function or topic to unsubscribe from
 * @example // Unsubscribing with a token
 * var token = PubSub.subscribe('mytopic', myFunc);
 * PubSub.unsubscribe(token);
 * @example // Unsubscribing with a function
 * PubSub.unsubscribe(myFunc);
 * @example // Unsubscribing from a topic
 * PubSub.unsubscribe('mytopic');
 */
PubSub.unsubscribe = function (value) {

    // 检测 messages 中是否有当前指定的 topic 主题存在
    var descendantTopicExists = function (topic) {
            for (var m in messages) {
                if (messages.hasOwnProperty(m) && m.indexOf(topic) === 0) return true;
            }
            return false;
        },
        // 判断传入的参数是否是 topic
        isTopic = typeof value === 'string' && (messages.hasOwnProperty(value) || descendantTopicExists(value)),
        // 判断传入的参数是否是 token
        isToken = !isTopic && typeof value === 'string',
        // 判断传入的参数是否是函数
        isFunction = typeof value === 'function',
        // 赋默认值
        result = false,
        m, message, t;

    // 若是传入的参数是 topic 则，注销对应 topic 主题上的事件
    if (isTopic) {
        PubSub.clearSubscriptions(value);
        return;
    }

    for (m in messages) {
        if (messages.hasOwnProperty(m)) {
            message = messages[m];

            // 如果是 token，则注销该 token 的事件处理函数
            if (isToken && message[value]) {
                delete message[value];
                result = value;
                break;
            }

            // 若参数是一个函数，则注销与这函数相关的所有订阅
            if (isFunction) {
                for (t in message) {
                    if (message.hasOwnProperty(t) && message[t] === value) {
                        delete message[t];
                        result = true;
                    }
                }
            }
        }
    }

    return result;
};
```