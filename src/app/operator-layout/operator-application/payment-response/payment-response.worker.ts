/// <reference lib="webworker" />
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

addEventListener('message', ({ data }) => {
    const response = encrypt(data.payload);
    postMessage(response);
});

function encrypt(event){
  const data = event.data;
  return  CryptoJS.AES.encrypt(
    JSON.stringify(data),
    environment.operatorKey
  ).toString();
}
