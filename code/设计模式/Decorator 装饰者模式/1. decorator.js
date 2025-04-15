// 使用新功能装饰构造函数

// 车辆 Vehicle 构造函数

function Vehicle(vehicleType) {

    // 默认值
    this.vehicleType = vehicleType || "car";
    this.model = "default";
    this.license = "00000-000";

}

// 测试基本 Vehicle 实例
var testInstance = new Vehicle("Car");
// 输出: Vehicle { vehicleType: 'Car', model: 'default', license: '00000-000' }
console.log(testInstance);

// 创建一个 vehicle 实例进行装饰
var truck = new Vehicle("truck");

// 给 truck 装饰新的功能
truck.setModel = function (modelName) {
    this.model = modelName;
};

truck.setColor = function (color) {
    this.color = color;
};

// 测试赋值操作是否正常工作
truck.setModel('CAT');
truck.setColor('blue');

// 输出: Vehicle { vehicleType: 'truck', model: 'CAT', license: '00000-000', setModel: [Function], setColor: [Function], color: 'blue' }
console.log(truck);

