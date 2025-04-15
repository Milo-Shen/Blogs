---
title: Immutable 常用 API 整理
date: 2018-04-10 17:10:00
tags: Immutable
categories: Immutable
comments: true

---

前言：之前开发的项目用到了 immutable 数据类型，故而对常用 api 进行整理一下，方便大家使用。具体 immutable 的简介和用途，可以自行查询，这里就不再赘述。
<!--more-->

![](//img.shenyujie.cc/2018-4-10-immutable-bg.jpg)

## 环境准备
1. Immutable 版本: v3.8.2
2. 平台：Chrome version 65

## Immutable 数据类型

+ List 有序列表，类似于原生类型的 Array
+ Map 无需索引集合，类似于原生类型的 Object
+ OrderedMap 有序 Map
+ Set 集合 （ 值具有唯一性 ）
+ OrderedSet ( 有序集合 )
+ Stack ( 堆栈 )
+ Range() ( 按值递增 )
+ Repeat() 这个方法有两个参数，value代表需要重复的值，times代表要重复的次数，默认为无穷大
+ Record 用于生成 Record 实例
+ Seq 序列
+ Collection Immutable 的基类

## 常用 API 介绍
虽然 Immutable 支持繁多数据类型，但是我们常用的只有 List 和 Map 这两种，下面着重介绍一下，关于这两者的 api

### fromJS 函数
用于将原生 object 转化成 Immutable 类型

```
/* fromJS 方法 */
let originData = {a: {b: [1, 2, 3]}, c: 4};
// 常用方法
let ImmutabledData = Immutable.fromJS(originData);
console.log(ImmutabledData);
// 不常用方法
ImmutabledData = Immutable.fromJS(originData, (key, value) => {
    // 将 Array 转化为 List，将 Object 转化为 Map
    let isIndexed = Immutable.Iterable.isIndexed(value);
    return isIndexed ? value.toList() : value.toOrderedMap();
});
```

### is 方法，用于比较值相等

```
let map1 = Immutable.fromJS({a: 1});
let map2 = Immutable.fromJS({a: 1});
// 输出：false
console.log(map1 === map2);
// 输出： true
console.log(Immutable.is(map1, map2));
// 区别于 Object is ( 前者: false, 后者: true )
console.log(Object.is(0, -0), Immutable.is(0, -0));
```

### Map 对象

```
let map = Immutable.Map({a: 1, b: 2});
// 使用二位数组构建 map
map = Immutable.Map([["a", 1], ["b", 2], ["c", 3], ["c", 4]]);
// key 存在同名覆盖，后面的覆盖前面的
// 输出：{a: 1, b: 2, c: 4}
console.log(map.toJS());
// 另一种构建 map 的方式
map = Immutable.Map.of('a', 1, 'b', 2, 'b', 3);
// 输出：{a: 1, b: 3}, 同样存在同名覆盖
console.log(map.toJS());
// 判断是否是 Map, 输出 true
console.log(Immutable.Map.isMap(map));
// 获取 map 大小 ( 以第一层结构为主 )
// 输出：2
console.log(map.size);
// 使用 count 获取大小,输出 2
console.log(map.count());
// count 可以筛选，此处统计了 value 值 > 1 的元素数量
console.log(map.count((value, key, obj) => {
    return value > 1
}));
// 使用 countBy 统计 ( 返回一个 Map 类型对象 )
// 输出：{false: 1, true: 1} 列举了复合条件和不符合条件的个数
console.log(map.countBy((value, key, obj) => {
    return value > 1
}).toJS());
```

### List 对象

```
/* List 对象 */
let list = Immutable.List([1, 2, 3, {a: 4}]);
console.log(list.toJS());
// 另一种 List 的构建方式
console.log(Immutable.List.of({x: 1}, 2, [3], 4).toJS());
// 判断是否是 List, 此处输出：true
console.log(Immutable.List.isList(list));
// 获取大小，此处输出：4
console.log(list.size);
// 使用 count 获取 list 大小，输出：4
console.log(list.count());
// 使用 count 筛选，输出：2
console.log(list.count((value, index, array) => {
    return value > 1
}));
// 使用 countBy 筛选, 返回一个 Map 类型对象，输出：{false: 2, true: 2}
console.log(list.countBy((value, index, array) => {
    return value > 1
}).toJS());

/* List 对象新方法 */
// pop shift push unshift 方法
// 和数组方法定义相同，但是不改变旧元素，输出：[1, 2, 3]
console.log(list.pop().toJS());
// interpose 间隔一个元素插入指定值
// 此处输出 [1, "5", 2, "5", 3]
console.log(Immutable.List([1, 2, 3]).interpose('5').toJS());
```

### 添加元素 set & setIn 方法

```
// 对于 map 类型
let myMap = Immutable.Map({a: 1, b: 2, c: {d: 3}});
// 将 key 位置的元素替换为值 value, 下面这个例子，将 'a' 处的 value 置为了 100
// 输出 : {a: 100, b: 2, c: {d: 3}}
console.log(myMap.set('a', 100).toJS());

// 对于 list 类型
let myList = Immutable.List([1, 2, 3]);
// 此处的 -1 等于 myList.size + -1，输出： [1, 2, 0]
console.log(myList.set(-1, 0).toJS());
// 输出 [1, 2, 3, undefined, 0] ，空位处会自动用 undefined 填充
console.log(myList.set(4, 0).toJS());

/* setIn 方法 */
let immuObj = Immutable.fromJS({a: {b: 1}});
// 输出： {a: {b: 100}}
console.log(immuObj.setIn(['a', 'b'], 100).toJS());
```

### 获取元素 get & getIn 方法

```
let ownImmuData = Immutable.fromJS({a: 1, b: 2, c: {d: 3}});
// 输出 : 1
console.log(ownImmuData.get('a'));
// getIn 方法，输出 : 3
console.log(ownImmuData.getIn(['c', 'd']));
let ownList = Immutable.List([1, 2, 3]);
// 只有数组可以使用 下标作为 key，输出：2
console.log(ownList.get(1));
// get 方法的默认值, 此处输出：no value
console.log(ownImmuData.get('none', 'no value'));
// getIn 方法的默认值， 此处输出：no value
console.log(ownImmuData.getIn(['c', 'none'], 'no value'));
```

### 更新元素 update & updateIn 方法

```
// 对于 List 元素
let uList = Immutable.List([1, 2, 3]);
// 普通 update, 输出：[2, 2, 3]
console.log(uList.update(0, x => x * 2).toJS());
// 带有默认值的 update, 输出：[1, 2, 3, 2]
console.log(uList.update(3, 1, x => x * 2).toJS());
// 空位会用 undefined 补齐, 输出：[1, 2, 3, undefined, -2]
console.log(uList.update(4, -1, x => x * 2).toJS());

// 对于 Map 或是混合元素
let uMap = Immutable.fromJS({a: {b: {c: 1}}, d: 2});
// 普通 update，输出：{a: {b: {c: 1}}, d: 6}
console.log(uMap.update('d', x => x * 3).toJS());
// 带有默认值的 update, 输出：{a: {…}, d: 2, ab: 2}
console.log(uMap.update('ab', 1, x => x * 2).toJS());
// updateIn 方法，输出：{a: {b: {c: 5}}, d: 2}
console.log(uMap.updateIn(['a', 'b', 'c'], x => x * 5).toJS());
```

### 删除元素 delete & deleteIn 方法

```
let dImmuData = Immutable.fromJS({a: 1, b: [1, 2, 3]});
// delete 方法，输出：{b: [1, 2, 3]}
console.log(dImmuData.delete('a').toJS());
// deleteIn 方法, 该 delete 删除数组元素时，不会和原生 delete 一样留下 empty 空位
// 输出：{a: 1, b: [2, 3]}
console.log(dImmuData.deleteIn(['b', 0]).toJS());
```

### clear 方法

```
let cData = Immutable.fromJS({a: 1});
// 输出：{}
console.log(cData.clear().toJS());
```

### 查找首尾元素 first & last

```
// map
let htData = Immutable.fromJS({a: 1, b: 2, c: {d: 1}});
// 输出：1
console.log(htData.first());
// 输出：{d: 1}
console.log(htData.last().toJS());

// list
let htList = Immutable.fromJS([0, 1, 2, 3]);
// 输出：0
console.log(htList.first());
// 输出：3
console.log(htList.last());
```

### 查找某个元素 find

```
// list
let sList = Immutable.List([1, 2, 3]);
// 输出 1
console.log(sList.find((value, index, array) => {
    return value === 1;
}));

// map
let sMap = Immutable.fromJS({a: 1, b: {c: 2}});
// 输出 1
console.log(sMap.find((value, key, obj) => {
    return value === 1;
}));
```

### 查找最大，最小元素 max & min

```
let mnData = Immutable.fromJS({a: 1, b: {d: {e: 100}}, c: [3, 4, 5], d: 50});
// 只能找单层
// 输出：50
console.log(mnData.max());
// 输出：1
console.log(mnData.min());
```

### map, filter, every, some, forEach 操作

```
/* 对于 list 而言 */
let oriData = [1, 2, 3, 4, 5];
// map()     // 输出：[2, 4, 6, 8, 10]
console.log(Immutable.fromJS(oriData).map((value, index, array) => value * 2).toJS());
// filter()  // 输出: [2, 4]
console.log(Immutable.fromJS(oriData).filter((value, index, array) => value % 2 === 0).toJS());
// every()   // 输出: false
console.log(Immutable.fromJS(oriData).every((value, index, array) => value > 2));
// some()    // 输出: true
console.log(Immutable.fromJS(oriData).some((value, index, array) => value > 2));
// forEach() // 输出：5 （ 返回迭代的条目数量，包括返回 false 的那个条目 ）
console.log(Immutable.fromJS(oriData).forEach((value, index, array) => value < 5));

/* 对于 map 而言 */
let oriMap = {a: 1, b: 2, c: 3, d: 4, e: 5};
// map()     // 输出：[2, 4, 6, 8, 10]
console.log(Immutable.fromJS(oriMap).map((value, key, obj) => value * 2).toJS());
// filter()  // 输出: [2, 4]
console.log(Immutable.fromJS(oriMap).filter((value, key, obj) => value % 2 === 0).toJS());
// every()   // 输出: false
console.log(Immutable.fromJS(oriMap).every((value, key, obj) => value > 2));
// some()    // 输出: true
console.log(Immutable.fromJS(oriMap).some((value, key, obj) => value > 2));
// forEach() // 输出：5 （ 返回迭代的条目数量，包括返回 false 的那个条目 ）
console.log(Immutable.fromJS(oriMap).forEach((value, key, obj) => value < 5));
```

### mapKeys & mapEntries

```
oriMap = {a: 1, b: 2, c: 3, d: 4, e: 5};
// mapKeys     输出: {a_ext: 1, b_ext: 2, c_ext: 3, d_ext: 4, e_ext: 5}
console.log(Immutable.fromJS(oriMap).mapKeys(key => `${key}_ext`).toJS());
// mapEntries  输出: {a_a: "1_b", b_a: "2_b", c_a: "3_b", d_a: "4_b", e_a: "5_b"}
console.log(Immutable.fromJS(oriMap).mapEntries(([key, value]) => [`${key}_a`, `${value}_b`]).toJS());
```

### 浅拷贝 merge & 深拷贝 mergeDeep 操作

```
// list
let lm1 = Immutable.fromJS([1, 2, 3, 4, {a: {b: 5, c: 6}}]);
let lm2 = Immutable.fromJS([1, 2, 3, 9, {a: {b: 5, d: 7}}]);
// 浅 merge()      输出：[1,2,3,9,{a: {b5, d:7}]
console.log(lm1.merge(lm2).toJS());
// 深 mergeDeep()  输出：[1,2,3,9,{a: {b5 ,c:6 ,d:7}]
console.log(lm1.mergeDeep(lm2).toJS());

// map
let mm1 = Immutable.fromJS({a: 1, b: 2, c: 3, d: {e: 4, g: 5}});
let mm2 = Immutable.fromJS({a: 1, b: 2, c: 9, m: 7, d: {e: 4, x: 8}});
// 浅 merge()      输出：{a: 1, b: 2, c: 9, d: {e: 4, x: 8}, m: 7}
console.log(mm1.merge(mm2).toJS());
// 深 mergeDeep()  输出：{a: 1, b: 2, c: 9, d: {e: 4, g: 5, x: 8}, m: 7}
console.log(mm1.mergeDeep(mm2).toJS());
```

### join 转化为字符串 

```
let jil = Immutable.fromJS([1, 2, 3, 4, {a: 1}]);
let jim = Immutable.fromJS({a: 1, b: 2, c: {d: 3}});
// 输出 : 1234Map { "a": 1 }
console.log(jil.join(''));
// 输出 ：12Map { "d": 3 }
console.log(jim.join(''));
```

### isEmpty 空值判断

```
// 判断 list, 输出：true
console.log(Immutable.fromJS([]).isEmpty());
// 判断 map, 输出：true
console.log(Immutable.fromJS({}).isEmpty());
```

### 检查 key 是否存在 has & hasIn

```
// list
let hil = [1, 2, 3, {a: 4}];
// 输出：true
console.log(Immutable.fromJS(hil).has(0));
// 输出：true
console.log(Immutable.fromJS(hil).hasIn([2, 'a']));

// map
let him = {a: 1, b: 2, c: {d: 3}};
// 输出：true
console.log(Immutable.fromJS(him).has('a'));
// 输出：true
console.log(Immutable.fromJS(him).hasIn(['c', 'd']));
```

### 检查 value 是否存在 includes & contains

```
// list
let iil = [1, 2, 3, {a: 4}];
// 输出：true
console.log(Immutable.fromJS(iil).includes(3));
// 输出：false
console.log(Immutable.fromJS(iil).contains('3'));

// map
let iim = {a: 1, b: 2, c: {d: 3}};
// 输出：false
console.log(Immutable.fromJS(iim).includes(3));
// 输出：true
console.log(Immutable.fromJS(iim).contains(2));
```

### sort 排序

```
let sil = [5, 4, 3, 2, 1];
// 默认排序（升序），输出：[1, 2, 3, 4, 5]
console.log(Immutable.fromJS(sil).sort().toJS());
// 传入参数排序，输出：[5, 4, 3, 2, 1]
console.log(Immutable.fromJS(sil).sort((a, b) => b - a).toJS());
```
