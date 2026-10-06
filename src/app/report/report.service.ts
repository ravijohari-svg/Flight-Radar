import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthorityapisService } from '../custom-services/authority/authorityapis.service';
import { firstValueFrom, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ReportService {
  environmentAuthorityApi: string;
  geoFenceIndia: any;
  constructor(private http: HttpClient, private api: AuthorityapisService) {
    this.environmentAuthorityApi = environment.reportBaseURL;
  }

  getMapLayers(data) {
    return firstValueFrom(
      this.http.post(this.environmentAuthorityApi + 'maps/get-map-layer', data)
    )
      .then((val: any) => {
        return val;
      })
      .catch((error) => {
        throwError(() => error);
      });

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(this.environmentAuthorityApi + 'maps/get-map-layer', data)
    //     .toPromise()
    //     .then(
    //       (val: any) => {
    //         resolve(val);
    //       },
    //       (err) => {
    //         // Error
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }

  getFIRs(data): Promise<any> {
    return firstValueFrom(
      this.http.post(this.environmentAuthorityApi + 'maps/get-fir', data)
    )
      .then((val: any) => {
        return val;
      })
      .catch((error) => {
        throwError(() => error);
      });

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(this.environmentAuthorityApi + 'maps/get-fir', data)
    //     .toPromise()
    //     .then(
    //       (val: any) => {
    //         resolve(val);
    //       },
    //       (err) => {
    //         // Error
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }
  getindiaBoudnary() {
    return firstValueFrom(
      this.http.get(this.environmentAuthorityApi + 'maps/get-india-boundary')
    )
      .then((val: any) => {
        return val;
      })
      .catch((error) => {
        throwError(() => error);
      });

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .get(this.environmentAuthorityApi + 'maps/get-india-boundary')
    //     .toPromise()
    //     .then(
    //       (val: any) => {
    //         resolve(val);
    //       },
    //       (err) => {
    //         // Error
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }
  apigetGeoFence() {
    if (!this.geoFenceIndia) {
      return new Promise((resolve) => {
        this.api.getGeoFence().subscribe((res) => {
          this.geoFenceIndia = res.data.MainData;

          resolve(this.geoFenceIndia);
        });
      });
    } else {
      return new Promise((resolve) => resolve(this.geoFenceIndia));
    }
  }
  getMissionInfo(data) {
    return firstValueFrom(
      this.http.post(
        this.environmentAuthorityApi + 'maps/preflight-mission-details',
        data
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch((error) => {
        throwError(() => error);
      });

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentAuthorityApi + 'maps/preflight-mission-details',
    //       data
    //     )
    //     .toPromise()
    //     .then(
    //       (res: any) => {
    //         resolve(res);
    //       },
    //       (err) => {
    //         // Error
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }
  getActiveBufferRegions(data) {
    return firstValueFrom(
      this.http.post(
        this.environmentAuthorityApi + 'maps/get-buffer-region',
        data
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch((error) => {
        throwError(() => error);
      });

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(this.environmentAuthorityApi + 'maps/get-buffer-region', data)
    //     // , this.headerInitializer()
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         resolve(res);
    //       },
    //       (err) => {
    //         // Error
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;

    // data = this.encryption(data);
    // return this.http.post(this.environmentAuthorityApi + 'mission/get-buffer-region', data, this.headerInitializer())
    //   .pipe(
    //     catchError(this.handleError)
    //   );
  }
  getElevation(data) {
    let payload = {
      latLngArray: data,
    };

    return firstValueFrom(
      this.http.post(
        this.environmentAuthorityApi + 'terrain/get-terrain-elevation',
        payload
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch((error) => {
        throwError(() => error);
      });

    // return new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentAuthorityApi + 'terrain/get-terrain-elevation',
    //       payload
    //     )
    //     .toPromise()
    //     .then((response) => {
    //       resolve(response);
    //     })
    //     .catch((error) => {
    //       reject(error);
    //     });
    // });
  }

  //Weather
  getCurrentWeather(lat: number, lon: number) {
    return firstValueFrom(
      this.http.get(
        `${environment.openWeatherUrl}/weather?lat=${lat}&lon=${lon}&appid=${environment.openWeatherapiKey}`
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch((error) => {
        throwError(() => error);
      });

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .get(
    //       `${environment.openWeatherUrl}/weather?lat=${lat}&lon=${lon}&appid=${environment.openWeatherapiKey}`
    //     )
    //     .toPromise()
    //     .then((response) => {
    //       resolve(response);
    //     })
    //     .catch((error) => {
    //       reject(error);
    //     });
    // });
    // return promise;

    // return this.http.get(`${environment.openWeatherUrl}/weather?lat=${lat}&lon=${lon}&appid=${environment.openWeatherapiKey}`)
  }

//new API for weather by weather Union
getCurrentWeather_WeatherUnion(data) {
  // data = this.aesEcrypt(data);
  return firstValueFrom(
    this.http.post(
      this.environmentAuthorityApi +
      'mission/get-weather',
      data,
      // this.headerInitializer()
      // this.headerInitializerBy_X_Api_Key()
    )
  )
    .then((val: any) => {
      return val;
    })
    .catch((error) => {
      throwError(() => error);
    });
  }

  //Report generation
  preflightDocument(data) {
    // data= this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentAuthorityApi + 'store-report/pre-flight-report',
        data
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch((error) => {
        throwError(() => error);
      });

    // return new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentAuthorityApi + 'store-report/pre-flight-report',
    //       data
    //     )
    //     .toPromise()
    //     .then((response) => {
    //       resolve(response);
    //     })
    //     .catch((error) => {
    //       reject(error);
    //     });
    // });
  }
  postflightDocument(data) {
    // data= this.aesEcrypt(data);
    return firstValueFrom(
      this.http.post(
        this.environmentAuthorityApi + 'store-report/post-flight-report',
        data
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch((error) => {
        throwError(() => error);
      });

    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'store-report/post-flight-report',
          data
        )
        .toPromise()
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  postflightMissionDetails(data) {
    return firstValueFrom(
      this.http.post(
        this.environmentAuthorityApi + 'mission/get-blackbox-details',
        data
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch((error) => {
        throwError(() => error);
      });

    // return new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentAuthorityApi + 'mission/get-blackbox-details',
    //       data
    //     )
    //     .toPromise()
    //     .then((response) => {
    //       resolve(response);
    //     })
    //     .catch((error) => {
    //       reject(error);
    //     });
    // });
  }
}
