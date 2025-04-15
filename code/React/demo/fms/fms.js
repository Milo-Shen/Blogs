'use strict';

// mock 接口数据


let fms = require('fms');
fms.run({
    port: 3500,
});

let  time = function () {
    return new Date();
};

/*********************************** React UI 2.2 API ***********************************/

let list = [];

for (let i = 0; i < 1000; i++) {
    list.push({
        name: `name_${i}`,
        id: `id_${i}`,
    })
}

/**
 * API     ： 查询会员信息接口
 * method  ： GET
 * para    ： false
 * store   ： true
 */
fms.ajax({
    url: '/list',
    type: 'get',
    res: {
        ok: {
            status: 'success',
            data: list
        }
    }
});

