var pubsub = {};

(function (q) {

    var topics = {},
        subUid = -1;

    // 发布或广播事件，包含特定的 topic 名称和参数
    q.publish = function (topic, args) {
        if (!topics[topic]) {
            return false;
        }

        var subscribers = topics[topic],
            len = subscribers ? subscribers.length : 0;

        while (len--) {
            subscribers[len].func(topic, args);
        }

        return this;

    };

    // 通过特定的名称和回调函数订阅事件，topic/event 触发时执行事件
    q.subscribe = function (topic, func) {
        if (!topics[topic]) {
            topics[topic] = [];
        }

        var token = (++subUid).toString();
        topics[topic].push({
            token: token,
            func: func
        });

        return token;
    };

    // 基于订阅上的标记引用，通过特定的 topic 取消订阅
    q.unsubscribe = function (token) {
        for (var m in topics) {
            if (topics[m] && topics.hasOwnProperty(m)) {
                for (var i = 0, j = topics[m].length; i < j; i++) {
                    if (topics[m][i].token === token) {
                        topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return this;
    }

})(pubsub);

// 基于上述 pubSub 的消息处理举例

// 创建一个简单的消息记录器，记录所有通过订阅者接收到的主题 (topic) 和数据
var messageLogger = function (topic, data) {
    data = typeof data === 'object' ? JSON.stringify(data) : data;
    console.log("Logging: " + topic + ": " + data);
};

// 订阅者监听订阅的 topic ，一旦该 topic 广播一个通知，订阅者立刻调用回调函数
var subscription = pubsub.subscribe("myTopic", messageLogger);

// 发布者负责发布程序感兴趣的 topic 或是通知
pubsub.publish("myTopic", "hello world");
pubsub.publish("myTopic", {
    name: "myName",
    year: "2018"
});
