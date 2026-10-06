import { Injectable } from '@angular/core';
import {
  AuthenticationDetails,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { Observable, throwError, firstValueFrom, Subject, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';

//Swal
import Swal from 'sweetalert2';

//Crypto
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import { IndexedDBFunctionsService } from '../common/indexed-db-functions.service';

const poolData = {
  UserPoolId: environment.AuthorityUserPoolID, // Your user pool id here
  ClientId: environment.AuthorityClientId, // Your client id here
};
const userPool = new CognitoUserPool(poolData);
@Injectable({
  providedIn: 'root',
})
export class AuthorityapisService {
  public data;
  public httpOptions: any;
  public httpHeaders: any;
  environmentAuthorityApi: any = '';
  elsightUrl = environment.elsightUrl;
  cognitoUser;
  AESEncrypt = environment.AESEncrypt;
  cacheInvalidate: boolean = false;
  openWeatherState = environment.openWeatherState;
  public zoneData = new BehaviorSubject<boolean>(false);
  zoneData$ = this.zoneData.asObservable();
  
  constructor(
    private http: HttpClient,
    private indexedDBFunctionsService: IndexedDBFunctionsService
  ) {
    this.environmentAuthorityApi = environment.apiAuthorityUrl;
  }

  getZoneData(state){
    this.zoneData.next(state);
  }

  //Http Header
  headerInitializer() {
    const AccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('adminAccessToken'),
    });
    const IdToken = new CognitoIdToken({
      IdToken: localStorage.getItem('adminIDToken'),
    });
    const RefreshToken = new CognitoRefreshToken({
      RefreshToken: localStorage.getItem('adminRefreshToken'),
    });
    const sessionData = {
      IdToken: IdToken,
      AccessToken: AccessToken,
      RefreshToken: RefreshToken,
    };
    let cognitoUser = userPool.getCurrentUser();
    const cachedSession = new CognitoUserSession(sessionData);

    this.checkForAccessToken();

    // if(localStorage.getItem('AdminDetails') == null || localStorage.getItem('AdminDetails') == undefined || localStorage.getItem('AdminDetails') == '') {
    //   this.router.navigateByUrl('authority/authority-login');
    // }

    if (
      cachedSession['idToken']['payload'].exp <=
      Math.floor(new Date().getTime() / 1000.0)
    ) {
      let swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          // confirmButton: 'btn alert-login-button mb-3 px-4',
          // cancelButton: 'btn alert-cancel-button mb-3 px-4 mx-2',
          cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
          confirmButton: 'btn primary-btn mb-3 px-4',
          title: 'alert-title',
          // text : 'alert-text'
          // cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false,
      });
      swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          title: 'Session Expired',
          text: 'Your session has been expired due to inactivity or network issue. You’ll have to refresh your browser to start a new session.',
          // timer: 3000,
          showConfirmButton: true,
          confirmButtonText: 'Refresh',
        })
        .then(() => {
          location.href = 'authority/authority-login';
        });
    }

    // if (cachedSession.isValid()) {
    // } else {
    // }
    this.httpHeaders = new HttpHeaders();
    if (localStorage.getItem('adminIDToken') != null) {
      // && location.href.indexOf('user-layout')!=-1
      this.httpHeaders = this.httpHeaders.append(
        'Authorization',
        localStorage.getItem('adminIDToken')
      );
    } else {
      this.httpHeaders = this.httpHeaders.append(
        'x-api-key',
        environment.Authorityauthorization
      );
    }

    this.httpOptions = {
      headers: this.httpHeaders,
    };
    return this.httpOptions;
  }
  // headerInitializer2() {
  //   const AccessToken = new CognitoAccessToken({ AccessToken: localStorage.getItem('adminAccessToken') });
  //   // const IdToken = new CognitoIdToken({ IdToken: localStorage.getItem('adminIDToken') });
  //   const RefreshToken = new CognitoRefreshToken({ RefreshToken: localStorage.getItem('adminRefreshToken') });
  //   const  IdToken= new CognitoIdToken({ IdToken:"lsjbskojscbikcgeiuyuwer"})
  //   let sessionData = {
  //     IdToken:IdToken,
  //     AccessToken: AccessToken,
  //     RefreshToken: RefreshToken
  //   };
  //   let cognitoUser = userPool.getCurrentUser();
  //   const cachedSession = new CognitoUserSession(sessionData);

  //   this.checkForAccessToken();

  //   // if(localStorage.getItem('AdminDetails') == null || localStorage.getItem('AdminDetails') == undefined || localStorage.getItem('AdminDetails') == '') {
  //   //   this.router.navigateByUrl('authority/authority-login');
  //   // }

  //   if ((cachedSession['idToken']['payload'].exp) <= (Math.floor(new Date().getTime() / 1000.0))) {
  //     let swalWithBootstrapButtons = Swal.mixin({
  //       customClass: {
  //         // confirmButton: 'btn alert-login-button mb-3 px-4',
  //         // cancelButton: 'btn alert-cancel-button mb-3 px-4 mx-2',
  //         cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
  //         confirmButton: 'btn primary-btn mb-3 px-4',
  //         title: 'alert-title',
  //         // text : 'alert-text'
  //         // cancelButton: 'btn btn-danger'
  //       },
  //       buttonsStyling: false
  //     })
  //     swalWithBootstrapButtons.fire({
  //       background: '#1b1f27',
  //       title: "Session Expired",
  //       text: "Your session has been expired due to inactivity or network issue. You’ll have to refresh your browser to start a new session.",
  //       // timer: 3000,
  //       showConfirmButton: true,
  //       confirmButtonText: 'Refresh'
  //     }).then(() => {
  //       location.href = 'authority/authority-login';
  //     });
  //   }

  //   // if (cachedSession.isValid()) {
  //   // } else {
  //   // }
  //   this.httpHeaders = new HttpHeaders();
  //   if (localStorage.getItem('adminIDToken') != null)
  //   // && location.href.indexOf('user-layout')!=-1
  //   {
  //     this.httpHeaders = this.httpHeaders.append('Authorization', localStorage.getItem('adminIDToken'));
  //   } else {
  //     this.httpHeaders = this.httpHeaders.append('x-api-key', environment.Authorityauthorization);
  //   }

  //   this.httpOptions = {
  //     headers: this.httpHeaders
  //   };
  //   return this.httpOptions;
  // }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      // if (error.status == 0) {
      //   let swalWithBootstrapButtons = Swal.mixin({
      //     customClass: {
      //       confirmButton: 'btn alert-login-button mb-3 px-4',
      //       cancelButton: 'btn alert-cancel-button mb-3 px-4 mx-2',
      //       title: 'alert-title',
      //       // text : 'alert-text'
      //       // cancelButton: 'btn btn-danger'
      //     },
      //     buttonsStyling: false
      //   })
      //   swalWithBootstrapButtons.fire({
      //     title:"Session Expired",
      //     text: "Your session has been expired due to inactivity or network issue. You’ll have to refresh your browser to start a new session.",
      //     // timer: 3000,
      //     showConfirmButton: true,
      //     confirmButtonText: 'Refresh'
      //   }).then(() => {
      //     location.href = 'authority/authority-login';
      //   });
      //   // this.showSwal('session-timeout');
      // }
      console.error(error);
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }

    return throwError(() => error);
  }
  checkForAccessToken() {
    const AccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('adminAccessToken'),
    });
    const IdToken = new CognitoIdToken({
      IdToken: localStorage.getItem('adminIDToken'),
    });
    const RefreshToken = new CognitoRefreshToken({
      RefreshToken: localStorage.getItem('adminRefreshToken'),
    });
    const sessionData = {
      IdToken: IdToken,
      AccessToken: AccessToken,
      RefreshToken: RefreshToken,
    };
    const cachedSession = new CognitoUserSession(sessionData);
    if (
      cachedSession['idToken']['payload'].iat + 2500 <=
      Math.floor(new Date().getTime() / 1000.0)
    ) {
      let cognitoUser = userPool.getCurrentUser();
      var refresh_token = new CognitoRefreshToken({
        RefreshToken: localStorage.getItem('adminRefreshToken'),
      });
      cognitoUser.refreshSession(refresh_token, (err, session) => {
        if (err) {
        } else {
          localStorage.setItem('adminIDToken', session['idToken']['jwtToken']);
          localStorage.setItem(
            'adminAccessToken',
            session['accessToken']['jwtToken']
          );
          localStorage.setItem(
            'adminRefreshToken',
            session['refreshToken']['token']
          );
        }
      });
    }
  }

  //Encryption and Decryption
  encryption(data) {
    const publickey = environment.serverPublickey;
    let responseObj;
    responseObj = JSON.stringify(data);
    let returnObj = [];

    const max_size = 400;
    const yardstick = new RegExp(`.{${max_size}}`, 'g'); // /.{10}/g;
    var pieces = responseObj.match(yardstick);

    if (pieces == null) {
      pieces = [responseObj];
    } else {
      const accumulated = pieces.length * max_size;
      const modulo = responseObj.length % accumulated;
      if (modulo) {
        pieces.push(responseObj.slice(accumulated));
      }
    }

    for (let i = 0; i < pieces.length; i++) {
      const encryptedData = crypto.publicEncrypt(
        {
          key: publickey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
          // oaepHash: "sha256",
        },
        Buffer.from(pieces[i])
      );
      returnObj.push(encryptedData.toString('base64'));
    }
    // const encryptedData = crypto.publicEncrypt(
    //   {
    //     key: publickey,
    //     padding: crypto.constants.RSA_PKCS1_PADDING
    //     // passphrase: '',
    //     // oaepHash: "sha256",
    //   },
    //   // We convert the data string to a buffer using `Buffer.from`
    //   Buffer.from(JSON.stringify(data))
    // );
    let payload = {
      data: returnObj,
    };
    return payload;
  }
  //To get the Url for latest basemaplayer
  getStadiaMapURl() {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(this.environmentAuthorityApi + 'ratelimiter/map-api', {})
        .toPromise()
        .then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
    return promise;
  }
  //Api count
  getApiCount(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'ratelimiter/map-api-increment-count',
          data
        )
        .toPromise()
        .then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
    return promise;
  }
  decryption(jsonResp) {
    let encryptionArr = jsonResp?.data?.MainData;
    // encryptionArr = [
    //   '3UZzGaswsD9pigU8VrtO8U9P/24Dy7zEZdxvKDl/K0kIzvAce/D3gd30ko/6nKy/qTupx1hzRxH2ZwsX1uZbyQbC56B7CwrtEuY07YfIZoYST7i1c9Zlck50uie0+oP9sDFwhmOaxlD3F5y6whWS9RuxUaoHUpxuOlGh6FKw7s2xURSYNOR+mPKdwGYiEU3Ms+PiLeLVarqrTBtR8nq0HGO6eXx9s/1vA0XBjH9eysxnpYRL2RppdzsEzgdXaP6sVJIqGJHvuniHmhJyhWZMwlHgdu7Pop7P+1Iny+Rvrho4n69xnTzkY2oyb+ndVqQN6RIXNfP6u3c1+zxAQJYECrGZ1v9/kBdt3+w4eoTS3i/kMPzLQRdfFVdgsUGo/jutiBS1QVRspExNq6xPiIxJ765lAdV2NINpOa4h3Tj43f8ctMBKFqbm6BKnLK+quMxO94KSpPnyxjrYpkaAUmQC9MymSDWCL5iFTm54LVT1gaxew92HBU3kc9YudgTgRa8mgEW4biS31yJnarwLhyPC33+7Se6IHKCh6/c+IP+TboKGBF2iPFKRayweJFHoTYn/oJHbuT5YKghGc336+QLUAt38be0D3Thw18RHzu5ZajzDRkgA1yblnsdaGp02VxcGoNzYiIAeIoW23myT1f9W5hMc7v2SlnAPFLWj15y814E=',

    // ]
    const privatekey = environment.privatekey;

    let decryptedString = '';
    encryptionArr.forEach((val) => {
      const encryptedData = Buffer.from(val, 'base64');
      const decryptedData = crypto.privateDecrypt(
        {
          key: privatekey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        encryptedData
      );

      let decoder = new TextDecoder();
      decryptedString = decryptedString + decoder.decode(decryptedData);
    });
    jsonResp.data.MainData = this.testJSON(decryptedString)
      ? JSON.parse(decryptedString)
      : decryptedString;
    // if(this.testJSON(decryptedString)) {

    // }
    // jsonResp.data.MainData = JSON.parse(decryptedString);
    return jsonResp;
    // return decoder.decode(decryptedData);
  }

  mapMapDecryption(res) {
    let encryptionArr = res?.data?.MainData;
    let decryptedString = '';
    // console.log(encryptionArr,"encry");
    encryptionArr.forEach((val) => {
      const decryptedData = CryptoJS.AES.decrypt(val, this.AESEncrypt);
      decryptedString =
        decryptedString + decryptedData.toString(CryptoJS.enc.Utf8);
    });
    res.data.MainData = this.testJSON(decryptedString)
      ? JSON.parse(decryptedString)
      : decryptedString;
    return res;
  }

  testJSON(text) {
    if (typeof text !== 'string') {
      return false;
    }
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      return false;
    }
  }

  //Cognito
  signIn(authorityid, password) {
    const authenticationData = {
      Username: authorityid,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: authorityid,
      Pool: userPool,
    };

    this.cognitoUser = new CognitoUser(userData);
    return new Promise((resolve, reject) => {
      this.cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          resolve(result);
        },
        onFailure: function (err) {
          reject(err);
        },
      });
    });
  }
  getAuthenticatedUser() {
    // gets the current user from the local storage
    return userPool.getCurrentUser();
  }

  //Profile Details
  getProfileDetails(data): Observable<any> {
    data = this.encryption(data);
    // saroj - 2023-06-30 - removed encription for sending payload for getting profile details
    return this.http
      .post(
        this.environmentAuthorityApi + 'authority/get-profile-details',
        data,
        this.headerInitializer()
      )
      .pipe(catchError(this.handleError))
      .pipe(
        map((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
            // val = this.mapMapDecryption(val);
          }
          return val;
        })
      );
  }
  getHubs(data): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'turf/mission-hubs',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (val: any) => {
            resolve(val);
          },
          (err) => {
            reject(err);
          }
        );
    });
    return promise;
  }
  //Country code
  //To get the state name in the UI card
  getStateName(lat, lon) {
    return this.http
      .get(
        `${this.openWeatherState}/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${environment.openWeatherapiKey}`
      )
      .toPromise();
  } //To get the country code in the UI card
  getCountryCode(lat, lon) {
    return this.http
      .get(
        `${this.openWeatherState}/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${environment.openWeatherapiKey}`
      )
      .toPromise();
  }

  //Missions
  getAllMissionsList(): Observable<any> {
    return this.http
      .get(
        this.environmentAuthorityApi + 'mission/get-all-mission-list',
        this.headerInitializer()
      )
      .pipe(catchError(this.handleError))
      .pipe(
        map((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          return val;
        })
      );
  }

  //Dashboard
  getUpcomingMissionList(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'mission/get-upcoming-mission-list',
          data,
          this.headerInitializer()
        )
        // , this.headerInitializer()
        .toPromise()
        .then(
          (res) => {
            // resolve(res)
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (err) => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }
  // getOnGoingMissionList(data): Observable<any> {
  //   data = this.aesEcrypt(data);
  //   return this.http
  //     .post(
  //       this.environmentAuthorityApi + 'mission/get-ongoing-mission-list',
  //       data,
  //       this.headerInitializer()
  //     )
  //     .pipe(catchError(this.handleError))
  //     .pipe(
  //       map((val: any) => {
  //         let res = this.mapMapDecryption(val);
  //         return res;
  //       })
  //     );
  // }

  getOnGoingMissionList(data): Promise<any> {
    return new Promise((resolve, reject) => {
      data = this.aesEcrypt(data);

      this.http
        .post(
          this.environmentAuthorityApi + 'mission/get-ongoing-mission-list',
          data,
          this.headerInitializer()
        )
        .pipe(
          catchError((error) => {
            this.handleError(error);
            reject(error); // Reject the promise if there is an error
            return [];
          }),
          map((val: any) => {
            let res = this.mapMapDecryption(val);
            return res;
          })
        )
        .toPromise() // Convert the observable to a promise
        .then((result) => {
          resolve(result); // Resolve the promise with the result
        });
    });
  }

  getApprovedMissionList(): Observable<any> {
    return this.http
      .get(
        this.environmentAuthorityApi + 'mission/get-approved-mission-list',
        this.headerInitializer()
      )
      .pipe(catchError(this.handleError))
      .pipe(
        map((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          return val;
        })
      );
  }

  //Dashboard - Update Mission Status
  updateMissionStatus(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'mission/update-mission-status',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            res = this.mapMapDecryption(res);
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
    return promise;
  }
  //Get Resp Mission Info
  getMissionInfo(data) {
    data = this.encryption(data);
    // data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'mission/preflight-mission-details',
          data,
          this.headerInitializer()
        )
        // , this.headerInitializer()
        .toPromise()
        .then(
          (res: any) => {
            if (res?.data?.MainData && res?.data?.MainData.length != 0) {
              res = this.decryption(res);
              resolve(res);
            }
          },
          (err) => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }
  getComplianceData(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'mission/get-compliance-documents',
          data
        )
        .toPromise()
        .then(
          (res: any) => {
            resolve(res);
          },
          (err) => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }
  getPostFlightMissionInfo(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'mission/postflight-mission-details',
          data,
          this.headerInitializer()
        )
        // , this.headerInitializer()
        .toPromise()
        .then(
          (res: any) => {
            if (res?.data?.MainData && res?.data?.MainData.length != 0) {
              res = this.mapMapDecryption(res);
              resolve(res);
            }
          },
          (err) => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }
  //Logs for OnGoing Missions
  getRespectiveMissionLogs(data): Observable<any> {
    data = this.encryption(data);
    return this.http
      .post(
        this.environmentAuthorityApi + 'mission/get-respective-mission-logs',
        data,
        this.headerInitializer()
      )
      .pipe(catchError(this.handleError))
      .pipe(
        map((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          return val;
        })
      );
  }
  getUpdatedMissionLogs(data): Observable<any> {
    data = this.aesEcrypt(data);
    return this.http
      .post(
        this.environmentAuthorityApi +
          'mission/get-respective-mission-latest-logs',
        data,
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }

  //BlackBox
  getBlackBoxList(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'blackbox/get-mission-list',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            // resolve(res);
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (err) => {
            reject(err);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          //  console.log(err)
        });
    });
    return promise;
  }
  getBlackboxMessages(data) {
    // data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      return this.http
        .post(
          this.environmentAuthorityApi + 'blackbox/get-msg-info-logs',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            // resolve(res);
            // let val = this.mapMapDecryption(res);
            resolve(res);
          },
          (error) => reject(error)
        )
        .catch((err) => {
          reject(err);
          // console.log(err);
          this.handleError(err);
        });
    });
    return promise;
  }
  aesEcrypt(data) {
    let responseObj;
    responseObj = JSON.stringify(data);
    let returnObj = [];

    const max_size = 400;
    const yardstick = new RegExp(`.{${max_size}}`, 'g'); // /.{10}/g;
    var pieces = responseObj.match(yardstick);

    if (pieces == null) {
      pieces = [responseObj];
    } else {
      const accumulated = pieces.length * max_size;
      const modulo = responseObj.length % accumulated;
      if (modulo) {
        pieces.push(responseObj.slice(accumulated));
      }
    }

    for (let i = 0; i < pieces.length; i++) {
      let piece = pieces[i];
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(piece),
        this.AESEncrypt
      );
      returnObj.push(encryptedData.toString());
    }
    let payload = {
      data: returnObj,
    };
    return payload;
  }

  //admin page

  //API with rxjs (Previous version)
  // getAuthoritiesProfileDetails(): Observable<any>{
  // return this.http.get(this.environmentAuthorityApi+ 'authority/get-authorities-profile-details',this.headerInitializer())
  // .pipe(
  //   catchError(this.handleError)
  // )
  // }

  //API with promises (New version)
  getAuthoritiesProfileDetails() {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(
          this.environmentAuthorityApi +
            'authority/get-authorities-profile-details',
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            // resolve(res);
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (err) => {
            reject(err);
          }
        )
        .catch((error) => {
          reject(error);
          reject(error);
          this.handleError(error);
          //  reject(err)
        });
    });
    return promise;
  }

  getAuthorityAdminRegistration(data) {
    data = this.encryption(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'authority/registration',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            let val = this.decryption(res);
            resolve(val);
          },
          (err) => {
            reject(err);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          // console.log(err);
        });
    });
    return promise;
  }

  forgotPassword(payload) {
    let url = this.environmentAuthorityApi + 'authority/forgot-password';
    const encrytedData = this.encryption(payload);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(url, encrytedData, this.headerInitializer())
        .toPromise()
        .then(
          (res) => {
            // Success
            const decryptedData = this.decryption(res);
            resolve(decryptedData);
          },
          (err) => {
            // Error
            this.handleError(err);
            reject(err);
          }
        );
    });
    return promise;
  }

  //Function to set the password for the authority registeration
  setNewPassword(data) {
    let url = this.environmentAuthorityApi + 'authority/reset-password';

    data = this.encryption(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(url, data)
        .toPromise()
        .then(
          (res) => {
            const decryptData = this.decryption(res);
            resolve(decryptData);
          },
          (err) => {
            return reject(err);
          }
        );
    });
    return promise;
  }

  getResetPassword(data) {
    data = this.encryption(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'authority/reset-password',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            let val = this.decryption(response);
            resolve(val);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          // console.log(err);
        });
    });
    return promise;
  }
  getUpdateAdminDetails(data) {
    data = this.encryption(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'authority/update-profile-details',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            let val = this.decryption(response);
            resolve(val);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          //  console.log(err);
        });
    });
    return promise;
  }

  getDeleteAdminDetails(data) {
    data = this.encryption(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'authority/delete-authority-profile',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            let val = this.decryption(response);
            resolve(val);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          //  console.log(err);
        });
    });
    return promise;
  }

  getCountryState(data) {
    // return this.http.post(this.environmentAuthorityApi + 'drop-down/add-country-state', data, this.headerInitializer())
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/world-mapping',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            resolve(response);
            // let val = this.mapMapDecryption(response);
            // resolve(val);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          //  console.log(err);
        });
    });
    return promise;
  }
  getCityOnly(data) {
    // return this.http.post(this.environmentAuthorityApi + 'drop-down/add-country-state', data, this.headerInitializer())
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/add-country-state',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          //  console.log(err);
        });
    });
    return promise;
  }
  getFirMaplayers(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/get-fir-maplayer',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          //  console.log(err);
        });
    });
    return promise;
  }
  //pilots-list

  //API with rxjs (Previous version)
  // getOperatorsDetails(): Observable<any>{
  //   return this.http.get(this.environmentAuthorityApi + 'authority/get-operators-profile-list', this.headerInitializer())
  //   .pipe(
  //     catchError(this.handleError)
  //   )
  // }

  //API with promises (New version)
  getOperatorsDetails() {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(
          this.environmentAuthorityApi + 'authority/get-operators-profile-list',
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            // resolve(response);
            let val = this.mapMapDecryption(response);
            resolve(val);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          // console.log(err);
        });
    });
    return promise;
  }

  getDeleteOperators(data) {
    data = this.encryption(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'authority/delete-operator',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            let val = this.decryption(response);
            resolve(val);
          },
          (error) => reject(error)
        )
        .catch((error) => {
          reject(error);
          this.handleError(error);
          // console.log(error)
        });
    });
    return promise;
  }

  getBlackBoxFileteredData(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'mission/get-mission-list-by-status',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            // resolve(res);
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (error) => reject(error)
        )
        .catch((error) => {
          reject(error);
          this.handleError(error);
          // console.log(error)
        });
    });
    return promise;
  }
  getBlockBoxMissionDetail(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'blackbox/get-mission-logs',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res: any) => {
            // resolve(res);
            if (res.data) {
              let val = this.mapMapDecryption(res);
              resolve(val);
            } else {
              reject(res);
            }
          },
          (err) => {
            reject(err);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          // console.log(error)
        });
    });
    return promise;
  }

  getSingleDroneDetails(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'drones-gears/get-drone-details',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            // resolve(response);
            let val = this.mapMapDecryption(response);
            resolve(val);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((error) => {
          reject(error);
          this.handleError(error);
        });
    });
    return promise;
  }
  //Plane Finder
  getLatestPlaneFinderData(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi +
            'authority/get-plane-finder-data-by-country',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            // resolve(res);
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (error) => reject(error)
        )
        .catch((err) => {
          reject(err);
          //  console.log(err);
          this.handleError(err);
        });
    });
    return promise;
  }

  //Drones
  // getDroneParameters(): Observable<any> {
  //   return this.http.get(this.environmentAuthorityApi + 'drop-down/get-drone-parameters', this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using the promises
  getDroneParameters(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get(
          this.environmentAuthorityApi + 'drop-down/get-drone-parameters',
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.mapMapDecryption(val);
          }
          resolve(val);
        })
        .catch((error: any) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // addDroneParameter(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http.post(this.environmentAuthorityApi + 'drop-down/add-drone-parameters', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using the promises
  addDroneParameter(data): Promise<any> {
    return new Promise((resolve, reject) => {
      data = this.encryption(data);
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/add-drone-parameters',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          resolve(val);
        })
        .catch((error: any) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // editDroneParameter(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http.post(this.environmentAuthorityApi + 'drop-down/edit-drone-parameters', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using the promises
  editDroneParameter(data): Promise<any> {
    return new Promise((resolve, reject) => {
      data = this.encryption(data);
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/edit-drone-parameters',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          resolve(val);
        })
        .catch((error: any) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // deleteDroneParameter(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http.post(this.environmentAuthorityApi + 'drop-down/delete-drone-parameters', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using the promises
  deleteDroneParameter(data): Promise<any> {
    return new Promise((resolve, reject) => {
      data = this.encryption(data);
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/delete-drone-parameters',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          resolve(val);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  //Active Airspaces
  getActiveBufferRegions(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'mission/get-buffer-region',
          data,
          this.headerInitializer()
        )
        // , this.headerInitializer()
        .toPromise()
        .then(
          (res) => {
            // resolve(res)
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (err) => {
            // Error
            reject(err);
          }
        );
    });
    return promise;

    // data = this.encryption(data);
    // return this.http.post(this.environmentAuthorityApi + 'mission/get-buffer-region', data, this.headerInitializer())
    //   .pipe(
    //     catchError(this.handleError)
    //   );
  }
  downloadFile(url: string): Observable<Blob> {
    const fileExtension = this.getFileExtension(url);
    const contentType = this.getContentType(fileExtension);

    const headers = new HttpHeaders({
      'Content-Type': contentType,
    });

    return this.http.get(url, { responseType: 'blob', headers });
  }
  getContentType(fileExtension: string): string {
    switch (fileExtension) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      // Add more cases for other file types if needed
      default:
        return 'application/octet-stream'; // Default content type for unknown file types
    }
  }
  getFileExtension(url: string): string {
    const parts = url.split('.');
    return parts[parts.length - 1].toLowerCase();
  }

  //Activity type - Rule engine
  // getActivityType(): Observable<any> {
  //   return this.http.get(this.environmentAuthorityApi + 'drop-down/get-activity-type', this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using the promises
  getActivityType(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get(
          this.environmentAuthorityApi + 'drop-down/get-activity-type',
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.mapMapDecryption(val);
          }
          resolve(val);
        })
        .catch((error: any) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // getFlightPurpose(): Observable<any> {
  //   return this.http.get(this.environmentAuthorityApi + 'drop-down/get-flight-purpose', this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         return val;
  //       }
  //     }));
  // }

  //By using the promise
  getFlightPurpose(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http
        .get(
          this.environmentAuthorityApi + 'drop-down/get-flight-purpose',
          this.headerInitializer()
        )
        .subscribe(
          (val: any) => {
            if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
              // resolve(val);
              let dec = this.mapMapDecryption(val);
              resolve(dec);
            }
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  // addActivityType(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http.post(this.environmentAuthorityApi + 'drop-down/add-activity-type', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using promises
  addActivityType(data): Promise<any> {
    return new Promise((resolve, reject) => {
      data = this.encryption(data);
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/add-activity-type',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          resolve(val);
        })
        .catch((error) => {
          reject(this.handleError(error));
        });
    });
  }

  // addPurposeFlight(data): Observable<any> {
  //   return this.http.post(this.environmentAuthorityApi + 'drop-down/add-flight-purpose', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       return val;
  //     }));
  // }

  //By using promises
  addPurposeFlight(data): Promise<any> {
    data = this.aesEcrypt(data);
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/add-flight-purpose',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          // resolve(val);
          let res = this.mapMapDecryption(val);
          resolve(res);
        })
        .catch((error: any) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // editActivityType(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http.post(this.environmentAuthorityApi + 'drop-down/edit-activity-type', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using the promises
  editActivityType(data): Promise<any> {
    return new Promise((resolve, reject) => {
      data = this.encryption(data);
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/edit-activity-type',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          resolve(val);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // editFlightPurpose(data): Observable<any> {

  //   return this.http.post(this.environmentAuthorityApi + 'drop-down/edit-flight-purpose', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       return val;
  //     }));
  // }

  //By using promises
  editFlightPurpose(data): Promise<any> {
    data = this.aesEcrypt(data);
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/edit-flight-purpose',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          // resolve(val);
          let res = this.mapMapDecryption(val);
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // deleteActivityType(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http.post(this.environmentAuthorityApi + 'drop-down/delete-activity-type', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using the promises
  deleteActivityType(data): Promise<any> {
    return new Promise((resolve, reject) => {
      data = this.encryption(data);
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/delete-activity-type',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          resolve(val);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // deleteFlightPurpose(data): Observable<any> {
  //   return this.http.post(this.environmentAuthorityApi + 'drop-down/delete-flight-purpose', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {

  //       return val;
  //     }));
  // }

  //By using the Promises
  deleteFlightPurpose(data) {
    data = this.aesEcrypt(data);
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'drop-down/delete-flight-purpose',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val) => {
          // resolve(val);
          let res = this.mapMapDecryption(val);
          resolve(res);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  //Date Time - Rule engine
  // getDateTime(): Observable<any> {
  //   return this.http.get(this.environmentAuthorityApi + 'rule-engine/time-permission', this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       // console
  //       // if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //       //   val = this.decryption(val)
  //       // }
  //       return val;
  //     }));
  // }

  //By using promises
  getDateTime() {
    return new Promise((resolve, reject) => {
      this.http
        .get(
          this.environmentAuthorityApi + 'rule-engine/time-permission',
          this.headerInitializer()
        )
        .toPromise()
        .then((val) => {
          // console
          // if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
          //   val = this.decryption(val)
          // }
          val = this.mapMapDecryption(val);
          resolve(val);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // addDateTime(data): Observable<any> {
  //   // data = this.encryption(data);
  //   return this.http.post(this.environmentAuthorityApi + 'rule-engine/time-permission/add-time-date', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     );

  // }

  //By using the promises
  addDateTime(data) {
    data = this.aesEcrypt(data);
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi +
            'rule-engine/time-permission/add-time-date',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val) => {
          // resolve(val);
          let res = this.mapMapDecryption(val);
          resolve(res);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // deleteTimeDate(data): Observable<any> {
  //   return this.http.post(this.environmentAuthorityApi + 'rule-engine/time-permission/delete-time-date', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  // }

  //By using promises
  deleteTimeDate(data) {
    data = this.aesEcrypt(data);
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi +
            'rule-engine/time-permission/delete-time-date',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val) => {
          // resolve(val);
          let res = this.mapMapDecryption(val);
          resolve(res);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  //Weather based rule-engine
  // getWeather(): Observable<any> {
  //   return this.http.get(this.environmentAuthorityApi + 'rule-engine/weather-map', this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       // console
  //       // if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //       //   val = this.decryption(val)
  //       // }
  //       return val;
  //     }));
  // }

  //By using promises
  getWeather(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get(
          this.environmentAuthorityApi + 'rule-engine/weather-map',
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          // if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
          //   val = this.decryption(val)
          // }
          val = this.mapMapDecryption(val);
          resolve(val);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // editWeather(data): Observable<any> {
  //     // data = this.encryption(data);
  //     return this.http.post(this.environmentAuthorityApi + 'rule-engine/weather-map/edit-permission', data, this.headerInitializer())
  //       .pipe(
  //         catchError(this.handleError)
  //       );

  //   }

  //By using promises
  editWeather(data): Promise<any> {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi +
            'rule-engine/weather-map/edit-permission',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          // resolve(val);
          let res = this.mapMapDecryption(val);
          resolve(res);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  //CoRelation
  // getCoRelation(): Observable<any> {
  //   return this.http.get(this.environmentAuthorityApi + 'mission-parameters/get-mission-parameters', this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using promises
  getCoRelation(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get(
          this.environmentAuthorityApi +
            'mission-parameters/get-mission-parameters',
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.mapMapDecryption(val);
          }
          resolve(val);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // addCoRelation(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http.post(this.environmentAuthorityApi + 'mission-parameters/add-mission-parameters', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using promisses
  addCoRelation(data): Promise<any> {
    data = this.encryption(data);
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi +
            'mission-parameters/add-mission-parameters',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          resolve(val);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // editCoRelation(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http.post(this.environmentAuthorityApi + 'mission-parameters/edit-mission-parameters', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using promises
  editCoRelation(data): Promise<any> {
    data = this.encryption(data);
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi +
            'mission-parameters/edit-mission-parameters',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          resolve(val);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  // deleteCoRelation(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http.post(this.environmentAuthorityApi + 'mission-parameters/delete-mission-parameters', data, this.headerInitializer())
  //     .pipe(
  //       catchError(this.handleError)
  //     )
  //     .pipe(map((val: any) => {
  //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //         val = this.decryption(val)
  //       }
  //       return val;
  //     }));
  // }

  //By using promises
  deleteCoRelation(data): Promise<any> {
    data = this.encryption(data);
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi +
            'mission-parameters/delete-mission-parameters',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.decryption(val);
          }
          resolve(val);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  //Maps layer from backend
  getvfrs(data): Observable<any> {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    return this.http
      .post(
        this.environmentAuthorityApi + 'maps/get-argis-vfrs',
        data,
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }
  getAirports(data): Observable<any> {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    return this.http
      .post(
        this.environmentAuthorityApi + 'maps/get-argis-airports',
        data,
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }

  getWarning(): Observable<any> {
    return this.http
      .get(
        this.environmentAuthorityApi + 'maps/get-tropogo-warningzones',
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }
  getNoFlyZone(): Observable<any> {
    return this.http
      .get(
        this.environmentAuthorityApi + 'maps/get-noflyzones',
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }
  getInnerYellowZone(): Observable<any> {
    return this.http
      .get(
        this.environmentAuthorityApi + 'maps/get-yellowinnerzones',
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }
  getYellowZone(): Observable<any> {
    return this.http
      .get(
        this.environmentAuthorityApi + 'maps/get-yellowzones',
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }

  getMilitaryNoFlyZone(): Observable<any> {
    return this.http
      .get(
        this.environmentAuthorityApi + 'maps/get-ie-vfr',
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }
  getGeoFence(): Observable<any> {
    // return this.http
    //   .get(
    //     this.environmentAuthorityApi + 'maps/get-geozone',
    //     this.headerInitializer()
    //   )
    //   .pipe(catchError(this.handleError));

    return this.http
      .get(
        '../../../assets/files/encryptedGeoZone.json',
        this.headerInitializer()
      )
      .pipe(catchError(this.handleError))
      .pipe(
        map((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            val = this.mapMapDecryption(val);
          }
          return val;
        })
      );
  }

  getNoFlyZoneDubai() {
    // return this.http
    //   .get(
    //     '../../../assets/files/encryptedGeoZone.json',
    //     this.headerInitializer()
    //   )
    //   .pipe(catchError(this.handleError))
    //   .pipe(
    //     map((val: any) => {
    //       if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
    //         val = this.mapMapDecryption(val);
    //       }
    //       return val;
    //     })
    //   );

    return new Promise((resolve, reject) => {
      this.http
        .get(
          '../../../assets/files/Dubai NoFlyZone.geojson',
          this.headerInitializer()
        )
        .toPromise()
        .then((val: any) => {
          resolve(val);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
    // return this.http
    //   .get(
    //     this.environmentAuthorityApi + 'maps/get-dubai-noflyzones',
    //     this.headerInitializer()
    //   )
    //   .pipe(
    //     map((response) => {
    //       let val = this.mapMapDecryption(response);
    //       return val;
    //     }),
    //     catchError(this.handleError)
    //   );
  }

  getFICDubai() {
    return new Promise((resolve, reject) => {
      this.http
        .get('../../../assets/files/FICUAE.json', this.headerInitializer())
        .toPromise()
        .then((val: any) => {
          resolve(val);
        })
        .catch((error) => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  getindiaBoudnary() {
    let promise = new Promise(async (resolve, reject) => {
      let cache = await this.getDataFromCache('IndiaBoundry');
      if (cache && !this.cacheInvalidate) {
        const decryptedData = this.mapMapDecryption(cache);
        resolve(decryptedData);
      } else {
        this.http
          .get(
            this.environmentAuthorityApi + 'maps/get-india-boundary',
            this.headerInitializer()
          )
          .toPromise()
          .then(
            (val: any) => {
              if (val.data.MainData && val.data.MainData.length != 0) {
                this.storeInCache('IndiaBoundry', val);
                val = this.mapMapDecryption(val);
              }
              resolve(val);
            },
            (err) => {
              // Error
              reject(err);
            }
          );
      }
    });
    return promise;
  }
  getMapLayers(data) {
    let encryptedData = this.aesEcrypt(data);
    let promise = new Promise(async (resolve, reject) => {
      let cache = await this.getDataFromCache(data.MapLayer);
      if (cache && !this.cacheInvalidate) {
        const decryptedData = this.mapMapDecryption(cache);
        resolve(decryptedData);
      } else {
        this.http
          .post(
            this.environmentAuthorityApi + 'maps/get-map-layer',
            encryptedData,
            this.headerInitializer()
          )
          .toPromise()
          .then(
            (val: any) => {
              if (val.data.MainData && val.data.MainData.length != 0) {
                this.storeInCache(data.MapLayer, val);
                val = this.mapMapDecryption(val);
              }
              resolve(val);
            },
            (err) => {
              // Error
              reject(err);
            }
          );
      }
    });
    return promise;
  }
  getFIRs(data): Promise<any> {
    let encryptedData = this.aesEcrypt(data);

    let promise = new Promise(async (resolve, reject) => {
      let cache = await this.getDataFromCache('FIRMapLayer');
      if (cache && !this.cacheInvalidate) {
        const decryptedData = this.mapMapDecryption(cache);
        resolve(decryptedData);
      } else {
        this.http
          .post(
            this.environmentAuthorityApi + 'maps/get-fir',
            encryptedData,
            this.headerInitializer()
          )
          .toPromise()
          .then(
            (val: any) => {
              if (val.data.MainData && val.data.MainData.length != 0) {
                this.storeInCache('FIRMapLayer', val);
                val = this.mapMapDecryption(val);
              }
              resolve(val);
            },
            (err) => {
              // Error
              reject(err);
            }
          );
      }
    });
    return promise;
  }

  //Metrices
  getDashboardMetrices(data): Observable<any> {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    return this.http
      .post(
        this.environmentAuthorityApi + 'mission/get-dashboard-metrics',
        data,
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }

  //Pilots
  getFilteredPilotsList(data): Observable<any> {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    return this.http
      .post(
        this.environmentAuthorityApi + 'operator/get-operator-list-by-days',
        data,
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }
  //Preflight document
  getUpcomingMissionListPromise(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'mission/get-upcoming-mission-list',
          data,
          this.headerInitializer()
        )
        .pipe(catchError(this.handleError))
        .toPromise()
        .then(
          (res) => {
            // Success
            // resolve(res);
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (err) => {
            // Error
            this.handleError(err);
            reject(err);
          }
        );
    });
    return promise;
  }
  preflightDocument(data) {
    // data = this.encryption(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'report/preflight-report',
          data,
          this.headerInitializer()
        )
        .pipe(catchError(this.handleError))
        .toPromise()
        .then(
          (res) => {
            // Success
            resolve(res);
          },
          (err) => {
            // Error
            this.handleError(err);
            reject(err);
          }
        );
    });
    return promise;
  }

  //Post flight Doc
  getCompletedMissions(): Observable<any> {
    // return interval(3000)
    // .pipe(switchMap(() => this.http.get(this.environmentAuthorityApi + 'mission/get-missionlist-for-postflight', this.headerInitializer())))
    //   .pipe(
    //     catchError(this.handleError)
    //   );

    return this.http
      .get(
        this.environmentAuthorityApi + 'mission/get-missionlist-for-postflight',
        this.headerInitializer()
      )
      .pipe(catchError(this.handleError));
  }
  getCompletedMissionsPromise() {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(
          this.environmentAuthorityApi +
            'mission/get-missionlist-for-postflight',
          this.headerInitializer()
        )
        .pipe(catchError(this.handleError))
        .toPromise()
        .then(
          (res) => {
            // Success
            resolve(res);
          },
          (err) => {
            // Error
            this.handleError(err);
            reject(err);
          }
        );
    });
    return promise;
  }
  postflightDocument(data) {
    // data = this.encryption(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'report/postflight-report',
          data,
          this.headerInitializer()
        )
        .pipe(catchError(this.handleError))
        .toPromise()
        .then(
          (res) => {
            // Success
            resolve(res);
          },
          (err) => {
            // Error
            this.handleError(err);
            reject(err);
          }
        );
    });
    return promise;
  }

  //Live data exchange
  checkLiveDataExchange(data) {
    data = this.aesEcrypt(data);
    return this.http
      .post(
        this.environmentAuthorityApi + 'mission/check-live-stream',
        data,
        this.headerInitializer()
      )
      .pipe(
        map((response) => {
          let val = this.mapMapDecryption(response);
          return val;
        }),
        catchError(this.handleError)
      );
  }

  //Reports Download
  preAndPostFlightReportDownload(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi +
            'report/get-pre-and-post-flight-report',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            // resolve(res);
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (error) => reject(error)
        )
        .catch((err) => {
          reject(err);
          //  console.log(err);
          this.handleError(err);
        });
    });
    return promise;
  }

  // Weather
  // getCurrentWeather(lat: number, lon: number) {
  //   let promise = new Promise((resolve, reject) => {
  //     this.http
  //       .get(
  //         `${environment.openWeatherUrl}/weather?lat=${lat}&lon=${lon}&appid=${environment.openWeatherapiKey}`
  //       )
  //       .pipe(catchError(this.handleError))
  //       .toPromise()
  //       .then(
  //         (res) => {
  //           // Success
  //           resolve(res);
  //         },
  //         (err) => {
  //           // Error
  //           this.handleError(err);
  //           reject(err);
  //         }
  //       );
  //   });
  //   return promise;

  //   // return this.http.get(`${environment.openWeatherUrl}/weather?lat=${lat}&lon=${lon}&appid=${environment.openWeatherapiKey}`)
  // }

  //new API for weather by weather Union
  getCurrentWeather_WeatherUnion(data) {
    // data = this.aesEcrypt(data);
    return firstValueFrom(
      this.http.post(
        this.environmentAuthorityApi + 'mission/get-weather',
        data
        // this.headerInitializer()
        // this.headerInitializerBy_X_Api_Key()
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch(this.handleError);
  }

  //Blackbox - Drone Trailing
  getDroneTrailingInitially(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'blackbox/get-dronetrailing-firsttime',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            // resolve(res);
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (err) => {
            reject(err);
          }
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
          // console.log(err)
        });
    });
    return promise;
  }
  getDroneTrailingContinuously(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi +
            'blackbox/get-dronetrailing-secondtime',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            // resolve(res);
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (error) => reject(error)
        )
        .catch((err) => {
          reject(err);
          // console.log(err);
          this.handleError(err);
        });
    });
    return promise;
  }

  //Remote id track
  getRemoteIdInitially(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.elsightUrl + 'elsight/get-respective-mission-logs',
          data,
          this.headerInitializer()
        )
        // , this.headerInitializer()
        .toPromise()
        .then(
          (res) => resolve(res),
          (err) => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }
  getRemoteIdContiuous(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.elsightUrl + 'elsight/get-respective-mission-latest-logs',
          data,
          this.headerInitializer()
        )
        // , this.headerInitializer()
        .toPromise()
        .then(
          (res) => resolve(res),
          (err) => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }

  //Onelap APIs
  oneLapHeader() {
    let httpHeaders = new HttpHeaders();
    httpHeaders = httpHeaders.append('Authorization', environment.oneLapAuth);
    // httpHeaders = httpHeaders.append('Access-Control-Allow-Origin', '*');
    // httpHeaders = httpHeaders.append('Content-Type', 'application/json');
    // httpHeaders = httpHeaders.append('Access-Control-Allow-Headers', 'origin, content-type, accept, authorization');

    let httpOptions = {
      headers: httpHeaders,
    };
    return httpOptions;
  }
  getOneLapLiveData() {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(environment.oneLapUrl, this.oneLapHeader())
        // , this.oneLapHeader()
        // , this.headerInitializer()
        .toPromise()
        .then(
          (res) => resolve(res),
          (err) => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }
  //Store pilot certificate
  storeCertificate(data): Promise<any> {
    data = this.aesEcrypt(data);
    const url =
      this.environmentAuthorityApi + 'operator/send-pilot-certification';
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(url, data, this.headerInitializer())
        .toPromise()
        .then((response) => {
          // resolve(response);
          // let val = this.mapMapDecryption(response);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
    return promise;
  }
  //Elevation graph
  getElevation(data) {
    let payload = {
      latLngArray: data,
    };
    // let payloads = this.aesEcrypt(payload);
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentAuthorityApi + 'terrian/get-terrain-elevation',
          payload,
          this.headerInitializer()
        )
        .toPromise()
        .then((response) => {
          // resolve(response);
          // let val = this.mapMapDecryption(response);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  storeInCache(key, value) {
    this.indexedDBFunctionsService.addDataToIndexedDB({
      MapLayerName: key,
      ...value,
    });
  }
  getDataFromCache(key): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indexedDBFunctionsService
        .getItemFromIndexedDB(key)
        .then((data) => {
          if (data && data.data) {
            resolve(data);
          } else {
            resolve(false);
          }
        })
        .catch((error) => {
          console.error('Error retrieving data from IndexedDB:', error);
          reject(error);
        });
    });
  }

  // api for get map hash value
  // map hash value - value shows if there is any changes in map-layer
  getMapHashValue() {
    let url = this.environmentAuthorityApi + 'maps/hash-value';
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(url, this.headerInitializer())
        .toPromise()
        .then(
          (res) => {
            // const dcryptDate = this.mapMapDecryption(res);
            // set the cache invalidate flag for futher use in map-layer api calling.
            const mapCacheValueFromCache = this.getMapHashValueFromCache();
            if (
              mapCacheValueFromCache &&
              res &&
              res['data'] &&
              res['data']?.MainData &&
              res['data']?.MainData?.HashValue == mapCacheValueFromCache
            ) {
              this.cacheInvalidate = false;
            } else {
              this.cacheInvalidate = true;
              this.setMapHashValue(res['data']?.MainData?.HashValue);
            }
            resolve(res);
          },
          (err) => {
            // Error
            this.handleError(err);
            reject(err);
          }
        );
    });
    return promise;
  }

  // get map hash value from local storage
  // map hash value - value shows if there is any changes in map-layer
  getMapHashValueFromCache() {
    return localStorage.getItem('mapHashValue');
  }
  // sets map hash value
  setMapHashValue(hashValue) {
    localStorage.setItem('mapHashValue', hashValue);
  }

  sendZoneData(data) {
    // data = this.encryption(data);
    // data = this.aesEcrypt(data);
    return firstValueFrom(
      this.http.post(
        this.environmentAuthorityApi + 'maps/add-zone',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        // resolve(response);
        let val = this.mapMapDecryption(response);
        // this.dronesAndGearsDataSubject.next(val);
        return response;
      })
      .catch(this.handleError);
  }

  getZoneApiData() {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(
          this.environmentAuthorityApi + 'maps/get-zone'
        )
        .toPromise()
        .then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
    return promise;
  }
}
