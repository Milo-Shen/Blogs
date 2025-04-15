// 加载 immutable 和 ignore 库
import {combineReducers} from 'redux-immutable';
import {filterActions} from 'redux-ignore';
import {MigratedData} from "./MigratedData";

// 加载 actions
import * as actions from '../actions/events';

// 加载各自 reducer
import {createAjaxReducer} from './ajaxManager';
import {createMigratedReducer} from './MigratedData';
import {PageControl} from "./PageControl";

// ajax 设置 filter 过滤项 (允许通过)
let ajaxFilter = [actions.LOAD, actions.LOAD_FAIL, actions.LOAD_SUCCESS];

// async 最终过滤项目（允许通过）
let filterAsync = [
    ...ajaxFilter
];

// MigratedData 最终过滤项目（允许通过）
let filterMigrated = [
    ...MigratedData.filtered,
];

const rootReducer = combineReducers({
    // 获取无依赖的展示数据
    async: filterActions(createAjaxReducer({

    }), filterAsync),
    // 获取有依赖的展示数据
    MigrateData: filterActions(createMigratedReducer({
    }), filterMigrated),
    // 页面控制
    PageControl: filterActions(PageControl, PageControl.filtered),
});

export default rootReducer;