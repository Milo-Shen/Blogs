---
title: React 性能优化之 shouldComponentUpdate
date: 2018-04-9 18:12:00
tags: React
categories: React
comments: true

---

前言： React 性能优化也是我们在编写应用时很容易遇到的问题，此篇我们从三个方面论述一下如何通过覆写 shouldComponentUpdate 来优化 React 的性能
<!--more-->

## 环境准备

本文例子使用的环境为：
1. React v16.2
2. Redux 4.4.8
3. Immutable 3.8.2

需要注意的是，从 React v16.0 版本开始，react-addons-perf 工具不再受支持

## React 优化的思路
1. 了解 React 渲染的流程，知道哪些地方可能造成性能问题
2. 使用工具定位造成性能问题的点，加以解决
3. 对比优化前后的性能表现
4. 避免一些糟糕的写法

### 避免糟糕的写法
1. 避免使用 {...this.props}，按需传递 props，传递的参数越多，层次越深，都会拖慢 SCU 的执行过程
2. this.event = this.event.bind(this) (将方法的bind一律置于constructor)
3. 尽量使用 const element 无状态组件
4. map 输出时，组件需要添加 key，且 key 必须是唯一的
5. 如果可以，尽量减少使用 setTimeout, setInterval 等函数
6. props 和 state 的数据尽量维持扁平化
7. 组件渲染时，尽可能减少最终生成 dom 的数量，比如使用 return null，而非 display: none 来控制组件的显示隐藏
8. 拆分组件，复杂的逻辑做好分层，不要在一个组件内完成

### React 组件生命周期
![](//img.shenyujie.cc/2018-4-8-render.jpg)

仔细观察 React 组件的生命周期，我们可以得知，每一次的 props 变化或是 state 变化都会触发 shouldComponentUpdate 函数，而 shouldComponentUpdate 函数则决定了 React 是否会重新执行 : VirtualDom Diff ——> Draw Real Dom 流程，而去重新渲染整个组件。故我们只要控制好 shouldComponentUpdate  函数就可以达到优化 React 性能的目的，因为 React 默认 shouldComponentUpdate 总是返回 true，这对我们的性能是一个很大的负担

### shouldComponentUpdate 优化点
1. 缩短 SCU 执行的时间
2. 对于没有必要重新渲染的组件，SCU 应该返回 false

## 对 SCU 进行优化

### 最简单的优化方式

```
// 接收两个参数，分别为待更新的属性及状态值
shouldComponentUpdate(nextProps, nextState) {
    // 当接收的参数不同时，返回 true
    return !(_.isEqual(this.props, nextProps) || !_.isEmpty(this.props));
}
```

### 使用 PureRenderMixin

```
// React 官方demo
import PureRenderMixin from 'react-addons-pure-render-mixin';
class FooComponent extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }
```

原理就是重写了 shouldComponentUpdate 方法 

### PureComponent

```
// 官方写法### deepCompare
import React, { PureComponent } from 'react'
class Example extends PureComponent {
  render() {
    // ...
  }
}
```

其内部也是通过重写 shouldComponentUpdate 方法实现的优化

### pure-render-deepCompare-decorator

```
import pureRender from "pure-render-deepcompare-decorator";

@pureRender
class List extends Component {
	constructor(props, context) {
		super(props, context);
	}
	render() {
		return (
			<div></div>
		);
	}
}
```

此方法执行最严格，因为会对 props 和 state 一层一层进行深比较，但是深比较和深拷贝一样，非常消耗性能。  
但是上述的方法，除了深比较大部分只会比较一层数据结构，对类似 {a:{b:1}} 这样的数据结构无法做到准确的处理。那么问题来了，我们既想享受深比较带来的严格意义上的 SCU 判断，又不想耗费大量的性能在比较过程中，该怎么办？这时候 immutable 的数据结构就派上了用场。

## 使用 Immutable 优化 SCU 过程

Immutable 提供了简洁高效的判断数据是否变化的方法，只需 === 和 is 比较就能知道是否需要执行 render()，而这个操作几乎 0 成本，所以可以极大提高性能。关于 Immutable 的详细介绍，可以看这篇 [Immutable 详解](https://zhuanlan.zhihu.com/p/20295971?spm=a2c4e.11153940.blogcont69516.18.4f275a00BvT6Ur&columnSlug=purerender)，讲得很好，之后我们改造 SCU 如下所示：

```
 shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};
    nextState = nextState || {};
    nextProps = nextProps || {};

    // 先比较参数数量是否一致
    if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
        Object.keys(thisState).length !== Object.keys(nextState).length) {
        return true;
    }

    // 比较 props 的异同
    for (const key in nextProps) {
        if (!is(thisProps[key], nextProps[key])) {
            return true;
        }
    }

    // 比较局部 state 的差异
    for (const key in nextState) {
        if (!is(thisState[key], nextState[key])) {
            return true;
        }
    }
    return false;
}
```

使用时我们只要先建立一个 BaseComponent 去实现该 SCU 方法，然后其他的 Component 继承 BaseComponent 即可。

## 优化例子
我们做一个简单的例子，一共有两个组件 Count 和 List 和一个刷新按钮 分别用来统计点击的次数和渲染一个列表，点击刷新按钮的时候刷新 count 组件，两者都继承于 BaseComponent，结构如下:

```
// list 组件
class List extends BaseComponent {
    constructor(props) {
        super(props);
    }
    render() {
        // 统计该组件的渲染情况
        console.log('render list');
        const {list} = this.props;
        return (
            <ul>
                {
                    list.map(item => (
                        <li key={item.get('id')}>{item.get('name')}</li>
                    ))
                }
            </ul>
        )
    }
}

// count 组件
class Count extends BaseComponent {
    constructor(props) {
        super(props);
    }
    render() {
        // 统计该组件的渲染情况
        console.log('render Count');
        const {Count, actions} = this.props;
        return (
            <div className="count">
                <p>{`当前数量: ${Count}`}</p>
                <span onClick={actions.refresh}>刷新</span>
            </div>
        )
    }
}
```

## 优化结果

### 优化前
![](//html.shenyujie.cc/2018-4-9-before.gif)

可以看到，未优化前，当点击刷新按钮时，count 和 list 组件都会重新渲染了，我们接下去看下时间消耗

![](//html.shenyujie.cc/2018-4-9-before-perf-1.png)

可以看到，渲染 list 列表花了 13.5ms，wasted time 显示冗余渲染了该 list 组件
![](//html.shenyujie.cc/2018-4-9-before-perf-2.png)

### 优化后
![](//html.shenyujie.cc/2018-4-9-after.gif)

优化后，当点击刷新按钮时，至于刷新 count 组件，list 组件并未被冗余渲染
![](//html.shenyujie.cc/2018-4-9-after-perf.png)

渲染结果中，不再花费时间去渲染 list 组件，点击一次刷新的操作从，总耗时 14.5ms 锐减到了 1.3ms，可见优化成果，性能得到了大幅度的提升。