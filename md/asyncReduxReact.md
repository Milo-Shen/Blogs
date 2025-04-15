---
title: 在 React 和 Redux 中引入 async await 语法
date: 2018-02-27 08:01:00
tags: React
categories: React
comments: true

---

前言：之前我们介绍了 async 和 await 函数的用法，下面我们尝试着在 react 和 redux 中运用 async 语法。
<!--more-->

## 安装
在浏览器环境中，由于大多数浏览器还不支持 async await 的语法，故而我们需要安装 babel 插件编译后使用

```
// 安装 async await 转换插件
npm install --save-dev babel-plugin-transform-async-to-generator
```

安装完插件后配置 `.babelrc` 文件

```
{
  "plugins": ["transform-async-to-generator"]
}
```

推荐 babel-plugin-transform-async-to-generator 插件的里有在于，其不需要其他插件进行配合，经过上述配置后，单独即可使用，比较方便。

## redux 中使用 async await

```
// 使用 async 前
export default function doFetch(params) {
    return dispatch => {
        return fetch('http://api', params)
            .then(data => {
                dispatch({
                    type: 'FETCH_SUCCESS',
                    payload: data
                })
            })
            .catch(err => {
                dispatch({
                    type: 'FETCH_FAIL',
                    err
                })
            })
    }
}

// 使用 async 后
export default function doFetch(params) {
    return async dispatch => {
        try {
            const data = await fetch('http://api', params)
            return dispatch({
                type: 'FETCH_SUCCESS',
                payload: data
            })
        } catch (err) {
            dispatch({
                type: 'FETCH_FAIL',
                err
            })
        }
    }
}
```

上面的例子中我们成功将 promise 回调的方式，改造成了 async 的方式，在 redux 的编写中，这将会优化我们的写法，使我们的写法看上去更像同步的方式

## 在 React 中使用 async await

```
// 使用 async 前
class FetchDataComponent extends Component {
    constructor(props) {
        super(props);
        this.fetchData = this.fetchData.bind(this);
    }

    fetchData(e) {
        e.preventDefault();
        fetch('http://api', params)
            .then(data => {
                // 对数据 data 进行处理
            })
            .catch(err => {
                // 对异常进行处理
            })
    }

    render () {
        return (
            <div onClick={this.fetchData}>
                获取数据
            </div>
        )
    }
}

// 使用 async 后
class FetchDataComponent extends Component {  
    constructor(props) {
        super(props);
        this.fetchData = this.fetchData.bind(this);
    }

    async fetchData(e) {
        e.preventDefault();
        try {
            let data = await this.props.fetchData(params);
            // 对数据 data 进行操作
        } catch (err) {
            // 对异常进行处理
        }
    }

    render () {
        return (
            <div onClick={this.fetchData}>
            获取数据
            </div>
        )
    }
}
```

以上是对 React 中的组件获取数据部分进行了 async 改造。这种写法虽然对性能没有提升，甚至因为还需要通过转义的步骤而损失些许性能(忽略不计)，但是带来的编程遍历和语法简洁（更像同步的方式）是不言而喻的