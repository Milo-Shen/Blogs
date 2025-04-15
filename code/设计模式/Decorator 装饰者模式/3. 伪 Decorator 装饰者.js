/**
 Code copyright Dustin Diaz and Ross Harmes, Pro JavaScript Design Patterns.
 **/
// Constructor.
var Interface = function (name, methods) {
    if (arguments.length !== 2) {
        throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected exactly 2.");
    }
    this.name = name;
    this.methods = [];
    for (var i = 0, len = methods.length; i < len; i++) {
        if (typeof methods[i] !== 'string') {
            throw new Error("Interface constructor expects method names to be " + "passed in as a string.");
        }
        this.methods.push(methods[i]);
    }
};


// Static class method.
Interface.ensureImplements = function (object) {
    if (arguments.length < 2) {
        throw new Error("Function Interface.ensureImplements called with " + arguments.length + "arguments, but expected at least 2.");
    }
    for (var i = 1, len = arguments.length; i < len; i++) {
        var interface = arguments[i];
        if (interface.constructor !== Interface) {
            throw new Error("Function Interface.ensureImplements expects arguments" + "two and above to be instances of Interface.");
        }
        for (var j = 0, methodsLen = interface.methods.length; j < methodsLen; j++) {
            var method = interface.methods[j];
            if (!object[method] || typeof object[method] !== 'function') {
                throw new Error("Function Interface.ensureImplements: object " + "does not implement the " + interface.name + " interface. Method " + method + " was not found.");
            }
        }
    }
};


// 用事先定义好的接口构造函数创建接口，该函数将接口名称和方法名称作为参数
// 在 reminder 示例中， summary() 和 placeOrder() 描绘的功能，接口应该支持

var reminder = new Interface("List", ["summary", "placeOrder"]);

var properties = {
    name: "Remember to buy the milk",
    date: "05/06/2016",
    actions: {
        summary: function () {
            return "Remember to buy the milk, we are almost out";
        },
        placeOrder: function () {
            return "Ordering milk from your local grocery store";
        }
    }
};

// 创建构造函数实现上述属性和方法
function Todo(config) {

    // 为了支持这些功能，接口示例需要检查这些功能
    Interface.ensureImplements(config.actions, reminder);

    this.name = config.name;
    this.methods = config.actions;

}

// 创建 todo 构造函数的新实例
var todoItem = new Todo(properties);

// 最后测试确保新增加的功能可用
// 输出：Remember to buy the milk, we are almost out
console.log(todoItem.methods.summary());
// 输出：Remember to buy the milk, we are almost out
console.log(todoItem.methods.placeOrder());