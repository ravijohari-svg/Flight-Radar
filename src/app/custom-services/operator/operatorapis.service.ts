import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthenticationDetails,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import {
  from,
  Observable,
  throwError,
  BehaviorSubject,
  Subject,
  firstValueFrom,
} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';

// import {} from '../../../assets/files/'
//Swal
import Swal from 'sweetalert2';
//Crypto
import * as crypto from 'crypto';
import { IndexedDBFunctionsService } from '../common/indexed-db-functions.service';

const poolData = {
  UserPoolId: environment.OperatorUserPoolID, // Your user pool id here
  ClientId: environment.OperatorClientId, // Your client id here
};
const userPool = new CognitoUserPool(poolData);

declare var require: any;
@Injectable({
  providedIn: 'root',
})
export class OperatorapisService {
  public data;
  public httpOptions: any;
  public httpHeaders: any;
  environmentOperatorApi: any = '';
  envUploadBaseUrl : any = '';
  cognitoUser;
  AESEncrypt = environment.AESEncrypt;
  openWeatherState = environment.openWeatherState;

  // true - map hash value change from last time
  // false - not changed
  cacheInvalidate: boolean = false;

  //Swal
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      confirmButton: 'btn primary-btn mb-3 px-4',
      title: 'alert-title',
    },
    buttonsStyling: false,
  });

  // using getGuestProfileDetailsAPI as service
  private guestProfileDetailsDataSubject: BehaviorSubject<any> =
    new BehaviorSubject(null);
  guestProfileDetailsData$ = this.guestProfileDetailsDataSubject.asObservable();

  //Using getDronesAndGearsAPI as service
  private dronesAndGearsDataSubject: BehaviorSubject<any> = new BehaviorSubject(
    null
  );
  dronesAndGearsData$ = this.dronesAndGearsDataSubject.asObservable();
  oneLapToken: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private indexedDBFunctionsService: IndexedDBFunctionsService
  ) {
    this.environmentOperatorApi = environment.apiOperatorUrl;
    this.envUploadBaseUrl = environment.uploadBaseUrl;
    // this.headerInitializer();
  }

  //Swal
  //Swal
  showSwal(type, option1?) {
    if (type == 'session-timeout') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          title: 'Sorry',
          text: 'Session time out or internet issue,Please try again!',
          timer: 3000,
          showConfirmButton: false,
        })
        .then(() => {
          this.router.navigateByUrl('operator/operator-login');
        });
    }
  }
  headerInitializer() {
    const AccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('userAccessToken'),
    });
    const IdToken = new CognitoIdToken({
      IdToken: localStorage.getItem('userIDToken'),
    });
    const RefreshToken = new CognitoRefreshToken({
      RefreshToken: localStorage.getItem('userRefreshToken'),
    });
    const sessionData = {
      IdToken: IdToken,
      AccessToken: AccessToken,
      RefreshToken: RefreshToken,
    };
    let cognitoUser = userPool.getCurrentUser();
    const cachedSession = new CognitoUserSession(sessionData);
    // if(localStorage.getItem('UserDetails') == null || localStorage.getItem('UserDetails') == undefined || localStorage.getItem('UserDetails') == '') {
    //   return this.router.navigateByUrl('operator/operator-login');
    // }
    // <=

    if (
      cachedSession['idToken']['payload'].exp <=
      Math.floor(new Date().getTime() / 1000.0)
    ) {
      let swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn alert-login-button mb-3 px-4',
          cancelButton: 'btn alert-cancel-button mb-3 px-4 mx-2',
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
          location.href = 'operator/operator-login';
        });
    }
    this.checkForAccessToken();

    this.httpHeaders = new HttpHeaders();
    if (localStorage.getItem('userIDToken') != null) {
      // && location.href.indexOf('user-layout')!=-1
      this.httpHeaders = this.httpHeaders.append(
        'Authorization',
        localStorage.getItem('userIDToken')
      );
    } else {
      this.httpHeaders = this.httpHeaders.append(
        'x-api-key',
        environment.Operatorauthorization
      );
    }

    this.httpOptions = {
      headers: this.httpHeaders,
    };
    return this.httpOptions;
  }
  headerInitializerBy_X_Api_Key() {
    const AccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('userAccessToken'),
    });
    const IdToken = new CognitoIdToken({
      IdToken: localStorage.getItem('userIDToken'),
    });
    const RefreshToken = new CognitoRefreshToken({
      RefreshToken: localStorage.getItem('userRefreshToken'),
    });
    const sessionData = {
      IdToken: IdToken,
      AccessToken: AccessToken,
      RefreshToken: RefreshToken,
    };
    let cognitoUser = userPool.getCurrentUser();
    const cachedSession = new CognitoUserSession(sessionData);
    // if(localStorage.getItem('UserDetails') == null || localStorage.getItem('UserDetails') == undefined || localStorage.getItem('UserDetails') == '') {
    //   return this.router.navigateByUrl('operator/operator-login');
    // }
    // <=

    if (
      cachedSession['idToken']['payload'].exp <=
      Math.floor(new Date().getTime() / 1000.0)
    ) {
      let swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn alert-login-button mb-3 px-4',
          cancelButton: 'btn alert-cancel-button mb-3 px-4 mx-2',
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
          location.href = 'operator/operator-login';
        });
    }
    this.checkForAccessToken();

    // if (cachedSession.isValid()) {
    // } else {
    // }

    this.httpHeaders = new HttpHeaders();
    //Using X-api-key only
    this.httpHeaders = this.httpHeaders.append(
      'x-api-key',
      environment.Operatorauthorization
    );

    this.httpOptions = {
      headers: this.httpHeaders,
    };
    return this.httpOptions;
  }
  headerForCROS() {
    let header: any = new HttpHeaders()
      .set('Access-Control-Allow-Origin', 'http://localhost:4200/')
      .set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS'
      )
      .set(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      )
      .set('Access-Control-Max-Age', '86400')
      .set('Access-Control-Allow-Credentials', 'true');
    // header=header.append('Access-Control-Allow-Origin', 'https://gis.icao.int');
    // header=header.append('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS');
    // header=header.append('Access-Control-Allow-Headers', 'Content-Type');
    // header=header.append('Access-Control-Max-Age', '86400');
    // header=header.append('Access-Control-Allow-Credentials', 'true');
    // if (!header.has('content-type')) {
    //   header=header.append('Access-Control-Allow-Origin', '*')
    // }
    let headers = {
      headers: header,
    };
    return headers;
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
  decryption(jsonResp) {
    let encryptionArr = jsonResp?.data?.MainData;

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

    return jsonResp;
  }
  // AES Encryption
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

  mapMapDecryption(res) {
    let encryptionArr = res?.data?.MainData;
    let decryptedString = '';
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
    // console.log(typeof text);
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

  handleError(error: HttpErrorResponse) {
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
      //     location.href = 'operator/operator-login';
      //   });
      //   // this.showSwal('session-timeout');
      // }
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError(() => error);
  }

  checkForAccessToken() {
    const AccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('userAccessToken'),
    });
    const IdToken = new CognitoIdToken({
      IdToken: localStorage.getItem('userIDToken'),
    });
    const RefreshToken = new CognitoRefreshToken({
      RefreshToken: localStorage.getItem('userRefreshToken'),
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
        RefreshToken: localStorage.getItem('userRefreshToken'),
      });
      cognitoUser.refreshSession(refresh_token, (err, session) => {
        if (err) {
        } else {
          localStorage.setItem('userIDToken', session['idToken']['jwtToken']);
          localStorage.setItem(
            'userAccessToken',
            session['accessToken']['jwtToken']
          );
          localStorage.setItem(
            'userRefreshToken',
            session['refreshToken']['token']
          );
        }
      });
    }
  }

  //New promise API
  updateProfileDetails(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/update-profile-details',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            let val = this.mapMapDecryption(res);
            resolve(val);
            // resolve(res)
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
  updateDocuments(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/update-documents',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            resolve(res);
          },
          (error) => reject(error)
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
        });
    });
    return promise;
  }
  //Toget the documents in the documents section of pilot profile
  retrieveDocuments(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/retrieve-document',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            resolve(res);
          },
          (error) => reject(error)
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
        });
    });
    return promise;
  }
  //New promise API
  addWaypointFile(data) {
    // data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/add-waypoints',
          data
          // this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            //  let val = this.mapMapDecryption(res);
            //  resolve(val);
            resolve(res);
          },
          (error) => {
            reject(error);
            console.log(error, 'err');
          }
        )
        .catch((err) => {
          reject(err);
          // console.log(err);
          this.handleError(err);
        });
    });
    return promise;
  }
  //setting module deleted uploaded documents
  deleteUploadedDocuments(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/delete-compliance-documents',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => resolve(res),
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
  //Delete waypointfile
  deleteWaypoint(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/delete-waypoints',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => resolve(res),
          (error) => reject(error)
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
        });
    });
    return promise;
  }
  //Delete waypointfile
  deleteDocuments(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/delete-document',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => resolve(res),
          (error) => reject(error)
        )
        .catch((err) => {
          reject(err);
          this.handleError(err);
        });
    });
    return promise;
  }

  //Authentication and Authorization
  newOperatorRegister(data): Observable<any> {
    data = this.aesEcrypt(data);
    return this.http
      .post(
        this.environmentOperatorApi + 'operator/registration',
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
  //New Operator register api call function
  // newOperatorRegisteration(data): Observable<any> {
  //   data = this.aesEcrypt(data);
  //   return this.http
  //     .post(
  //       this.environmentOperatorApi + 'operator/registration',
  //       data,
  //       this.headerInitializer()
  //     )
  //     .pipe(
  //       map((response) => {
  //         let val = this.mapMapDecryption(response);
  //         return val;
  //       }),
  //       catchError(this.handleError)
  //     );
  // }
  newOperatorRegisteration(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/registration',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => {
            // resolve(res)
            let val = this.mapMapDecryption(res);
            resolve(val);
          },
          (err) => {
            return reject(err);
          }
        );
    });
    return promise;
  }
  //New function to check no and email exist or not
  whatsAppAndEmailCheck(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/check-mobile-email-exists',
          data
        )
        .toPromise()
        .then(
          (res) => resolve(res),
          (err) => {
            return reject(err);
          }
        );
    });
    return promise;
  }
  //Function to set the password for the operator registeration
  setPassOperator(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(this.environmentOperatorApi + 'operator/reset-password', data)
        .toPromise()
        .then(
          (res) => resolve(res),
          (err) => {
            return reject(err);
          }
        );
    });
    return promise;
  }
  //Function to send the email verification link again
  emailVerificationAgain(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(this.environmentOperatorApi + 'operator/resend-email', data)
        .toPromise()
        .then(
          (res) => resolve(res),
          (err) => {
            return reject(err);
          }
        );
    });
    return promise;
  }
  //Function to call the waypoints templates
  waypointTemplate(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(this.environmentOperatorApi + 'operator/retrieve-waypoints', data)
        .toPromise()
        .then(
          (res) => resolve(res),
          (err) => {
            return reject(err);
          }
        );
    });
    return promise;
  }
  resetPassword(data): Observable<any> {
    data = this.aesEcrypt(data);
    return this.http
      .post(
        this.environmentOperatorApi + 'operator/reset-password',
        data,
        this.headerInitializer()
      )
      .pipe(catchError(this.handleError))
      .pipe(
        map((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            // val = this.decryption(val);
            // val = this.mapMapDecryption(val);
          }
          return val;
        })
      );
  }

  // Whatsapp OTP verification
  whatsappOTPVerify(data) {
    data = this.aesEcrypt(data);
    // return this.http.post(this.environmentOperatorApi + 'whatsapp/verify-otp', data)
    //   .pipe(
    //     catchError(this.handleError)
    //   );
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(this.environmentOperatorApi + 'whatsapp/verify-otp', data)
        // , this.headerInitializer()
        .toPromise()
        .then(
          (res) => {
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
  // Whatsapp send OTP
  whatsappSendOTP(data) {
    data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'whatsapp/send-otp',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (res) => resolve(res),
          (err) => {
            reject(err);
          }
        );
    });
    return promise;
  }

  //Cognito LogIn
  signIn(operatorid, password) {
    const authenticationData = {
      Username: operatorid,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: operatorid,
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

  skipTourApi(operatorid) {
    const payload = {
      UserId: operatorid,
      SkipTour: true,
    };

    return this.http
      .post(
        this.environmentOperatorApi + 'operator/update-skip-tour',
        payload,
        this.headerInitializer()
      )
      .toPromise()
      .then((val: any) => {
        return val;
      })
      .catch(this.handleError);
  }

  logOut() {
    this.getAuthenticatedUser().signOut();
    // this.cookieService.deleteAll();
    this.cognitoUser = null;
    localStorage.clear();
  }
  getAuthenticatedUser() {
    // gets the current user from the local storage
    return userPool.getCurrentUser();
  }

  //By using Promises
  getProfileDetails(data): Promise<any> {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'operator/get-profile-details',
        data,
        this.headerInitializer()
      )
    )
      .then((val: any) => {
        if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
          // val = this.decryption(val);
          val = this.mapMapDecryption(val);
        }
        return val;
      })
      .catch(this.handleError);

    // return this.http
    //   .post(
    //     this.environmentOperatorApi + 'operator/get-profile-details',
    //     data,
    //     this.headerInitializer()
    //   )
    //   .toPromise()
    //   .then((val: any) => {
    //     if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
    //       // val = this.decryption(val);
    //       val = this.mapMapDecryption(val);
    //     }
    //     return val;
    //   })
    //   .catch(this.handleError);
  }

  //into promises
  getGuestProfileFile(): Promise<any> {
    return firstValueFrom(
      this.http.get(
        '../../../assets/files/GuestProfileData.json',
        this.headerInitializer()
      )
    )
      .then((val: any) => {
        if (val?.data?.MainData && val?.data?.MainData?.length !== 0) {
          val = this.mapMapDecryption(val);
        }
        return val;
      })
      .catch(this.handleError);

    // return new Promise((resolve, reject) => {
    //   this.http
    //     .get(
    //       '../../../assets/files/GuestProfileData.json',
    //       this.headerInitializer()
    //     )
    //     .pipe(catchError(this.handleError))
    //     .subscribe(
    //       (val: any) => {
    //         if (val?.data?.MainData && val?.data?.MainData?.length !== 0) {
    //           val = this.mapMapDecryption(val);
    //         }
    //         resolve(val);
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     );
    // });
  }

  getGuestNearbyAirport(): Promise<any> {
    return firstValueFrom(
      this.http.get(
        '../../../assets/files/GuestNearbyAirport.json',
        this.headerInitializer()
      )
    )
      .then((val: any) => {
        if (val?.data?.MainData && val?.data?.MainData?.length !== 0) {
          val = this.mapMapDecryption(val);
        }
        return val; // Resolve with the processed data
      })
      .catch(this.handleError);

    // return new Promise((resolve, reject) => {
    //   this.http
    //     .get(
    //       '../../../assets/files/GuestNearbyAirport.json',
    //       this.headerInitializer()
    //     )
    //     .pipe(
    //       catchError((error) => {
    //         reject(error); // Reject the promise on HTTP request error
    //         return throwError(error);
    //       })
    //     )
    //     .subscribe((val: any) => {
    //       if (val?.data?.MainData && val?.data?.MainData?.length !== 0) {
    //         val = this.mapMapDecryption(val);
    //       }
    //       resolve(val); // Resolve with the processed data
    //     });
    // });
  }

  getGuestElevationData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get(
          '../../../assets/files/GuestElevationData.json',
          this.headerInitializer()
        )
        .pipe(
          catchError((error) => {
            reject(error); // Reject the promise on HTTP request error
            return throwError(() => error);
          })
        )
        .subscribe((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length !== 0) {
            val = this.mapMapDecryption(val);
          }
          resolve(val); // Resolve with the processed data
        });
    });
  }

  //into promises
  getGuestMissionDetails(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get(
          '../../../assets/files/GuestMissionData.json',
          this.headerInitializer()
        )
        .pipe(
          catchError((error) => {
            reject(error); // Reject the promise on HTTP request error
            return throwError(() => error);
          })
        )
        .subscribe((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length !== 0) {
            val = this.mapMapDecryption(val);
          }
          resolve(val); // Resolve with the processed data
        });
    });
  }

  getRptoFormData(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/get-rpto-form',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            // let val = this.decryption(response);
            // let val = this.mapMapDecryption(response);
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        );
    }).catch((err) => {
      // console.log(err);
    });
    return promise;
  }

  sendCustomerData(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/guest-user-form-data',
          data,
          this.headerInitializerBy_X_Api_Key()
        )
        .toPromise()
        .then(
          (response) => {
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        );
    }).catch((err) => {
      // console.log(err);
    });
    return promise;
  }
  uploadRptoDocs(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/rpto-form-upload-doc',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            // let val = this.decryption(response);
            // let val = this.mapMapDecryption(response);
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        );
    }).catch((err) => {
      // console.log(err);
    });
    return promise;
  }

  deleteRptoDocs(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/rpto-form-delete-doc',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (response) => {
            // let val = this.decryption(response);
            // let val = this.mapMapDecryption(response);
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        );
    }).catch((err) => {
      // console.log(err);
    });
    return promise;
  }

  updateRptoForm(data) {
    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'operator/update-rpto-form',
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
        );
    }).catch((err) => {
      // console.log(err);
    });
    return promise;
  }

  getGuestProfileDetails(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'operator/get-guest-profile-details',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        // let val = this.decryption(response);
        let val = this.mapMapDecryption(response);
        this.guestProfileDetailsDataSubject.next(val);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'operator/get-guest-profile-details',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (response) => {
    //         // let val = this.decryption(response);
    //         let val = this.mapMapDecryption(response);
    //         this.guestProfileDetailsDataSubject.next(val);
    //         resolve(val);
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     );
    // }).catch((err) => {
    //   // console.log(err);
    // });
    // return promise;
  }

  getCountryList() {
    return firstValueFrom(
      this.http.get(
        this.environmentOperatorApi + 'country/get-country-list'
        // this.headerInitializer()
      )
    )
      .then((res) => {
        // console.log(res,"before");
        // resolve(res)
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .get(
    //       this.environmentOperatorApi + 'country/get-country-list'
    //       // this.headerInitializer()
    //     )
    //     // , this.headerInitializer()
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // console.log(res,"before");
    //         // resolve(res)
    //         let val = this.mapMapDecryption(res);
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

  //To get the state name in the UI card
  getStateName(lat, lon) {
    return firstValueFrom(
      this.http.get(
        `${this.openWeatherState}/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${environment.openWeatherapiKey}`
      )
    );

    // return this.http
    //   .get(
    //     `${this.openWeatherState}/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${environment.openWeatherapiKey}`
    //   )
    //   .toPromise();
  } //To get the country code in the UI card
  getCountryCode(lat, lon) {
    return firstValueFrom(
      this.http.get(
        `${this.openWeatherState}/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${environment.openWeatherapiKey}`
      )
    );

    // return this.http
    //   .get(
    //     `${this.openWeatherState}/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${environment.openWeatherapiKey}`
    //   )
    //   .toPromise();
  }

  //Drones and Gears list
  // getDronesAndGearsList(data) {
  //   // data = this.encryption(data);
  //   data = this.aesEcrypt(data);
  //   let promise = new Promise((resolve, reject) => {
  //     this.http
  //       .post(
  //         this.environmentOperatorApi + 'drone-and-gear/get-drones-gears-list',
  //         data,
  //         this.headerInitializer()
  //       )
  //       .toPromise()
  //       .then(
  //         (response) => {
  //           // resolve(response);
  //           let val = this.mapMapDecryption(response);
  //           resolve(val);
  //         },
  //         (error) => {
  //           reject(error);
  //         }
  //       );
  //   }).catch((err) => {
  //     // console.log(err);
  //   });
  //   return promise;
  // }

  //Drones and Gears list API as service
  getDronesAndGearsList(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'drone-and-gear/get-drones-gears-list',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        // resolve(response);
        let val = this.mapMapDecryption(response);
        this.dronesAndGearsDataSubject.next(val);
        return val;
      })
      .catch(this.handleError);
  }

  //Drones and Gears
  droneRegistration(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'drone-and-gear/drone-registration',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        let val = this.mapMapDecryption(response);
        // let val = this.decryption(response);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'drone-and-gear/drone-registration',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (response) => {
    //         let val = this.mapMapDecryption(response);
    //         // let val = this.decryption(response);
    //         resolve(val);
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     );
    // }).catch((err) => {
    //   // console.log(err);
    // });
    // return promise;
  }

  droneUpdation(data) {
    data = this.aesEcrypt(data);
    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'drone-and-gear/update-drone-details',

        // drone-and-gear/edit-drone-details',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        let val = this.mapMapDecryption(response);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'drone-and-gear/update-drone-details',

    //       // drone-and-gear/edit-drone-details',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (response) => {
    //         let val = this.mapMapDecryption(response);
    //         resolve(val);
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     );
    // }).catch((err) => {
    //   // console.log(err);
    // });
    // return promise;
  }

  droneDelete(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'drone-and-gear/delete-drone',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        let val = this.mapMapDecryption(response);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'drone-and-gear/delete-drone',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (response) => {
    //         let val = this.mapMapDecryption(response);
    //         resolve(val);
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     );
    // }).catch((err) => {
    //   // console.log(err);
    // });
    // return promise;
  }

  whatsAppDroneListAssign(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'drone-and-gear/assign-drone-wp-mission',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        let val = this.mapMapDecryption(response);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi +
    //         'drone-and-gear/assign-drone-wp-mission',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (response) => {
    //         let val = this.mapMapDecryption(response);
    //         resolve(val);
    //         // resolve(response)
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     );
    // }).catch((err) => {
    //   // console.log(err);
    // });
    // return promise;
  }

  whatsAppDroneListUnassign(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi +
          'drone-and-gear/unassign-drone-wp-mission',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        let val = this.mapMapDecryption(response);
        return val;
        // resolve(response)
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi +
    //         'drone-and-gear/unassign-drone-wp-mission',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (response) => {
    //         let val = this.mapMapDecryption(response);
    //         resolve(val);
    //         // resolve(response)
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     );
    // }).catch((err) => {
    //   // console.log(err);
    // });
    // return promise;
  }

  getDroneParameters() {
    return firstValueFrom(
      this.http.get(
        this.environmentOperatorApi + 'drop-down/get-drone-parameters',
        this.headerInitializer()
      )
    )
      .then((response) => {
        let val = this.mapMapDecryption(response);
        // resolve(val);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .get(
    //       this.environmentOperatorApi + 'drop-down/get-drone-parameters',
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (response) => {
    //         let val = this.mapMapDecryption(response);
    //         // resolve(val);
    //         resolve(val);
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     );
    // }).catch((err) => {
    //   // console.log(err);
    // });
    // return promise;
  }

  //BY using the Promises
  getOperatorsList(data): Promise<any> {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'drone-and-gear/get-operators-list',
        data,
        this.headerInitializer()
      )
    )
      .then((val: any) => {
        if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
          // val = this.decryption(val);
          val = this.mapMapDecryption(val);
        }
        return val;
      })
      .catch(this.handleError);

    // return this.http
    //   .post(
    //     this.environmentOperatorApi + 'drone-and-gear/get-operators-list',
    //     data,
    //     this.headerInitializer()
    //   )
    //   .toPromise()
    //   .then((val: any) => {
    //     if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
    //       // val = this.decryption(val);
    //       val = this.mapMapDecryption(val);
    //     }
    //     return val;
    //   })
    //   .catch(this.handleError);
  }
  //Missions
  // getMissionList(data): Observable<any> {
  //   return this.http
  //     .post(
  //       this.environmentOperatorApi + 'mission/get-mission-list',
  //       data,
  //       this.headerInitializer()
  //     )
  //     .pipe(catchError(this.handleError));
  // }
  getMissionList(data): Promise<any> {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'mission/get-mission-list',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        // resolve(res);
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'mission/get-mission-list',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // resolve(res);
    //         let val = this.mapMapDecryption(res);
    //         resolve(val);
    //       },
    //       (err) => {
    //         reject(err);
    //       }
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       this.handleError(err);
    //       //  console.log(err)
    //     });
    // });
    // return promise;
  }

  //By using the promises
  createMission(data): Promise<any> {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'mission/create-mission',
        data,
        this.headerInitializer()
      )
    )
      .then((val: any) => {
        if (val?.data?.MainData && val?.data?.MainData != 0) {
          // val = this.decryption(val)
          val = this.mapMapDecryption(val);
        }
        return val;
      })
      .catch(this.handleError);

    // return this.http
    //   .post(
    //     this.environmentOperatorApi + 'mission/create-mission',
    //     data,
    //     this.headerInitializer()
    //   )
    //   .toPromise()
    //   .then((val: any) => {
    //     if (val?.data?.MainData && val?.data?.MainData != 0) {
    //       // val = this.decryption(val)
    //       val = this.mapMapDecryption(val);
    //     }
    //     return val;
    //   });
  }

  //Compliance document
  storeDocuments(data): Promise<any> {
    // data = this.encryption(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'mission/compliance-documents',
        data,
        this.headerInitializer()
      )
    ).catch(this.handleError);

    // return this.http
    //   .post(
    //     this.environmentOperatorApi + 'mission/compliance-documents',
    //     data,
    //     this.headerInitializer()
    //   )
    //   .toPromise()
    //   .catch(this.handleError);
    // .then((val: any) => {
    //   if (val?.data?.MainData && val?.data?.MainData != []) {
    //     val = this.decryption(val)
    //   }
    //   return val;
    // });
  }

  //Preflight document
  preflightDocument(data): Observable<any> {
    // data= this.aesEcrypt(data);
    return this.http
      .post(
        this.environmentOperatorApi + 'report/preflight-report',
        data,
        this.headerInitializer()
      )
      .pipe(catchError(this.handleError));
  }
  // startMission(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http
  //     .post(
  //       this.environmentOperatorApi + 'mission/start-mission',
  //       data,
  //       this.headerInitializer()
  //     )
  //     .pipe(catchError(this.handleError))
  //     .pipe(
  //       map((val: any) => {
  //         if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //           val = this.decryption(val);
  //         }
  //         return val;
  //       })
  //     );
  // }
  startMission(data): Promise<any> {
    // data = this.encryption(data);

    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'mission/start-mission',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        // let val = this.decryption(response);
        let val = this.mapMapDecryption(response);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'mission/start-mission',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (response) => {
    //         // let val = this.decryption(response);
    //         let val = this.mapMapDecryption(response);
    //         resolve(val);
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       this.handleError(err);
    //       //  console.log(err)
    //     });
    // });
    // return promise;
  }

  // endMission(data): Observable<any> {
  //   data = this.encryption(data);
  //   return this.http
  //     .post(
  //       this.environmentOperatorApi + 'mission/end-mission',
  //       data,
  //       this.headerInitializer()
  //     )
  //     .pipe(catchError(this.handleError))
  //     .pipe(
  //       map((val: any) => {
  //         if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
  //           val = this.decryption(val);
  //         }
  //         return val;
  //       })
  //     );
  // }
  endMission(data): Promise<any> {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'mission/end-mission',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        // let val = this.decryption(response);
        let val = this.mapMapDecryption(response);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'mission/end-mission',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (response) => {
    //         // let val = this.decryption(response);
    //         let val = this.mapMapDecryption(response);
    //         resolve(val);
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       this.handleError(err);
    //       //  console.log(err)
    //     });
    // });
    // return promise;
  }

  //Mission Module - BlackBox
  // Blackbox mission list
  getBlackBoxList(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'dashboard/get-mission-list',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        // let val = this.decryption(response);
        let val = this.mapMapDecryption(response);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'dashboard/get-mission-list',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // resolve(res);
    //         let val = this.mapMapDecryption(res);
    //         resolve(val);
    //       },
    //       (err) => {
    //         reject(err);
    //       }
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       this.handleError(err);
    //       //  console.log(err)
    //     });
    // });
    // return promise;
  }
  //Blackbox Mission Detail
  getBlackBoxMissionDetail(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'dashboard/get-blackbox-mission-logs',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        // let val = this.decryption(response);
        let val = this.mapMapDecryption(response);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   return this.http
    //     .post(
    //       this.environmentOperatorApi + 'dashboard/get-blackbox-mission-logs',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // resolve(res);
    //         let val = this.mapMapDecryption(res);
    //         resolve(val);
    //       },
    //       (error) => reject(error)
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       // console.log(err);
    //       this.handleError(err);
    //     });
    // });
    // return promise;
  }

  getBlackboxMessages(data) {
    // data = this.aesEcrypt(data);
    let promise = new Promise((resolve, reject) => {
      return this.http
        .post(
          this.environmentOperatorApi + 'dashboard/get-msg-info-logs',
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

  async getSingleDroneDetails(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'drone-and-gear/get-single-drone-details',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   return this.http
    //     .post(
    //       this.environmentOperatorApi +
    //         'drone-and-gear/get-single-drone-details',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         resolve(res);
    //       },
    //       (error) => reject(error)
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       // console.log(err);
    //       this.handleError(err);
    //     });
    // });
    // return promise;
  }

  //By using promises
  getAllActivityType(): Promise<any> {
    return firstValueFrom(
      this.http.get(
        this.environmentOperatorApi + 'drop-down/get-activity-type',
        this.headerInitializer()
      )
    )
      .then((val: any) => {
        if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
          // val = this.decryption(val);
          val = this.mapMapDecryption(val);
        }
        return val;
      })
      .catch(this.handleError);

    // return this.http
    //   .get(
    //     this.environmentOperatorApi + 'drop-down/get-activity-type',
    //     this.headerInitializer()
    //   )
    //   .toPromise()
    //   .then((val: any) => {
    //     if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
    //       // val = this.decryption(val);
    //       val = this.mapMapDecryption(val);
    //     }
    //     return val;
    //   })
    //   .catch(this.handleError);
  }

  //By using promises
  getAllFlightPurpose(): Promise<any> {
    return firstValueFrom(
      this.http.get(
        this.environmentOperatorApi + 'drop-down/get-flight-purpose',
        this.headerInitializer()
      )
    )
      .then((val: any) => {
        // val = this.decryption(val);
        val = this.mapMapDecryption(val);

        return val;
      })
      .catch(this.handleError);

    // return this.http
    //   .get(
    //     this.environmentOperatorApi + 'drop-down/get-flight-purpose',
    //     this.headerInitializer()
    //   )
    //   .toPromise()
    //   .then((val: any) => {
    //     let dec = this.mapMapDecryption(val);
    //     return dec;
    //   })
    //   .catch(this.handleError);
  }

  //Plane Finder
  getLatestPlaneFinderData(data) {
    // data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi +
          'dashboard/get-plane-finder-data-by-country',
        data,
        // this.headerInitializer()
        this.headerInitializerBy_X_Api_Key()
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   return this.http
    //     .post(
    //       this.environmentOperatorApi +
    //         'dashboard/get-plane-finder-data-by-country',
    //       data,
    //       // this.headerInitializer()
    //       this.headerInitializerBy_X_Api_Key()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // resolve(res);
    //         // let val = this.mapMapDecryption(res);
    //         // console.log(res);
    //         resolve(res);
    //       },
    //       (err) => reject(err)
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       // console.log(err);
    //       this.handleError(err);
    //     });
    // });
    // return promise;
  }
  getPodsData() {
    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi +
          'maps/get-pod-hubs',
        this.headerInitializerBy_X_Api_Key()
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch(this.handleError);
  }

  //Active Airspace - Buffer Region
  getActiveBufferRegions(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'mission/get-buffer-region',
        data,
        this.headerInitializer()
      )
    )
      .then((res: any) => {
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'mission/get-buffer-region',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // resolve(res);
    //         let val = this.mapMapDecryption(res);
    //         resolve(val);
    //       },
    //       (error) => reject(error)
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       // console.log(err);
    //       this.handleError(err);
    //     });
    // });
    // return promise;
  }

  createMissionLogs(data): Promise<any> {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'mission/create-mission-logs',
        data,
        this.headerInitializer()
      )
    )
      .then((response) => {
        // let val = this.decryption(response);
        let val = this.mapMapDecryption(response);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'mission/create-mission-logs',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (response) => {
    //         // let val = this.decryption(response);
    //         let val = this.mapMapDecryption(response);
    //         resolve(val);
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       this.handleError(err);
    //       //  console.log(err)
    //     });
    // });
    // return promise;
  }

  updateMissionLogs(data): Promise<any> {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'mission/update-mission-logs',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        // resolve(res);
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   return this.http
    //     .post(
    //       this.environmentOperatorApi + 'mission/update-mission-logs',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // resolve(res);
    //         let val = this.mapMapDecryption(res);
    //         resolve(val);
    //       },
    //       (err) => reject(err)
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       // console.log(err);
    //       this.handleError(err);
    //     });
    // });
    // return promise;
  }

  //Updating the live streaming mode
  updateLiveStreamMode(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'mission/update-uav-log-mode',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        // resolve(res);
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'mission/update-uav-log-mode',
    //       data,
    //       this.headerInitializer()
    //     )
    //     // , this.headerInitializer()
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // resolve(res);
    //         let val = this.mapMapDecryption(res);
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

  //Blackbox - Drone Trailing
  getDroneTrailingInitially(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'dashboard/get-dronetrailing-firsttime',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        // resolve(res);
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    let promise = new Promise((resolve, reject) => {
      return this.http
        .post(
          this.environmentOperatorApi + 'dashboard/get-dronetrailing-firsttime',
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
          (err) => reject(err)
        )
        .catch((err) => {
          reject(err);
          // console.log(err);
          this.handleError(err);
        });
    });
    return promise;
  }

  getDroneTrailingContinuously(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'dashboard/get-dronetrailing-secondtime',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        // resolve(res);
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   return this.http
    //     .post(
    //       this.environmentOperatorApi +
    //         'dashboard/get-dronetrailing-secondtime',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // resolve(res);
    //         let val = this.mapMapDecryption(res);
    //         resolve(val);
    //       },
    //       (err) => reject(err)
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       // console.log(err);
    //       this.handleError(err);
    //     });
    // });
    // return promise;
  }

  //Weather
  //By using promises
  // getCurrentWeather(lat: number, lon: number) {
  //   return firstValueFrom(
  //     this.http.get(
  //       `${environment.openWeatherUrl}/weather?lat=${lat}&lon=${lon}&appid=${environment.openWeatherapiKey}`
  //     )
  //   );
  //   // return this.http
  //   //   .get(
  //   //     `${environment.openWeatherUrl}/weather?lat=${lat}&lon=${lon}&appid=${environment.openWeatherapiKey}`
  //   //   )
  //   //   .toPromise();
  // }

  //new API for weather by weather Union
  getCurrentWeather_WeatherUnion(data) {
    // data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'dashboard/get-weather',
        data,
        // this.headerInitializer()
        this.headerInitializerBy_X_Api_Key()
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch(this.handleError);
  }

  //By using promises
  getCurrentWeatherByCityName(cityName) {
    return firstValueFrom(
      this.http.get(
        `${environment.openWeatherUrl}/weather?q=${cityName},IN&appid=${environment.openWeatherapiKey}`
      )
    );

    return this.http
      .get(
        `${environment.openWeatherUrl}/weather?q=${cityName},IN&appid=${environment.openWeatherapiKey}`
      )
      .toPromise();
  }

  getCityName(lat, long) {
    return firstValueFrom(
      this.http.get(
        `${environment.getCityAndLatLong}/reverse?lat=${lat}&lon=${long}&limit=1&appid=${environment.openWeatherapiKey}`
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .get(
    //       `${environment.getCityAndLatLong}/reverse?lat=${lat}&lon=${long}&limit=1&appid=${environment.openWeatherapiKey}`
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => resolve(res),
    //       (err) => {
    //         // Error
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }

  //Load NoflyZoneJSON
  // noFlyZoneJSONIndia(): Observable<any> {
  //   return this.http.get('../../../assets/files/arcGIS-India-NoFlyZone.json');
  // }
  // noFlyZoneJSONIreland(): Observable<any> {
  //   return this.http.get('../../../assets/files/arcGIS-Ireland-NoFlyZone.json');
  // }

  //Maps layer from backend
  getvfrs(data): Observable<any> {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);

    return this.http
      .post(
        this.environmentOperatorApi + 'maps/get-vfrs',
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
        this.environmentOperatorApi + 'maps/get-airports',
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
    // data = this.encryption(data);
    return this.http
      .get(
        this.environmentOperatorApi + 'maps/get-warningzones',
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

  //By using promises
  // getindiaBoudnary(): Promise<any> {
  //   let promise = new Promise(async (resolve, reject) => {
  //     let cache = await this.getDataFromCache('IndiaBoundry');
  //     if (cache && !this.cacheInvalidate) {
  //       const decryptedData = this.mapMapDecryption(cache);
  //       resolve(decryptedData);
  //     } else {
  //       this.http
  //         .get(
  //           this.environmentOperatorApi + 'maps/get-india-boundary',
  //           // this.headerInitializer()
  //           this.headerInitializerBy_X_Api_Key()
  //         )
  //         .toPromise()
  //         .then(
  //           (val: any) => {
  //             if (val.data.MainData && val.data.MainData.length != 0) {
  //               this.storeInCache('IndiaBoundry', val);
  //               val = this.mapMapDecryption(val);
  //             }
  //             resolve(val);
  //           },
  //           (err) => {
  //             // Error
  //             reject(err);
  //           }
  //         );
  //     }
  //   });
  //   return promise;
  // }

  async getindiaBoudnary(): Promise<any> {
    let cache = await this.getDataFromCache('IndiaBoundry');
    if (cache && !this.cacheInvalidate) {
      const decryptedData = this.mapMapDecryption(cache);
      return decryptedData;
    } else {
      return firstValueFrom(
        this.http.get(
          this.environmentOperatorApi + 'maps/get-india-boundary',
          // this.headerInitializer()
          this.headerInitializerBy_X_Api_Key()
        )
      )
        .then((val: any) => {
          if (val.data.MainData && val.data.MainData.length != 0) {
            this.storeInCache('IndiaBoundry', val);
            val = this.mapMapDecryption(val);
          }
          return val;
        })
        .catch(this.handleError);
    }
  }

  async getFIRs(data): Promise<any> {
    let encryptedData = this.aesEcrypt(data);

    let cache = await this.getDataFromCache('FIRMapLayer');
    if (cache && !this.cacheInvalidate) {
      const decryptedData = this.mapMapDecryption(cache);
      return decryptedData;
    } else {
      return firstValueFrom(
        this.http.post(
          this.environmentOperatorApi + 'maps/get-fir',
          encryptedData,
          this.headerInitializerBy_X_Api_Key()
        )
      )
        .then((val: any) => {
          if (val.data.MainData && val.data.MainData.length != 0) {
            this.storeInCache('FIRMapLayer', val);
            val = this.mapMapDecryption(val);
          }
          return val;
        })
        .catch(this.handleError);
    }
  }

  getIntersectedEntity(data): Promise<any> {
    // data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'turf/intersection-entity',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'turf/intersection-entity',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (val: any) => {
    //         // if (val.data.MainData && val.data.MainData.length != 0) {
    //         //   val = this.mapMapDecryption(val);
    //         // }
    //         resolve(val);
    //       },
    //       (err) => {
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }
  getReservedEntity(data): Promise<any> {
    // data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'turf/reserved-airspace-entity',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'turf/reserved-airspace-entity',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (val: any) => {
    //         // if (val.data.MainData && val.data.MainData.length != 0) {
    //         //   val = this.mapMapDecryption(val);
    //         // }
    //         resolve(val);
    //       },
    //       (err) => {
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }
  getPointCorrelationWithPolygon(data): Promise<any> {
    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'turf/check-point-in-polygon',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'turf/check-point-in-polygon',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (val: any) => {
    //         resolve(val);
    //       },
    //       (err) => {
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }
  getPolyLineVolume(data): Promise<any> {
    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'turf/polyline-volume',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'turf/polyline-volume',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (val: any) => {
    //         resolve(val);
    //       },
    //       (err) => {
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }
  getBuffer(data): Promise<any> {
    // data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'turf/get-buffer',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          this.environmentOperatorApi + 'turf/get-buffer',
          data,
          this.headerInitializer()
        )
        .toPromise()
        .then(
          (val: any) => {
            // if (val.data.MainData && val.data.MainData.length != 0) {
            //   val = this.mapMapDecryption(val);
            // }
            resolve(val);
          },
          (err) => {
            reject(err);
          }
        );
    });
    return promise;
  }
  getFirIntersection(data): Promise<any> {
    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'turf/fir-intersaction',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'turf/fir-intersaction',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (val: any) => {
    //         resolve(val);
    //       },
    //       (err) => {
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }
  // getGeoFence(): Observable<any> {
  //   // return this.http
  //   //   .get(
  //   //     this.environmentOperatorApi + 'maps/get-geozone',
  //   //     this.headerInitializer()
  //   //   )
  //   //   .pipe(catchError(this.handleError));

  //   return this.http
  //     .get(
  //       '../../../assets/files/GeoZoneIndia_V9.geojson',
  //       this.headerInitializer()
  //     )
  //     .pipe(catchError(this.handleError));

  //   // return this.http.get('../../../assets/files/GeoFence V7.geojson');
  // }
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
  getNoFlyZone(): Observable<any> {
    return this.http
      .get(
        this.environmentOperatorApi + 'maps/get-noflyzones',
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
        this.environmentOperatorApi + 'maps/get-yellowinnerzones',
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
        this.environmentOperatorApi + 'maps/get-yellowzones',
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
  cleanData(data) {
    // Check if the data is an object
    if (typeof data === 'object' && data !== null) {
      // Iterate over each property
      for (let key in data) {
        // Check if the property is an object or array
        if (typeof data[key] === 'object' && data[key] !== null) {
          // Recursively clean nested objects or arrays
          this.cleanData(data[key]);
        } else if (key === 'styleUrl' || data[key] === '') {
          // Remove unwanted properties or empty strings
          delete data[key];
        }
      }
    }
    // Return the cleaned data
    return data;
  }

  getNoFlyZoneDubai() {
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
    //     this.environmentOperatorApi + 'maps/get-dubai-noflyzones',
    //     this.headerInitializer()
    //   )
    //   .pipe(
    //     map((response) => {
    //       let val = this.mapMapDecryption(response);
    //       return val;
    //     }),
    //     catchError(this.handleError)
    //   );
    // return this.http.get('../../../assets/files/Dubai NoFlyZone.geojson')
    //   .pipe(
    //     catchError(this.handleError)
    //   );
  }
  cleanJSON(data) {
    if (typeof data === 'string') {
      return data.replace(/\\+/g, '');
    } else if (typeof data === 'object' && data !== null) {
      for (let key in data) {
        data[key] = this.cleanJSON(data[key]);
      }
    }
    // Return the cleaned data
    return data;
  }
  getFICDubai() {
    return firstValueFrom(
      this.http.get(
        '../../../assets/files/FICUAE.json',
        this.headerInitializer()
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // return new Promise((resolve, reject) => {
    //   this.http
    //     .get('../../../assets/files/FICUAE.json', this.headerInitializer())
    //     .toPromise()
    //     .then((val: any) => {
    //       resolve(val);
    //     })
    //     .catch((error) => {
    //       this.handleError(error);
    //       reject(error);
    //     });
    // });
  }
  getMilitaryNoFlyZone(): Observable<any> {
    return this.http
      .get(
        this.environmentOperatorApi + 'maps/get-ie-vfr',
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

  async getMapLayers(data) {
    let encryptedData = this.aesEcrypt(data);
    let cache = await this.getDataFromCache(data.MapLayer);
    if (cache && !this.cacheInvalidate) {
      const decryptedData = this.mapMapDecryption(cache);
      return decryptedData;
    } else {
      return firstValueFrom(
        this.http.post(
          this.environmentOperatorApi + 'maps/get-map-layer',
          encryptedData,
          // this.headerInitializer()
          this.headerInitializerBy_X_Api_Key()
        )
      )
        .then((val: any) => {
          if (val.data.MainData && val.data.MainData.length != 0) {
            this.storeInCache(data.MapLayer, val);
            val = this.mapMapDecryption(val);
          }
          return val;
        })
        .catch(this.handleError);
    }

    // let promise = new Promise(async (resolve, reject) => {
    //   let cache = await this.getDataFromCache(data.MapLayer);
    //   if (cache && !this.cacheInvalidate) {
    //     const decryptedData = this.mapMapDecryption(cache);
    //     resolve(decryptedData);
    //   } else {
    //     this.http
    //       .post(
    //         this.environmentOperatorApi + 'maps/get-map-layer',
    //         encryptedData,
    //         // this.headerInitializer()
    //         this.headerInitializerBy_X_Api_Key()
    //       )
    //       .toPromise()
    //       .then(
    //         (val: any) => {
    //           if (val.data.MainData && val.data.MainData.length != 0) {
    //             this.storeInCache(data.MapLayer, val);
    //             val = this.mapMapDecryption(val);
    //           }
    //           resolve(val);
    //         },
    //         (err) => {
    //           // Error
    //           reject(err);
    //         }
    //       );
    //   }
    // });
    // return promise;
  }

  storeInCache(key, value) {
    // // localStorage.setItem(key, JSON.stringify(value));
    // console.log({
    //   MapLayerName: key,
    //   ...value,
    // });

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
          // console.log(data);
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

  //Payments
  getPaymentPlans() {
    return firstValueFrom(
      this.http.get(
        this.environmentOperatorApi +
          'payment-gateway/get-subscription-plan-details',
        this.headerInitializer()
      )
    )
      .then((res) => {
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .get(
    //       this.environmentOperatorApi +
    //         'payment-gateway/get-subscription-plan-details',
    //       this.headerInitializer()
    //     )
    //     // , this.headerInitializer()
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         let val = this.mapMapDecryption(res);
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
  createOrderId(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'payment-gateway/get-razorpay-order-id',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'payment-gateway/get-razorpay-order-id',
    //       data,
    //       this.headerInitializer()
    //     )
    //     // , this.headerInitializer()
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         let val = this.mapMapDecryption(res);
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
  updatePaymentSucess(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi +
          'payment-gateway/payment-success-response',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi +
    //         'payment-gateway/payment-success-response',
    //       data,
    //       this.headerInitializer()
    //     )
    //     // , this.headerInitializer()
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         let val = this.mapMapDecryption(res);
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

  // @SL - CCAvenue payment flow
  getCCAvenueEncrypt(data) {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        `${this.environmentOperatorApi}payment-gateway/get-ccavenue-encrypt-data`,
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    let promise = new Promise((resolve, reject) => {
      this.http
        .post(
          `${this.environmentOperatorApi}payment-gateway/get-ccavenue-encrypt-data`,
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
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }

  //Testing
  test() {
    return this.http
      .get(
        'https://gis.icao.int/ArcGIS/rest/services/WORLDROUTE/MapServer/19?f=json&pretty=true',
        this.headerForCROS()
      )
      .pipe(catchError(this.handleError));
  }
  testFlyZone(): Observable<any> {
    // var express = require('express')
    // var cors = require('cors')
    // var app = express()
    // var corsOptions = {
    //   origin: 'https://gis.icao.int',
    //   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    // }
    // return app.get('https://gis.icao.int/ArcGIS/rest/services/WORLDROUTE/MapServer/23/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&maxAllowableOffset=2445&geometry={"xmin":10214067.209044807,"ymin":2558820.24617387,"xmax":10886324.44353,"ymax":3231077.480659064,"spatialReference":{"wkid":102100,"latestWkid":3857}}&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100&layer={"source":{"type":"dataLayer","dataSource":{"type":"table","workspaceId":"MyDatabaseWorkspaceIDSSR2","dataSourceName":"ss6.gdb.Lakes"}}}', cors(corsOptions), function (req, res, next) {
    //   res.json({ msg: 'This is CORS-enabled for only example.com.' })
    // })
    // .pipe(
    //       catchError(this.handleError)
    //     );
    // return this.http.get('https://gis.icao.int/ArcGIS/rest/services/WORLDROUTE/MapServer/23/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&maxAllowableOffset=2445&geometry={"xmin":10214067.209044807,"ymin":2558820.24617387,"xmax":10886324.44353,"ymax":3231077.480659064,"spatialReference":{"wkid":102100,"latestWkid":3857}}&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100&layer={"source":{"type":"dataLayer","dataSource":{"type":"table","workspaceId":"MyDatabaseWorkspaceIDSSR2","dataSourceName":"ss6.gdb.Lakes"}}}',this.headerForCROS())
    // // , this.headerForCROS()
    // // .pipe(
    // //   tap(_ => this.log('fetched heroes')),
    // //   catchError(this.handleError<Hero[]>('getHeroes', []))
    // // );
    //   .pipe(
    //     catchError(this.handleError)
    //   );

    let data = {
      xmin: 79.6765478971305,
      ymin: 10.8429870516846,
      xmax: 85.7155373831102,
      ymax: 16.7054375699158,
      spatialReference: {
        wkid: 4326,
      },
    };
    let result = from(
      // wrap the fetch in a from if you need an rxjs Observable
      fetch(
        'https://gis.icao.int/ArcGIS/rest/services/WORLDROUTE/MapServer/23/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&maxAllowableOffset=2445&geometry={"xmin":10214067.209044807,"ymin":2558820.24617387,"xmax":10886324.44353,"ymax":3231077.480659064,"spatialReference":{"wkid":102100,"latestWkid":3857}}&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100&layer={"source":{"type":"dataLayer","dataSource":{"type":"table","workspaceId":"MyDatabaseWorkspaceIDSSR2","dataSourceName":"ss6.gdb.Lakes"}}}',
        {
          // headers: {
          //   'Content-Type': 'application/json',
          // },
          method: 'GET',
          mode: 'no-cors',
        }
      )
    );
    return result;
  }
  //RSA Testing
  testForRSA(data): Observable<any> {
    // data = this.encryption(data);
    // data = this.aesEcrypt(data);
    // data = {
    //   "data": [
    //     "H5sd9RjD8xfJsKrbquOD7pxcYe5x7t3LlF+9KqeTDJw8Gbgj0hLHMQoTQEesx0L7lGJbVSWSJKAc2J3Rgoqw47mhbarSG2Xrekt5RtGwP6d9eSej2xjIL/oSfkEXE0Zs9HCwAHO09k6mMw/VTQRXo1dri4BObSyXqllBzZF3zHPXzszQr1JIwM9bGYVM6iK1h9tdO1dH6vh29ylIfQktjHn7d1yI3ouHizPdw6JSMpkLCyFJy1EjmJcJ7feRfVwv4hwog1QRB2pSiFaYhSEDUwtcGPMCBgPbd48oWr1lDNuKhhDoDYM1hQfeHQd4gb6LMtwkBSCKDPghYCEwGjvt/WPtWVRH4/zMUR63DIO6s6GqbWyj8oeHNc8srdfPCGSRbafcJ5VKP7qRCDWjOizo6L+mcEgQVuzx9Gd0y3PTqxKXjaR6jhOVJae5Has0nnhAWMmAy+e8Kgds0QSyQibMIYuimKFUcT8BwlYPMykK4A5RxTnRvsRk9hK4yu/FIIo0g5fCBQO9YpR+ClZcce75qQIdZqbGZZJx7BC7bBN7jof+GHBmgls1H2hc4hk9QpEVC67CoAt9q1+IO3tuE5ZxvWsZsWG/UJoeyThSF3/JZdGa17Lulh9hXPfZX5TTuVO+YLrjvxuz9MXOVMCcucnQ+Wa15VewWpmb1Pg+nClqwb4="
    //   ]
    // }

    return this.http
      .post(
        this.environmentOperatorApi + 'dashboard/test-encryption-api',
        data,
        this.headerInitializer()
      )
      .pipe(catchError(this.handleError))
      .pipe(
        map((val: any) => {
          if (val?.data?.MainData && val?.data?.MainData?.length != 0) {
            // val = this.decryption(val);
            // val = this.mapMapDecryption(val);
          }
          return val;
        })
      );
  }

  //Download Reports
  download(url: string): Observable<any> {
    // let headers = this.headerInitializer();
    // headers = {
    //   // ...headers,
    //   responseType: 'blob',
    //   'Content-type': 'application/pdf',
    //   'Access-Control-Allow-Origin': '*'
    // }
    // SamplePreflightResponseBase64.txt
    // SamplePreflightResponse.txt
    return this.http.get(
      '../../../assets/files/SamplePreflightResponseBase64.txt'
    );
  }
  preAndPostFlightReportDownload(data) {
    // data = this.encryption(data);
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'report/get-pre-and-post-flight-report',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   return this.http
    //     .post(
    //       this.environmentOperatorApi + 'report/get-pre-and-post-flight-report',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         let val = this.mapMapDecryption(res);
    //         resolve(val);
    //         // resolve(res);
    //       },
    //       (err) => reject(err)
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       // console.log(err);
    //       this.handleError(err);
    //     });
    // });
    // return promise;
  }

  //Onelap APIs
  oneLapHeader() {
    let httpHeaders = new HttpHeaders();
    httpHeaders = httpHeaders.append('Authorization', environment.oneLapAuth);
    let httpOptions = {
      headers: httpHeaders,
    };
    return httpOptions;
  }
  getOneLapLiveData(oneLapId) {
    return firstValueFrom(
      this.http.get(
        environment.oneLapDynamicUrl + oneLapId,
        this.oneLapHeader()
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .get(environment.oneLapDynamicUrl + oneLapId, this.oneLapHeader())
    //     .toPromise()
    //     .then(
    //       (res) => resolve(res),
    //       (err) => {
    //         // Error
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }

  // one-lap api for token and one-lap id
  async getOneLapIdAndToken(payload) {
    // data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'drone-and-gear/get-onelap-authkey',
        payload,
        this.headerInitializer()
      )
    )
      .then((res) => {
        // setting the oneLapToken in variable to futher use
        this.oneLapToken = res['data'].token;
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   return this.http
    //     .post(
    //       this.environmentOperatorApi + 'drone-and-gear/get-onelap-authkey',
    //       payload,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // setting the oneLapToken in variable to futher use
    //         this.oneLapToken = res['data'].token;
    //         resolve(res);
    //       },
    //       (error) => reject(error)
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       // console.log(err);
    //       this.handleError(err);
    //     });
    // });
    // return promise;
  }

  getOneLapLiveDataWithToken(oneLapId) {
    let httpHeaders = new HttpHeaders();
    httpHeaders = httpHeaders.append('Authorization', this.oneLapToken);
    let httpOptions = {
      headers: httpHeaders,
    };

    return firstValueFrom(
      this.http.get(environment.oneLapDynamicUrl + oneLapId, httpOptions)
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .get(environment.oneLapDynamicUrl + oneLapId, httpOptions)
    //     .toPromise()
    //     .then(
    //       (res) => resolve(res),
    //       (err) => {
    //         // Error
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }

  rejectMission(payload) {
    let url = this.environmentOperatorApi + 'mission/delete-mission';
    let data = this.aesEcrypt(payload);

    return firstValueFrom(this.http.post(url, data, this.headerInitializer()))
      .then((res) => {
        // Success
        const dcryptDate = this.mapMapDecryption(res);
        return dcryptDate;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(url, data, this.headerInitializer())
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // Success
    //         const dcryptDate = this.mapMapDecryption(res);
    //         resolve(dcryptDate);
    //       },
    //       (err) => {
    //         // Error
    //         this.handleError(err);
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }

  //Live data exchange
  // checkLiveDataExchange(data) {
  //   return this.http
  //     .post(
  //       this.environmentOperatorApi + 'mission/check-live-stream',
  //       data,
  //       this.headerInitializer()
  //     )
  //     .pipe(catchError(this.handleError));
  // }
  //new promise version
  checkLiveDataExchange(data): Promise<any> {
    data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'mission/check-live-stream',
        data,
        this.headerInitializer()
      )
    )
      .then((res) => {
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'mission/check-live-stream',
    //       data,
    //       this.headerInitializer()
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         let val = this.mapMapDecryption(res);
    //         resolve(val);
    //       },
    //       (error) => reject(error)
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       // console.log(err);
    //       this.handleError(err);
    //     });
    // });
    // return promise;
  }

  //Elevation graph
  getElevation(data) {
    // data = this.aesEcrypt(data)
    let payload = {
      latLngArray: data,
    };
    // let payloads = this.aesEcrypt(payload);

    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'terrian/get-terrain-elevation',
        payload,
        // this.headerInitializer()
        this.headerInitializerBy_X_Api_Key()
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // return new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'terrian/get-terrain-elevation',
    //       payload,
    //       // this.headerInitializer()
    //       this.headerInitializerBy_X_Api_Key()
    //     )
    //     .toPromise()
    //     .then((response) => {
    //       // resolve(response);
    //       // let val = this.mapMapDecryption(response);
    //       resolve(response);
    //     })
    //     .catch((error) => {
    //       reject(error);
    //     });
    // });
  }

  // Whatsapp left buffer region notification
  sendLeftBufferRegionNotification(data): Promise<any> {
    const url =
      this.environmentOperatorApi + 'mission/leftbufferregionwhatsapp';
    return this.http.post(url, data, this.headerInitializer()).toPromise();
  }
  //Satellite Count
  satelliteCount(data): Promise<any> {
    const url =
      this.environmentOperatorApi + 'dashboard/get-latest-satellite-data';

    return firstValueFrom(
      this.http.post(url, data, this.headerInitializerBy_X_Api_Key())
    ).then((res) => {
      return res;
    });
    // return this.http
    //   .post(
    //     url,
    //     data,
    //     this.headerInitializerBy_X_Api_Key()
    //     // this.headerInitializer()
    //   )
    //   .toPromise();
  }
  //To get the Url for latest basemaplayer
  getStadiaMapURl() {
    return firstValueFrom(
      this.http.post(this.environmentOperatorApi + 'ratelimiter/map-api', {})
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(this.environmentOperatorApi + 'ratelimiter/map-api', {})
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         resolve(res);
    //       },
    //       (err) => {
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }
  //Api count
  getApiCount(data) {
    return firstValueFrom(
      this.http.post(
        this.environmentOperatorApi + 'ratelimiter/map-api-increment-count',
        data
      )
    )
      .then((res) => {
        return res;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(
    //       this.environmentOperatorApi + 'ratelimiter/map-api-increment-count',
    //       data
    //     )
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         resolve(res);
    //       },
    //       (err) => {
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }
  //NearbyAirport
  nearbyAirport(data): Promise<any> {
    data = this.aesEcrypt(data);
    const url =
      this.environmentOperatorApi + 'dashboard/get-nearby-airport-by-mission';
    // return this.http.post(url, data,this.headerInitializer()).toPromise();

    return firstValueFrom(this.http.post(url, data, this.headerInitializer()))
      .then((res) => {
        let val = this.mapMapDecryption(res);
        return val;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(url, data, this.headerInitializer())
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         let val = this.mapMapDecryption(res);
    //         resolve(val);
    //       },
    //       (error) => reject(error)
    //     )
    //     .catch((err) => {
    //       reject(err);
    //       // console.log(err);
    //       this.handleError(err);
    //     });
    // });
    // return promise;
  }
  getFileContent(url: string): Promise<any> {
    return this.http.get(url, { responseType: 'text' }).toPromise();
  }

  forgotPassword(payload) {
    let url = this.environmentOperatorApi + 'operator/forgot-password';
    // let data = this.encryption(payload);
    let data = this.aesEcrypt(payload);

    return firstValueFrom(this.http.post(url, data, this.headerInitializer()))
      .then((res) => {
        // Success
        // const dcryptDate = this.decryption(res);
        const dcryptDate = this.mapMapDecryption(res);
        return dcryptDate;
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .post(url, data, this.headerInitializer())
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // Success
    //         // const dcryptDate = this.decryption(res);
    //         const dcryptDate = this.mapMapDecryption(res);
    //         resolve(dcryptDate);
    //       },
    //       (err) => {
    //         // Error
    //         this.handleError(err);
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
  }

  // api for get map hash value
  // map hash value - value shows if there is any changes in map-layer
  getMapHashValue() {
    let url = this.environmentOperatorApi + 'maps/hash-value';

    return firstValueFrom(this.http.get(url, this.headerInitializer()))
      .then((res) => {
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
          return res;
        };
      })
      .catch(this.handleError);

    // let promise = new Promise((resolve, reject) => {
    //   this.http
    //     .get(url, this.headerInitializer())
    //     .toPromise()
    //     .then(
    //       (res) => {
    //         // const dcryptDate = this.mapMapDecryption(res);
    //         // set the cache invalidate flag for futher use in map-layer api calling.
    //         const mapCacheValueFromCache = this.getMapHashValueFromCache();
    //         if (
    //           mapCacheValueFromCache &&
    //           res &&
    //           res['data'] &&
    //           res['data']?.MainData &&
    //           res['data']?.MainData?.HashValue == mapCacheValueFromCache
    //         ) {
    //           this.cacheInvalidate = false;
    //         } else {
    //           this.cacheInvalidate = true;
    //           this.setMapHashValue(res['data']?.MainData?.HashValue);
    //         }
    //         resolve(res);
    //       },
    //       (err) => {
    //         // Error
    //         this.handleError(err);
    //         reject(err);
    //       }
    //     );
    // });
    // return promise;
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

  fetchGeoZone(waypointURL) {
    return firstValueFrom(this.http.get(waypointURL, { responseType: 'blob' }))
      .then((res) => {
        return res;
      })
      .catch(this.handleError);
  }

  getLandingPageDetails() {
    return firstValueFrom(
      this.http.get(
        environment.baseApi + 'main/main-website/get-landing-data?page=UTM',
      )
    )
      .then((val: any) => {
        return val;
      })
      .catch(this.handleError);
  }

  contactDetails(payload) {
    let url = environment.baseApi + 'main/main-website/post-contact-form';
    let data = payload;
    return firstValueFrom(this.http.post(url, data))
      .then((res) => {
        return res;
      })
      .catch(this.handleError);
    }

  //By using the promises
  uploadWaypointFile(data): Promise<any> {
    // data = this.aesEcrypt(data);

    return firstValueFrom(
      this.http.post(
        this.envUploadBaseUrl + 'mission/upload-files',
        data,
        this.headerInitializer()
      )
    )
      .then((val: any) => {
        if (val?.data?.MainData && val?.data?.MainData != 0) {
          // val = this.decryption(val)
          // val = this.mapMapDecryption(val);
        }
        return val;
      })
      .catch(this.handleError);

  }

}
