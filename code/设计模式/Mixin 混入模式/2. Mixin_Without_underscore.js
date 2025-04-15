// 定义简单的 Car 构造函数
var Car = function (settings) {
    this.model = settings.model || "no model provided";
    this.color = settings.color || "no color provided";
};

// Mixin
var Mixin = function () {
};


Mixin.prototype = {

    driveForward: function () {
        console.log('drive forward');
    },

    driveBackward: function () {
        console.log('drive backward');
    },

    driveSideways: function () {
        console.log('drive sideways')
    }

};

// 通过一个方法将现有对象扩展到另外一个对象上
function augment(receivingClass, givingClass) {

    // 只提供特定方法
    if (arguments[2]) {
        for (var i = 0, len = arguments.length; i < len; i++) {
            receivingClass.prototype[arguments[i]] = givingClass.prototype[arguments[i]];
        }
    } else {
        for (var methodName in givingClass.prototype) {
            // 确保接收类不包含所处理方法的同名方法
            if (!receivingClass.prototype.hasOwnProperty(methodName)) {
                receivingClass.prototype[methodName] = givingClass.prototype[methodName];
            }
        }
    }

}

// 为 Car 构造函数增加 driveForward 和 driveBackward 两个方法
augment(Car, Mixin, "driveForward", "driveBackward");

// 创建一个新的 Car
var myCar = new Car({
    model: "Ford Escort",
    color: "blue"
});

// 确保新增的方法可用
// 输出: drive forward
myCar.driveForward();
// 输出: drive backward
myCar.driveBackward();

// 也可以不特定申明方法名，将 Mixin 的所有方法都添加到 Car 中去
augment(Car, Mixin);

var mySportsCar = new Car({
    model: "Porsche",
    color: "red"
});

// 输出: drive sideways
mySportsCar.driveSideways();