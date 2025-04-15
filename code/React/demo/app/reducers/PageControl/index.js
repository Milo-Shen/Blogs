// 加载 Immutable 库
import Immutable from 'immutable';

// 引入初始数据
import {state as initialState} from "../../initialState";

// 加载 actions
import {

} from '../../actions/events';

// 初始化的数据
let initData = Immutable.fromJS(initialState.PageControl);

function PageControl(state = initData, action) {
    switch (action.type) {
        default:
            return state;
    }
}

// 设置该 reducer 需要响应的 actions
PageControl.filtered = [

];

export {PageControl};