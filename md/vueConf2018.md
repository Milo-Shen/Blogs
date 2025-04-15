---
title: vueconf 2018 会议记录
date: 2018-11-28 11:00:00
tags: [vueconf]
categories: [vueconf]
comments: true

---

24号去参加了 conf 开发者会议，虽然尤大今年没能亲临会议，但是还是通过远程的方式让我们惊喜了一把。下面总结下会议的内容。
<!--more-->


## Vue 尤大部分

![](https://img.shenyujie.cc/2018-11-24-vue_2.jpg?imageView2/2/w/1920)
首先是 Vue 3.0 部分，详细介绍了 2019 年年末即将到来的 vue 的最新特性。

![](https://img.shenyujie.cc/2018-11-24-vue_3.jpg?imageView2/2/w/1920)
总体来说，Vue3.0 在 2.0 的基础上改进了性能，使用了 ES6 标准中的新特性，并引入了一些新功能。  

![](https://img.shenyujie.cc/2018-11-24-vue_4.jpg?imageView2/2/w/1920)
在 React v16.0 版本之后，引入了 fiber 纤程的概念，通过将 JS 计算任务拆分成一个个小任务，用于改善框架在处理 Javascript 计算密集型场景下的体验和性能。这一特性同样地在 Vue 3.0 中被实现，同时 virtual dom 的算法也被重写，带来了将近 2 倍的性能提升。  

![](https://img.shenyujie.cc/2018-11-24-vue_5.jpg?imageView2/2/w/1920)
在 Vue3.0 中，框架更加重视了编译时的优化，通过编译时的优化来减少运行时的性能开销  

![](https://img.shenyujie.cc/2018-11-24-vue_6.jpg?imageView2/2/w/1920)
通过优化 slot 的生成，分离父子组件，以便使得子组件的重渲染不会影响到父组件（2.x 版本中子组件的重渲染会使得父组件同时被重渲染），提升性能。  

![](https://img.shenyujie.cc/2018-11-24-vue_7.jpg?imageView2/2/w/1920)
通过静态内容提取，提升性能

![](https://img.shenyujie.cc/2018-11-24-vue_8.jpg?imageView2/2/w/1920)
通过提取内联函数，避免每次渲染都重新生成新的内联函数，进而防止不必要的子组件重渲染，来达到性能的提升

![](https://img.shenyujie.cc/2018-11-24-vue_9.jpg?imageView2/2/w/1920)
在 Vue3.0 中，双向绑定的实现机制从 ES5 的 get, set 转向了 ES6 标准中的 Proxy 语言机制。带来了性能提升，并且语法上新增了对 Map, Set, WeakMap, WeakSet 的支持，不过旧的浏览器估计就享受不到新特性带来的好处了。

![](https://img.shenyujie.cc/2018-11-24-vue_10.jpg?imageView2/2/w/1920)
Object.defineProperty 是一个性能昂贵的操作，在 Vue 3.0 中通过 Proxy 取代 defineProperty 减少了组件实例化过程的性能开销。

![](https://img.shenyujie.cc/2018-11-24-vue_11.jpg?imageView2/2/w/1920)
通过从 Virtual Dom 算法的改进，和诸如 Proxy 等底层的优化，最终相比现行的 Vue 2.x 版本，带来了2倍多的性能提升，内存开销也降低到了原先的一半。

![](https://img.shenyujie.cc/2018-11-24-vue_13.jpg?imageView2/2/w/1920)
Vue 3.0 开始支持 webpack 的 Tree-shaking 功能，打包过程中剔除无用代码，使得最终应用的体积可以更小

![](https://img.shenyujie.cc/2018-11-24-vue_14.jpg?imageView2/2/w/1920)
并且 Vue 的核心运行时的大小也降低到了 10kb。

![](https://img.shenyujie.cc/2018-11-24-vue_15.jpg?imageView2/2/w/1920)
Vue 3.0 也带来了更好的 Typescript 的支持，内部也将用 TS 来实现

![](https://img.shenyujie.cc/2018-11-24-vue_16.jpg?imageView2/2/w/1920)
对于喜欢阅读框架源码的同学，Vue 3.0 的源码，内部也将更加模块化，降低阅读的成本

![](https://img.shenyujie.cc/2018-11-24-vue_17.jpg?imageView2/2/w/1920)
Vue 3.0 中的 runtime 也从 vue 中抽离了出来，平台无关化以后甚至可以独立使用。

![](https://img.shenyujie.cc/2018-11-24-vue_18.jpg?imageView2/2/w/1920)
在 Vue 3.0 中，原生支持 Observable 观察者模式，对于全局状态维护，信息传递等场景，提供了明显的便利

![](https://img.shenyujie.cc/2018-11-24-vue_19.jpg?imageView2/2/w/1920)
Vue 3.0 中组件更新，提供了 renderTrigger 的监视功能，开发者可以明确知道，某一个组件更新的具体原因

![](https://img.shenyujie.cc/2018-11-24-vue_20.jpg?imageView2/2/w/1920)
Vue 3.0 对 TypeScript 的支持也炉火纯青，微软派遣了相关 TypeScript 专家全程参与 Vue3.0 的开发

![](https://img.shenyujie.cc/2018-11-24-vue_21.jpg?imageView2/2/w/1920)
Vue 3.0 中也引入了 Hooks Api

![](https://img.shenyujie.cc/2018-11-24-vue_23.jpg?imageView2/2/w/1920)
这里是对 Vue 3.0 Fiber 架构的实际性能展示，将 JS 计算任务按照 16ms 的标准切分到不同时间段执行后，整个页面的响应效率有了质的提升

![](https://img.shenyujie.cc/2018-11-24-vue_24.jpg?imageView2/2/w/1920)
对于万年老大难的 IE，Vue 3.0 给出了回退机制，双向绑定底层会退化到 ES5 中的 get set 来实现

## Vue Cli 部分
![](https://img.shenyujie.cc/2018-11-24-vue_26.jpg?imageView2/2/w/1920)
Vue Cli 3.0 涵盖了市面上大部分的最新技术

![](https://img.shenyujie.cc/2018-11-24-vue_28.jpg?imageView2/2/w/1920)
Vue Cli 3.0 开始采用类似 Parcel 的零配置策略，同时集成了最佳实践

![](https://img.shenyujie.cc/2018-11-24-vue_29.jpg?imageView2/2/w/1920)
Vue Cli 3.0 集成了市面上大部分的最佳实践

## 其他部分
![](https://img.shenyujie.cc/2018-11-24-vue_48.jpg?imageView2/2/w/1920)
目前 electron 在企业中的应用也逐渐普及开来，多用于内部工具的开发。
![](https://img.shenyujie.cc/2018-11-24-vue_49.jpg?imageView2/2/w/1920)
Electron 可以用做企业的发布，管理，错误监控，体现了其快速开发，跨平台的优势
![](https://img.shenyujie.cc/2018-11-24-vue_50.jpg?imageView2/2/w/1920)
