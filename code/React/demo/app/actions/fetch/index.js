// 获取工具函数
import {fetchWrap} from '../../utils/funcLibrary';

// 获取 actions 类型包装
import {load, loadFail, loadSuccess} from "../triggers";

// 获取数据迁移 actions
// import {} from "../triggers";


/**
 * 包装 fetchAjax dispatch （语法糖）
 * @param parameter
 * @returns {function(*, *)}
 */
export function fetchAjax(parameter = {}) {
    return (dispatch, getState) => {
        dispatch(load(parameter.key));
        let p = parameter.promise(parameter.key);
        return p.then(data => {
            dispatch(loadSuccess(parameter.key, data));
        })
            .catch(error => dispatch(loadFail(parameter.key, error.toString())))
            .then(() => {
                parameter.callback && parameter.callback(getState().getIn(['async', parameter.key]), dispatch)
            });
    }
}

export function fetch_list() {
    return fetchAjax({
        key: 'list',
        promise: (api) => fetchWrap({api: api})
    });
}