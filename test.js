var assert = require('assert');
var Promise = require('promise');
var tryDo = require('.');

describe('测试', function () {
  this.timeout(10e3);

  it('接口是否存在', function () {
    assert(!!tryDo);
  });

  it('重复次数', function (done) {
    var count = 0;

    tryDo(function () {
      count++;
    }, {count: 3}).catch(function () {
      assert(count, 3);
      done();
    });
  });

  it('Promise异步函数', function (done) {
    var count = 0;

    tryDo(function () {
      return Promise[++count === 2 ? 'resolve' : 'reject'](count);
    }, {count: 3}).then(function (data) {
      assert(data, 2);
      done();
    });
  });

  it('Callback异步函数', function (done) {
    var count = 0;

    tryDo(function (callback) {
      count++;
      callback('错误');
    }, {count: 3}).catch(function () {
      assert(count, 3);
      done();
    });
  });

  it('同步函数', function (done) {
    var count = 0;

    tryDo(function () {
      if (++count === 2) {
        return count
      }
    }, {count: 3}).then(function (data) {
      assert(data, 2);
      done();
    });
  });

  it('超时', function (done) {
    var count = 0;

    tryDo(function (callback) {
      ++count;
      setTimeout(callback, 1e3);
    }, {count: 3, timeout: 500}).catch(function () {
      assert(count, 1);
      done();
    });
  });

  it('延时', function (done) {
    var start = new Date();

    tryDo(function () {
      return Promise.reject();
    }, {
      count: 3, delay: function (time) {
        return time * 200;
      }
    }).catch(function () {
      assert(new Date() - start >= 600);
      done();
    });
  });

  it('Callback接收结果', function (done) {
    var count = 0;

    tryDo(function () {
      return Promise[++count === 2 ? 'resolve' : 'reject'](count);
    }, {
      count: 3,
      callback: function (err, data) {
        assert(data, 3);
        done();
      }
    });
  });
});
