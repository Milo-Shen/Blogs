---
title: 检测客户端是否支持 webp 的几种方式
date: 2017-06-15 21:19:51
tags: javascript
categories: javascript
comments: true
---
客户端通过 JS 来检测是否支持 webp 图片格式的方法有很多种，以免遗忘，在这里做一个总结。
<!-- more -->
## 通过加载 webp 图片的方式检测客户端是否支持 webp 

```
// check_webp_feature:
// 'feature' can be one of 'lossy', 'lossless', 'alpha' or 'animation'.
// 'callback(feature, result)' will be passed back the detection result (in an asynchronous way!)
function check_webp_feature(feature, callback) {
    var kTestImages = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
        lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA=="
        animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
    };
    var img = new Image();
    img.onload = function () {
        var result = (img.width > 0) && (img.height > 0);
        callback(feature, result);
    };
    img.onerror = function () {
        callback(feature, false);
    };
    img.src = "data:image/webp;base64," + kTestImages[feature];
}
```

[以上代码来源：https://developers.google.com/speed/webp/faq#how_can_i_detect_browser_support_using_javascript](https://developers.google.com/speed/webp/faq#how_can_i_detect_browser_support_using_javascript)

这种方式检测地比较全面，可以检测客户端对多个 webp 压缩级别的支持度测试

## 通过 canvas 的方式检测是否支持 webp

```
document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0;
```

## 通过创建 object 的方式检测是否支持 webp

```
var d = document;
var check = function() {
    var supportWebp;
    try {
        var ele = d.createElement('object');
        ele.type = 'image/webp';
        ele.innerHTML = '!';
        d.body.appendChild(ele);
        supportWebp = !ele.offsetWidth;
        d.body.removeChild(ele);
    }catch (err) {
        supportWebp = false;
    }
    return supportWebp;
}
```

这种方式与上面两种方式比较起来会显得奇葩一些，在支持 webp 的浏览器上，此 obj 是不可见的，也就是宽度为 0，可以根据这点来判断浏览器对于 webp 的支持度
