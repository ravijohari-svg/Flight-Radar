/// <reference lib="webworker" />
import * as turf from '@turf/turf';
import { Constants } from 'src/app/constants/constants';


addEventListener('message', ({ data }) => {
  if (data.type == 'buffer') {
    const response = verticalDroneLeftitsBuffer(data.payload);
    postMessage(response);
  }
});

function verticalDroneLeftitsBuffer(data) {
  let pos = [];
  let points = [];
  const { pt, latitudeArr, longitudeArr, altitudeArr, liveAlt } = data;
  for (let i = 0; i < longitudeArr.length - 2; i++) {
    let line = turf.lineString([
      [longitudeArr[i], latitudeArr[i]],
      [longitudeArr[i + 1], latitudeArr[i + 1]],
    ]);
    let buffered = turf.buffer(line, Constants.missionBuffer, {
      units: 'kilometers',
      steps: 2,
    });
    if (turf.booleanPointInPolygon(pt, buffered)) {
      let minAlt = Math.min(altitudeArr[i], altitudeArr[i + 1]) - 50;
      let maxAlt = Math.max(altitudeArr[i], altitudeArr[i + 1]) + 50;
      if (liveAlt >= minAlt && liveAlt <= maxAlt) {
        return false;
      } else {
        return true;
      }
    }
  }
}
