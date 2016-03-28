(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['promise'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('promise'));
  }
}(function (Promise) {
  'use strict';

  var prototypeToString = Object.prototype.toString;

  function isUndefined(value) {
    return typeof(value) === 'undefined';
  }

  function isFunction(func) {
    return prototypeToString.call(func) === '[object Function]';
  }

  /**
   * 包装任务为 Promise 风格的异步任务
   *
   * @param  {function} task 待包装的任务
   * @return {function} 包装后的任务
   */
  function wrapTask(task) {
    return function () {
      return new Promise(function (resolve, reject) {
        if (task.length === 1) {
          task(function (err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        } else {
          var result = task();

          if (result && result.then) {
            // 如果是 Promise 风格的异步函数
            result.then(resolve, reject);
          } else if (!isUndefined(result)) {
            // 如果是同步函数，并且有返回值
            resolve(result);
          } else {
            reject();
          }
        }
      });
    };
  }

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
  function tryDo(task, options) {
    task = wrapTask(task);

    var tryPromise = new Promise(function (resolve, reject) {
      var promise = task();
      var count = options.count || 1;
      var time = 1;
      var delay = function (time) {
        if (isFunction(options.delay)) {
          return options.delay(time);
        } else {
          return options.delay || 0;
        }
      };

      while (--count) {
        promise = promise.catch(function () {
          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              task().then(resolve, reject);
            }, delay(time++));
          });
        });
      }

      promise.then(resolve, reject);

      // 超时处理
      if (options.timeout) {
        setTimeout(function () {
          reject('timeout');
        }, options.timeout);
      }
    });

    if (options.callback) {
      var callback = options.callback;
      tryPromise.then(function (data) {
        callback(null, data);
      }).catch(callback);
    }

    return tryPromise;
  }

  return tryDo;
}));
