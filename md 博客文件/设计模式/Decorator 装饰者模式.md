# JavasSript 设计模式 (9) 之装饰者模式 ( Decorator 模式 )

前言：Decorator 装饰者模式是一种结构性设计模式，旨在促进代码复用。与 Mixin 模式类似，他们可以被认为是另一个可行的对象子类化的替代方案

![](https://img.shenyujie.cc/2019-6-16-Decorator-Pattern.png)

## Decorator 模式的作用
1. Decorator 模式提供了将行为动态添加至系统的现有类的能力，装饰者本身对于类原有的基础功能来说并不是必要的 ( 若是必要功能，可整合到超类本身而无需使用 Decorator 模式 )。
2. 装饰者可以用于修改现有的系统，可以在系统中添加额外的功能，而不需要大量修改使用它们的底层代码。当应用程序可能包含需要大量不同类型对象的功能时，可使用 Decorator 模式。

## 一个简单的 Decorator 例子
Decorator 模式并不严重依赖于创建对象的方式，而是关注扩展其额外功能。我们使用一个单一的基本对象并逐步添加提供额外功能的 decorator 对象，而不是仅仅依赖于原型继承。简单来说就是，向基本对象添加 decorator 属性或方法，而不是进行子类化，因此较为精简

```
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

```

上述例子是 decorator 模式最基础的一个实现，仅作为一个入门。它不能真正证明装饰者模式的所有优势，为此，下面我们举一个销售苹果电脑的示例（ 在该例子中，我们使用多个 Decorator 装饰对象 ）

```
// 使用多个 Decorator 装饰对象
// 被装饰对象的构造函数
function MacBook() {
    this.const = function () {
        return 1024;
    };
    this.screenSize = function () {
        return 15.4;
    }
}

// Decorator 1
function Memory(macbook) {
    var v = macbook.const();
    macbook.const = function () {
        return v + 128;
    }
}

// Decorator 2
function Engraving(macbook) {
    var v = macbook.const();
    macbook.const = function () {
        return v + 256;
    }
}

// Decorator 3
function Insurance(macbook) {
    var v = macbook.const();
    macbook.const = function () {
        return v + 512;
    }
}

var mb = new MacBook();
Memory(mb);
Engraving(mb);
Insurance(mb);

// 输出: 1920
console.log(mb.const());

// 输出: 15.4
console.log(mb.screenSize());
```

在这个示例中，我们使用 Decorator 模式 MacBook 超类的对象 .const 函数来返回 MacBook 的当前价格加上特定的升级价格。在这个过程中 Decorator 并没有重写原始 MacBook 类的构造函数方法，只是在需要的时候，对某一个实例化的 MacBook 对象进行功能的增强或是修改。

## 伪经典 Decorator 装饰者模式
伪经典装饰者是由 Dustin Diaz 和 Ross Harmes 提出的，该模式被设计用于引用目的。伪 Decorator 模式被描述为一种用于在相同接口的其他对象内部透明地包装对象的模式。接口应该是对象定义方法的一种方式，但是实际上他并不直接指定如何实现这些方法。接口还可以定义接收那些参数，但都是可选的。  
下面是使用鸭子类型在 Javascript 中实现接口的一个示例，这种方法帮助确定一个对象是否是基于其实现方法的构造函数/对象的实例

```
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
```

在这个示例中，`Interface.ensureImplements` 提供了严格的检查功能。  
接口的最大问题是，在 Javascript 中没有为其提供原生的支持，试图模仿可能不太适合的另一种语言特性是有风险的。可以在不耗费大量性能成本的情况下使用享元模式，但我们将继续看一下使用相同概念的抽象装饰者。

## 抽象 Decorator 装饰者模式
为了演示该版本 Decorator 模式的结构，假设我们有一个超类，再次模拟 Macbook，以及模拟一个商店允许我们 “装饰” 苹果笔记本并收取增强功能的额外费用。

```
var Macbook = function () {
    // ...
};

var MacbookWith4GBRam = function () {};
var MacbookWith8GBRam = function () {};
var MacbookWith4GBRamAndEngraving = function () {};
var MacbookWith8GBRamAndEngraving = function () {};
var MacbookWith4GBRamAndParallels = function () {};
var MacbookWith8GBRamAndParallels = function () {};
var MacbookWith4GBRamAndParallelsAndCase = function () {};
var MacbookWith8GBRamAndParallelsAndCase = function () {};
var MacbookWith4GBRamAndParallelsAndCaseAndInsurance = function () {};
var MacbookWith8GBRamAndParallelsAndCaseAndInsurance = function () {};
// etc ...
```

这将是一个不切实际的解决方案，因为每个可用的增强功能组合都需要一个新的子类，这显然很麻烦且不利于维护。为了解决这个问题，避免维护大量的子类，下面我们来看一下如何使用装饰者来更好地解决这个问题。我们只需要创建 5 个新的装饰者类，而不是需要之前看到的所有组合。在这些增强类上调用的方法将被传递给 Macbook 类。在接下来的示例中，装饰者会透明地包装他们的组件，由于使用了相同的接口，他们可以进行互相交互，代码如下所示：

```
var Macbook = new Interface("Macbook",[
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
    addEngraving:function () {},
    addParallels:function () {},
    add4GBRam:function () {},
    add8GBRam:function () {},
    addCase:function () {},
    getPrice:function () {
        // 基本价格
        return 900;
    }
};
```

为了方便我们添加后期需要的更多选项，我们定义了一个具有默认方法的抽象装饰者类来实现 Macbook 接口，其余的选项则划入子类。抽象装饰者确保我们可以装饰出一个独立的，而且多个装饰者在不同组合下都需要的基类，而不需要为每一个可能的组合都派生子类。

```
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
```

在上面的例子中，Macbook decorator 接受一个对象作为组件。踏使用了我们前面定义的 Macbook 接口，针对每个方法，在组件上会调用相同的方法。我们现在可以仅通过使用 Macbook Decorator 创建选项类：简单调用超类构造函数，必要时可以重写任何方法。

```
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
```

正如我们可以看到的，其中大部分内容都是很容易实现的。我们所做的是重写需要装饰的 addCase() 和 getPrice() 方法，首先执行该组件的原有方法，然后加上额外的内容（ 文本或价格 ）。下面我们试着将所有的内容整合到一个例子中：

```
// 实例化 Macbook
var myMacbookPro = new MacbookPro();

// 输出：900
console.log(myMacbookPro.getPrice());

// 装饰 macbook
myMacbookPro = new CaseDecorator(myMacbookPro);

// 返回的将是 945
console.log(myMacbookPro.getPrice());
```

由于装饰者可以动态地修改对象，因此他们是一种用于改变现有系统的完美模式。有时候，为对象创建装饰者比维护每个对象类型的单个子类要简单一些。可以让可能需要大量子类对象的应用程序的维护变得更加简单。

## Decorator 模式的优点
对象可以被新行为包装或 “装饰”，然后可以继续被使用，而不必担心被修改的基本对象。在一个更加广泛的上下文中，这种模式也使我们不必依靠大量的子类来获得同样的好处

## Decorator 模式的缺点
如果管理不当，它会极大地复杂化应用程序架构，因为它向我们的命名空间引入了很多小型类似的对象。让人担心的是，除了对象变得难以管理，其他不熟悉这个模式的开发人员可能难以理解为什么使用它。