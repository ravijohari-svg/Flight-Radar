import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientApisService {

  environmentClientAPIUrl = environment.apiClientUrl
  constructor(private http: HttpClient) { }

  updateFlightTakeOff(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(this.environmentClientAPIUrl + 'sky-air/notify-to-client-for-drone-takeoff-via-whatsapp',data)
        .toPromise()
        .then((res) =>resolve(res),
          (err) => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }
}
