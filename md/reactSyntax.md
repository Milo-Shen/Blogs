---
title: React 之使用 与操作符，三目表达式，简化组件的逻辑判断
date: 2018-02-25 18:04:00
tags: React
categories: React
comments: true

---

前言：平时我们处理 React JSX 组件时，常常会用 if else 来进行条件判断，但是这种写法过于臃肿，下面我们尝试着用 && 和三目运算符来对组件的写法进行优化
<!--more-->

### 原始写法 (条件判断，根据条件显示组件 A or B)

```
let myRender = (condition) => {
    if (condition) return (<ComponentA/>);
    else return (<ComponentB/>);
};
```

以上是常用写法，下面使用三目运算符进行简化

### 三目运算符简化

```
let myRender = (condition) => {
    return (condition ? <ComponentA/> : <ComponentB/>)
};
```

### 原始写法（条件判断，根据条件决定是否显示组件）

```
let myRender = (condition) => {
    if (condition) return (<ComponentA/>);
    else return null;
};
```

### 三目运算符简化

```
// 三目运算符
let myRender = (condition) => {
    return (condition ? <ComponentA/> : null)
};
```

虽然三目运算符简化了最初的 if else 判断的写法，但是由于三目运算符 ？后面必须跟两个参数，故而会有一个冗余的 null 跟着，不是很优雅，下面继续优化

### 使用 && 操作符进一步简化

```
// && 操作符
let myRender = (condition) => {
    return (condition && <ComponentA/>)
};
```

使用 && 操作符，可以使 if 判断得到更进一步的简化，借助 && 的短路求值特性，只有在符合条件的时候，才会显示组件 ComponentA

本文会继续探讨其余的简化写法（上述写法同时适用于 react 15 & 16）