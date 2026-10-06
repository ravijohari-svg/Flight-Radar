/// <reference lib="webworker" />
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

addEventListener('message', ({ data }) => {
   let  response = encrypt(data.payload);
   postMessage(response);
});

function encrypt(event) {
  const data = event.data;
  let encrydata =  CryptoJS.AES.encrypt(JSON.stringify(data), environment.operatorKey);
  let encryData = encrydata.toString();
  return encryData;
}
