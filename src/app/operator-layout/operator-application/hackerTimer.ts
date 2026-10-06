export default (function () {
  var worker,
    timerIdToCallback = {},
    lastTimerId = 0,
    maxTimerId = 0x7fffffff, // 2 ^ 31 - 1, 31 bit, positive values of signed 32 bit integer
    logPrefix = 'hackerTimer.js Logs -';
  if (typeof Worker !== 'undefined') {
    function getTimerId() {
      do {
        if (lastTimerId == maxTimerId) {
          lastTimerId = 0;
        } else {
          lastTimerId++;
        }
      } while (timerIdToCallback.hasOwnProperty(lastTimerId));
      return lastTimerId;
    }
    try {
      worker = new Worker(new URL('./hackTimer.worker.ts', import.meta.url), {
        name: 'worker-eightyeight',
        type: 'module',
      });
      // @ts-ignore
      window.setInterval = function (callback, time /* , parameters */) {
        var timerId = getTimerId();
        // console.log('setInterval', fakeId, callback);
        timerIdToCallback[timerId] = {
          callback: callback,
          parameters: Array.prototype.slice.call(arguments, 2),
        };
        worker.postMessage({
          name: 'setInterval',
          timerId: timerId,
          time: time,
        });
        return timerId;
      };
      window.clearInterval = function (timerId) {
        // console.log('clearInterval', fakeId);

        if (timerIdToCallback.hasOwnProperty(timerId)) {
          delete timerIdToCallback[timerId];
          worker.postMessage({
            name: 'clearInterval',
            timerId: timerId,
          });
        }
      };
      // @ts-ignore
      window.setTimeout = function (callback, time /* , parameters */) {
        var timerId = getTimerId();
        // console.log('setTimeout', fakeId, callback);
        timerIdToCallback[timerId] = {
          callback: callback,
          parameters: Array.prototype.slice.call(arguments, 2),
          isTimeout: true,
        };
        worker.postMessage({
          name: 'setTimeout',
          timerId: timerId,
          time: time,
        });
        return timerId;
      };
      window.clearTimeout = function (timerId) {
        // console.log('clearTimeout', fakeId);
        if (timerIdToCallback.hasOwnProperty(timerId)) {
          delete timerIdToCallback[timerId];
          worker.postMessage({
            name: 'clearTimeout',
            timerId: timerId,
          });
        }
      };
      worker.onmessage = function (event) {
        var data = event.data,
          timerId = data.timerId,
          request,
          parameters,
          callback;
        if (timerIdToCallback.hasOwnProperty(timerId)) {
          request = timerIdToCallback[timerId];
          callback = request.callback;
          parameters = request.parameters;
          if (request.hasOwnProperty('isTimeout') && request.isTimeout) {
            delete timerIdToCallback[timerId];
          }
        }
        if (typeof callback === 'string') {
          try {
            callback = new Function(callback);
          } catch (error) {
            console.log(
              logPrefix + 'Error parsing callback code string: ',
              error
            );
          }
        }
        if (typeof callback === 'function') {
          callback.apply(window, parameters);
        }
      };
      worker.onerror = function (event) {
        console.log(event);
      };
    } catch (error) {
      console.log(logPrefix + 'Initialisation failed');
      console.error(error);
    }
  } else {
    console.log(
      logPrefix + 'Initialisation failed - HTML5 Web Worker is not supported'
    );
  }
})();
