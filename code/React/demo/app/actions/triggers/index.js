import * as actions from "../events";

/***************************** ajax trigger *****************************/

export function load(key) {
    return {type: actions.LOAD, payload: {key: key}};
}

// 记录 ajax 成功，并返回数据
export function loadSuccess(key, data) {
    return {type: actions.LOAD_SUCCESS, payload: {key: key, data: data}};
}

// 记录 ajax 失败，并返回数据
export function loadFail(key, error) {
    return {type: actions.LOAD_FAIL, payload: {key: key, error: error}};
}

/***************************** 首页 trigger *****************************/

export function refresh() {
    return {type: actions.REFRESH}
}