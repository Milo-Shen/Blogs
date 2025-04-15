---
title: ES6 之 Generator 函数用法解析
date: 2018-01-18 22:00:00
tags: ES6
categories: ES6
comments: true

---

ES6 新增了一种异步编程的解决方案 Generator 函数，其语法和行为方式和过往的函数都不同。其既是一个状态机，也是一个遍历器对象生成函数（ 可以调用 next ）

<!--more-->

## Generator 函数特点
1. 其作为一个状态机，内部可以封装多个状态（多为有限状态机）
2. 作为一个遍历器生成函数，返回的对象可以使用 next 遍历
3. function 命令和函数名之间有一个 * 号
4. 函数体内使用 yield 语句来定义不同的内部状态

## Generator 例子与详解
下面通过各种例子来对 Generator 的用法进行详解，例子参考 阮一峰老师 << ES6 权威指南 >>，本文在编写时也对书中案例的不足之处和错误之处进行了探究和讨论，下面会一一列出

## Generator 函数写法

```
function * f(x, y){ ... }

function *f(x, y){ ... }

function* f(x, y){ ... }

function*f(x, y){ ... }
```

上面的写法均可通过，`*` 号的位置可以写在 function 关键字和函数名之间的任意地方，但即便如此仍旧推荐第三种，使得 `function*` 作为一个整体去写，这样便可以一目了然就知道此函数为 Generator 函数

## 最简单的 Generator 例子

```
function* helloWorld() {
    yield 'hello';
    yield 'world';
    return 'ending';
}

let it = helloWorld();

console.log(it.next());  // { value: 'hello', done: false }
console.log(it.next());  // { value: 'world', done: false }
console.log(it.next());  // { value: 'ending', done: true }
console.log(it.next());  // { value: undefined, done: true }
```

上述例子定义了一个最简单的 Generator 函数，它的内部有三个状态（有限状态机）: hello ,world 和 return ( 结束 Generator )。其用法和普通函数比：  

1. 一是在函数名前，function 关键字后加入了一个 `*` 号来表示定义的函数是 Generator 函数。
2. 二是函数调用后（函数内部语句此时并未执行）返回的是一个指向函数顶部状态（有限状态机）的指针而不是函数返回的结果。  
3. 三是必须调用 next 方法，才能使指针指向下一个状态，直到遇到下一条 yield 语句或是 return 结束。  
4. Generator 是分断执行的，而 yield 语句则是 Generator 暂停的标记，next方法可以恢复 Generator 函数的执行。  

## 上述 Generator 例子解析
1. 第一次调用 next ，Generator 函数开始执行直到遇到第一条 yield 语句暂停（暂停在该语句处），此时返回值 value 的值就是当前 yield 语句后面跟的 value，done 的属性为 false 代表遍历尚未结束。
2. 第二次调用 next ，函数暂停在第二条 yield 语句 `yield 'world'`处，此时 value 的值便是此条 yield 后面所跟的值 world，done 由于 generator 尚未迭代完仍旧是 false。
3. 第三次调用 next，此时函数暂停在 return 语句处，由于是 return 语句，所以 done 的值为 true，代表遍历结束，value 的值为 return 后面跟着的 ending。
4. 第四次调用 next，由于上面 return 语句已经使得整个 Generator 函数的状态 done 变为了 true，遍历器结束，所以此时 value 的值为 undefined，done 仍旧为 true。以后再调用 next 多少次，由于 generator 状态 done 已经结束，故而永久是上述值。

![](//img.shenyujie.cc/2018-1-14-hello-generator.png)
上图是 Generator 执行流程图

## yield 语句
yield 语句 (无法使用在普通函数中) 是 Generator 函数的暂停标志，执行步骤如下

1. 遇到 yield 语句就暂停执行后面的操作，并将 yield 后面表达式的值作为返回对象 value 的值
2. 下一次调用 next 时，继续往下执行，直到遇到下一条 yield 语句，并把该 yield 的后面表达式的值作为 value 的值
3. 如果没有下一条 yield 语句，就一直执行到函数结束，直到遇到 return 语句，并将该 return 后面表达式的值作为 value 的值
4. 如果后面没有 return 语句，则返回对象的 value 的值为 undefined

## Generator 实现惰性求值

```
function* add() {
    yield 1 + 2;
}

let it = add();

console.log(it.next());  // { value: 3, done: false }
```

上面的例子中，表达式 1 + 2 不会立即求值，只有当调用 next 方法，指针指向这一句时才会求值

## Generator 实现暂缓执行函数

```
function* f() {
    console.log('working !');
}

let it = f();

// 直到此句函数调用时，才会输出字符串：working !
it.next(); 
```

上面的函数，不使用 yield 语句则单纯变成了一个暂缓执行函数，只有在调用 next 的时候，才会执行function* 函数体内的代码，输出 working !

## 无法在普通函数中使用 yield

```
let arr = [1, [2, [3, 4]], 5];

// 递归定义 Generator 函数
let flat = function* (a) {
    let length = a.length;
    a.forEach(item => {
        if (typeof item !== 'number') yield* flat(item);
        else yield item;
    })
};

// 一下语句会抛出异常
for (let i of flat(arr)) {
    console.log(i)
}
```

上面的例子中，forEach 接受的回调函数只能是普通函数，此时，我们给它一个 Generator 函数便会报错

## 对以上函数的修正

```
let arr = [1, [2, [3, 4]], 5];

// 递归定义 Generator 函数
let flat = function* (a) {
    let length = a.length;
    for (let i = 0; i < length; i++) {
        let item = a[i];
        if (typeof item !== 'number') yield* flat(item);
        else yield item;
    }
};

for (let i of flat(arr)) {
    // 输出 1, 2, 3, 4, 5
    console.log(i)
}
```

我们使用 for 循环代替了 forEach 来遍历 arr 数组，for 循环对函数类型没有要求，故而可以使用 yield 语句。  
<font color="red">顺带值得一提的是，Generator 执行后返回的指针本身是 iterator 迭代器对象，故而可以使用 for ... of 循环来遍历</font>

## yield 语句置于表达式中(nodejs 8.4.0 和 babel 均尚未支持)

```
// yield 作为表达式时需要使用 () 括起来
console.log('hello' + (yield 123))
```

<font color="red">以上语句尚未在 nodejs 8.4.0 和 babel 中支持，请勿使用 !</font>

## 与 Iterator 接口的关系(Generator 执行后的返回的指针即为遍历器对象)

```
function* generator() {
    console.log('generator');
}

let it = generator();

// 输出 true
console.log(it[Symbol.iterator]() === it);
```

上面的代码中, generator 函数执行后返回的指针 it 就是遍历器接口 `it[Symbol.iterator]()` 执行后的返回值。由此可见：Generator 执行后的返回的指针即为该对象的遍历器对象

## next 方法的参数 (例1)
yield 语句本身没有返回值，或是说总是返回 undefined，next 方法可以携带一个参数，该参数可以作为上一条 yield 语句的返回值

```
// next 方法的参数会作为上一条 yield 语句的值

function* f() {
    for (let i = 0; true; i++) {
        let reset = yield i;
        if (reset) i = -1;
    }
}

let g = f();

console.log(g.next());  // { value: 0, done: false }
console.log(g.next());  // { value: 1, done: false }

// 此处输出 0 是 next 参数和 i++ 共同的效果
console.log(g.next(true));  // { value: 1, done: false }
```

上面的例子中，我们首先定义了一个无限循环的 Generator 函数 f，下面我们列举函数的运行步骤：

1. 第一次执行 next，此时循环变量 i 的值为初始化的 0，函数暂停在第一条 yield 语句 `yield i` 上，并且返回对象 value 的值，正好是 yield 命令后面跟着的 i 为 1， 故而输出 `{ value: 0, done: false }`
2. 第二次执行 next，此时循环变量 i 的值为 1（经过了一次 i++），函数暂停在第二次循环的 yield 语句 `yield i`，此时返回对象的 value 为 1，返回值为 `{ value: 1, done: false }`
3. 第三次执行 next，此时 next 带了参数 true，此参数作为上一条 yield 语句的返回值。故而 reset 的值变成了 true，i 被语句 `i = -1` 把值置为 1，再经过 i++ 操作变成 0，故而此时返回值为 `{ value: 0, done: false }`

以上的步骤可以用下图表示
![](//img.shenyujie.cc/2018-1-16-next-parameter.png)

## next 方法参数 (例2)

```
function* f(x) {
    let y = yield(x + 1);
    let z = yield (y / 3);
    return (x + y + z);
}

// next 无参数
let it = f(5);

console.log(it.next());  // { value: 6, done: false }
console.log(it.next());  // { value: NaN, done: false }
console.log(it.next());  // { value: NaN, done: true }
```

上面例子步骤：

1. `let it = f(5)` x 被赋值为 5，f(5) 生成一个遍历器指针并赋值给变量 it
2. 执行第一次 next，返回对象的 value 值为 yield 后面所跟表达式的值 (x + 1 => 5 + 1) 为 6
3. 第二次执行 next，由于此时 next 无参数，故而上一条 yield 语句的返回值为 undefined，故而 y 为 undefined，next 操作的返回对象的 value 值为 (y / 3 => undefined / 3 => NaN) 为 NaN
4. 第三次执行 next，同理，next 操作的返回对象的 value 值为 NaN，但是由于此时 next 遇到的是 return 语句，所以遍历器状态 done 的值被系统置为了 true，代表遍历结束

## yield next 带参数 (例3)

```
function* f(x) {
    let y = yield(x + 1);
    let z = yield (y / 3);
    return (x + y + z);
}

// next 有参数
let it = f(5);
console.log(it.next());    // {value: 6, done: false}
console.log(it.next(12));  // {value: 4, done: false}
console.log(it.next(13));  // {value: 30, done: true}
```

上述例子步骤解析：

1. `it = f(5)` 获得遍历器指针对象，并赋值给局部变量 it
2. 第一次调用 next，指针移动并暂停在语句 `yield(x + 1)` 上，yield 后面所跟表达式 ( x+ 1 => 5 + 1)的值 6 成为了 next 函数返回对象 value 的值，故而输出 `{value: 6, done: false}`
3. 第二次调用 next，指针移动并暂停在语句 `yield (y / 3)`上, 由于此时 next 带参数 12, 所以上一条 yield 语句 `yield(x + 1)` 的值就变为 12, 由于 `y = yield(x + 1)`故而 y 的值为 12,此时 next 返回对象的 value 值为当前指针暂停处 yield 后所跟表达式 `y/3 => 12/3`的值为 4，所以 next 输出 `{value: 4, done: false}`
4. 第四次调用 next，指针移动并暂停在语句 `return (x + y + z)`上，此时由于 next 带参数 13，故而上一条 yield 语句 `yield (y / 3)` 值为 13，即 z = 13。加之此次 next 遇到 return 语句，所以 done 被置为 true。最终 next 返回对象的 value 值为 (x + y + z =>5 + 12 + 13) 为 30，故而最终 next 输出 `{value: 30, done: true}`

## yield 第一次调用 next 不允许带参数否则会被系统忽略 (例4)

```
function* f(x) {
    let y = yield(x + 1);
    let z = yield (y / 3);
    return (x + y + z);
}

// next 有参数
let it = f(5);
console.log(it.next(11));  // {value: 6, done: false}
console.log(it.next(12));  // {value: 4, done: false}
console.log(it.next(13));  // {value: 30, done: done}
```

next 方法的参数代表上一条 yield 语句的返回值，<font color="red">故而第一次调用 next 方法时不允许携带参数（第一次调用时不存在 "上一条 yield 语句的可能性"），若是携带，虽语法不会报错，但是会被系统自动忽略该参数</font>，故而上述例子的输出结果和 `yield next 带参数 (例4)` 相同

## 分析 next 调用时，Generator 内部语句的调用顺序

```
function* dataConsumer() {
    console.log('started');
    console.log(`1. ${yield 'Hello'}`);
    console.log(`2. ${yield 'World}`);
    return 'result';
}

let it = dataConsumer();

console.log(it.next());     // started, { value: 'Hello, done: false }
console.log(it.next('a'));  // 1. a, { value: 'World, done: false }
console.log(it.next('b'));  // 2. b, { value: 'result', done: true }
```

通过上述例子输出结果可以分析得出：
1. next 语句返回 obj 的 value 值永远是 yield 后面跟着的表达式的值，并且每次 next 执行都会暂停在当前指针的下一条 yield 语句上。
2. 若是 yield 语句包含在其他非 yield 语句中，则只有当执行下一条 yield 时，上一条包含 yield 语句的操作才会被执行。

上述例子执行过程如下：
![](//html.shenyujie.cc/2018-1-16-next-para-two.png)

## Generator 包装函数 (第一次 next 时支持带参)

```
// 包装 next 函数，使其第一次加载时也能 next 传值
function wrapper(generator) {
    return function (...args) {
        let genObj = generator(...args);
        genObj.next();
        return genObj;
    };
}

let wrapped = wrapper(function* () {
    console.log(`input: ${yield}`);   // 输出： input: hello
});

wrapped().next('hello');
```

由于第一次调用 next 时，不允许带参数，所以我们可以在 Generator 函数的最外层再包一层，事先先执行一次 next 操作，如此包装之后的 Generator 便可在 "第一次" 调用 next 时带参。

## Generator 函数与 for ... of 循环

```
function* f() {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    return 5;
}

// for ... of 循环遇到 done:true 时，循环终止，并且遍历结果不包含该值
for (let i of f()) {
    // 输出： 1, 2, 3, 4
    console.log(i)
}
```

在上面 `Generator 函数与 Iterator 接口的关系`中我们可以看到，Generator 执行后返回的指针就是 Iterator 迭代器实例对象，故而 Generator 函数也可以使用 for ... of 循环来遍历，且不需要使用 next 方法  
<font color="red">需要注意的是，for ... of 循环遇到 done:true 时，循环终止，并且遍历结果不包含该值，故而上述输出结果中并没有 return 后跟的值 5</font>  

## 使用 Generator 实现 fibonacci 数列

```
function* fibonacci() {
    let [pre, cur] = [0, 1];
    while (true) {
        [pre, cur] = [cur, pre + cur];
        yield cur;
    }
}

for (let i of fibonacci()) {
    if (i > 10) break;
    // 输出： 1, 2, 3, 5, 8
    console.log(i);
}
```

## Generator 返回的指针即为 Iterator 对象，可以使用实现了 symbol.iterator 接口的方法调用

```
function* f() {
    yield 1;
    yield 2;
    return 3;
    yield 4;
}

// 扩展运算符， 输出： [1,2]
console.log([...f()]);

// Array.from， 输出： [1,2]
console.log(Array.from(f()));

// for ... of 循环
for (let i of f()) {
    // 输出： 1, 2
    console.log(i)
}
```

上面例子需要注意的是，以上方法（解构赋值，Array.from，for ... of）遍历时遇到 return 会终止，并且不包含 return 后的值，故而遍历结果到 2 就停止了。

## 通过 Generator 为普通对象实现 Iterator 接口

```
// 法一：直接使用 yield
function* objectEntries(obj) {
    let propKeys = Reflect.ownKeys(obj);
    for (let propKey of propKeys) {
        yield [propKey, obj[propKey]];
    }
}

let jane = {first: 'jane', last: 'Doe'};

for (let [key, value] of objectEntries(jane)) {
    // 输出： first jane， last Doe
    console.log(key, value)
}

// 法二：将 Generator 函数添加到对象的 Symbol.iterator 属性上
function* objectIterator() {
    let propKeys = Reflect.ownKeys(this);
    for (let propKey of propKeys) {
        yield [propKey, this[propKey]];
    }
}

let joke = {first: 'joke', last: 'Merry'};

joke[Symbol.iterator] = objectIterator;

for (let [key, value] of joke) {
    // 此处会把 Symbol.iterator 也遍历出来
    // 输出： first jane， 
    //        last Doe， 
    //        Symbol(Symbol.iterator) [GeneratorFunction: objectIterator]
    console.log(key, value);
}
```

上述例子中，我们通过 Generator 为对象 jane 和 joke 实现了遍历器接口，故而我们可以使用 for ... of 循环去遍历这两个对象。  
<font color="red">需要注意的是，采用第二种方法时，使用 for ... of 循环遍历时，会把 `Symbol(Symbol.iterator) [GeneratorFunction: objectIterator]` 也放入遍历结果中！</font>

## Generator.prototype.throw
Generator 函数返回的遍历器对象都有一个 throw 方法，可以在函数体外抛出错误，并且在 Generator 函数体内捕获，下面通过各种例子来实践操作。

## 第一个 throw 例子

```
let f = function* () {
    while (true) {
        try {
            yield
        }
        catch (e) {
            // throw 语句抛出的异常只能交由系统的 catch 捕获
            console.log(`内部捕获: ${e}`);
        }
    }
};

let it = f();
// 为何此处先
it.next();

try {
    it.throw('a');  // 输出：内部捕获: a
    it.throw('b');  // 输出：内部捕获: b
} catch (e) {
    console.log(`外部捕获：${e}`)
}
```

上面的例子中，我们抛出了 2 个错误，这两个 exception 均被 Generator 函数体内的 try catch 所捕获。  
<font color="red">需要注意的是，这两个 exception 都是用遍历器对象本身的 throw 抛出的，而不是系统 throw，若是用系统 throw 抛出的只能被外部捕获。</font>  
<font color="green">这里我们提出一个疑问：为何上面我们先调用了 next 方法后再去抛出异常，那若是不事先调用 next 方法，会有何结果，下面的例子会对此进行探讨并给出答案</font>

## 遍历器指针抛出异常时，不事先执行 next （探讨例子 1）

```
let f = function* () {
    while (true) {
        try {
            yield
        }
        catch (e) {
            console.log(`内部捕获: ${e}`);
        }
    }
};

let it = f();

try {
    it.throw('a');  // 输出： 外部捕获：a
    it.throw('b');  // 此语句不执行
} catch (e) {
    console.log(`外部捕获：${e}`)
}
```

上述例子中，我们发现，当我们使用遍历器抛出异常后并未与预想中的一样，被内部捕获，而是被外部捕获了。但是我们在 Generator 函数内部命名编写了 try catch 块啊，为什么会没有被捕捉到呢？  
<font color="red">原因是因为：此时遍历器指针还停留在 Generator 生成的数据结构的头指针上，尚未进入 Generator 函数体，所以此时使用遍历器指针抛出异常时，在 ES6 解释器看来，并没有一个内部的 try catch 块去捕获异常(还未进入函数体!)，那么该异常就自然而然地被继续向上抛出，直到被 Generator 函数外部定义的 try catch 块捕获到，捕获到之后，Generator 状态变为 done，故而下一句语句 `it.throw('b')` 便不再执行 !</font>  
<font color="green">同理，我们可以有一个猜想，当未进入 Generator 函数体（指针在 head 节点处）时，无法被内部 try catch 捕获，那么当遍历器 done 为 true，即出了 Generator 函数体时，是否也不会被内部捕获，我们这里猜测为是，不会被捕获，下面的例子会予以证明 ! 在证明之前我们先上一张上述例子的流程图更清晰地说明上述观点。</font>  

![](//img.shenyujie.cc/2017-1-16-throw-nonext-1.png)

上图证明未进入函数体时无法内部捕获

## 遍历器指针在遍历结束后抛出异常（探讨例子 2)

```
let f = function* () {
    try {
        yield 'hello';
        yield 'world';
    }
    catch (e) {
        console.log(`内部捕获: ${e}`);
    }
};

try {
    let it = f();
    // 此时 throw ，generator 函数尚未开始，是外部捕获 (it.throw('A');  // 外部捕获：A)
    console.log(it.next());
    // 此时 throw ，generator 函数尚未结束，是内部捕获 (it.throw('A');  // 内部捕获：A)
    console.log(it.next());
    // 此时 throw ，generator 函数尚未结束，是内部捕获 (it.throw('A');  // 内部捕获：A)
    console.log(it.next());
    // 此时 throw ，generator 函数已经结束，是外部捕获 (it.throw('A');  // 外部捕获：A)
} catch (e) {
    console.log(`外部捕获：${e}`)
}
```

从上面的例子可以看出：<font color="red">当遍历器 throw 方法执行于最顶端(未执行过 next，指针还在 head 处，尚未进入 Generator 函数体) 或是当遍历器状态 done 为 true，即遍历结束后（此时指针已退出 Generator 函数体内存空间），遍历器 throw 都会被外部捕获（对于 ES6 解释器来说，此时找不到 Generator 内部 try catch 块，因为此时遍历器指针根本不在 Generator 函数体内部），验证了上面一个例子的猜测</font>  
<font color="green">此时我们明白了 Generator 内部 try catch 块执行的时机，那么我们又有一个疑问，当第一次内部抛出 exception 时，遍历器的状态 done 是否会变为  true 结束呢，我们猜测是会的，但是问题来了，在 `第一个 throw 例子` 这个例子中，明明两次 it.throw 都会被内部捕捉到啊，遍历器貌似并没有停止下来呀，下面的例子会探讨这个问题，再此之前，我们先对上述例子做一个数据流程图，以便更好地理解</font>  

![](//img.shenyujie.cc/2018-1-16-done-throw.png)
上述图例可以说明，遍历结束后无法内部捕获

## Generator 函数抛出错误会导致 Generator 状态转变为停止 done: true（探讨例子 3)


```
let f = function* () {
    try {
        yield 'hello';
        yield 'world';
        yield 'end';
    }
    catch (e) {
        console.log(`内部捕获: ${e}`);
    }
};

let it = f();
it.next();

try {
    it.throw('a');  // 内部捕获 a
    it.throw('b');  // 外部捕获 b
} catch (e) {
    console.log(`外部捕获：${e}`)
}
```

上面的例子中，在抛出异常前，我们事先调用一下 next 函数，以便保证遍历器抛出的异常可以被 Generator 内部 try catch 块捕捉到。接着我们使用遍历器连续抛出 2 个 exception a 和 b。结果显示：第一句 it.throw 被内部捕获，无异常。然而第二句 it.throw 却被外部捕获，结合我们上面的例子得出的结果来看，显然，当执行第二句 it.throw 时候，遍历器状态已经被置为结束，如此，才会使得下一句 it.throw 由于遍历器指针已经退出了 Generator 函数体，无法使用函数体内定义的 try catch 块而继续向上抛出，继而被外部 try catch 块所捕获。  
所以我们得出结论：<font color="red">异常会造成 Generator 函数遍历结束，done: true</font>  
<font color="green">那么第一个例子 `第一个 throw 例子` 为何两次遍历器 throw 都会被内部捕获呢？ 答案是因为该例子中 try catch 块写在 while 循环的内部，所以每一次 while 循环时可以认为每一条 yield 语句我们都逐条进行了 try catch 操作, 我们换一种写法，把 try catch 写在 while 循环的外部,此时由于只有一个总体的 try catch 去捕获异常，而不是每一条可能报错的 yield 语句都被 try catch 了，其行为表现就会和当前的这个例子一致，请看下文。</font>

## Generator 遍历器抛出错误会导致 Generator 状态转变为停止 done: true （探讨例子 4）

```
let f = function* () {
    // 每一次 throw error 都会打断遍历器
    try {
        while (true) {
            yield
        }
    } catch (e) {
        console.log(`内部捕获: ${e}`);
    }
};

let it = f();
it.next();

try {
    it.throw('a');  // 内部捕获 a
    it.throw('b');  // 外部捕获 b
} catch (e) {
    console.log(`外部捕获：${e}`)
}
```

上面的例子中，Generator 函数体内的 try catch 块写在了最外层，包裹住了 while 循环，此时 while 循环作为一个整体被检测异常，此时若是遍历器抛出异常，则行为表现和上面的例子一致。第一次遍历器 throw 会被内部捕获，此时 Generator 函数停止。  
<font color="red">事实证明：若是当前抛出异常的语句有独立的 try catch 包裹，则遍历器可继续执行（ 此条 exception 已经被内部处理 ）而，若是 try catch 作为一个整体包裹在最外层，那么抛出异常时，下一条 yield 语句和上面报错的 yield 语句被作为一个整体代码块一起 stop 掉了</font>

## Generator 遍历器抛出错误，若是内部无 try catch 则会被外部捕获 

```
let f = function* () {
    while (true) {
        yield;
    }
};

let it = f();

try {
    it.throw('a');  // 外部捕获 a
    it.throw('b');  // 不执行
} catch (e) {
    console.log(`外部捕获：${e}`)
}
```

从上面的例子中，由于 Generator 函数体内没有部署 try catch 块，故而第一次抛出异常时被外部捕获。由于被外部捕获了，程序便停顿在了抛出异常的此处，下面一句 throw 就不执行了

## 系统级 throw 抛出的异常，只能交由系统外部捕获

```
let f = function* () {
    while (true) {
        try {
            yield
        }
        catch (e) {
            console.log(`内部捕获: ${e}`);
        }
    }
};

let it = f();
it.next();

try {
    throw new Error('a');  // 外部捕获 a
    throw new Error('b');  // 不执行
} catch (e) {
    console.log(`外部捕获：${e}`)
}
```

上面的例子中，由于异常是被系统级 throw 而不是遍历器 throw 抛出的，故而只能外部捕获，此时，程序停止，故而第二条 throw 不会被执行

## 另外两个遍历器抛出异常使得 Generator 状态停止的例子

```
let generator = function* () {
    yield console.log('hello');
    yield console.log('world');
};

let g = generator();
g.next();

try {
    g.throw('A');
} catch (e) {
    // 此时遍历器已经结束，故而 console.log('world') 这句没有执行
    // 但 g.next 本身执行了，返回值为 {value: undefined, done: false}
    g.next();
}

let generator = function* () {
    try {
        yield console.log('hello');
        yield console.log('world');
        yield console.log('end');
    } catch (e) {
        console.log(`内部捕获：${e}`);
    }

};

let g = generator();
g.next();

try {
    g.throw('A');
} catch (e) {
    // 此时遍历器已经结束，由于已被内部捕获，所以此处不会执行到
    g.next();
}
```

## 系统 throw 抛出的异常不会影响（终止）遍历器状态

```
let generator = function* () {
    try {
        yield console.log('hello');
        yield console.log('world');
        yield console.log('end');
    } catch (e) {
        console.log(`内部捕获：${e}`);
    }

};

let g = generator();
g.next();  // 输出 hello

try {
    throw new Error('B');
} catch (e) {
    console.log(`外部抛出异常: ${e}`);
    g.next();  // 输出 world
}
```

上面的例子中，系统级 throw 抛出异常后，catch 块中的 g.next 仍旧执行输出了字符串 world。可见系统 throw 抛出的异常并不会像遍历器抛出的异常那般造成遍历器状态的终止。


## 遍历器抛出异常被内部捕获后，会自动执行一次 next

```
let generator = function* () {
    try {
        yield console.log('hello');
    } catch (e) {
        console.log(`内部捕获：${e}`);  // 输出： 内部捕获：A
    }
    yield console.log('world');
    yield console.log('end');
};

let g = generator();
g.next();  // 输出 hello

try {
    g.throw('A'); // 输出 world
} catch (e) {
    console.log('catch 执行 !')  // 不执行
}
g.next(); // 输出 end
```

上面例子的执行步骤：

1. 获得迭代器指针 g
2. 第一次执行 next，输出 hello，指针暂停在此句 `yield console.log('hello')` 处
3. 遍历器器抛出异常，此时由于指针所处的 yield 语句被内部 try catch 包裹，所以该异常被内部捕获
4. 内部捕获后，遍历器自动执行下一次 next 输出 world
5. 由于异常被 Generator 内部捕获了，所以外部的 catch 块并没有执行
6. 手动执行下一次 next，输出 end，并且由于执行到了 Generator 函数体内最后一条语句，故而遍历结束

下面我们用流程图来描述该过程：
![](//img.shenyujie.cc/2018-1-17-auto-next.png)

## Generator 函数体内运行时抛出的异常也可被外部捕获

```
function* f() {
    let x = yield 3;
    let y = x.toUpperCase();
    yield y;
}

let it = f();
it.next();

try {
    it.next(42);
} catch (err) {
    console.log(err);
}
```

上述例子中，对象 x 并没有 toUpperCase 方法，故而在执行 `it.next(42)` 时系统会抛出异常，此时可被外部 try catch 捕获

## Generator 内部手动系统级 throw 抛出的异常也可被外部捕获

```
function* g() {
    yield 1;
    console.log('throw an exception');
    throw new Error('generator broke !');
    yield 2;
    yield 3;
}

let it = g();

// 第一次执行 next 方法
console.log(it.next());

// 第二次执行 next 方法
try {
    console.log(it.next());
} catch (err) {
    console.log(err);
}

// 第三次执行 next 方法
// 由于上一次抛出的 error 迭代器此时已被打断，done: true
try {
    console.log(it.next());
} catch (err) {
    console.log(err);
}
```

1. 第一次执行 next 时，遍历器指针暂停在 `yield 1` 语句上，返回对象的 value 属性值为 1
2. 第二次执行 next 时，Generator 函数体内系统级 throw 一个异常，此时该异常被外部捕获，并被 catch 输出
3. 第三次调用 next 时，此时遍历器状态已经停止，done 被置为 true，所以 catch 内代码也不执行（Generator 函数体已经停止不会再抛出异常）

## Generator 遍历器异常的作用

```
// 回调地狱
ajax('a', function (a) {
    if (a.error) throw new Error(a.error);
    ajax('b', function (b) {
        if (b.error) throw new Error(b.error);
        ajax('c', function (c) {
            if (c.error) throw new Error(c.error);
        })
    })
});

// 用途
function* g() {
    try {
        let a = yield ajax('a');
        let b = yield ajax('b');
        let c = yield ajax('c');
    } catch (e) {
        console.log(e);
    }
}
```

通过 Generator 函数异常处理的特性，我们可以将原先回调地狱时候，为了捕获多个错误，我们不得不在每一次回调中编写异常处理函数，省是麻烦，有了 Generator 后，我们可以使用类似同步的方式，一次性处理上述异常抛出，大大简化了处理逻辑

## Generator.prototype.return
Generator 遍历器拥有一个 return 方法，可以返回给定的值，并且终结该 Generator 方法（done 被置为 true）

## 第一个 Generator return 例子

```
// return 可以返回指定的值，并终结 Generator 函数的遍历
function* f() {
    yield 1;
    yield 2;
    yield 3;
}

let it = f();
console.log(it.next());        // 输出： {value: 1, done: false}
console.log(it.return('end')); // 输出： {value: 'end', done: true}
console.log(it.next());        // 输出： {value: undefined, done: true}
```

上述例子步骤：
1. 第一次调用 next，指针暂停在语句 `yield 1` 上，next 返回对象的 value 值为 1
2. 调用 return('end')，遍历器对象被终止，return 参数 'end' 被当做此次 next 返回对象的 value 属性值，遍历器状态 done 被置为 true
3. 再次调用 next 函数，由于此时遍历器已经终止，故而返回对象为 {value: undefined, done: true}

<font color="green">这个例子中我们有个疑问，执行 return 语句时，return 语句是执行了下一条 `yield 2` 语句，只是把 return 后跟着的参数值 'end' 替代了 yield 2 后面的数值 2，还是压根没执行 `yield 2 `直接终止了遍历器指针呢？我们看下面的例子</font>

## Generator 执行 return 后不会再去执行下一条 next 语句，而是直接终止当前遍历器

```
// return 可以返回指定的值，并终结 Generator 函数的遍历
function* f() {
    console.log('A');  // 此句语句输出： 'A'
    yield 1;
    console.log('B');  // 此句语句并未执行到 ！
    yield 2;
    yield 3;
}

let it = f();
console.log(it.next());        // 输出： {value: 1, done: false}
console.log(it.return('end')); // 输出： {value: 'end', done: true}
console.log(it.next());        // {value: undefined, done: true}
```

从上面的例子中，我们可以看出 return 执行后，若是 `yield 2` 语句被执行，则字符串 'B' 肯定会被输出，此处无输出，证明 return 操作会直接终止当前遍历器，而不会去执行下一条 yield 语句！

## Generator return 后不带参数则返回对象 value 属性值为 undefined

```
// return 没有返回值默认为 undefined
function* f() {
    yield 1;
    yield 2;
    yield 3;
}

let it = f();
console.log(it.next());   // 输出： {value: 1, done: false}
console.log(it.return()); // 输出： {value: undefined, done: true}
console.log(it.next());
```

## Generator 方法会推迟到 finally 块(若有)之后执行

```
function* f() {
    yield 1;
    try {
        yield 2;
        yield 3;
    } finally {
        yield 4;
        yield 5;
    }
    yield 6;
}

let it = f();

// 此时尚未进入 try 块， it.return(7) 会返回 {value: 7, done: false}
console.log(it.next());

// 此时尚未进入 try 块， it.return(7) 会返回 {value: 7, done: false}
console.log(it.next());

// 此时进入 try 块，若是执行 it.return(7) 则直接进入 finally 块去执行，输出 {value: 4, done: false}

console.log(it.next());
// 此时还未退出 try 块，若是执行 it.return(7) 则直接进入 finally 块去执行，输出 {value: 4, done: false}

console.log(it.next());
// 此时处于 finally 中，但由于不是由于 try 导致进入的故而和普通执行 return 效果一致，输出{value:7 , done: true}

console.log(it.next());
// 出了 finally 块后，此时执行 return ，结束了迭代，所以后一条 next 无法输出 6，输出结果为 {value: 7, done: true}
```

上面的代码中，调用 return 后，若是 return 调用的时候，遍历器指针不在 try catch 块内，则为普通 return 语句，即以 return 后面跟的表达式的值作为返回对象的 value 属性值并终止遍历器。若 return 时候，遍历器指针在 try catch 块内，则先执行 finally 代码块，等到 finally 代码块执行完成后，再去执行 return 方法，下面用流程图来表达上述例子
![](//img.shenyujie.cc/2018-1-18-return-time-2.png)

## yield* 语句
若是想在 Generator 函数中调用另外一个 Generator 函数，我们需要用到 yield* 命令

## 无 yield* 直接在 Generator 函数体重调用另一个 Generator 函数是无效的

```
function* f() {
    yield 'a';
    yield 'b';
}

function* Y() {
    yield 'c';
    f();
    yield 'd';
}

for(let v of Y()){
    // 输出： c,d
    console.log(v);
}
```

上面 Generator 函数 Y 中直接调用 Generator 函数 f 是无效的，并没有如期输出 a, b

## yield* 例子

```
function* f() {
    yield 'a';
    yield 'b';
}

function* y() {
    yield 'c';
    yield* f();
    yield 'd';
}

for (let v of y()) {
    // 输出：c, a, b, d
    console.log(v);
}
```

上面的例子中，通过 yield* 我们可以在 y 函数内递归遍历 f 函数

## yield* 的等价写法

```
function* f() {
    yield 'a';
    yield 'b';
}

function* z() {
    yield 'c';
    for (let v of f()) {
        yield v
    }
    yield 'd';
}

for (let v of z()) {
    // 输出： c, a, b, d
    console.log(v);
}
```

## 单纯 yield 后跟 Generator 函数会返回一个遍历器对象

```
function* f() {
    yield 'a';
    yield 'b';
}

function* x() {
    yield 'c';
    // 没有 * 仅仅返回一个遍历器对象
    yield f();
    yield 'd';
}

let g = x();
g.next()  // 返回：c
g.next()  // 返回一个遍历器对象，若需使用，则：g.next().value.next().value
g.next()  // 返回：d
```

## 使用自执行函数包装被 yield* 包含的 Generator 函数

```
let delegated = (function* () {
    yield 'a';
    yield 'b';
}());

let delegating = (function* () {
    yield 'c';
    yield* delegated;
    yield 'd';
}());

for (let v of delegating) {
    // 输出：c, a, b, d
    console.log(v);
}
```

## 任何实现了 Symbol.iterator 接口的数据结构都可以使用 yield* 遍历

```
// 数组的 yield* 遍历
function* f() {
    yield 'start';
    yield* ['a', 'b', 'c']
}

for (let v of f()) {
    // 输出：start, a, b, c
    console.log(v);
}

// 字符串的 yield* 遍历
function* y() {
    yield 'hello';
    yield* 'world';
}

for (let v of y()) {
    // 输出：hello, w, o, r, l, d
    console.log(v);
}
```

上面的例子中，数组，字符串等等，凡是实现了 Symbol.iterator 接口的函数都可以使用 yield* 遍历

## 若是被代理的 Generator 函数有 return 语句，那么可以向代理他的 Generator 函数返回数据

```
function* f() {
    yield 'a';
    yield 'b';
    return 'return value';
}

function* y() {
    yield 1;
    yield 2;
    let value = yield* f();
    console.log(value);
}

let it = y();

console.log(it.next());  // 输出：1
console.log(it.next());  // 输出：2
console.log(it.next());  // 输出：a
console.log(it.next());  // 输出：b，此后打印字符串 'return value'
console.log(it.next());  // 输出：undefined
```

<font color="red">上面的例子中，Generator 函数 return 的值成了函数 y 函数体内 value 变量的值，而不是作为返回对象的 value 值处理，此处需要特别留意!</font>

## 另一个被代理的 Generator 函数有 return 语句时的例子

```
function* getFuncWithReturn() {
    yield 'a';
    yield 'b';
    return 'the result';
}

function* logReturn(gen) {
    let result = yield* gen;
    // 此句先执行
    console.log(result);
}

console.log([...logReturn(getFuncWithReturn())]);

// 输出：the result
//       [ 'a', 'b' ]
```

使用扩展运算符时，被包含的 Generator 函数也会被遍历执行到，并且当其有 return 语句时，return 语句的值被作为返回值赋值给了局部变量 result并输出

## 使用 yield* 快速取出嵌套数组成员

```
function* iterTree(tree) {
    if (Array.isArray(tree)) {
        for (let i = 0; i < tree.length; i++) {
            yield* iterTree(tree[i]);
        }
    } else yield tree;
}

let tree = ['a', ['b', 'c'], [['d'], ['e']]];

for (let v of iterTree(tree)) {
    // 输出：a, b, c, d, e
    console.log(v)
}
```

## 作为对象属性的 Generator 函数

```
// 简写
let obj = {
    * myGeneratorMethod(){
        ...
    }
};

// 完整写法
let obj = {
    myGeneratorMethod: function* () {
        ...
    }
}
```