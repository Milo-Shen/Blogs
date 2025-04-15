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