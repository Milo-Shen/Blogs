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

var Macbook = new Interface("Macbook", [
    "addEngraving",
    "addParallels",
    "add4GBRam",
    "add8GBRam",
    "addCase"
]);

// Macbook Pro 可能需要如下来描述
var MacbookPro = function () {
    // 实现 Macbook
};

MacbookPro.prototype = {
    addEngraving: function () {
    },
    addParallels: function () {
    },
    add4GBRam: function () {
    },
    add8GBRam: function () {
    },
    addCase: function () {
    },
    getPrice: function () {
        // 基本价格
        return 900;
    }
};

// Macbook 抽象装饰者类
var MacbookDecorator = function (macbook) {
    Interface.ensureImplements(macbook, Macbook);
    this.macbook = macbook;
};

MacbookDecorator.prototype = {
    addEngraving: function () {
        return this.macbook.addEngraving();
    },
    addParallels: function () {
        return this.macbook.addParallels();
    },
    add4GBRam: function () {
        return this.macbook.add4GBRam();
    },
    add8GBRam: function () {
        return this.macbook.add8GBRam();
    },
    addCase: function () {
        return this.macbook.addCase();
    },
    getPrice: function () {
        return this.macbook.getPrice();
    }
};

var CaseDecorator = function (macbook) {
    // 接下来调用超类的构造函数
    this.superclass.constructor(macbook);
};

// 扩展超类
extend(CaseDecorator, MacbookDecorator);

CaseDecorator.prototype.addCase = function () {
    return this.macbook.addCase() + "Adding case to macbook";
};

CaseDecorator.prototype.getPrice = function () {
    return this.macbook.getPrice() + 45;
};

// 实例化 Macbook
var myMacbookPro = new MacbookPro();

// 输出：900
console.log(myMacbookPro.getPrice());

// 装饰 macbook
myMacbookPro = new CaseDecorator(myMacbookPro);

// 返回的将是 945
console.log(myMacbookPro.getPrice());