let getJSON = url => {
    return new Promise(function (resolve, reject) {
        let client = new XMLHttpRequest();
        client.open('GET', url);
        client.onreadystatechange = handler;
        client.responseType = 'json';
        client.setRequestHeader('Accept', 'application/json');
        client.send();

        function handler() {
            if (this.readyState !== 4) return;
            if (this.status === 200) resolve(this.response);
            else reject(new Error(this.statusText));
        }
    });
};

// 调用豆瓣 api（测试时请不要跨域）
let api = 'https://api.douban.com/v2/book/1220562';
getJSON(api).then(json => {
    console.log(json)
},err => {console.log(err)});

