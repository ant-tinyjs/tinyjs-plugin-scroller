# tinyjs-plugin-scroller

> 滚动插件

## 查看demo

http://tinyjs.net/plugins/tinyjs-plugin-scroller.html#demo

## 引用方法

- 推荐作为依赖使用

  - `npm install tinyjs-plugin-scroller --save`

- 也可以直接引用线上cdn地址，注意要使用最新的版本号，例如：

  - https://gw.alipayobjects.com/os/lib/tinyjs-plugin-scroller/0.2.1/index.js
  - https://gw.alipayobjects.com/os/lib/tinyjs-plugin-scroller/0.2.1/index.debug.js

## 起步
首先当然是要引入，推荐`NPM`方式，当然你也可以使用`CDN`或下载独立版本，先从几个例子入手吧！

##### 1、最简单的例子

我们通过dom来演示一下：

``` html
<div class="cell">
  <div id="J-container" class="container">
    1</br>2</br>3</br>4</br>5</br>6</br>7</br>8</br>9</br>10
  </div>
</div>
// 引用 Tiny.js 源码
<script src="https://gw.alipayobjects.com/as/g/tiny/tiny/1.2.0/tiny.js"></script>
```

``` css
html, body, div {
  margin:0;
  padding:0;
}
.cell {
  height: 400px;
  overflow-y: hidden;
  background-color: #f5f5f5;
}
.container {
  font-size: 72px;
}
```

``` js
require('tinyjs-plugin-scroller');
// 或者
// import Scroller from 'tinyjs-plugin-scroller';

var container = document.getElementById('J-container');
var scroller = new Tiny.Scroller(function (left, top, zoom) {
  container.style.transform = 'translateY('+ -top +'px)';
}, {
  scrollingY: true,
});
// 设置滚动的规模，参数依次是 clientWidth, clientHeight, contentWidth, contentHeight
scroller.setDimensions(window.innerWidth, 400, container.clientWidth, container.clientHeight);
// 按下时的事件监听
container.addEventListener('touchstart', function (e) {
  scroller.doTouchStart(e.touches || [e], e.timeStamp);
});
// 移动时的事件监听
container.addEventListener('touchmove', function (e) {
  scroller.doTouchMove(e.touches || [e], e.timeStamp, e.scale);
});
// 抬起时的事件监听
container.addEventListener('touchend', function (e) {
  scroller.doTouchEnd(e.timeStamp);
});
// 移出屏幕／取消的事件监听
container.addEventListener('touchcancel', function (e) {
  scroller.doTouchEnd(e.timeStamp);
});
```

## 依赖
- `Tiny.js`: [Link](http://tinyjs.net/api)

## API文档

http://tinyjs.net/plugins/tinyjs-plugin-scroller.html#docs

## 感谢

[quentinyang](https://github.com/quentinyang)
