// 加载 Immutable 库
import Immutable from 'immutable';

// 加载全部初始 state 数据
import {initialState as initial} from '../../initialState';

// 加载 actions
import {
    LOAD,
    LOAD_SUCCESS,
    LOAD_FAIL
} from '../../actions/events';

// 初始化的数据
let initialState = Immutable.fromJS({
    loadingNumber: 0,
    loadState: {}
});

// 创建发起 fetch 操作所需要的 actions
export function ajaxManager(state = initialState, actions) {
    let action = actions;
    switch (action.type) {
        case LOAD:
            return state
                .update('loadingNumber', x => x + 1)
                .setIn(['loadState', action.payload.key], Immutable.fromJS({
                    loading: true,
                    loaded: false
                }));
        case LOAD_SUCCESS:
            return state
                .update('loadingNumber', x => x - 1)
                .setIn(['loadState', action.payload.key], Immutable.fromJS({
                    loading: false,
                    loaded: true,
                    error: null
                }))
                .set(action.payload.key, Immutable.fromJS(action.payload.data));
        case LOAD_FAIL:
            return state
                .update('loadingNumber', x => x - 1)
                .setIn(['loadState', action.payload.key], Immutable.fromJS({
                    loading: false,
                    loaded: false,
                    error: action.payload.error
                }))
                .set(action.payload.key, initial.getIn(['async', action.payload.key]));
        default:
            return state;
    }
}

// 用于合并 ajax reducer
export function createAjaxReducer (reducers) {
    let reducerKeys = Object.keys(reducers || {});
    return function (state, action) {
        let asyncState = ajaxManager(state, action);
        let otherState = Immutable.Map();
        let otherValue = null;
        for (let i = 0; i < reducerKeys.length; i += 1) {
            let key = reducerKeys[i];
            if (typeof reducers[key] === 'function') {
                otherValue = reducers[key](asyncState.get(key), action);
                otherState = otherState.set(key, otherValue);
            }
        }
        return Immutable.Map().merge(asyncState, otherState);
    };
}