---
title: fis3脚本以及基于nodejs的ftp上传工具
date: 2016-2-16 19:47:48
tags: fis3
categories: javascript
---
前言：fis3 可以进行文件压缩，灰度发布，自动生成精灵图，最重要的他可以用文件指纹的方式解决浏览器缓存机制所带来的静态资源发布时，用户可能读取的仍是缓存的旧文件而无法实时更新的问题。<!--more-->  
[具体使用](http://fis.baidu.com/fis3/api/index.html)  
例子：（fis3 部分）  

```
fis.match('::packager', {
  spriter: fis.plugin('csssprites')
});

fis.match('*', {
  useHash: true
});

fis.match('*.js', {
  optimizer: fis.plugin('uglify-js')
});

fis.match('*.css', {
  useSprite: true,
  optimizer: fis.plugin('clean-css')
});

fis.match('*.png', {
  optimizer: fis.plugin('png-compressor')
});

fis.match('*.{png,js,css}', {
  release: '/static/$0'
});
```

奈何笔者的项目使用的是 freemaker 的 FTL 作为的模板引擎，fis3 恰好不兼容 FTL 文件的格式，使得 FTL 文件内的静态资源无法使用加入文件指纹后的新文件名造成失效，故而使用 nodejs 写一个脚本，一来生成映射表，映射静态资源加入指纹前后文件名的对应关系，而来批量替换 FTL 文件中相应的静态资源项  

```
// 由于 fis3 的文件指纹功能不支持 FTL 格式, 故而手动对 FTL 中的文件进行替换

var fs = require('fs');
var path = require("path");

// 储存文件的对应关系
var map = {};

// 获取当前进程的工作目录
var cwd = process.cwd();

// 静态资源的释放目录,释放到 rs 目录
var staticPath = cwd + '/static';

// FTL 模板的存放位置
var viewPath = cwd + '/WEB-INF/template';

// CSS 文件存放的位置
var cssPath = staticPath + '/style';

// 对文件以及文件目录进行扫描
function walk(path, fileCallback, dirCallback) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function (item) {
        var item_path = path + '/' + item;
        if (fs.statSync(item_path).isDirectory()) {
            dirCallback && dirCallback(item_path);
            walk(item_path, fileCallback, dirCallback);
        } else {
            fileCallback && fileCallback(item_path);
        }
    });
}

console.log("步骤 1: 生成 fis3 转换后前后文件名的对应关系 !");

walk(staticPath, function (item_path) {
    if (item_path.match(/_\w{8}\./)) {
        // 获取当前文件的相对路径
        var relativePath = item_path.replace(staticPath, '');
        var originalPath = relativePath.replace(/_\w{8}(?=\.)/, '');
        map[originalPath] = relativePath;
    }
});

console.log("步骤 2: 处理 FTL 文件");

walk(viewPath, function (item_path) {
    try {
        var context = fs.readFileSync(item_path, 'utf-8');
    } catch (e) {
        console.error('open ' + item_path + ' error !');
    }
    var reg = /\${rsRoots\.rsRoot}.*?\.(js|css|jpg|png|ico|gif).*?"/g;
    context = context.replace(reg, function (data) {
        var pathReg = /\/.*?\.(jpg|png|gif|ico|js|css)\b/g;
        data = data.replace(pathReg, function (match) {
            return map[match] ? map[match] : match;
        });
        return data;
    });
    try {
        fs.writeFileSync(item_path, context);
    } catch (e) {
        console.error('write to ' + item_path + ' error !');
    }
});

console.log("步骤 3: 处理 CSS 文件");

walk(cssPath, function (item_path) {
    try {
        var context = fs.readFileSync(item_path, 'utf-8');
    } catch (e) {
        console.error('open ' + item_path + ' error !');
    }
    var urlReg = /url\((http||\.\.)?.*?\)/g,
        md5Reg = /_\w{8}(?=\.)/;
    context = context.replace(urlReg, function (match, isHttpUrl) {
        if (!isHttpUrl) {
            var pathReg = /\/.*\.(png|jpg|ico|gif)/;
            match = match.replace(pathReg, function (data) {
                return '/rs' + data;
            });
        }
        return match;
    });
    try {
        fs.writeFileSync(item_path, context);
    } catch (e) {
        console.error('write to ' + item_path + ' error !')
    }
});

console.log("释放完毕");
```

编写 nodejs 版本的 FTP 上传工具，以增量的方式上传加入文件指纹后的静态资源至 FTP  

```
// 统计失败重试的次数
var retryCount = -1;

// 生成分割线
var couLine = repeat('-', 25);

process.on('uncaughtException', function (err) {
    // 最多尝试 5 次
    if (retryCount <= 5) doFtpWork();
    else process.exit();
});

// 自动提交经过 fis3 转换过的静态资源到服务器

var path = require('path');
var fs = require('fs');
var client = require('ftp');

// 用于储存需要创建的文件夹
var folderStore = [];

// 用于储存需要上传的文件
var fileStore = [];

// 用于标记本地文件的上传类型
var upMap = [];

// 获取当前进程的工作目录
var cwd = process.cwd();

// 静态资源的释放目录,释放到 rs 目录
var staticPath = cwd + '/static';

// 需要上传到的 ftp 服务器的目录
var file_directory = 'p2b/nodejsFTP/static';

// 用户名和密码信息
var ftpConfig = {
    host: "192.168.60.228",
    user: "dev",
    password: "cc.123"
};

/**
 * 功能:用于生成重复字符串
 * @param target
 * @param n
 * @returns {string}
 */
function repeat(target, n) {
    return (new Array(n + 1)).join(target);
}

/**
 * 功能 : 遍历本地的文件及其目录
 * @param path
 * @param fileCallback
 * @param dirCallback
 */
function walk(path, fileCallback, dirCallback) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function (item) {
        var item_path = path + '/' + item;
        if (fs.statSync(item_path).isDirectory()) {
            dirCallback && dirCallback(item_path);
            walk(item_path, fileCallback, dirCallback);
        } else {
            fileCallback && fileCallback(item_path);
        }
    });
}

/**
 * 功能 : 遍历固定目录下所有的文件
 * @param directory
 * @param fileCallback
 */
function walk_ftp(directory, fileCallback) {
    // 新建本地的 FTP 服务
    var ftp = new client();
    // 连接 ftp 服务器
    ftp.connect(ftpConfig);
    // 获取 ftp 指定目录下所有的文件
    ftp.on('ready', function () {
        ftp.cwd(directory, function (err) {
            if (err) throw err;
            ftp.list(function (err, list) {
                if (err) throw err;
                list.forEach(function (item) {
                    var next = path.join(directory, item.name);
                    // 如果是目录
                    if (item.type && item.type.trim() == 'd') {
                        walk_ftp(next, fileCallback);
                    } else {
                        fileCallback && fileCallback(next);
                    }
                });
                ftp.end();
            });
        });
    });
}

/**
 *  * * 判断文件写入服务器的方式:
 *      1. 直接写入
 *      2. 删除 ftp 上的旧文件后写入
 *      3. 无需写入,跳过
 * 可以写入的条件是:
 *      1. 此文件没有出现在指定目录中,直接写入
 *      2. FTP 上存在旧的文件,删除后写入
 *      3. 文件未发生改变,无需写入
 * @param folder
 * @param file
 * @param succ
 */

function mergeToFtp(folder, file, succ) {
    var upload = new client();
    upload.connect(ftpConfig);
    upload.on('ready', function () {
        upload.cwd(toFtpPath(folder), function (err) {
            if (err) throw err;
            upload.list(function (err, list) {
                var file_arr = [];
                list.forEach(function (item) {
                    if (!(item.type && item.type == 'd')) {
                        var name = item.name || '';
                        if (file_arr.indexOf(name) == -1) {
                            file_arr.push(name);
                        }
                    }
                });
                (function inner(upload, ftp_arr) {
                    if (file.length > 0) {
                        // ftp上的文件名
                        var ori_ftp = null;
                        var reg = /_\w{8}(?=\.)/;
                        // 写入类型
                        var type = 1;
                        // 获取当前文件
                        var curFile = file.shift();
                        // 获取当前文件对应的 FTP 地址
                        var ftp_path = toFtpPath(curFile);
                        // 获取当前文件的文件名
                        var file_name = path.basename(ftp_path);
                        // 获取当前文件 fis3 转换前的文件名
                        var ori_file_name = file_name.replace(reg, '');
                        ftp_arr.forEach(function (ftp_name) {
                            // 获取 fis3 处理前的 ftp 文件名
                            var ori_ftp_name = ftp_name.replace(reg, '');
                            // 判断写入方式
                            if (ftp_name == file_name) {
                                // 文件未发生改变,无需写入
                                type = 3;
                            } else if (ori_ftp_name == ori_file_name) {
                                // 存在旧文件
                                type = 2;
                                var parentFtp = path.dirname(ftp_path);
                                ori_ftp = path.join(parentFtp, ftp_name);
                            }
                        });
                        var map = {};
                        map.type = type;
                        map.file = curFile;
                        map.ori_ftp = ori_ftp;
                        map.fileToFtp = ftp_path;
                        upMap.push(map);
                        inner(upload, ftp_arr);
                    } else {
                        succ && succ(upMap);
                        upload.end();
                    }
                })(upload, file_arr);
            });
        });
    });
}

/**
 * 功能 : 把本地文件的路径转换成 ftp 的路径
 * @param item_path
 * @returns {*}
 */
function toFtpPath(item_path) {
    // 获取文件的相对路径
    var relative = item_path.replace(staticPath, '');
    // 返回 FTP 上的文件地址
    return path.join(file_directory, relative);
}

/**
 * 在 FTP 上创建文件夹
 * @param succ
 */
function createFtpFolder(succ) {
    var upload = new client();
    upload.connect(ftpConfig);
    upload.on('ready', function () {
        (function inner(upload, finish) {
            if (folderStore.length > 0) {
                var ftp_path = folderStore.shift();
                upload.mkdir(ftp_path, function (err) {
                    if (err) console.log("文件夹 : " + ftp_path.replace(file_directory, '') + " 存在 !");
                    else console.log("文件夹 : " + ftp_path.replace(file_directory, '') + " 创建成功 !");
                    inner(upload, finish);
                });
            } else {
                finish && finish();
                upload.end();
            }
        })(upload, succ);
    });
}

// 对需要上传的文件按照所在的目录排序
function classifyByFolder(fileStore) {
    // 用于存储目录与目录下的文件的对应关系
    var map = {};
    var length = 0;
    fileStore.forEach(function (item) {
        // 获取文件的目录
        var dir = path.dirname(item);
        if (!map[dir]) {
            map[dir] = [];
            ++length;
        }
        map[dir].push(item);
    });
    return {
        map: map,
        length: length
    };
}

/**
 * 功能 : ftp 发送文件
 * @param upload
 * @param diskPath
 * @param ftpPath
 * @param succ
 */
function fileToFtp(upload, diskPath, ftpPath, succ) {
    upload.put(diskPath, ftpPath, function (err) {
        if (err) throw err;
        succ && succ();
    });
}

/**
 * 功能 : 删除 FTP 的指定文件
 * @param delDown
 * @param ftpPath
 * @param succ
 */
function deleteFromFtp(delDown, ftpPath, succ) {
    delDown.delete(ftpPath, function (err) {
        if (err) throw err;
        succ && succ();
    });
}

// 上传文件去 ftp
function sendToFtp(upMap, succ) {
    var upload = new client();
    upload.connect(ftpConfig);
    upload.on('ready', function () {
        (function inner(upload, finish) {
            if (upMap.length > 0) {
                var curMap = upMap.shift();
                if (curMap.type == 3) {
                    console.log("文件: " + path.basename(curMap.file) + "未发生改变,无需上传!");
                    inner(upload, finish);
                } else {
                    // 直接写入
                    if (curMap.type == 1) {
                        fileToFtp(upload, curMap.file, curMap.fileToFtp, function () {
                            console.log("新增文件: " + path.basename(curMap.fileToFtp) + "成功!");
                            inner(upload, finish);
                        });
                    } else {
                        // 删除后写入
                        curMap.ori_ftp && deleteFromFtp(upload, curMap.ori_ftp, function () {
                            console.log("删除旧文件: " + path.basename(curMap.ori_ftp) + "成功!");
                            fileToFtp(upload, curMap.file, curMap.fileToFtp, function () {
                                console.log("更新文件: " + path.basename(curMap.fileToFtp) + "成功!");
                                inner(upload, finish);
                            });
                        });
                    }
                }
            } else {
                succ && succ();
                upload.end();
            }
        })(upload, succ);
    });
}

function doFtpWork() {
    ++retryCount;
    //打印出错误
    console.log('步骤4 : 获取需要创建的文件夹');
    // 获取需要上传文件的所有路径,以供在需要时创建
    walk(staticPath, function (item_path) {
        // 获取需要上传的文件
        fileStore.push(item_path);
        // 获取 FTP 上的文件地址
        var ftpPath = toFtpPath(item_path);
        // 获取文件所在的文件夹
        var folder = path.dirname(ftpPath);
        // 对路径进行格式化操作
        var n_ftpPath = path.normalize(folder);
        var n_file_directory = path.normalize(file_directory);
        // 获取相对路径
        var relative = n_ftpPath.replace(n_file_directory, '');
        // 获取所有的分路径数组
        relative = relative.split(path.sep).filter(function (item) {
            // 去掉数组中空字符串的元素
            return item;
        });
        // 获取所有的分路径,并去重
        if (relative.length > 0) {
            for (var i = 1; i <= relative.length; i++) {
                // 获取所有的分路径数组
                var path_array = relative.slice(0, i);
                // 获取分路径
                var single_path = path.normalize(file_directory);
                path_array.forEach(function (item) {
                    single_path = path.join(single_path, item)
                });
                if (folderStore.indexOf(single_path) == -1) {
                    folderStore.push(single_path);
                }
            }
        }
    });

    // 创建文件夹
    if (folderStore.length > 0) {
        createFtpFolder(function () {
            console.log('步骤5 : 文件夹创建完毕,开始上传文件');
            // 把文件按照所在的目录归类
            var classify = classifyByFolder(fileStore);
            var map = classify.map;
            // 获取 map 的 length
            var length = classify.length;
            for (var folder in map) {
                if (map.hasOwnProperty(folder)) {
                    mergeToFtp(folder, map[folder], function (upMap) {
                        if (--length == 0) {
                            // 遍历完所有的文件之后,根据上传类型上传文件
                            sendToFtp(upMap, function () {
                                console.log(couLine + "上传完成" + couLine);
                            });
                        }
                    });
                }
            }
        })
    }
}

doFtpWork();

```


