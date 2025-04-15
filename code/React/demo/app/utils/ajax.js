// 加载 fetch 包装容器类
import {fetchWrap} from './funcLibrary';

/**
 * 获取
 * @param shopCode
 * @returns {Promise<Response>}
 */
export function ajax_member(shopCode) {
    return fetchWrap({
        api: 'member',
        para: {shopCode: shopCode}
    });
}
