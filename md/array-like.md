---
title: 类数组 Array-Like Objects 初探
date: 2016-07-15 10:50:49
tags: javascript
categories: javascript
comments: true

---
## Array-Like
javascript 中一切皆为对象，Array-Like 顾名思义就是类数组对象，和数组一样可以使用 `[]` 操作符访问，有`length`属性，但是没有数组的部分内置方法，譬如 push 、pop 等，最常见的类数组对象便是函数形参的 arguments,
那么，什么样的元素是 Array-Like Objects？  
<!--more-->
> 以下是 Javascript 权威指南上对它的定义

```
function isArrayLike(o) {
    if (o &&                                  // o 是非 null, undefined 等
        typeof o === 'object' &&              // o 是对象
        isFinite(o.length) &&                 // o.length 是有限数值
        o.length >= 0 &&                      // o.length 是非负值
        o.length === Math.floor(o.length) &&  // o.length 是整数
        o.length < Math.pow(2, 32))           // 0.length < 2^32
        return true;
    else return false;                        // 否则它不是
}
```
> 以上是对类数组的严格定义，以下是 underscore 中对类数组的定义:  

```
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
var getLength = property('length');
var isArrayLike = function (collection) {
    var length = getLength(collection);
    return typeof length == 'number' 
        && length >= 0 
        && length <= MAX_ARRAY_INDEX;
}
```
很简单，不是数组，但是有 length 属性，且属性值为非负 Number 类型即可。至于 length 属性的值，underscore 给出了一个上限值 MAX_ARRAY_INDEX, 这是 javascript 中所能表示的最大数字。  
#### 想想还有什么同时能满足以上条件的？NodeList，HTML Collections，仔细想想，甚至还有字符串，或者拥有 length 属性的对象，函数（length 属性值为形参数量），等等。

## Array-Like to Array
> 有的时候我们需要把 Array-Like Objects 转化为 Array 使之能使用数组的一些方法，以下是一些 Array-Like to Array 的转化方法

+ 第一种最简单粗暴，直接新建一个数组，然后把类数组里边的元素一个一个赋值给临时数组，并返回临时数组

	```
	function toArray(array_like) {
	    var tmp = [];
	    for (var i = 0; i < array_like.length; i++) {
	        tmp[i] = array_like[i];
	    }
	    return tmp;
	}
	```
+ 但这不是最优雅的，我们可以用数组内置的方法来实现

	```
	function toArray(array_like) {
	    return Array.prototype.slice.call(array_like);
	}
	```
+ 我们也可以用 `[]` 来代替 Array.prototype 这样可以省几个字节，但是 `[]` 会首先创建一个空数组，效率方便不及前者。

	```
	function toArray(array_like) {
	    return [].slice.call(array_like);
	}
	```
> 为什么这样可以转换？我们简单了解下，主要的原因是 slice 方法只需要参数有 length 属性即可。首先，slice 方法得到的结果是一个 新的数组，通过 Array.prototype.slice.call 传入的参数（假设为 a），如果没有 length 属性，或者 length 属性值不是 Number 类型，或者为负，那么直接返回一个空数组，否则返回 a[0]-a[length-1] 组成的数组 [具体可以参考V8源代码](https://github.com/v8/v8/blob/master/src/js/array.js#L621-L660)

* ES6 中给予了我们额外的 Array-Like to Array 的方式

	```
	var str = "helloworld";
	var arr = Array.from(str); 
	```
## compatibility
> IE 下 Array.prototype.slice.call(nodes) 会抛出错误 (because a DOM NodeList is not a JavaScript object）所以我们需要手动处理兼容性问题

	```
function toArray(array_like) {
    var res = [];
    try {
        res = Array.prototype.slice.call(array_like);
        return res;
    } catch (err) {
        res = [];
        for (var i = 0, length = array_like.length; i < length; i++) {
            res.push(array_like[i]);
        }
        return res;
    }
}

	```

## Others
> 数组的一些内置方法也可以接受类数组作为实参

```
var obj = {0: 4, length: 2};
var arr = [1, 2, 3];
Array.prototype.push.apply(arr, obj);
console.log(arr); // [1, 2, 3, 4, undefined]
```
