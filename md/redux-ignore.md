---
title: React 性能优化之 redux-ignore
date: 2018-04-9 22:09:00
tags: React
categories: React
comments: true

---

前言：我们在构建 React & Redux 应用时，无法避免地，当项目越来越大时，action 和相应 reducer 的数量会骤增。但是也许与大部分人的预期相反，当一个 action 触发时，不仅仅是该 action 对应的 reducer 执行了，其他所有的 reducer 也同时被执行了，只是 action type 不匹配，state 的值不变而已。这种空操作，也在无形中消耗了宝贵的性能
<!--more-->

## 引入 redux-ignore 库

redux-ignore 库可以帮助我们过滤掉那些不属于当前被触发的 action 类型的 reducer，保证只有和当前 action 对应的 reducer 被触发，为我们提升性能

```
// 引入方式
npm install --save redux-ignore
```

## api

```
import { ignoreActions, filterActions } from 'redux-ignore';
 
// 黑名单写法
ignoreActions(reducer, [ARRAY_OF_ACTIONS])
ignoreActions(reducer, (action) => !action.valid)

// 白名单写法
filterActions(reducer, [ARRAY_OF_ACTIONS])
filterActions(reducer, (action) => action.valid)
```

这里更推荐白名单的写法，且第二个参数是 array 的方式即 `filterActions(reducer, [ARRAY_OF_ACTIONS])`，理由如下： 

1. action 数量过多的情况下，白名单写法更简洁
2. 因为一个 reducer 有可能处理多个 action，故而数组的方式更合适

## 使用

```
import { combineReducers } from 'redux';
import { filterActions } from 'redux-ignore';
import { ACTION_1, ACTION_2 } from './actions';
import { counter } from './reducers';
 
combineReducers({ 
  counter: filterActions(counter, [ACTION_1, ACTION_2])
});
```

## 源码分析

```
function isFunction (obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply)
}

function createActionHandler (ignore) {
  // redux-ignore higher order reducer
  return function handleAction (reducer, actions = []) {
    const predicate = isFunction(actions)
        ? actions
        : (action) => actions.indexOf(action.type) >= 0

    const initialState = reducer(undefined, {})

    return (state = initialState, action) => {
      if (predicate(action)) {
        return ignore ? state : reducer(state, action)
      }

      return ignore ? reducer(state, action) : state
    }
  }
}

export const ignoreActions = createActionHandler(true)
export const filterActions = createActionHandler(false)

export default ignoreActions
```

源码很简单，像 filterActions 方法的话，就是通过 actions.indexOf(action.type) >= 0， 去检测该 action 是否在白名单中，若在，则执行 reducer。若不在，则忽略无关 reducer