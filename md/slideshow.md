---
title: 使用 React 实现网易云音乐轮播图
date: 2017-08-17 19:24:00
tags: 网易云音乐轮播图
categories: React
comments: true

---

网易云音乐（PC版）的轮播图效果尤为不错，欣喜之余，便以 React 的形式，自己实现一个。使用 React 其实也是懒得用 jquery 直接操作 dom ， JSX 的类模板方式为轮播图的编写省下了不少工作量。同时借助 ScreenToGif 强大的逐帧分析能力，可以完美分析网易轮播图的视觉实现，下面是自己实现的效果
![](//img.shenyujie.cc/2017-8-17-home-slideshow-tiny.PNG)
<!--more-->
## 代码实现

+ 部分使用 ES6 语法
+ 请使用 chrome 浏览器预览 （Edge 也兼容）
+ 便于预览，此处 JSX 直接在浏览器内解析（非编译）
+ 本篇只提供代码与实现效果 (底部 iframe)，详细解析待下篇

### HTML 结构

```
<body>
    <div class="slideshow" id="example">
</body>
```

HTML 结构，仅仅只为轮播图提供一个容器 DIV

### 完整代码

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta content="telephone=no" name="format-detection">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<style>
		 body{background: #051d44;}
		.slideshow{position: relative;margin-top: 5px;height: 240px;padding: 0 40px;width:850px;}
		.slideshow a{position: absolute;margin: auto;left:0;right:0;bottom: 0;top:0;display: inline-block;box-sizing: border-box;width: 540px;height: 200px;border: 1px solid #000305;transition: all 0.5s ease 0s , z-index 0s ease 0.15s;-webkit-transition: all 0.5s ease 0s , z-index 0s ease 0.15s;}
		.slideshow a .mask{position: absolute;display: inline-block;width: 100%;height: 100%;background: #000000;opacity: 0.4;}
		.slideshow a img{width: 100%;height: 100%;}
		.slideshow a.leftScale{transform: translate3d(-40%,0,0) scale(0.88);-webkit-transform: translate3d(-40%,0,0) scale(0.88);z-index: 0;}
		.slideshow a.rightScale{transform: translate3d(40%,0,0) scale(0.88);-webkit-transform: translate3d(40%,0,0) scale(0.88);z-index: 0;}
		.slideshow a.top{z-index: 2;}
		.slideshow a.bottom{transform: translate3d(0%,0,0) scale(0.88);-webkit-transform: translate3d(0%,0,0) scale(0.88);z-index: -1;}
		.slideshow a.bottom span{opacity: 0.4;filter: opacity(0.4);-webkit-filter: opacity(0.4);}
		.slideshow a.top span{opacity: 0;}
		.slideshow .turnBox span{width: 22px;height: 38px;position: absolute;top: 50%;margin-top: -19px;cursor: pointer;display: inline-block;}
		.slideshow .turnBox span.turnLeft{z-index: 99;background: url("//img.shenyujie.cc/2017-8-17-left.png") no-repeat;background-size: 22px 38px;}
		.slideshow .turnBox span.turnRight{z-index: 99;right: 40px;background: url("//img.shenyujie.cc/2017-8-17-right.png") no-repeat;background-size: 22px 38px;}
		.slideshow .turnBox span.turnLeft:hover{background: url("//img.shenyujie.cc/2017-8-17-left-hover.png") no-repeat;background-size: 22px 38px;}
		.slideshow .turnBox span.turnRight:hover{right: 40px;background: url("//img.shenyujie.cc/2017-8-17-right-hover.png") no-repeat;background-size: 22px 38px;}
		.slideshow .turnBox{opacity: 0;transition:opacity 0.6s ease;-webkit-transition:opacity 0.6s ease;}
		.slideshow:hover .turnBox{opacity: 1;}
		.slideshow ul{position: absolute;line-height: 0;bottom: 4px;left:50%;transform: translateX(-50%);-webkit-transform: translateX(-50%);font-size: 0;}
		.slideshow ul li{display: inline-block;width: 20px;height: 2px;background: #465872;margin-left: 4px;cursor: pointer;}
		.slideshow ul li:first-child{margin-left: 0;}
		.slideshow ul li.on{background-color: #0184c8;}
	</style>
    <title>React 实现类似网易云音乐轮播图效果</title>
</head>
<body>
<div class="slideshow" id="example">
</body>
<script type="text/javascript" src="//js.shenyujie.cc/clone.js"></script>
<script type="text/javascript" src="//js.shenyujie.cc/react.js"></script>
<script type="text/javascript" src="//js.shenyujie.cc/react-dom.js"></script>
<script type="text/javascript" src="//js.shenyujie.cc/browser.min.js"></script>
<script type="text/babel">

    var NotesList = React.createClass({
        getInitialState: function() {
            return {
                position:[{
                    _className:'leftScale',
                    selected:true
                },{
                    _className:'top',
                    selected:false
                },{
                    _className:'rightScale',
                    selected:false
                },{
                    _className:'bottom',
                    selected:false
                }]
            };
        },

        totalCount: 4,

        topIndex: 1,

        className:{left: 'leftScale', top: 'top', right: 'rightScale', bottom: 'bottom'},

        calculatePos:function (index) {
	    var topIndex = index || this.topIndex;
            return {
                current: topIndex,
		oldCurrent: index ? this.topIndex : -1,
                next: (topIndex + 1) % this.totalCount,
                nextTwo: (topIndex + 2) % this.totalCount,
                previous: (topIndex + this.totalCount - 1) % this.totalCount,
                previousTwo: (topIndex + this.totalCount - 2) % this.totalCount,
            }
        },

        turnLeft:function () {
            var pos = this.calculatePos();
            var className = this.className;
            var newState = window.extend.clone(true, {}, this.state);
            var newPos = newState.position.forEach((x, index) => {
                switch(index){
                    case pos.previousTwo:
                        newState.position[index]._className = className.left;
                        newState.position[index].selected = true;
                        break;
                    case pos.previous:
                        newState.position[index]._className = className.top;
                        newState.position[index].selected = false;
                        break;
                    case pos.current:
                        newState.position[index]._className = className.right;
                        newState.position[index].selected = false;
                        break;
                    case pos.next:
                        newState.position[index]._className = className.bottom;
                        newState.position[index].selected = false;
                        break;
                }
            });
            this.setState(newState,()=>{
                this.topIndex = pos.previous
            })
        },

        turnRight:function () {
            var pos = this.calculatePos();
            var className = this.className;
            var newState = window.extend.clone(true, {}, this.state);
            var newPos = newState.position.forEach((x, index) => {
                switch(index){
                    case pos.previous:
                        newState.position[index]._className = className.bottom;
                        newState.position[index].selected = false;
                        break;
                    case pos.current:
                        newState.position[index]._className = className.left;
                        newState.position[index].selected = true;
                        break;
                    case pos.next:
                        newState.position[index]._className = className.top;
                        newState.position[index].selected = false;
                        break;
                    case pos.nextTwo:
                        newState.position[index]._className = className.right;
                        newState.position[index].selected = false;
                        break;
                }
            });
            this.setState(newState,()=>{
                this.topIndex = pos.next
            })
        },
		
	turnArbitrarily:function(index){
            if(index === this.topIndex) return;
	    var pos = this.calculatePos(index);
            var className = this.className;
            var newState = window.extend.clone(true, {}, this.state);
            var newPos = newState.position.forEach((x, index) => {
                switch(index){
                    case pos.oldCurrent:
                        newState.position[index]._className = className.bottom;
                        newState.position[index].selected = false;
                        break;
                    case pos.current:
                        newState.position[index]._className = className.top;
                        newState.position[index].selected = false;
                        break;
                    case pos.next:
                        newState.position[index]._className = className.right;
                        newState.position[index].selected = false;
                        break;
                    case pos.previous:
                        newState.position[index]._className = className.left;
                        newState.position[index].selected = true;
                        break;
                }
            });
            this.setState(newState,()=>{
                this.topIndex = pos.next
            })
	},
		
	picTurn: function(index){
	    var pos = this.calculatePos();
	    if(index === pos.next){this.turnRight()}
	    else if(index === pos.previous){this.turnLeft()}
	    else{this.turnArbitrarily(index)}
	},

        render: function() {
            return (
                    <div>
                        <a className={this.state.position[0]._className} href="javascript:void(0);" onClick={()=>{this.picTurn(0)}}>
                            <span className="mask"></span>
                            <img src="//img.shenyujie.cc/2017-8-17-ss-1.png"/>
                        </a>
                        <a className={this.state.position[1]._className} href="javascript:void(0);" onClick={()=>{this.picTurn(1)}}>
                            <span className="mask"></span>
                            <img src="//img.shenyujie.cc/2017-8-17-ss-2.png"/>
                        </a>
                        <a className={this.state.position[2]._className} href="javascript:void(0);" onClick={()=>{this.picTurn(2)}}>
                            <span className="mask"></span>
                            <img src="//img.shenyujie.cc/2017-8-17-ss-3.png"/>
                        </a>
                        <a className={this.state.position[3]._className} href="javascript:void(0);" onClick={()=>{this.picTurn(3)}}>
                            <span className="mask"></span>
                            <img src="//img.shenyujie.cc/2017-8-17-ss-4.png"/>
                        </a>
                        <div className="turnBox">
                            <span className="turnLeft" onClick={this.turnLeft}></span>
                            <span className="turnRight" onClick={this.turnRight}></span>
                        </div>
                        <ul>
                            <li className={this.state.position[0].selected ? 'on' : ''} onMouseEnter={()=>{this.picTurn(1)}}></li>
                            <li className={this.state.position[1].selected ? 'on' : ''} onMouseEnter={()=>{this.picTurn(2)}}></li>
                            <li className={this.state.position[2].selected ? 'on' : ''} onMouseEnter={()=>{this.picTurn(3)}}></li>
                            <li className={this.state.position[3].selected ? 'on' : ''} onMouseEnter={()=>{this.picTurn(0)}}></li>
                        </ul>
                    </div>
            );
        }
    });

    ReactDOM.render(
            <NotesList/>,
        document.getElementById('example')
    );
</script>
</html>
```

### 效果

<iframe style="position:absolute;height:270px;width:948px;" src="//html.shenyujie.cc/2017-8-17-slideshows.html" width="100%" frameborder="0" scrolling="no"> </iframe>
<div style="display:block !important;height:305px !important"></div>