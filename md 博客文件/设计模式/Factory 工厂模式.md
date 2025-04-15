# JavasSript 设计模式 (7) 之工厂模式 (Factory 工厂模式)

前言：Factory 工厂模式涉及到对象的概念，但它不显式地要求使用一个构造函数，而是提供一个通用的接口来创建对象，我们可以指定所希望创建的工厂对象的类型。

![](https://img.shenyujie.cc/2019-6-9-Factory-Pattern.png)

## Factory 工厂模式的用途
若是我们需要创建的对象比较复杂（ 该对象强烈依赖于动态因素或应用程序配置 ）便可以考虑使用 Factory 模式

## Factory 工厂模式例子
假设我们有一个汽车工厂 VehicleFactory 
，其可以生产两种类型的车 Car 和 Truck。下面我们使用 Factory 模式来实现 VehicleFactory 工厂，代码如下:

```
// 定义 Car 构造函数
function Car(options) {
    this.doors = options.doors || 4;
    this.state = options.state || 'brand new';
    this.color = options.color || 'silver';
}

// 定义 Truck 构造函数
function Truck(options) {
    this.state = options.state || 'used';
    this.wheelSize = options.wheelSize || "large";
    this.color = options.color || "blue";
}

// 定义 vehicle 工厂的大体代码
function VehicleFactory() { }

// 定义该工厂的原型，默认 vehicleClass 为 Car
VehicleFactory.prototype.vehicleClass = Car;

// 创建新 Vehicle 实例的工厂方法
VehicleFactory.prototype.createVehicle = function (options) {
    if (options.vehicleType === "car") {
        this.vehicleClass = Car;
    } else {
        this.vehicleClass = Truck;
    }
    return new this.vehicleClass(options);
};

// 创建生成汽车的工厂实例
var carFactory = new VehicleFactory();
var car = carFactory.createVehicle({
    vehicleType: "car",
    color: "yellow",
    doors: 6
});

// 测试汽车是由 VehicleFactory 原型 prototype 中的 Car 创建的
// 输出 true
console.log(car instanceof Car);


// 输出 Car 对象，Car { doors: 6, state: 'brand new', color: 'yellow' }
console.log(car);
```

若是我们想使用 VehicleFactory 工厂生产 Truck, 代码如下: 

```
// 生产 Truck
var truck = carFactory.createVehicle({
    vehicleType: "truck",
    state: "like new",
    color: "yellow",
    doors: 8
});

// 测试汽车是由 VehicleFactory 原型 prototype 中的 Truck 创建的
// 输出 true
console.log(truck instanceof Truck);


// 输出 Truck 对象，Truck { state: 'like new', wheelSize: 'large', color: 'yellow' }
console.log(truck);
```

我们也可以将 VehicleFactory 归入子类来构建一个 Truck 的工厂类，代码如下: 

```
// 将 VehicleFactory 归入子类来创建一个 Truck 工厂类
function TruckFactory() { }

TruckFactory.prototype = new VehicleFactory();
TruckFactory.prototype.vehicleClass = Truck;

var truckFactory = new TruckFactory();
var myBigTruck = truckFactory.createVehicle({
    state: "omg..so bad",
    color: "pink",
    wheelSize: "so big"
});

// myBigTruck 是由 Truck 创建的
// 输出 true
console.log(myBigTruck instanceof Truck);


// 输出 Truck 对象，Truck { state: 'omg..so bad', wheelSize: 'so big', color: 'pink' }
console.log(myBigTruck);
```

## 使用 Factory 模式的场景
1. 当对象或组件涉及高复杂性时
2. 当需要根据所在的不同环境轻松生成对象的不同实例时
3. 当处理很多共享相同属性的小型对象或组件时
4. 在编写只需要一个 API 契约（ 鸭子类型 ）的其他对象的实例对象时，有利于解耦

## Factory 模式的缺点
1. 若是应用失当，该模式会给应用带来大量不必要的复杂性。
2. 由于没有显式的对象实例化过程（ 对象的实例化隐藏在了 Factory 模式的内部 ），单元测试时有可能会带来意想不到的问题

## Abstract Factory 抽象工厂
抽象工厂模式是工厂模式的高级用法，它用于封装一组具有共同目标的单个工厂。它能够将一组对象的实现细节从一般用法中分离出来。

## Abstract Factory 的使用场景举例
一个系统必须独立于他所创建的对象的生成方式，或它需要与对种对象类型一同工作。下面我们修改上述的车辆工厂方法至抽象车辆工厂方法 AbstractVehicleFactory。在这个例子中，我们不在限定车辆工程的车辆类型，而是可以通过用户 (注册/获取) 来操作车辆类型，请看下面的例子：

```
// 定义 Car 构造函数
function Car(options) {
    this.doors = options.doors || 4;
    this.state = options.state || 'brand new';
    this.color = options.color || 'silver';
}

// 此处的工厂方法只注册具有 drive 和 breakDown 方法的车辆类型
Car.prototype.drive = function () {
};
Car.prototype.breakDown = function () {
};

// 定义 Truck 构造函数
function Truck(options) {
    this.state = options.state || 'used';
    this.wheelSize = options.wheelSize || "large";
    this.color = options.color || "blue";
}

// 此处的工厂方法只注册具有 drive 和 breakDown 方法的车辆类型
Truck.prototype.drive = function () {
};
Truck.prototype.breakDown = function () {
};

var AbstractVehicleFactory = (function () {

    // 存储车辆类型
    var types = {};

    return {
        getVehicle: function (type, customizations) {
            var Vehicle = types[type];
            return Vehicle ? new Vehicle(customizations) : null;
        },

        registerVehicle: function (type, Vehicle) {
            var proto = Vehicle.prototype;
            // 只注册实现车辆契约的类
            if (proto.drive && proto.breakDown) {
                types[type] = Vehicle;
            }

            return AbstractVehicleFactory;
        }
    }

})();

// 为抽象车辆工厂类注册可生产车辆的类型
AbstractVehicleFactory.registerVehicle("car", Car);
AbstractVehicleFactory.registerVehicle("truck", Truck);

// 基于抽象车辆类型实例化一个 car 对象
var car = AbstractVehicleFactory.getVehicle('car', {
    color: "green",
    state: "new"
});

// 输出: true
console.log(car instanceof Car);
// 输出: Car { doors: 4, state: 'new', color: 'green' }
console.log(car);

// 实例化一个 Truck 类型
var truck = AbstractVehicleFactory.getVehicle('truck', {
    wheelSize: "medium",
    color: "yellow"
});

// 输出: true
console.log(truck instanceof Truck);
// 输出: Truck { state: 'used', wheelSize: 'medium', color: 'yellow' }
console.log(truck);
```

以上便实现了抽象工厂方法 AbstractVehicleFactory