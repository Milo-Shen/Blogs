---
title: React Portal 传送门
date: 2018-03-013 8:00:00
tags: ES6
categories: ES6
comments: true

---

前言：Portal 顾名思义是传送门的意思。它在 React 中可以实现：render 到一个组件里面去，但是实际改变的是网页上另一处的 DOM 元素。
<!--more-->

## 不使用 Portal 的弊端
React 中的一切都是组件。平时使用时该特性并无太大问题，但是在遇到：对话框，弹层之类的组件时就比较棘手了，我们看下下面的例子

```
<div class="myAPP">
   { isNeed && <Dialog /> }
</div>

// 编译后结果：
<div class="myAPP">
   <div class="dialog">Dialog Content</div>
</div>
```

最直接的做法，我们可以在 JSX 中，直接把 Dialog 组件画出来，但是这种做法会使得 `<Dialog/>` 组件最终渲染出来的 html 和其上下文 jsx 产生的 html 糅合在一起。但是对话框组件，从用户的感知上来说，是一个独立的组件，应该位于屏幕的中央，然而现在却被其他 html 代码块包裹着。导致 Dialog 的 CSS 样式会被其他元素的 CSS 所影响，带来副作用。故而上述方法具有局限性

## 传统解决类似 Dialog 组件样式纠缠的方法

1. 在 React 组件树的最顶层留一个位置专门放置 Dialog 组件
2. 通过 Redux 通知 Dialog 组件是否显示或隐藏
3. 也可以通过类似 PubSub 的通知类库，通知 Dialog 组件是否显示或隐藏

![](//img.shenyujie.cc/2018-3-12-redux-portal.png)

## 使用 React Portal 解决

要是我们既想在组件的JSX中选择使用Dialog，把Dialog用得像一个普通组件一样，但是又希望Dialog内容显示在另一个地方，就需要Portal上场了。  
Portal 可以让 Dialog 这样的组件在表示层和其他组件没有任何差异，但是最终渲染的 html 位置可以在页面的其他地方

![](//img.shenyujie.cc/2018-3-12-portal.png)

## React 15 中 Portal 的实现方法

在 React 15 中，我们需要使用以下两个方法去实现 Portal

1. unstable_renderSubtreeIntoContainer  
2. unmountComponentAtNode

unstable_renderSubtreeIntoContainer 可以把 JSX 组件在 Portal 传送门的一端显示到另一端去
unmountComponentAtNode 用于清理 unstable_renderSubtreeIntoContainer 函数可能造成的资源泄露

```
import React from 'react';
import {unstable_renderSubtreeIntoContainer, unmountComponentAtNode} from 'react-dom';

class Portal extends React.Component {
    render() {
        // 组件本身 render null，什么都不渲染
        return null;
    }

    componentDidMount() {
        const doc = window.document;
        this.node = doc.createElement('div');
        doc.body.appendChild(this.node);

        this.renderPortal(this.props);
    }

    componentDidUpdate() {
        this.renderPortal(this.props);
    }

    componentWillUnmount() {
        unmountComponentAtNode(this.node);
        window.document.body.removeChild(this.node);
    }

    renderPortal(props) {
        unstable_renderSubtreeIntoContainer(
            this, //代表当前组件
            <div className="Portal">
                {props.children}
            </div>, // 塞进传送门的JSX
            this.node // 传送门另一端的DOM node
        );
    }
}

export default Portal;
```

上述过程：

1. render函数返回 null，即在该组件的正常生命周期内，不进行渲染
2. 在componentDidMount里面，利用原生API来在body上创建一个div，这个 div 不会被其他元素所干扰
3. 在 componentDidMount 和 componentDidUpdate 函数中，调用 renderPortal 来渲染传送门中的组件（往传送门塞东西）
4. 在 componentWillUnmount 函数中调用 unmountComponentAtNode 解除传送门资源泄露的副作用，并且调用 js 原生函数，从 body 上卸载我们创建的那个 div

### 使用方法

```
const App = () => (
  <div className="home">
      <h1>HomePage</h1>
      <Portal>
          <h2>this is Portal</h2>
      </Portal>
  </div>
);
```

像正常组件一样使用我们创建出来的 Portal 即可。

执行结果：
![](//img.shenyujie.cc/2018-3-13-Portal-Result-tiny.png)

## React 16 中 Portal 的实现方法

React 16 中的传送门实现就要简洁很多，如下所示：

```
import React from 'react';
import {createPortal} from 'react-dom';

class Portal extends React.Component {
    constructor(props) {
        super(...arguments);
        const doc = window.document;
        this.node = doc.createElement('div');
        doc.body.appendChild(this.node);
    }

    render() {
        return createPortal(
            <div className="Portal">
                {this.props.children}
            </div>, //塞进传送门的JSX
            this.node //传送门的另一端DOM node
        );
    }

    componentWillUnmount() {
        window.document.body.removeChild(this.node);
    }
}

export default Portal;
```

上面实现的功能和 React 15 中是一致的，但是 React 16 对 Portal 做了官方的稳定支持，故而更加推荐使用 React 16 去开发 Portal

## React Portal 事件冒泡

```
<div onClick={clickMe}>   
   <Portal>Click Me</Portal>
</div>
```

1. React 16 中，通过Portal渲染出去的DOM，事件是会冒泡从传送门的入口端传过来，故而上面的 clickMe 函数会被执行
2. React 16 之前的版本，Portal 是单向的，事件冒泡无法穿透传送门，故而 clickMe 不执行