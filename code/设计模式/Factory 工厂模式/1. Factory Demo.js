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
function VehicleFactory() {
}

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
