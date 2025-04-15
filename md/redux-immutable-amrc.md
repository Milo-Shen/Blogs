---
title: React + redux + immutable 的 ajax 自动流程管理
date: 2018-02-27 18:30:00
tags: React
categories: React
comments: true

---

前言：在单纯的 React & redux 的开发中，我们可以使用 `redux-amrc` 来帮助我们进行自动异步流程管理，然而在引入了 immutable 不可变数据结构以后。由于这个库只支持原始 JS 数据类型，故而无法使用，下面我们尝试着自己封装一个适用于 immutable 结构的 amrc 库出来

## 回顾一下 redux-amrc 的使用方法
这里只演示 fetch 操作的部分，具体的集成方法请详见官方网站，[官方地址](https://lewis617.github.io/redux-amrc/)  

```
// 引入 ASYNC
import { ASYNC } from 'redux-amrc';

// 加载数据
function loadData() {
  return {
    [ASYNC]: {
      key: 'data',
      promise: () => fetch('/api/data')
        .then(response => response.json()),
      once: true
    }
  };
}
```

## 编写支持 immutable  数据结构的 redux-immutable-amrc
下面我们编写支持 immutable 数据结构的 ajax 自动流程管理库，需要达到的目标有：

1. 支持 immutable 数据类型
2. 不需要再手动编写异步 action 对象。
3. 不需要再手动编写 reducer 来处理异步 action 对象。
4. 获取插件自动生成的 value、error、loaded、loading、loadingNumber 等多个异步状态。

以上最重要的就是支持 immutable 数据类型，这里我们选用的 immutable 库是 facebook 推出的 ( 本文使用的版本是 3.8.2, 4.0 目前还是 rc 版，不推荐使用 )，[官方网站](http://facebook.github.io/immutable-js/docs/#/)

### Step 1： 编写 actions

`actions/index.js`

```
// 用于标识 获取数据，获取数据成功，获取数据失败三种状态
export const LOAD = '@async/LOAD';
export const LOAD_SUCCESS = '@async/LOAD_SUCCESS';
export const LOAD_FAIL = '@async/LOAD_FAIL';

// 以下是 action creater 纯函数
export function load(key) {
    return {type: actions.LOAD, payload: {key: key}};
}
export function loadSuccess(key, data) {
    return {type: actions.LOAD_SUCCESS, payload: {key: key, data: data}};
}
export function loadFail(key, error) {
    return {type: actions.LOAD_FAIL, payload: {key: key, error: error}};
}
```

### Strp 2： 编写 reducer

` reducer/ajaxReducer.js `

```
// 加载 Immutable 库
import Immutable from 'immutable';

// 加载 actions
import {
    LOAD,
    LOAD_SUCCESS,
    LOAD_FAIL
} from '../../actions';

// 初始化的数据
let initialState = Immutable.fromJS({
    loadingNumber: 0,
    loadState: {}
});

// 创建发起 fetch 操作所需要的 actions
export function ajaxManager(state = initialState, actions) {
    let action = actions;
    switch (action.type) {
        // 有请求进来，请求累加器 + 1
        case LOAD:
            // 发起请求
            return state
                .update('loadingNumber', x => x + 1)
                .setIn(['loadState', action.payload.key], Immutable.fromJS({
                    loading: true,
                    loaded: false
                }));
        case LOAD_SUCCESS:
            // 请求成功
            return state
                .update('loadingNumber', x => x - 1)
                .setIn(['loadState', action.payload.key], Immutable.fromJS({
                    loading: false,
                    loaded: true,
                    error: null
                }))
                .set(action.payload.key, Immutable.fromJS(action.payload.data));
        case LOAD_FAIL:
            // 请求失败
            return state
                .update('loadingNumber', x => x - 1)
                .setIn(['loadState', action.payload.key], Immutable.fromJS({
                    loading: false,
                    loaded: false,
                    error: action.payload.error
                }))
        default:
            return state;
    }
}
```

### Step 3： 编写 createReducer

` reducer/ajaxReducer.js `

```
exports.createReducer = function (reducers) {
    let reducerKeys = Object.keys(reducers || {});
    return function (state, action) {
        // 拿到 ajaxManager reducer 处理过后的数据
        let asyncState = ajaxManager(state, action);
        let otherState = Immutable.Map();
        let otherValue = null;
        // 依次遍历自定义的嵌套 reducer
        for (let i = 0; i < reducerKeys.length; i += 1) {
            let key = reducerKeys[i];
            if (typeof reducers[key] === 'function') {
                // 获取自定义嵌套 reducer 的值
                otherValue = reducers[key](asyncState.get(key), action);
                otherState = otherState.set(key, otherValue);
            }
        }
        // 混合 ajaxManager reducer 和嵌套的自定义 reducer 的结果
        return Immutable.Map().merge(asyncState, otherState);
    };
};
```

上面的 createReducer 用于操作 ajax 拿到的数据，可以在 ajaxManager 这个大的 reducer 中，再放入自定义的 reducer。把 ajaxManager 的结果和自定义 reducer 的结果混合起来，塞入 store 中。  
上面的代码中，由于 Immutable 使用的 3.8.2 版本并没有实现 Immutable.merge 类方法，故而使用 `Immutable.Map().merge` 折中替代

### Step 4： 封装 fetch 操作，自动管理 ajax 流程

` fetch/index.js `

```
export function fetchAjax(parameter = {}) {
    return (dispatch, getState) => {
        dispatch(load(parameter.key));
        // 将参数中传入的 api，传给传进来的 fetch 函数
        let p = parameter.promise(parameter.key);
        // ajax 成功后发起 loadSuccess action
        return p.then(data => dispatch(loadSuccess(parameter.key, data)))
            // 发生异常则发起 loadFail action
            .catch(error => dispatch(loadFail(parameter.key, error.toString())));
    }
}
```

上面的例子，同时借助了 redux-thunk 中间件，来帮助我们 dispatch actions。  
上面返回的是一个高阶函数 HOC，这样做的目的是为了简化我们实际发起 ajax 的操作

## 整体流程图
![](//img.shenyujie.cc/2018-4-9-ajax-manager.png)

## 使用方法
下面我们来看一下上面自己编写的 redux-immutable-armc 的使用方法

### 集成方法

`reducers/index.js`

```
// 由于采用了 immutable 库，所以 combineReducers 需要从 redux-immutable 引入
import {combineReducers} from 'redux-immutable ';
import { createReducer } from './reducer/ajaxReducer.js ';
import { myReducer } from './reducer/myReducer.js ';

const rootReducer = combineReducers({
  async: createReducer({
    // 这里可以对获取的数据，进行单独 reducer 管理
    MemberInfo: myReducer
  })
});

export default rootReducer;
```

### 使用举例

```
export function fetch_membership() {
    return fetchAjax({
        key: 'MemberInfo',
        promise: () => fetch({api: 'http://127.0.0.1:3500/MemberInfo'})
            .then(res => res.json())
    });
}
```

上面的例子中，我们发起了一个 fetch 请求，api 地址是本地 3500 端口下的 MemberInfo api。  
请求成功后，redux-immutable-amrc 会在 store 下建立一个 async 的 key。再其下面，例子中的 key 会成为拿到的 ajax 数据的 key，获取的数据将作为值存放在这个 key 下。结果如下所示:

```
{
    async: {
        loadingNumber: 0,
        MemberInfo: true,
        loadState: {
            MemberInfo: {
                loading: false,
                loaded: true,
                error: null
            }
        },
    }
}
```

fetch 到的 ajax 数据存放在 store async 下字段名为 MemberInfo ( 制定的 key ) 下，同时 loadState 管理着该 ajax 的请求状态，loadingNumber 记录着该 react 应用中目前所拥有的所有正在进行中的 fetch 请求数量
