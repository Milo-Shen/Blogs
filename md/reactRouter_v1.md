---
title: React-Router 同一 URL 下，参数改变，重新发起请求
date: 2018-03-04 11:51:00
tags: ES6
categories: ES6
comments: true

---

前言：React + React Router 制作的单页应用中，我们通常把 ajax 操作写在 componentDidMount 中。一般来说那么做没有什么问题，但是若是路由跳转时，路由地址没变，但是参数发生了变化（譬如：/home/123 => /home/456），此时由于组件已经挂载完成，componentDidMount 并不会再次执行，故而页面不刷新，下面我们解决这个问题：

<!--more-->

### 准备工作
我们首先要清楚，当路由从 /home/123 => /home/456 时 (域名主体没变，参数发生变化)，React 生命周期函数的调用情况。我们可以发现，下面两种函数是会在该情况下被触发的：

1. componentWillReceiveProps
2. componentDidUpdate

以上两个是 React 组件将要更新，和更新完成后将会触发的函数，我们挑选使用 componentDidUpdate 函数进行操作

```
class myFetch extends React.Component {
    constructor(props, context, updater) {
        super(props, context, updater);
        
        // 是否要忽略正在进行中的请求
        this.ignoreLastFetch = false;
        
        // 设置初始的 state 的值
        this.state = {
            ajaxData: null
        }
    }

    componentDidMount () {
    	// 在组件初始化的时候，实现调用一次数据
        this.fetchData();
    }

    componentDidUpdate (prevProps) {
        // 当 url 参数参数发生改变时，重新进行请求
        let oldId = prevProps.params.id;
        let newId = this.props.params.id;
        if (newId !== oldId) this.fetchData();
    }

    componentWillUnmount () {
        // 上面步骤四，在组件移除前忽略正在进行中的请求
        this.ignoreLastFetch = true;
    }

    fetchData () {
        let id = this.props.params.id;
        let url = `/api/myData/${id}`;
        fetch(url, (err, data) => {
            if (!err && !this.ignoreLastFetch)
                this.setState({ ajaxData: data })
        })
    }

    render () {
        return <Display content={this.state.ajaxData}/>
    }

}
```

上面的例子在，同一 url 下，React Router URL 参数发生改变时，重新发起请求的操作过程