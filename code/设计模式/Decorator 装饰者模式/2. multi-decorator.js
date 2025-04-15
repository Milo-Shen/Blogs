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