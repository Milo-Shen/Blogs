let loadImageAsync = url => {
    return new Promise(function (resolve, reject) {
        let image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('no image found !'));
        image.src = url;
    });
};

let imgSrc = 'http://img.shenyujie.cc/2018-8-8-kimi-24.PNG';
loadImageAsync(imgSrc).then(succ => {
    console.log('width：' + succ.width + 'px');
    console.log('height：' + succ.height + 'px');
},err => {console.log(err)});