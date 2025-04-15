// 加载 immutable 库
import Immutable from 'immutable';

export let state = {
    async: {
        loadingNumber: 0,
        loadState: {},
        // 书的内容
        list: [],

    },
    // 数据迁移存储区 (非直接页面呈现部分迁移至此)
    MigrateData: {
        Count: 0
    },
    // 用于控制页面的展示
    PageControl: {}
};

export let initialState = Immutable.fromJS(state);