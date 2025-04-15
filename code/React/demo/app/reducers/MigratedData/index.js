// 加载 Immutable 库
import Immutable from 'immutable';

// 引入初始数据
import {state as initialState} from "../../initialState";

// 加载 actions
import {REFRESH} from '../../actions/events';

// 该 reducer 的初始数据
let initData = Immutable.fromJS(initialState.MigrateData);

function MigratedData(state = initData, action) {
    let data = action.data;
    switch (action.type) {
        case REFRESH:
            return state.update('Count', x => x + 1);
        default:
            return state;
    }
}

// 用于合并 MigratedData reducer
export function createMigratedReducer(reducers) {
    let reducerKeys = Object.keys(reducers || {});
    return function (state, action) {
        let migratedState = MigratedData(state, action);
        let otherState = Immutable.Map();
        let otherValue = null;
        for (let i = 0; i < reducerKeys.length; i += 1) {
            let key = reducerKeys[i];
            if (typeof reducers[key] === 'function') {
                otherValue = reducers[key](migratedState.get(key), action);
                otherState = otherState.set(key, otherValue);
            }
        }
        return Immutable.Map().merge(migratedState, otherState);
    };
}

// 设置该 reducer 需要响应的 actions
MigratedData.filtered = [
    REFRESH
];

export {MigratedData};