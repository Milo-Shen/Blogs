// 加载 fetch promise 文件
import fetch from 'isomorphic-fetch';

// 加载 queryString
import queryString from 'query-string';

// 加载路由
import {browserHistory} from 'react-router';

// 获取 Url
import * as Uri from "../utils/uri";

/**
 * 包装原生的 fetch 操作
 * @param parameter
 * @returns {Promise<Response>}
 */
export function fetchWrap(parameter = {}) {
    let key = parameter.api,
        method = parameter.method,
        para = parameter.para,
        origin = parameter.origin || false,
        queryUrl = `${Uri.baseUrl}${Uri[key]}`,
        fetchSetup = {
            method: method || 'GET',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            cache: false,
            credentials: 'include'
        };
    para = queryString.stringify(para);
    if (para && fetchSetup.method.toUpperCase() === 'GET') {
        queryUrl = `${queryUrl}?${para}`;
    }
    if (para && fetchSetup.method.toUpperCase() === 'POST') {
        fetchSetup.body = para;
    }
    return fetch(queryUrl, fetchSetup).then(res => res.json())
        .then(res => {
            if (origin) return res;
            else if (res && res.status && res.status === 'success') {
                if (res.data === 0) return 0;
                else return res.data || res.msg || '';
            }
            else if (res && res.status && res.status === 'fail' && res.msg === 'maintain') {
                browserHistory.push('/maintain');
            }
            else if (res && res.status && res.status === 'fail' && res.msg !== 'maintain') return res.msg || '';
            else return res.msg || '';
        });
}

/**
 * 功能 ： 将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * 例子：
 * dateFormatter(new date(), 'yyyy-MM-dd hh:mm:ss.S') ==> 2017-10-18 08:09:04.423
 * dateFormatter(new date(), 'yyyy-M-d h:m:s.S')      ==> 2017-10-18 8:9:4.18
 */
export let dateFormatter = function (date, fmt) {
    let o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
