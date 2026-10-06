import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, Event, Scroll } from '@angular/router';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import './hackerTimer';

import { MediaMatcher } from '@angular/cdk/layout';
import Swal from 'sweetalert2';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PaymentModalService } from 'src/app/custom-services/operator/payment-modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
import { environment } from 'src/environments/environment';
import { Constants } from '../../constants/constants';
import * as CryptoJS from 'crypto-js';
import { NotificationService } from 'src/app/custom-services/notification-service/notification.service';
import { NotificationType } from 'src/app/custom-services/notification-service/notification';
import { CognitoAccessToken, CognitoIdToken } from 'amazon-cognito-identity-js';
import { IndexedDBFunctionsService } from 'src/app/custom-services/common/indexed-db-functions.service';
@Component({
  selector: 'app-operator-application',
  templateUrl: './operator-application.component.html',
  styleUrls: ['./operator-application.component.scss'],
})
export class OperatorApplicationComponent implements OnInit, OnDestroy {
  // @ViewChild('payment', { static: false }) payment: ElementRef;

  // private _mobileQueryListener: () => void;
  // mobileQuery: MediaQueryList;
  ws;
  webSocketApiCall;
  webSocketValue;
  encryptData;

  //Trigger Conditions
  droneStarted = false;
  saveTheLogs = false;
  armedEnabled = false;
  secondTrigger = false;
  filteredWsArr = [];
  dupWsArr = [];
  payloadInterval;
  asOfDate;
  CurrentTime;
  triggerId = 'TRGR00001';
  //Profile Details
  profileDetails;

  //Cognito Interval
  refreshTokenInterval;
  refreshTokenEvent;

  //Active path
  activePath;

  activeURLArr = Constants.activeURLArr;
  toggleSideNav = true;

  test;
  paymentOpen;

  subscriptionPlan;

  // Open Weather API
  cityName: Observable<any>;
  weatherDetails;
  currentWeatherDetails;
  NotFound;
  responseCityName: Observable<any>;

  //Debouncing logic
  debounceTimer;

  currentUrl;
  guestUser = false;

  urlType;
  mapId;

  //Modal
  modalRef: BsModalRef;
  private unSubscribe = new Subject<void>();
  //Swal
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      // cancelButton: 'btn alert-cancel-button mb-3 px-4 mx-2',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
      // text : 'alert-text'
      // cancelButton: 'btn btn-danger',
    },
    buttonsStyling: false,
  });
  closedState: string;
  showSwal(type, option?) {
    if (type == 'restrict-redirect') {
      this.swalWithBootstrapButtons.fire({
        background: Constants.swal_bg_color,
        // title: 'Are you sure?',
        text: `Page cannot be refreshed when your mission is active`,
        focusConfirm: false,
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
      });
    }

    if (type == 'guestLogin') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          title: 'Login or sign up?',
          text: `You need to login or sign up first to proceed.`,
          focusConfirm: false,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
          cancelButtonText: 'Cancel',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('operator/operator-login');
          }
        });
    }
  }

  constructor(
    public router: Router,
    private operatorService: OperatorService,
    private operatorApi: OperatorapisService,
    private cesiumFunction: CesiumFunctionService,
    private modalService: BsModalService,
    private paymentModalService: PaymentModalService,
    private mapLayerService: MapLayersService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private maplayerService: MapLayersService,
    private indexedDBFunctionsService: IndexedDBFunctionsService
  ) {
    // show create mission button on UI
    this.router.events
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((event: Event) => {
        if (event instanceof Scroll) {
          if (event.routerEvent instanceof NavigationEnd) {
            // this.currentUrl = event.url;
            this.currentUrl = event.routerEvent.urlAfterRedirects;
          }
        } else if (event instanceof NavigationEnd) {
          this.currentUrl = event.urlAfterRedirects;
        }
      });
  }

  ngOnInit(): void {
    //validating AccessToken for user, if user is not logged in
    const AccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('userAccessToken'),
    });
    const IdToken = new CognitoIdToken({
      IdToken: localStorage.getItem('IdToken'),
    });
    if (!AccessToken['jwtToken'] || !AccessToken['payload']) {
      this.mapLayerService.access('pilot');
      //maplayer services
      // this.getUrls();
      //call new prfile data , when user is not logged in
      this.operatorApi
        .getGuestProfileFile()
        .then((data) => {
          this.guestUser = true;
          this.profileDetails = data;
          this.profileDetails.UserMode = 'Guest';
          let encryData = CryptoJS.AES.encrypt(
            JSON.stringify(this.profileDetails),
            environment.operatorKey
          );
          localStorage.setItem('UserDetails', encryData);
        })
        .catch((error) => {
          // console.error('Error fetching guest profile:', error);
        });
    } else {
      this.guestUser = false;
      this.profileDetails = this.operatorService.returnProfileDetails();
      //intializeing the getDronesAndGearsList srevices function
      this.getDronesAndGearsList();
      this.openWebsocketConnection();
    }

    // initilize indexedDB
    this.indexedDBFunctionsService.openIndexedDBConnection();

    this.subscriptionPlan = this.profileDetails?.SubscriptionPlan;
    this.checkForActiveURL();

    this.refreshTokenInterval = setInterval(() => {
      this.operatorApi.checkForAccessToken();
    }, 30000);

    this.paymentModalService
      .getPaymentModal()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((modalVal) => (this.paymentOpen = modalVal));

    window.addEventListener('beforeunload', this.closeWebsocketEventListener);

    this.initialFunction();
    this.cesiumFunction.access(Constants.pilotAccess);
    this.mapLayerService.access(Constants.pilotAccess);

    this.operatorService.message$.subscribe(msg => {
      this.closedState = msg;
    });
  }

  getUrls() {
    this.operatorApi.getStadiaMapURl().then((res: any) => {
      let url = res.data.MainData.MapAPIUrl;
      this.urlType = res.data.MainData.MapAPIType;
      this.mapId = res.data.MainData.MapAPIId;
      this.maplayerService.getMapId(this.mapId);
      // this.maplayerService.getUrl(url);
      this.maplayerService.getUrlType(this.urlType);
    });
  }

  handleBeforeUnload(e) {
    e.preventDefault();
    const message =
      'Are you sure you want to leave? All provided data will be lost.';
    e.returnValue = message;
    return message;
  }

  getDronesAndGearsList() {
    let payload = {
      OperatorId: this.profileDetails?.UserId,
    };
    this.operatorApi.getDronesAndGearsList(payload).then((res: any) => {
      // console.log('Calling the API from operator-application and getting the response: ',res);
    });
  }

  openWebsocketConnection() {
    if (this.webSocketService) {
      this.webSocketService.connectWebSocket(
        environment.websocketKey + 'operatorId=',
        this.profileDetails
      );
    }
  }

  closeWebsocketEventListener() {
    if (this.webSocketService) {
      this.webSocketService.closeConnection();
    }
  }

  OnlineEventFunction = () => {
    this.openWebsocketConnection();
    this.notificationService.notify({
      title: 'Connected',
      message: 'Back Online!',
      type: NotificationType.success,
      duration: '',
      removeClose: '',
    });
  };

  OfflineEventFunction = () => {
    this.closeWebsocketEventListener();
    this.notificationService.notify({
      title: 'No Internet',
      type: NotificationType.warning,
      message: 'Please check your internet connection...',
      duration: 'never',
      removeClose: '',
    });
  };

  ngOnDestroy(): void {
    // this.mobileQuery.removeListener(this._mobileQueryListener);
    clearInterval(this.webSocketApiCall);
    clearInterval(this.refreshTokenInterval);
    this.unSubscribe.next();
    this.unSubscribe.complete();
    this.notificationService.clearNotifications();
    window.removeEventListener(
      'beforeunload',
      this.closeWebsocketEventListener
    );
    window.removeEventListener('online', this.OnlineEventFunction);
    window.removeEventListener('offline', this.OfflineEventFunction);
  }

  checkForActiveURL() {
    let url = this.router.url;
    this.activeURLArr.every((path) => {
      if (url.includes(path.url)) {
        this.activePath = path.url;
        return false;
      } else {
        return true;
      }
    });
  }
  onLogout() {
    this.router.navigateByUrl('operator/operator-login');
  }
  createMission() {
    this.router.navigateByUrl('operator/operator-app/mission/create-mission');
  }

  onRouterNavigationClick(event, pathName) {
    let profileDetails = this.operatorService.returnProfileDetails();
    let subscriptionPlan = profileDetails.SubscriptionPlan;

    if (
      profileDetails.SubscriptionPlan == Constants.subscriptionPlan.free &&
      pathName !== 'Dashboard' &&
      pathName !== 'Profile'
    ) {
      event.stopPropagation();
      event.preventDefault();
      this.swalWithBootstrapButtons
        .fire({
          background: Constants.swal_bg_color,
          title: `You are having an '${profileDetails.SubscriptionPlan}' subscription plan`,
          text: `Would you like to upgrade it to access?`,
          focusConfirm: false,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.value) {
            // return this.router.navigateByUrl('operator-app/payment');
            // return  this.paymentModal(test) ;
            this.paymentOpen = true;
            this.paymentModalService.setPaymentModal(this.paymentOpen);
          } else {
            return false;
          }
        });
    } else if (
      profileDetails.SubscriptionPlan == Constants.subscriptionPlan.basic ||
      profileDetails.SubscriptionPlan == Constants.subscriptionPlan.advanced ||
      (profileDetails.SubscriptionPlan == Constants.subscriptionPlan.free &&
        pathName == 'Dashboard')
    ) {
      // event.preventDefault();
      let valueStored = localStorage.getItem('valueStored');
      if (valueStored) {
        event.stopPropagation();
        event.preventDefault();
        this.showSwal('restrict-redirect');
      }
    }
  }
  reDirectToLink(path) {
    if (!localStorage.getItem('valueStored')) {
      this.activePath = path;
      this.router.navigateByUrl('operator/operator-app/' + path);
    } else {
      this.showSwal('restrict-redirect');
    }
  }

  authorizing(path) {
    let profileDetails = this.operatorService.returnProfileDetails();
    let subscriptionPlan = profileDetails.SubscriptionPlan;
    if (profileDetails.SubscriptionPlan == Constants.subscriptionPlan.free) {
      this.swalWithBootstrapButtons
        .fire({
          title: `You are having an '${profileDetails.SubscriptionPlan}' subscription plan`,
          text: `Would you like to upgrade it to access?`,
          background: Constants.swal_bg_color,
          // width: '450px',
          focusConfirm: false,
          // icon: 'info',
          showCancelButton: true,
          // cancelButtonText:'Cancel',
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
          // cancelButtonColor:'#0a0d14aa',
        })
        .then((result) => {
          if (result.value) {
            // return this.router.navigateByUrl('operator-app/payment')
            this.paymentOpen = true;
            this.paymentModalService.setPaymentModal(this.paymentOpen);
            // return this.paymentModal(test) ;
          } else {
            return false;
          }
        });
    } else if (
      profileDetails.SubscriptionPlan == Constants.subscriptionPlan.basic ||
      profileDetails.SubscriptionPlan == Constants.subscriptionPlan.advanced
    ) {
      if (profileDetails.NumberOfFlightSubmission < 1) {
        this.swalWithBootstrapButtons
          .fire({
            title: `Your flight submission plan is exceeded.`,
            text: `upgrade your subscription plan to access it.`,
            background: Constants.swal_bg_color,
            focusConfirm: false,
            // icon: 'info',
            showCancelButton: true,
            // cancelButtonText:"No Thanks",
            allowOutsideClick: false,
            confirmButtonText: 'Okay',
          })
          .then((result) => {
            if (result.value) {
              // return this.router.navigateByUrl('operator-app/payment');
              this.paymentOpen = true;
              this.paymentModalService.setPaymentModal(this.paymentOpen);
              //  return this.reDirectToLink(path);
            } else {
              return false;
            }
          });
      } else {
        this.reDirectToLink(path);
      }
    }
  }

  //Test
  paymentModal(test) {
    this.modalRef = this.modalService.show(test, {
      class: 'modal-dialog-centered gray payment-modal',
      backdrop: 'static',
      keyboard: false,
    });
    // this.test = true;
  }

  initialFunction() {
    // disconnect notification
    window.addEventListener('offline', this.OfflineEventFunction);
    window.addEventListener('online', this.OnlineEventFunction);

    if (!this.profileDetails?.RPTO && !this.profileDetails?.GeoFence) {
      navigator.geolocation.getCurrentPosition((loc) => {
        // this.operatorApi
        //   .getCurrentWeather(loc.coords.latitude, loc.coords.longitude)
        //   .then((res: any) => {
        //     this.currentWeatherDetails = res;
        //     this.cityName = res.name;
        //     this.responseCityName = res.name;
        //   });
        let weatherAPIPayload = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        this.operatorApi
          .getCurrentWeather_WeatherUnion(weatherAPIPayload)
          .then((res) => {
            let body = JSON.parse(res?.body);
            this.currentWeatherDetails = body;
            this.cityName = body.name;
            this.responseCityName = body.name;
            return res;
          });
      });
    }
  }

  //OpenWeather
  onWeatherForm() {
    if (this.cityName) {
      this.operatorApi.getCurrentWeatherByCityName(this.cityName).then(
        (res: any) => {
          this.NotFound = '';
          this.currentWeatherDetails = res;
          this.cityName = res.name;
          this.responseCityName = res.name;
          // this.viewer.camera.flyTo({
          //   destination: Cesium.Cartesian3.fromDegrees(
          //     this.currentWeatherDetails.coord.lon,
          //     this.currentWeatherDetails.coord.lat,
          //     10000
          //   ),
          // });
        },
        (err) => {
          this.NotFound = err.error.message;
        }
      );
    }
  }

  onGuestUserNavigationClick(event, name, url) {
    this.showSwal('guestLogin');
  }
}
