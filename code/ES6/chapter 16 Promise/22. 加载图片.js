let loadImageAsync = url => {
    return new Promise(function (resolve, reject) {
        let image = new Image();
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
    });
};