---
title: React key 对渲染性能的影响
date: 2017-10-18 21:29:00
tags: React
categories: React 性能优化
comments: true

---


使用 React 编写组件时，若渲染的是一个循环结构，若不为数组的每一项设置一个 key ，则控制台会抛出警告：  

> Warning: Each child in an array or iterator should have a unique “key” prop.
Check the render method of Constructor.
See http://fb.me/react-warning-keys for more information.

通常我们为了消除警告，会把数组的 index 设置为 key 值以消除警告，那么这种做法是否合理呢？

<!--more-->

## 准备工作

+ React 官方性能监测工具 Perf 
+ React 版本 15.6.1

## 安装步骤

+ `npm install --save-dev react-with-addons` 安装 React 扩展组件
+ `import Perf from 'react-addons-perf'` 即可使用 Perf 性能监测工具
+  webpack.config.js 添加：


```
module: {
    loaders: [
        {
	        test: require.resolve("react-addons-perf"),
	        loader: "expose-loader?Perf"
        }
    ]
}
```

## 示例代码

在需要监测的操作前启动 Perf：

```
<bottom onClick={() => {
    // 在需要监测的操作前启动 Perf
    Perf.start();
    _delete(item.id);
}} className="delete">X
</bottom>
```

重新渲染完成后打印性能检测结果

```
componentDidUpdate() {
    // 监测结束
    Perf.stop();
    let measurements = Perf.getLastMeasurements();
    // 打印 React 操作
    Perf.printOperations(measurements);
}
```

更多用法请看[官方文档](https://facebook.github.io/react/docs/perf.html)

## 背景知识： 

### Demo 初始化界面

![](//img.shenyujie.cc/2017-10-12-demo.PNG)

此 Demo 可以通过点击右侧的删除按钮来删除元素，并获取列表数据

## 进行实验

### 使用 index 作为 key（手动删除表格第一条数据）

```
<tr key={index}>...<tr>
```

![](//img.shenyujie.cc/2017-10-11-react-perf-key-index.PNG)
可以见到使用数组下标作为 index 的时候，React 会先更新表格内前9条数据，并且删除表格内最后一条数据，此时一共操作了 18 次 DOM

### 使用 id 作为 key（手动删除表格第一条数据）

```
<tr key={item.id}>...<tr>
```

![](//img.shenyujie.cc/2017-10-11-react-perf-key-id.PNG)
可以看出，此时 React 仅仅更删除了第一行数据，操作了 1次 DOM 元素

## 结论
1. 使用 index 作为 key值是错误的，react 要求 key 值必须是稳定的（在当前列表项不变即可）
2. 推荐使用 id 或是 uuid 等字段作为 React 的 key 以便减少 DOM 操作