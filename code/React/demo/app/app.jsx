import './app.css';

// 加载 react 基础组建
import React from 'react';
import ReactDOM from 'react-dom';
import Perf from 'react-addons-perf'
window.Perf = Perf // 挂载到全局变量方便使用

// 加载容器和组件
import {Provider} from 'react-redux';

// 加载自定义组价
import Home from './container/ClientSide/Home';

// 加载配置文件和路由
import {Router, Route, browserHistory} from 'react-router';
import {initialState} from './initialState';
import configureStore from './store/configureStore';

const store = configureStore(initialState);

ReactDOM.render((
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={Home}/>
        </Router>
    </Provider>
), document.getElementById('aaa'));
