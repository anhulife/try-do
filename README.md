# try-do

> 尝试执行一个任务，直到执行成功，除非超过指定次数或时间

## 安装

npm install try-do --save

## 使用

```javascript
var tryDo = require('try-do');

var count = 0;

tryDo(function () {
  return Promise[++count === 2 ? 'resolve' : 'reject'](count);
}, {count: 3}).then(function (data) {
  assert(data, 2);
});
```

## 接口定义

```javascript
/**
 * 尝试执行一个任务，直到执行成功，除非超过指定次数或时间
 *
 * 任务支持同步和异步，异步支持 Promise 和 Callback 两种风格
 * 同步函数是否执行成功，是按返回值是否为 undefined 判断依据，undefined 代表执行失败，否则成功。
 *
 * @param {function} task 需要执行的任务
 * @param {Object} options 参数
 * @param {number} [options.count=1] 次数限制
 * @param {number} [options.timeout] 时间限制
 * @param {number|function} [options.delay=0] 任务之间的延时，可以是函数
 * @param {function} [options.callback] 结束后的回调，如果不传，就返回一个 Promise 对象
 */
function tryDo(task, options)
```
