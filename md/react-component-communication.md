---
title: 探究 React 组件之间的通信问题
date: 2017-07-04 16:13:00
tags: reactJs
categories: reactJs
comments: true
---
最近写了一点 React 的应用，遇到了 React 各个组件之间的通信问题（1.父组件向子组件传值，2.子组件向父组件传值，3.平级组件间相互传值），特此整理一下。  

<!-- more -->
## React 之间的层级关系
假设我们开发的是一款纯 React 应用，那么有可能有如下的层级结构关系  

+ 父组件向子组件之间通信
+ 子组件向父组件之间通信
+ 没有嵌套关系的组件间通信

下面我们探讨一下各种层级关系之间的通信方式

## 父组件向子组件之间通信
这个功能实现起来相当容易，主要是通过 props 来传值，这在 React 的开发中是最普遍使用的一种方式。  

例子：  

```
import React from 'react';
import ReactDOM from 'react-dom';

class Father extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: null};
        this.textChange = this.textChange.bind(this);
    }

    textChange(e) {
        this.setState({value: e.currentTarget.value});
    }

    render() {
        return (
            <div>
                请输入数字 (父元素)：<input type="tel" onChange={this.textChange}/>
                <Child text={this.state.value}/>
            </div>
        );
    }
}

class Child extends React.Component {
    render() {
        return (
            <div>
                输入的数字 (子元素)：<span>{this.props.text}</span>
            </div>
        );
    }
}

ReactDOM.render((
    <Father />
), document.getElementById('ValuePropagation'));
```

效果：  
![父组件向子组件传值](//img.shenyujie.cc/2017-7-4-fatherToSon.gif)

PS: 若是嵌套层级较深，从外到内通信的成本就会愈发增加，所以书写的时候尽量减少嵌套的层级

## 子组件向父组件之间通信
子组件向父组件传值，我们可以依赖 props 来传递事件的引用，通过回调函数的方式来实现

例子：  

```
import React from 'react';
import ReactDOM from 'react-dom';

class Father extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: null};
        this.textChange = this.textChange.bind(this);
    }

    textChange(newValue){
        this.setState({value:newValue});
    }

    render() {
        return (
            <div>
                输入的数字 (父元素)：<span>{this.state.value}</span>
                <Child callBack={this.textChange}/>
            </div>
        );
    }
}

class Child extends React.Component {

    constructor(props) {
        super(props);
        this.textChange = this.textChange.bind(this);
    }

    textChange(e){
        let value = e.currentTarget.value;
        this.props.callBack(value);
    }

    render() {
        return (
            <div>
                请输入数字 (子元素)：<input type="tel" onChange={this.textChange}/>
            </div>
        );
    }
}

ReactDOM.render((
    <Father />
), document.getElementById('ValuePropagation'));
```

效果：  
![子组件向父组件传值](//img.shenyujie.cc/2017-7-4-sonTofather.gif)

## 没有嵌套关系的组件间通信
没有嵌套关系的组件之间的通信可以使用 Publish / Subscribe 模式，这边自用的是 [PubSubJS](https://github.com/mroderick/PubSubJS)，采用的是全局广播的方式。

例子：

```
import React from 'react';
import ReactDOM from 'react-dom';
import PubSub from 'pubsub-js';

class Element_One extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: null};
    }

    componentDidMount(){
        this.pubsub = PubSub.subscribe('textChange',(topic,newValue)=>{
            this.setState({value: newValue});
        });
    }

    componentWillUnmount(){
        PubSub.unsubscribe(this.pubsub);
    }

    render() {
        return (
            <div>
                输入的数字 (Element_one)：<span>{this.state.value}</span>
            </div>
        );
    }
}

class Element_Two extends React.Component {

    constructor(props) {
        super(props);
        this.textChange = this.textChange.bind(this);
    }

    textChange(e){
        let value = e.currentTarget.value;
        PubSub.publishSync('textChange',value);
    }

    render() {
        return (
            <div>
                请输入数字 (Element_Two)：<input type="tel" onChange={this.textChange}/>
            </div>
        );
    }
}

ReactDOM.render((
    <div>
        <Element_One />
        <Element_Two />
    </div>
), document.getElementById('ValuePropagation'));

```

效果：  

![没有嵌套关系的组件间通信](//img.shenyujie.cc/2017-7-4-AtoB.gif)

以上的例子在小型的应用场景里面还是比较适用的，但是遇到大型的项目，使用回调函数，或是全局广播的方式就显得有欠妥当，因为没有一个独立的地方去管理整个业务的事件逻辑，会使得整个代码显得凌乱，也为之后的维护工作带来隐忧。所以按照实际需求使用是最恰当的。有兴趣的朋友们也可以使用 Javascript 状态管理容器 [Redux](http://www.redux.org.cn/)，相信是个不错的选择。
