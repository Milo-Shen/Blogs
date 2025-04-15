# JavasSript 设计模式 (5) 之命令模式 (Command 模式)

前言：Command 命令模式用于将方法调用，请求或操作封装到单一对象中，从而根据我们不同的请求对客户进行参数化和传递可供执行的方法调用。

## Command 命令模式的目的
将方法调用，请求或操作封装到单一对象中，从而根据我们不同的请求对客户进行参数化和传递可供执行的方法调用。除此之外，Command 模式将调用操作的对象与知道如何实现该操作的对象解耦，并在交换出具体类（对象）方面提供更大的整体灵活性
![](https://img.shenyujie.cc/2019-2-9-Command-Pattern.png)

## Command 模式的优点

1. 为我们提供了一种分离职责的手段：这些职责包括从执行命令的任意地方发布命令，以及将该职责转而委托给不同的对象
2. Command 模式将会把 action 动作和调用该动作的对象绑定在一起。他们始终包括一个执行操作(如 run() 或 execute())。所具有相同接口的 Command 对象可以根据需要轻松交换，这被认为是该模式最大的好处

## 传统 JS 写法（ 非 Command 模式 ）

```
(function () {

    let carManager = {

        // 请求信息
        requestInfo: function (model, id) {
            return `The information for ${model} with ID ${id} is foobar`;
        },

        // 订购汽车
        buyVehicle: function (model, id) {
            return `You have successfully purchased Item ${id} , a ${model}`;
        },

        // 组织一个 view
        arrangeViewing: function (model, id) {
            return `You have successfully booked a viewing of ${model}(${id})`;
        }
    };

})();
```

上面的写法可以让用户直接访问 carManager 对象中的方法，然而会造成以下问题：  
carManager 中的方法和访问这些方法的对象耦合，很大程度上违反了松耦合对象的 OOP 理论。若是 carManager 对象中的方法发生改变，所有调用了该方法的地方都要做出相应的调整

## 使用 Command 模式改造上述代码

```
 carManager.execute = function (name) {
        return carManager[name] && carManager[name].apply(carManager, [].slice.call(arguments, 1));
 };
```

最终的调用过程如下所示：

```
carManager.execute("arrangeViewing", "Ferrari", 1234);
carManager.execute("requestInfo", "Alice", 321);
carManager.execute("buyVehicle", "Ferrari", 343);
```

经过改造以后，可以接受任意在 carManager 对象上执行的命名方法，传递可以使用的任意数据。