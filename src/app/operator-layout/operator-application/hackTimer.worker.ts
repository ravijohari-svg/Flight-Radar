var timerIdToId = {};
onmessage = function (event) {
  var data = event.data,
    name = data.name,
    timerId = data.timerId,
    time;
  if (data.hasOwnProperty('time')) {
    time = data.time;
  }
  switch (name) {
    case 'setInterval':
      timerIdToId[timerId] = setInterval(function () {
        postMessage({ timerId: timerId });
      }, time);
      break;
    case 'clearInterval':
      if (timerIdToId.hasOwnProperty(timerId)) {
        clearInterval(timerIdToId[timerId]);
        delete timerIdToId[timerId];
      }
      break;
    case 'setTimeout':
      timerIdToId[timerId] = setTimeout(function () {
        postMessage({ timerId: timerId });
        if (timerIdToId.hasOwnProperty(timerId)) {
          delete timerIdToId[timerId];
        }
      }, time);
      break;
    case 'clearTimeout':
      if (timerIdToId.hasOwnProperty(timerId)) {
        clearTimeout(timerIdToId[timerId]);
        delete timerIdToId[timerId];
      }
      break;
  }
};
