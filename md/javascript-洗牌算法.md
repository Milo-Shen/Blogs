---
title: javascript 洗牌算法
date: 2016-07-15 14:43:29
tags: 算法
categories: 算法
comments: true

---
导语:  Fisher–Yates Shuffle ： 有时我们需要打乱一个数组，即为数组乱序，也称洗牌算法，以下记录一些常用的洗牌算法
<!--more-->
### 一， 准备工作
~~ 1.5 ; 1.5 << 0 ; 1.5 >> 0 ; parseInt(1.5) 皆为对数字进行取整

### 二，洗牌算法
>  时间复杂度 o ( n^2 )

```
function shuffle(a) {
    var b = [];
    while (a.length) {
        var index = ~~(Math.random() * a.length);
        b.push(a[index]);
        a.splice(index, 1);
    }
    return b;
}
```

>  近似快速实现的算法  
>  时间复杂度 o ( log(n) )

```
function shuffle(a) {
    return a.concat().sort(function (a, b) {
        return Math.random() - 0.5;
    });
}
```

>  underscore中的实现, Fisher–Yates Shuffle 算法  
>  时间复杂度 o(n)

```
_.shuffle = function (obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
        rand = _.random(0, index);
        if (rand !== index) shuffled[index] = shuffled[rand];
        shuffled[rand] = set[index];
    }
    return shuffled;
}
```

>  Fisher–Yates Shuffle 算法  
>  实现复杂度为: o ( n )

```
function shuffle(a) {
    var length = a.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
        rand = ~~(Math.random() * (index + 1));
        if (rand !== index) {
            shuffled[index] = shuffled[rand];
        }
        shuffled[rand] = a[index];
    }
    return shuffled;
}
```
### 随机性的数学归纳法证明
对 n 个数进行随机  

1. 首先我们考虑 n = 2 的情况，根据算法，显然有 1/2 的概率两个数交换，有 1/2 的概率两个数不交换，因此对 n = 2 的情况，元素出现在每个位置的概率都是 1/2，满足随机性要求。
2. 假设有 i 个数， i >= 2 时，算法随机性符合要求，即每个数出现在 i 个位置上每个位置的概率都是 1/i。
3. 对于 i + 1 个数，按照我们的算法，在第一次循环时，每个数都有 1/(i+1) 的概率被交换到最末尾，所以每个元素出现在最末一位的概率都是 1/(i+1) 。而每个数也都有 i/(i+1) 的概率不被交换到最末尾，如果不被交换，从第二次循环开始还原成 i 个数随机，根据 2. 的假设，它们出现在 i 个位置的概率是 1/i。因此每个数出现在前 i 位任意一位的概率是 (i/(i+1)) * (1/i) = 1/(i+1)，也是 1/(i+1)。
4. 综合 1. 2. 3. 得出，对于任意 n >= 2，经过这个算法，每个元素出现在 n 个位置任意一个位置的概率都是 1/n。

## 小结  
关于数组乱序，不要用 Math.random() 实现
