/**
 *  功能 : requestAnimationFrame 兼容性代码
 */
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };

}());

(function () {
    // 兼容老式浏览器,旧浏览器不支持 mediaDevices 属性
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // 新的浏览器 getUserMedia 部署在 mediaDevices 中
    // 但是旧有的浏览器，无 mediaDevices 变量，故做兼容
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {

            // 浏览器兼容，webkit & firefox
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

            // 不支持则抛出异常
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // 否则兼容其他浏览器的调动方式
            // 默认是 promise 的形式
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }
}());

// 图片方法倍数
let picRate = 1.1;

// 是否可开始人脸识别;
let isLoaded = false;

var faceDetect = (function (faceDetect, undefined) {

    // 全局变量
    var _v = {
        screenWidth: 0,
        screenHeight: 0,
        cap: null,
        src: null,
        gray: null,
        // canvas 的 ctx
        ctx: null,
        // 水印
        watermark: {},
        // 头像遮罩
        headMask: {},
        // 输入视频的 video 标签
        inputVideo: null,
        // 用于输出合成帧的 canvas
        outputCanvas: null,
        // 人脸检测分类器
        faceCascade: null,
        // 眼睛检测分类器
        eyeCascade: null
    };

    // 辅助函数
    var _f = {

        // 获取屏幕宽高
        setClientSize: function () {
            _v.screenWidth = window.innerWidth || document.body.clientWidth;
            let height = window.innerHeight || document.body.clientHeight;
            _v.screenHeight = height - 50;
        },

        // 调整 canvas 大小
        resizeCanvas: function (dom) {
            dom.width = _v.screenWidth;
            dom.height = _v.screenHeight;
        },

        resizeVideo: function (oVideo) {
            oVideo.setAttribute('autoplay', '1');
            oVideo.setAttribute('playsinline', '1');
            oVideo.setAttribute('width', 1);
            oVideo.setAttribute('height', 1)
        },

        // 初始化水印
        loadImage: function (target, src) {
            _v[target] = new Image();
            _v[target].src = src;
        }
    };

    // camera 相关函数
    var _camera = {
        // 启动相机 camera

        load: function () {
            var constraints = {
                audio: false,
                video: {
                    facingMode: 'user',
                    width: _v.screenWidth,
                    height: _v.screenHeight
                }
            };
            navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                let video = _v.inputVideo;
                // 旧浏览器不存在 srcObject 属性
                if ("srcObject" in video) {
                    video.srcObject = stream;
                } else {
                    // 兼容旧浏览器，但是在新浏览器中尽量避免使用
                    video.src = window.URL.createObjectURL(stream);
                }
                video.onloadedmetadata = function (e) {
                    video.play();
                };
            }).catch(function (err) {
                // 对有可能发生的异常进行处理
                console.log(err.name + ": " + err.message);
            });
        }
    };

    // openCV 相关函数
    var _openCV = {
        // 对视频帧进行处理
        processVideo: function () {
            // 捕捉到一个视频帧
            _v.cap.read(_v.src);

            // 将图像转入灰色色域
            cv.cvtColor(_v.src, _v.gray, cv.COLOR_RGBA2GRAY);


            var downSampled = new cv.Mat();
            cv.pyrDown(_v.gray, downSampled);
            cv.pyrDown(downSampled, downSampled);

            // 人脸检测
            let faces = new cv.RectVector();
            _v.faceCascade.detectMultiScale(downSampled, faces, 1.1, 3, 0);

            // // 眼睛检测
            // let eyes = new cv.RectVector();
            // _v.eyeCascade.detectMultiScale(downSampled, eyes, 1.1, 3, 0);

            var size, xRatio, yRatio, face, point1, point2, i;
            var oFace = [];

            // 用红框标注出人脸
            size = downSampled.size();
            xRatio = _v.screenWidth / size.width;
            yRatio = _v.screenHeight / size.height;
            for (i = 0; i < faces.size(); ++i) {
                face = faces.get(i);
                let w = face.width * xRatio,
                    h = face.height * yRatio,
                    dx = (picRate - 1) * w / 2,
                    dy = (picRate - 1) * h / 2,
                    x = face.x * xRatio - dx,
                    y = face.y * yRatio - dy;
                w = w * picRate;
                h = h * picRate;
                oFace.push({w: w, y: y, x: x, h: h});
            }

            // // 用红框标注出眼睛
            // size = downSampled.size();
            // xRatio = _v.screenWidth / size.width;
            // yRatio = _v.screenHeight / size.height;
            // for (i = 0; i < eyes.size(); ++i) {
            //     let eye = eyes.get(i);
            //     point1 = new cv.Point(eye.x * xRatio, eye.y * yRatio);
            //     point2 = new cv.Point((eye.x + eye.width) * xRatio, (eye.y + eye.height) * xRatio);
            //     cv.rectangle(_v.src, point1, point2, [0, 0, 255, 255])
            // }

            // 释放内存
            downSampled.delete();
            faces.delete();

            // 显示图像
            cv.imshow(_v.outputCanvas, _v.src);

            // 画水印
            _business.addWaterMark(20, 20);
            // 画面部遮罩
            _business.addFaceMask(oFace);

            window.requestAnimationFrame(_openCV.processVideo)
        },

    };

    // 业务代码
    var _business = {
        // 添加水印
        addWaterMark: function (x, y) {
            let watermark = _v.watermark;
            if (watermark.complete) {
                _v.ctx.drawImage(watermark, x, y, watermark.width, watermark.height);
            }
        },

        // 画脸部遮罩
        addFaceMask: function (face) {
            if (!face.length) return;
            let headMask = _v.headMask;
            if (_v.headMask.complete) {
                face.forEach(item => {
                    _v.ctx.drawImage(headMask, item.x, item.y, item.w, item.h);
                })
            }
        }
    };

    faceDetect.init = function () {
        // 获取 inputVideo 和 用于视频输出的 canvas
        _v.inputVideo = document.getElementById('faceVideo');
        _v.outputCanvas = document.getElementById('faceDetect');
        // 获取屏幕宽高
        _f.setClientSize();
        // 调整 inputVideo 大小
        _f.resizeCanvas(_v.outputCanvas);
        // 调整 canvas 大小
        _f.resizeVideo(_v.inputVideo);
        _v.ctx = _v.outputCanvas.getContext('2d');
        // 初始化水印
        _f.loadImage('watermark', '/image/watermark.png');
        // 初始化头像
        _f.loadImage('headMask', '/image/D4.png');
    };

    // 进行人脸识别
    faceDetect.run = function () {
        // 获取人脸识别特征库
        _v.faceCascade = new cv.CascadeClassifier();
        _v.faceCascade.load("face.xml");
        // 获取眼睛识别特征库
        _v.eyeCascade = new cv.CascadeClassifier();
        _v.eyeCascade.load("eye.xml");
        // 用于捕捉视频信息
        _v.cap = new cv.VideoCapture(_v.inputVideo);
        _v.src = new cv.Mat(_v.screenHeight, _v.screenWidth, cv.CV_8UC4);
        _v.gray = new cv.Mat(_v.screenHeight, _v.screenWidth, cv.CV_8UC1);
        _camera.load();
        requestAnimationFrame(_openCV.processVideo);
    };

    return faceDetect;

})(window.faceDetect || {}, void 0);

// 配置 openCV
var Module = {
    locateFile: function (name) {
        var files = {
            "opencv_js.wasm": 'opencv/opencv_js.wasm'
        };
        return files[name]
    },
    preRun: [function () {
        // 初始化 canvas & inputVideo 大小
        faceDetect.init();
        Module.FS_createPreloadedFile("/", "face.xml", "model/haarcascade_frontalface_default.xml", true, false);
        Module.FS_createPreloadedFile("/", "eye.xml", "model/haarcascade_eye.xml", true, false);
    }],
    postRun: [function () {
        isLoaded = true;
        document.getElementById('startInput').value = '准备完毕，可以进行识别'
    }]
};

document.getElementById('startInput').addEventListener('click', function () {
    faceDetect.run();
});