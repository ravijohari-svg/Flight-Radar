/// <reference lib="webworker" />
import * as turf from '@turf/turf';
import booleanIntersects from '@turf/boolean-intersects';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

addEventListener('message', ({ data }) => {
  if(data.type == 'verticalIntersection') {
    const response = verticalIntersection(data.payload);
    postMessage(response);
  }
  if(data.type == 'encrypt'){
    const response = encrypt(data.payload);
    postMessage(response);
  }
});
function verticalIntersection(data){
  const {activeAirspace,vertLong,vertLat,vertAlt} = data;
  let activeCords = activeAirspace.coOrdinates;
  for (let i = 0; i < activeCords.length - 2; i++) {
    let activeSpace = turf.lineString([activeCords[i], activeCords[i + 1]]);
    for (let j = 0; j < vertLong.length - 2; j++) {
      let currentCord = turf.lineString([
        [vertLong[j], vertLat[j]],
        [vertLong[j + 1], vertLat[j + 1]],
      ]);
      if (booleanIntersects(currentCord, activeSpace)) {
        let currentAltMax =
          Math.max(vertAlt[j], vertAlt[j + 1]) + 50;
        let currentAltMin =
          Math.min(vertAlt[j], vertAlt[j + 1]) - 50;
        let activeAltMax =
          Math.max(activeCords[i][2], activeCords[i + 1][2]) + 50;
        let activeAltMin =
          Math.min(activeCords[i][2], activeCords[i + 1][2]) - 50;
        if (currentAltMin > activeAltMax || currentAltMax < activeAltMin) {
        } else {
          return true;
        }
      }
    }
  }
  return false;
}

function encrypt(event){
  const data = event.data;
  return  CryptoJS.AES.encrypt(
    JSON.stringify(data),
    environment.operatorKey
  ).toString();
}

