import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
import { PaymentModalService } from 'src/app/custom-services/operator/payment-modal.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
import { Router } from '@angular/router';

import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as turf from '@turf/turf';
import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import { Constants } from 'src/app/constants/constants';
import { BehaviorSubject } from 'rxjs';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
import * as echarts from 'echarts';
// for & guides
import { Config, State, driver } from 'driver.js';
import { NotificationService } from 'src/app/custom-services/notification-service/notification.service';
import { NotificationType } from 'src/app/custom-services/notification-service/notification';
import { CognitoAccessToken } from 'amazon-cognito-identity-js';
import * as CryptoJS from 'crypto-js';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
interface Coordinate {
  latitude: number;
  longitude: number;
}
@Component({
  selector: 'app-operator-dashboard',
  templateUrl: './operator-dashboard.component.html',
  styleUrls: ['./operator-dashboard.component.scss'],
  providers: [],
})
export class OperatorDashboardComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  // , CameraService
  profileDetails;
  missionListArr;
  missionList;
  missionIndex;
  dronesAndGearList;
  submitted: boolean = false;
  // Open Weather API
  cityName: Observable<any>;
  weatherDetails;
  currentWeatherDetails;
  NotFound;
  responseCityName: Observable<any>;
  //web-worker
  private worker: Worker;
  isClicked: any = false;

  //Template card
  isView = false;
  result;

  //Elevation graph
  chartOption: echarts.EChartsOption;
  latGraph: any = [];
  longGraph: any = [];
  altGraph: any = [];
  liveAlt: number = 0;
  liveDist = 0;
  elevationData;
  distances;
  droneHeight;
  maxElevation: number = 0;
  totalDist;
  indexs = 0;
  execute: boolean = true;
  missionForm: number = 0;
  activityType = [];

  //WS
  ws;
  webSocketApiCall;
  webSocketValue;
  wsConnected = false;
  webSocketError;
  socketCloseErr;
  missionStarted = false;
  //Cached Storage of Data
  cachedData: any = [];
  cachedInterval;
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
  triggerId;
  liveMessage = '';
  liveMessageNotification = false;

  //Checklist
  enableStartMission = false;
  droneConnected;

  // Timer for Start Mission
  startMissionTimer;
  //Mission Section Index
  missionSection = 0;
  //Ccompliance Section Index
  complianceSection = 0;

  //2D3D
  toggleFlag = true;

  //Live Drone
  liveDrone;
  liveLatitude;
  liveLongitude;
  liveAltitude: number = 0;
  terrainAlt;
  // 3d Drone image
  nav_bearing;
  nav_pitch;
  nav_roll;
  liveDroneOptions = {
    allowDrag: false,
  };
  // Drone Image real-time
  // showDrone;
  droneImageEntity;
  droneImageTimer;
  // Drone boundary
  droneBufferEntity;
  droneBufferHierarchy;
  droneBufferMaterial;

  //Drone Errors
  droneErrors;
  droneName;
  altitudeRef = [];

  //For drone smoothness
  positionProperty = new Cesium.SampledPositionProperty();

  //Subject
  private unSubscribe = new Subject<void>();
  private liveDroneUnSubscribe = new Subject<void>();

  //Test
  testing = Cesium.Cartesian3.fromDegrees(-80, 49);
  aquamarine = '#191919';

  //Map Layer from backend
  geojsonvfr = new Cesium.GeoJsonDataSource();
  geojsonAirport = new Cesium.GeoJsonDataSource();

  //Restricted Entities
  entitiesOfRestrictedAreas = [];

  // Warning Visibility
  warningVisibility;
  warningZoneFlag;

  //Deconfliction
  deconfliction;
  //Drone and buffer
  droneOutsideBuffer;
  notifyoutsideBuffer;
  dronePosition;

  missionEnded;

  show = true;

  //Time Condition
  missionTime;

  //Test for Multi Polygons
  Cesium = Cesium;
  lastPickTrack: any;

  viewer;
  mapIdObj = {
    mapId: 'cesium-container',
    containerId: 'cesium-container',
  };

  //Loader
  loader = true;
  missionstartloader;

  //Plane Finder
  planeFinder;
  planes = [];
  planesVisibility;
  planesObserverable = new Subject();

  //Active airspace - Buffer region
  activeBufferVisibility = true;
  activeBufferRegion;
  activeBuffers = [];
  activeAirspaceEntities;

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
  liveDronePath;
  droneFollow: boolean = false;
  dropdownState: boolean;
  toggleMissionDetailstab: boolean = false;
  wayPointArr: any;
  satellitesCount: number;
  nearbyAirports: any;
  expandedAccordionIndex: number;
  intersections: any;
  flightTime: string;
  corelation;
  conditonToFly: any;
  flyingtoLoc;
  liveLogsSubscription: any;

  geojsonDataSourceWarningZone = new Cesium.GeoJsonDataSource();

  // @yash push notification
  // pushNotification: any;
  // pushNotificationTimeout: any;

  //Debouncing logic
  debounceTimer;

  //Getting Maps Layer from backend Based on Country initially
  entitiesOfRestrictedAreasIndia = [];
  entitiesOfRestrictedAreasIreland = [];
  entitiesOfRestrictedAreasDubai = [];

  // Mission Approved
  missionErrFlag;

  // Live Drone Subscription
  liveDroneSubscription = new Subject<void>();

  //Real-time

  missionListTimer;

  //Map reset
  mapResetFlag;

  //Live Data exchange
  dataExchangeValue;
  //Live data exchange timer
  checkLiveDataTimer;
  unSubscribeLiveDataExchange = new Subject<void>();

  //One lap timer
  oneLapTimer;

  //Missions permission list
  missionPermissionsList;

  // OSM buildings
  osmBuilding = false;
  osmTileset;

  // Mapbox
  mapBoxKey = environment.mapBoxKey;
  maptilerkey = environment.maptilerkey;

  paymentOpen;
  modalRef: BsModalRef;
  //web socket connection
  subscription: any;
  //Streaming mode
  StreamModes = Constants.StreamModes;
  UAVLogMode;

  // Custom info box data
  entityDescription;

  activeTab: string = 'general';
  //disable and enable create-mission button
  createMissionBtnDisabled: boolean = true;

  showFirstTimeLoginDialog: boolean = false;
  advisoryNotification: any;
  deleteMissionLoader: any;
  disableStart: boolean = false;
  disableButton: boolean = false;
  oneLapStarted: any;
  gcsConnected: boolean = false;

  //for guest user
  guestUser: boolean = false;
  private mapClickHandlerGuest: any;
  private timerGuest: ReturnType<typeof setTimeout>;
  private moveStartListenerGuest: () => void;
  private callCounter: number = 0;
  moveStartEventListener: any;
  guestLoactionLat;
  guestLoactionLong;
  ScreenSpaceEventHandler: any;
  canCallOneLapApi: any = false;
  isLoginPopupDisplayed = false;
  fileName;
  invalidFile: boolean = false;
  uploaded: boolean = false;

  // loading till be get viewer from map-component
  viewerLoading: any = true;
  onTickHandler: () => void;
  // this condition added for guest profile to be initialized first before the viewer
  guestProfileInitiated = new BehaviorSubject<boolean>(false);

  handler;
  pointData = [];
  polyData = [];
  entity;
  LatitudeArr = [];
  LongitudeArr = [];
  AltitudeArr = [];
  WayPointNum = [];
  wayPointsArr = [];
  lengthSplit;
  bufferPolygon = [];
  bufferPointsArr = [];
  distanceData = [];
  createMissionForm: FormGroup;
  showPopUp: boolean = false;
  FencePosition;
  checked: any;
  socketType: string = 'MISSION_PLANNER';
  mode = false;
  // zoomForMissionPlanner: boolean = true;
  zoomForOtherMission: boolean = true;

  constructor(
    private router: Router,
    private operatorApi: OperatorapisService,
    private operatorService: OperatorService,
    private paymentModalService: PaymentModalService,
    private modalService: BsModalService,
    private cesiumFunction: CesiumFunctionService,
    private dateAndTimeFormat: DateTimeFormatService,
    private mapLayersService: MapLayersService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private AuthorityService: AuthorityapisService
  ) {}

  showSwal(type, option?) {
    if (type == 'endMissionConfirm') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          title: 'Are you sure?',
          text: `You will not be able to revert back`,
          focusConfirm: false,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'End Mission',
          cancelButtonText: 'Cancel',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.endMission(option);
          } else {
          }
        });
    }

    if (type == 'guestLogin') {
      this.isLoginPopupDisplayed = true;
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
            //diable or enable scroll and zoom
            // this.cesiumFunction.disableMapZoomandScrollForGuest(
            //   this.viewer,
            //   true
            // );
            this.isLoginPopupDisplayed = false;
          } else {
            //diable or enable scroll and zoom
            // this.cesiumFunction.disableMapZoomandScrollForGuest(
            //   this.viewer,
            //   true
            // );
            // Reset the flag to false after the popup is closed
            this.isLoginPopupDisplayed = false;
          }
        });
    }
    if (type == 'guestLogin2') {
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
            //diable or enable scroll and zoom
            // this.cesiumFunction.disableMapZoomandScrollForGuest(
            //   this.viewer,
            //   true
            // );
            this.router.navigate(['operator/operator-login', 'create-mission']);
          } else {
            //diable or enable scroll and zoom
            // this.cesiumFunction.disableMapZoomandScrollForGuest(
            //   this.viewer,
            //   true
            // );
          }
        });
    }
  }

  ngOnInit(): void {
    this.initialFunction();
    this.getActivityType();

    this.createMissionForm = this.fb.group({
      YourName: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator,
          this.alphabeticValidator,
          Validators.minLength(3),
        ],
      ],
      Mobile: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator,
          this.numericValidator,
          Validators.minLength(10),
        ],
      ],
      Email: [
        '',
        [Validators.required, this.noWhitespaceValidator, Validators.email],
      ],
      ActivityType: ['', Validators.required],
    });
    // requesting notification permission.
    // window.Notification.requestPermission();

    this.paymentModalService
      .getPaymentModal()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((modalVal) => (this.paymentOpen = modalVal));
    setTimeout(() => {
      this.onClickonMaps();
    }, 1000);
  }

  initialFunction() {
    //validating AccessToken for User
    const AccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('userAccessToken'),
    });
    if (!AccessToken['jwtToken'] || !AccessToken['payload']) {
      this.disableButton = true;
      this.guestUser = true;
      this.showPopUp = true;
      this.missionIndex = 0;
      this.operatorApi
        .getGuestProfileFile()
        .then((data) => {
          this.profileDetails = data;
          let encryData = CryptoJS.AES.encrypt(
            JSON.stringify(this.profileDetails),
            environment.operatorKey
          );
          localStorage.setItem('UserDetails', encryData);
        })
        .catch((error) => {
          // console.error('Error fetching guest profile:', error);
        });
      this.operatorApi
        .getGuestMissionDetails()
        .then((data) => {
          // for side card uncomment below code and uncomment the OperationName also whereever it is : this.missionList.OperationName
          // setTimeout(() => {
          //   this.toggleMissionDetailstab = true;
          // }, 4000);
          // let missionDataArr = [];
          // let dataModified = data;
          // data.currentTimeDate = this.dateAndTimeFormat.dateAndTimeFormatting(
          //   new Date(),
          //   'dateAndTime'
          // );
          // missionDataArr.push(dataModified);
          // this.missionListArr = missionDataArr;
          // this.missionList = dataModified;
          // this.guestUserMissionDetails(this.missionList);
        })
        .catch((error) => {
          // console.error('Error fetching guest mission details:', error);
        })
        .finally(() => {
          this.guestProfileInitiated.next(true);
        });
    } else {
      this.guestUser = false;
      //If user is logged In
      this.profileDetails = this.operatorService.returnProfileDetails();
      // using setTimeout to push at last when everything is initialize
      setTimeout(() => {
        const payload = {
          action: 'validate-get-logs',
          operatorId: this.profileDetails?.UserId,
        };
        this.webSocketService.sendMessage(payload);
      }, 1000);

      this.guestProfileInitiated.next(true);
    }

    this.getDronesAndGearList();

    //subscribing web socket service
    this.subscription = this.webSocketService
      .getMessages()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((message) => {
        let body;
        if (message.body) {
          body = JSON.parse(message?.body);
        }
        if (message.action === Constants.checkLiveStream) {
          this.dataExchangeValue = message;
        }
        // Process the mission details update
        if (message.action === 'deconfliction') {
          this.handleMissionDetailsUpdate(message);
        }
        if (message.action === 'Operator-take-logs') {
          let activeMission;
          // if (localStorage.getItem('isLive') != 'true') {
          activeMission = JSON.parse(localStorage.getItem('valueStored'));
          // }
          if (activeMission != null) {
          this.socketType = 'OTHER';
          if(!this.mode){
            this.notificationService.notify({
              title: 'Drone module connection is established',
              type: NotificationType.success,
              message: 'Done',
              duration: 5000,
            });
          }
          this.mode = true;
          // this.redirectToMissionPlanner();
          this.wsConnectedLogs(message, activeMission.MissionId);
          
          }
        }
        if (body && body.action == 'validate-get-logs') {
          if (body.message == true) {
            this.disableStart = true;
            this.missionStarted = false;
            this.wsConnected = false;
            if (this.ws) this.ws.close();
          } else {
            this.disableStart = false;
          }
        }
        if (message.dataChange) {
          this.mapResetFlag = false;
          const payload = {
            action: 'validate-get-logs',
            operatorId: this.profileDetails?.UserId,
          };
          this.webSocketService.sendMessage(payload);
          this.getMissionList();
        }
        if(message.action === 'check-zone-stream' && message.dataChange){
          this.getZoneData();
        }
      });

    // showing tour and guides UI
    const showPrompt = localStorage.getItem('showPrompt');
    if (
      AccessToken['jwtToken'] &&
      !showPrompt &&
      !this.profileDetails?.SkipTour &&
      this.profileDetails?.SkipTour != 'true'
    ) {
      this.showFirstTimeLoginDialog = true;
    }
  }
  nextOperation() {
    this.submitted = true;
    // if (
    //   this.createMissionForm?.controls.YourName.errors.alphabetic &&
    //   this.createMissionForm?.controls.Mobile.errors.numeric &&
    //   this.createMissionForm?.controls.Email.errors == null &&
    //   this.createMissionForm?.controls.ActivityType.errors == null
    // )
    if (
      this.createMissionForm.controls.YourName.errors?.required == undefined &&
      (this.createMissionForm.controls?.YourName.errors?.minlength?.actualLength
        ? this.createMissionForm.controls?.YourName.errors?.minlength
            ?.actualLength > 2
        : true) &&
      this.createMissionForm.controls?.YourName.errors.alphabetic == true &&
      this.createMissionForm.controls?.Mobile.value.length === 10 &&
      this.createMissionForm.controls?.Mobile.errors.numeric == true &&
      this.createMissionForm?.controls.Email.errors == null &&
      this.createMissionForm?.controls.ActivityType.errors == null
    ) {
      this.missionForm = 2;
      this.submitted = false;
    }
  }
  isNext: number = 0;
  isDrawPoint() {
    this.isNext = 2;
  }
  isUploaded() {
    this.isNext = 3;
    this.missionForm = 3;
  }
  backStepper1() {
    this.missionForm = 1;
  }
  backStepper2() {
    this.missionForm = 2;
    this.uploaded = false;
    this.pointData = [];
    this.polyData = [];
    this.LatitudeArr = [];
    this.LongitudeArr = [];
    this.AltitudeArr = [];
    this.WayPointNum = [];
    this.wayPointsArr = [];
    this.bufferPolygon = [];
    this.bufferPointsArr = [];
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
    this.distanceData = [];
    this.wayBackened = [];
  }
  nextOperation2() {
    let payload = {
      FullName: this.createMissionForm.value.YourName,
      FlightType: this.createMissionForm.value.ActivityType,
      MobileNo: this.createMissionForm.value.Mobile,
      Email: this.createMissionForm.value.Email,
      Location: this.responseCityName,
      Waypoint: this.wayBackened,
      Type: 'GuestProfile',
    };
    this.operatorApi
      .sendCustomerData(payload)
      .then((res) => {
        // console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    this.router.navigateByUrl('operator/operator-login');
  }

  nextOperation1() {
    if (this.isNext == 2) {
      let payload = {
        FullName: this.createMissionForm.value.YourName,
        FlightType: this.createMissionForm.value.ActivityType,
        MobileNo: this.createMissionForm.value.Mobile,
        Email: this.createMissionForm.value.Email,
        Location: this.responseCityName,
        Waypoint: this.wayBackened,
        Type: 'GuestProfile',
      };
      this.operatorApi
        .sendCustomerData(payload)
        .then((res) => {})
        .catch((err) => {
          console.log(err);
        });
      this.router.navigateByUrl('operator/operator-login');
    }
    if (this.isNext == 3) {
      this.missionForm = 3;
    }
  }
  //On Way Points Upload
  uploadFiles(evt) {
    const files = evt.target.files; // FileList object
    const file = files[0];
    this.fileName = file.name;
    if (!file.name.endsWith('.kml') && !file.name.endsWith('.waypoints')) {
      //invalidFile error
      this.invalidFile = true;
    } else {
      this.invalidFile = false;
    }
  }
  async extractKMLCoords(plainText) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(plainText, 'text/xml');
    let Polygons = [];
    if (xmlDoc.documentElement.nodeName == 'kml') {
      let coordinates: any = xmlDoc.getElementsByTagName('coordinates');
      for (const coords of coordinates) {
        let coord = coords.childNodes[0].nodeValue.trim();
        let points = coord.split(' ');

        let PolygonsPaths = [];
        for (const point of points) {
          let singleCoord = point.split(',');
          Polygons.push({ lat: +singleCoord[1], lng: +singleCoord[0] });
        }
      }
    } else {
      throw 'error while parsing';
    }
    return Polygons;
  }
  finalwaypointVal = [];
  waypoint;
  onWayPointsUpload(evt) {
    let files: FileList = evt.target.files;
    let file = files[0];
    if (file.name.endsWith('.kml')) {
      let fileReader = new FileReader();
      fileReader.onload = async (e: any) => {
        let result = await this.extractKMLCoords(e.target.result);
        this.editWayPoints(undefined, result);
      };
      fileReader.readAsText(file);
    } else if (file.name.endsWith('.waypoints')) {
      let fileReader: FileReader = new FileReader();
      let self = this;
      fileReader.onloadend = async function (x) {
        self.finalwaypointVal = [];
        self.waypoint = fileReader.result;
        const lines = self.waypoint.split('\n');
        const convertedData = [];
        for (const line of lines) {
          if (line.trim() === '') {
            continue;
          }
          const values = line.split(/\s+/);
          const cleanedValues = values.filter((value) => value.trim() !== '');
          convertedData.push(cleanedValues);
        }
        self.editWayPoints(convertedData);
        self.modifyWayPointFileDetails();
      };
      fileReader.readAsText(file);
    } else {
      return;
    }
  }
  modifyWayPointFileDetails() {
    let homeAlt;
    this.finalwaypointVal.forEach((arr, index) => {
      if (arr[8] && arr[9] && arr[10]) {
        if (arr[2] == 0) {
          arr.push(arr[10]);
          homeAlt = Number(arr[10]);
        } else if (arr[2] == 3) {
          arr.push(String(Number(arr[10]) + homeAlt));
        }
      }
    });
  }
  extent;
  editWayPoints(wayPoints?, kmlFileVal?) {
    this.extent = Cesium.Rectangle.fromDegrees(
      117.940573,
      -29.808406,
      118.313421,
      -29.468825
    );
    let initialPos = [];
    let totalLatitude = 0;
    let totalLongitude = 0;
    let validArrCount = 0;
    this.LatitudeArr = [];
    this.LongitudeArr = [];
    this.AltitudeArr = [];
    this.WayPointNum = [];
    if (wayPoints) {
      wayPoints.forEach((arr, index) => {
        if (arr[8] && arr[9] && arr[10]) {
          if (
            Number(arr[3]) == 16 ||
            Number(arr[3]) == 21 ||
            Number(arr[3]) == 85
          ) {
            validArrCount += 1;
            totalLatitude += Number(arr[8]);
            totalLongitude += Number(arr[9]);

            if (Number(arr[8]) == 0 || Number(arr[9]) == 0) {
              if (Number(arr[3]) == 16) {
                this.LatitudeArr.push(arr[8]);
                this.LongitudeArr.push(arr[9]);
              } else {
                this.LatitudeArr.push(
                  this.LatitudeArr[this.LatitudeArr.length - 1]
                );
                this.LongitudeArr.push(
                  this.LongitudeArr[this.LongitudeArr.length - 1]
                );
              }
            } else {
              this.LatitudeArr.push(arr[8]);
              this.LongitudeArr.push(arr[9]);
            }

            this.WayPointNum.push(arr[0]);

            if (Number(arr[3]) == 21) {
              if (Number(arr[8]) == 0 || Number(arr[9]) == 0) {
                this.LatitudeArr.push(
                  this.LatitudeArr[this.LatitudeArr.length - 1]
                );
                this.LongitudeArr.push(
                  this.LongitudeArr[this.LongitudeArr.length - 1]
                );
              } else {
                this.LatitudeArr.push(arr[8]);
                this.LongitudeArr.push(arr[9]);
              }
              this.WayPointNum.push(String(Number(arr[0]) + 1));
            }
            if (this.LatitudeArr.length == 1) {
              this.AltitudeArr.push(0);
            } else {
              this.AltitudeArr.push(
                Number(this.AltitudeArr[0]) + Number(arr[10])
              );
              if (Number(arr[3]) == 21) {
                this.AltitudeArr.push(0);
              }
            }
            let lat = this.LatitudeArr[this.LatitudeArr.length - 1];
            let lng = this.LongitudeArr[this.LatitudeArr.length - 1];
            initialPos.push(Cesium.Cartesian3.fromDegrees(lng, lat));
            if (Number(arr[3]) == 21) {
              initialPos.push(Cesium.Cartesian3.fromDegrees(lng, lat));
            }
          } else if (Number(arr[3]) == 22 || Number(arr[3]) == 84) {
            let lat = this.LatitudeArr[this.LatitudeArr.length - 1];
            let lng = this.LongitudeArr[this.LatitudeArr.length - 1];
            this.LatitudeArr.push(lat);
            this.LongitudeArr.push(lng);
            this.AltitudeArr.push(Number(arr[10]));
            this.WayPointNum.push(String(Number(arr[0])));
            //2D Maps
            initialPos.push(Cesium.Cartesian3.fromDegrees(lng, lat));
          } else if (Number(arr[3]) == 20) {
            validArrCount += 1;
            this.LatitudeArr.push(this.LatitudeArr[0]);
            this.LongitudeArr.push(this.LongitudeArr[0]);
            this.AltitudeArr.push(Number(this.AltitudeArr[0]));
            this.WayPointNum.push(
              String(Number(this.WayPointNum[this.WayPointNum.length - 1]) + 1)
            );
            // , arr[10]  AltitudeArr[0]

            //2D Maps
            initialPos.push(
              Cesium.Cartesian3.fromDegrees(
                this.LongitudeArr[0],
                this.LatitudeArr[0]
              )
            );
          }
        }
      });
    } else {
      kmlFileVal.forEach((coordinate, index) => {
        this.LatitudeArr.push(coordinate.lat);
        this.LongitudeArr.push(coordinate.lng);
        this.AltitudeArr.push(120);
        this.WayPointNum.push(String(index));
        initialPos.push(
          Cesium.Cartesian3.fromDegrees(coordinate.lng, coordinate.lat)
        );
      });
    }
    let diffLength;
    this.updateWayPoints(
      initialPos,
      this.LongitudeArr,
      this.LatitudeArr,
      this.AltitudeArr
    );
  }
  wayBackened = [];
  updateWayPoints(initialPos, LongArr?, LatArr?, AltArr?) {
    this.polyData = [];
    for (let i = 0; i < initialPos.length; i++) {
      var cartographic = Cesium.Cartographic.fromCartesian(initialPos[i]);
      var longitude = Cesium.Math.toDegrees(cartographic.longitude);
      var latitude = Cesium.Math.toDegrees(cartographic.latitude);
      this.wayBackened.push({ x: longitude, y: latitude });
      this.calDistance(longitude, latitude);
      this.polyData.push(longitude, latitude);
      var position = Cesium.Cartesian3.fromDegrees(
        this.polyData[this.polyData.length - 2],
        this.polyData[this.polyData.length - 1]
      );
      this.viewer.entities.add({
        position: position,
        point: {
          color: Cesium.Color.fromRgba(0xaa8e8e8e),
          pixelSize: 9,
          outlineColor: Cesium.Color.TRANSPARENT,
        },
      });
    }
    if (this.polyData.length > 0) {
      const polylineProps = {
        positions: Cesium.Cartesian3.fromDegreesArray(this.polyData),
        width: 3,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromRgba(0x888e8e8e),
          dashLength: 14,
        }),
      };
      this.viewer.entities.add({
        polyline: polylineProps,
      });
    }
    if (initialPos) {
      this.LatitudeArr = [];
      this.LongitudeArr = [];
      this.wayPointsArr = initialPos;
      initialPos.forEach((values, index) => {
        var cartographic = Cesium.Cartographic.fromCartesian(values);
        this.LatitudeArr.push(Cesium.Math.toDegrees(cartographic.latitude));
        this.LongitudeArr.push(Cesium.Math.toDegrees(cartographic.longitude));
      });
      let diffLength;
    }
    if (initialPos.length >= 2) {
      let turfPos = [];

      initialPos.forEach((values, index) => {
        var cartographic = Cesium.Cartographic.fromCartesian(values);
        turfPos.push([
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude),
        ]);
      });
      var buffered;
      let payload = {
        TurfPosition: turfPos,
        BufferType: 'Linestring',
      };
      this.operatorApi.getBuffer(payload).then((res: any) => {
        buffered = res.data.MainData;
        this.cesiumFunction.bufferRegion2D(
          this.viewer,
          buffered.geometry.coordinates[0]
        );
        this.entity = this.cesiumFunction.bufferRegion2Ds(
          this.viewer,
          buffered.geometry.coordinates[0]
        );

        let initialArr = [];
        this.bufferPolygon = [];
        let avgAltitude = Math.max(...this.AltitudeArr) + 50;
        buffered.geometry.coordinates[0].forEach((val, index) => {
          // 3D Maps
          initialArr.push(
            Cesium.Cartesian3.fromDegrees(val[0], val[1], avgAltitude)
          );
          this.bufferPolygon.push([val[0], val[1], avgAltitude]);
        });
        this.bufferPointsArr = initialArr;
        this.flyTo(
          this.LongitudeArr,
          this.LatitudeArr,
          this.AltitudeArr,
          initialPos
        );
      });
    }
  }
  flyTo(
    LongitudeArr,
    LatitudeArr,
    AltitudeArr,
    wayPoints,
    formSubmit?,
    createMission?
  ) {
    // this.loader = true;
    let totalLongitude = 0;
    let totalLatitude = 0;
    LongitudeArr.map((long) => {
      totalLongitude += Number(long);
      return Number(long);
    });
    LatitudeArr.map((lat) => {
      totalLatitude += Number(lat);
      return Number(lat);
    });

    let maxLong = Math.abs(
      Math.max(...LongitudeArr) - Math.min(...LongitudeArr)
    );
    let maxLat = Math.abs(Math.max(...LatitudeArr) - Math.min(...LatitudeArr));

    let maxAlt = Math.max(...AltitudeArr.map((val) => Number(val)));
    let j = 0;
    let finalVal: any = [];
    let mappedVal = wayPoints.map((val) => val.x);
    let sortedWayPoint = mappedVal.sort();
    for (var i = 0; i < sortedWayPoint.length; i++) {
      let diff = sortedWayPoint[i] - j;
      finalVal.push(diff);
      j = sortedWayPoint[i];
    }
    finalVal = finalVal.filter((val, index) => index != 0);
    let diffVal = finalVal.reduce((a, b) => a + b, 0) / finalVal.length;
    diffVal = Math.abs(diffVal);
    let complete = false;
    let self = this;
    this.zoomToEntity();
  }
  zoomToEntity() {
    let waypointpath = [];
    for (let i = 0; i < this.LatitudeArr.length; i++) {
      waypointpath.push(
        Cesium.Cartesian3.fromDegrees(
          this.LongitudeArr[i],
          this.LatitudeArr[i],
          this.AltitudeArr[i]
        )
      );
    }
    this.cesiumFunction.zoomEntity1(this.viewer, this.entity, waypointpath);
    this.uploaded = true;
  }
  // Delete the Mission popup
  rejectMission(missionId) {
    this.disableButton = true;
    this.deleteMissionLoader = true;
    if (missionId) {
      this.swalWithBootstrapButtons
        .fire({
          title: `Reject Mission?`,
          html: `You want to reject the mission <b>#${missionId}</b> <i>${this.missionList.OperationName}</i>`,
          focusConfirm: false,
          icon: 'warning',
          showCancelButton: true,
          background: '#1b1f27',
          cancelButtonText: 'Cancel',
          allowOutsideClick: false,
          confirmButtonText: 'Yes!',
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            // deleting the mission
            try {
              const payload = {
                MissionId: missionId,
              };
              await this.operatorApi.rejectMission(payload);
              await this.mapReset();

              this.disableButton = false;

              this.swalWithBootstrapButtons.fire({
                title: `Successfully Deleted`,
                focusConfirm: true,
                icon: 'success',
                timer: 1500,
                background: '#1b1f27',
                cancelButtonText: 'Cancel',
                allowOutsideClick: false,
              });
            } catch (err) {
              console.log(err);
            } finally {
              this.deleteMissionLoader = false;
              // return true;
            }
          } else {
            this.deleteMissionLoader = false;
            this.disableButton = false;
            return false;
          }
        });
    }
  }

  ngAfterViewInit(): void {
    // this.YourName.nativeElement.focus();
    this.guestProfileInitiated
      .pipe(
        filter((doneFlag) => doneFlag === true),
        switchMap(() => this.mapLayersService.initialized),
        takeUntil(this.unSubscribe)
      )
      .subscribe((viewer) => {
        if (viewer) {
          const AccessToken = new CognitoAccessToken({
            AccessToken: localStorage.getItem('userAccessToken'),
          });
          if (!AccessToken['jwtToken'] || !AccessToken['payload']) {
            this.viewer = viewer;
            this.makePolyLine();
            navigator.geolocation.getCurrentPosition((loc) => {
              this.flyingtoLoc = true;
              let weatherAPIPayload = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              };
              this.operatorApi
                .getCurrentWeather_WeatherUnion(weatherAPIPayload)
                .then(
                  (res) => {
                    let body = JSON.parse(res?.body);
                    this.currentWeatherDetails = body;
                    this.cityName = body.name;
                    this.responseCityName = body.name;

                    //to locate to current location for guest User
                    if (!AccessToken['jwtToken'] || !AccessToken['payload']) {
                      this.guestLoactionLat = loc.coords.latitude;
                      this.guestLoactionLong = loc.coords.longitude;
                      // this.missionList.OperationName = `${this.guestLoactionLat}, ${this.guestLoactionLong}`;
                      if (this.viewer) {
                        setTimeout(() => {
                          this.cesiumFunction.navigateToLocationGuest(
                            this.viewer,
                            79.0882,
                            21.1458,
                            6912000,
                            30
                          );
                        }, 1000);
                      }
                      // this.makePolyLine();
                      //getting settaltite data
                      if (this.guestUser == false) {
                        this.getsatellitesCount(
                          this.guestLoactionLat,
                          this.guestLoactionLong,
                          //120
                          this.missionList?.Altitude[0]
                        );
                      }
                    }
                    setTimeout(() => {
                      this.flyingtoLoc = false;
                    }, 3000);
                  },
                  (err) => {}
                );
            });
            // console.log(this.viewer);
            if (this.viewer.entities) {
              this.viewer.entities.removeAll();
              this.viewer.scene.requestRender();
            }
            this.activeAirspaceEntities = this.viewer.entities;
            //switching the toogle to 3D
            // using setTimeout because this operation needs
            // to be perform after everything is initialized
            // setTimeout(() => {
            //   this.toggle2D3D(true);
            // });
            this.getCameraCoordinates();
            //when guest user clicks on map
            // this.onClickonMapsGuest();
            if (this.guestUser == false) {
              this.onClickonMaps();
            }
            //when guest user moves on map
            this.onMovingCameraGuest();
            //delhi location
            // this.navigateToLocation(this.viewer, 77.2090, 28.6139, 1000);
            //center location
            // this.navigateToLocation(this.viewer,77.9477 ,  23.4733, 100000);
            //bhopal //25 degree tilt is normal
            // here timeout is neccessary when user clicks on browser back  button from login page to dashboard
            setTimeout(() => {
              this.cesiumFunction.navigateToLocationGuest(
                this.viewer,
                77.453707,
                23.27436,
                10000000,
                30
              );
            }, 500);
            this.guestLoactionLat = 23.27436;
            this.guestLoactionLong = 77.453707;
            // this.missionList.OperationName = `${this.guestLoactionLat}, ${this.guestLoactionLong}`;
            //getting settaltite data
            if (this.guestUser == false) {
              this.getsatellitesCount(
                this.guestLoactionLat,
                this.guestLoactionLong,
                this.missionList?.Altitude[0]
              );
            }
            this.loader = false;
          } else {
            this.viewer = viewer;
            //validating AccessToken for User, if User is logged in call this API
            this.getMissionList(true);

            //  Fence for RPTO
            if (
              this.profileDetails.RPTO
              // this.profileDetails?.GeoFence &&
              // this.profileDetails?.GeoFence?.FileURL
            ) {
              this.operatorService.waypointsFetch().then((value) => {
                this.FencePosition = value;

                this.mapLayersService.addRPTOGeoZone(
                  this.viewer,
                  this.FencePosition,
                  this.profileDetails?.GeoFence?.MaxAlt,
                  true
                );
              });
            }

            //remove map click listener popup if user is logged in
            this.removeOnClickonMapsGuest();
            // Remove the map scroll popup event listener when the user is logged in
            this.removeMoveStartListener();
            if (this.viewer.entities) {
              this.viewer.entities.removeAll();
              this.viewer.scene.requestRender();
            }

            this.activeAirspaceEntities = this.viewer.entities;

            let cartographic = this.viewer.scene.camera.positionCartographic;
            let lat = Cesium.Math.toDegrees(cartographic.latitude);
            let long = Cesium.Math.toDegrees(cartographic.longitude);
            let weatherAPIPayload = {
              latitude: lat,
              longitude: long,
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
            this.getCameraCoordinates();
            // Test
            if (this.guestUser == false) {
              this.onClickonMaps();
            }
          }

          this.viewerLoading = true;
        }
      });

      this.getZoneData();
  }
  onButtonClick() {
    if (this.isClicked === true) {
      this.isClicked = false;
    } else {
      this.isClicked = true;
    }
  }
  makePolyLine() {
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.handler.setInputAction((input: any) => {
      if (this.isClicked == true) {
        var pickRay = this.viewer.scene.camera.getPickRay(input.position);
        var cartesian = this.viewer.scene.globe.pick(
          pickRay,
          this.viewer.scene
        );
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        this.wayBackened.push({ x: longitude, y: latitude });
        this.pointData.push(cartesian);
        this.polyData.push(longitude, latitude);
        this.calDistance(longitude, latitude);
        if (this.pointData.length > 0) {
          const polylineProps = {
            positions: Cesium.Cartesian3.fromDegreesArray(this.polyData),
            width: 3,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromRgba(0x888e8e8e),
              dashLength: 14,
            }),
          };
          var position = Cesium.Cartesian3.fromDegrees(
            this.polyData[this.polyData.length - 2],
            this.polyData[this.polyData.length - 1]
          );
          this.viewer.entities.add({
            position: position,
            point: {
              color: Cesium.Color.fromRgba(0xaa8e8e8e),
              pixelSize: 9,
              outlineColor: Cesium.Color.TRANSPARENT,
            },
          });
          this.viewer.entities.add({
            polyline: polylineProps,
          });
        }
        if (this.pointData) {
          this.LatitudeArr = [];
          this.LongitudeArr = [];
          this.AltitudeArr = [];
          this.WayPointNum = [];
          this.wayPointsArr = this.pointData;
          this.pointData.forEach((values, index) => {
            var cartographic = Cesium.Cartographic.fromCartesian(values);
            this.LatitudeArr.push(Cesium.Math.toDegrees(cartographic.latitude));
            this.LongitudeArr.push(
              Cesium.Math.toDegrees(cartographic.longitude)
            );
            this.AltitudeArr.push(120);
            this.WayPointNum.push(String(index));
          });

          if (this.pointData.length >= 2) {
            let initialPos = [];
            let reversePos = [];
            let turfPos = [];
            this.pointData.forEach((values, index) => {
              var cartographic = Cesium.Cartographic.fromCartesian(values);
              turfPos.push([
                Cesium.Math.toDegrees(cartographic.longitude),
                Cesium.Math.toDegrees(cartographic.latitude),
              ]);
            });
            let initialArr = [];
            let latLongArr = [];
            let unionArr = [];
            let maxAltitude = Number(120) + 50;
            let arr1d = [].concat(...turfPos);

            var line = turf.lineString(turfPos);
            let line1 = turf.lineString(turfPos, { stroke: '#F00' });
            var kinks = turf.kinks(line);
            let multiLineSplit = [];
            kinks.features.forEach((val, index) => {
              multiLineSplit.push(val.geometry.coordinates);
            });
            let lineSplit = turf.lineSplit(
              line,
              turf.multiPoint(multiLineSplit)
            );
            var buffered = turf.buffer(line, Constants.missionBuffer, {
              units: 'kilometers',
              steps: 2,
            });
            if (lineSplit.features.length != 0) {
              this.lengthSplit = lineSplit.features.length;
              lineSplit.features.forEach((outer, i) => {
                let sepline;
                sepline = turf.lineString(outer.geometry.coordinates);
                let sepbuffer = turf.buffer(sepline, Constants.missionBuffer, {
                  units: 'kilometers',
                  steps: 2,
                });
                sepbuffer.geometry.coordinates.forEach((mid, j) => {
                  unionArr.push(mid);
                  mid.forEach((inner, k) => {
                    latLongArr.push([inner[0], inner[1]]);
                    // if (k != 0) {
                    initialArr.push(
                      Cesium.Cartesian3.fromDegrees(inner[0], inner[1])
                    );
                    // }
                  });
                });
              });
              let unionInitialArr = [];
              let union: any = turf.polygon([unionArr[0]], { fill: '#0f0' });
              unionArr.forEach((val, index) => {
                let value = turf.polygon([val], { fill: '#0f0' });
                union = turf.union(union, value);
              });
              this.bufferPolygon = [];
              union.geometry.coordinates[0].forEach((value) => {
                unionInitialArr.push(
                  Cesium.Cartesian3.fromDegrees(value[0], value[1], maxAltitude)
                );
                this.bufferPolygon.push([value[0], value[1], maxAltitude]);
              });
              this.bufferPointsArr = unionInitialArr;
              this.cesiumFunction.bufferRegion2D(
                this.viewer,
                union.geometry.coordinates[0]
              );
              this.entity = this.cesiumFunction.bufferRegion2Ds(
                this.viewer,
                union.geometry.coordinates[0]
              );

              latLongArr.push(latLongArr[0]);
            } else {
              this.bufferPolygon = [];
              buffered.geometry.coordinates[0].forEach((val, index) => {
                initialArr.push(
                  Cesium.Cartesian3.fromDegrees(val[0], val[1], maxAltitude)
                );
                this.bufferPolygon.push([val[0], val[1], maxAltitude]);
              });
              this.bufferPointsArr = initialArr;
              this.cesiumFunction.bufferRegion2D(
                this.viewer,
                buffered.geometry.coordinates[0]
              );
              this.entity = this.cesiumFunction.bufferRegion2Ds(
                this.viewer,
                buffered.geometry.coordinates[0]
              );
            }
          }
        }
        this.viewer.scene.requestRender();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  onReset() {
    this.pointData = [];
    this.polyData = [];
    this.LatitudeArr = [];
    this.LongitudeArr = [];
    this.AltitudeArr = [];
    this.WayPointNum = [];
    this.wayPointsArr = [];
    this.bufferPolygon = [];
    this.bufferPointsArr = [];
    this.distanceData = [];
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
    this.isClicked = false;
    this.uploaded = false;
    this.wayBackened = [];
  }
  calDistance(longitude, latitude) {
    this.distanceData.push({ longitude, latitude });
    if (this.distanceData.length === 2) {
      const coord1 = {
        latitude: this.distanceData[0].latitude,
        longitude: this.distanceData[0].longitude,
      };
      const coord2 = {
        latitude: this.distanceData[1].latitude,
        longitude: this.distanceData[1].longitude,
      };
      const cartographic1 = Cesium.Cartographic.fromDegrees(
        coord1.longitude,
        coord1.latitude
      );
      const cartographic2 = Cesium.Cartographic.fromDegrees(
        coord2.longitude,
        coord2.latitude
      );
      const cartesian1 = Cesium.Cartesian3.fromRadians(
        cartographic1.longitude,
        cartographic1.latitude
      );
      const cartesian2 = Cesium.Cartesian3.fromRadians(
        cartographic2.longitude,
        cartographic2.latitude
      );
      const distance = Cesium.Cartesian3.distance(cartesian1, cartesian2);
      this.distanceShow(cartesian1, cartesian2, distance);
      this.distanceData.shift();
    }
  }
  distanceShow(cartesian1, cartesian2, distance) {
    const midpoint = Cesium.Cartesian3.midpoint(
      cartesian1,
      cartesian2,
      new Cesium.Cartesian3()
    );
    if (distance > 40000) {
      distance = distance / 1000;
      this.viewer.entities.add({
        position: midpoint,
        label: {
          text: `${distance.toFixed(2)} km`,
          font: '20px sans-serif',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0, -10),
        },
      });
    } else {
      this.viewer.entities.add({
        position: midpoint,
        label: {
          text: `${distance.toFixed(2)} m`,
          font: '20px sans-serif',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0, -10),
        },
      });
    }
  }
  startTourPrompt() {
    this.showFirstTimeLoginDialog = false;
    localStorage.setItem('showPrompt', 'true');

    type PopoverDOM = {
      wrapper: HTMLElement;
      arrow: HTMLElement;
      title: HTMLElement;
      description: HTMLElement;
      footer: HTMLElement;
      progress: HTMLElement;
      previousButton: HTMLElement;
      nextButton: HTMLElement;
      closeButton: HTMLElement;
      footerButtons: HTMLElement;
    };

    type CustomPopoverRender = (
      popover: PopoverDOM,
      opts: { config: Config; state: State }
    ) => void;

    const customPopoverRender: CustomPopoverRender = (
      popover,
      { config, state }
    ) => {
      const totalSteps = config.steps.length;

      // close button
      // steps div
      const customStepper = document.createElement('div');
      customStepper.innerHTML = `<span class='stepper'>Step ${
        state.activeIndex + 1
      }/${totalSteps}<span>`; // Change the text as needed
      customStepper.className = 'custom-stepper'; // Add custom class for styling
      // button
      const customCloseButton = document.createElement('button');
      customCloseButton.innerText = 'Skip Tour';
      customCloseButton.className = 'custom-close-button';

      // skip tour click button
      customCloseButton.addEventListener('click', () => {
        this.operatorApi.skipTourApi(this.profileDetails.UserId);
        driverObj.destroy();
      });
      customStepper.appendChild(customCloseButton);
      // Replace the existing close button with the custom one created
      popover.closeButton.replaceWith(customStepper);
    };

    // steps configration
    const driverObj = driver({
      onPopoverRender: customPopoverRender,
      nextBtnText: 'Next',
      prevBtnText: 'Previous',
      doneBtnText: 'Done',
      smoothScroll: true,
      allowClose: false,
      stagePadding: 5,
      steps: [
        {
          element: '#nav-item-drones-gears',
          popover: {
            title: 'Add Drones and Gears',
            description:
              'Here you can add new Drones, for creating the mission you need to add the drone first.',
            showButtons: ['next'],
          },
        },
        {
          element: '.createMissionBtn',
          popover: {
            title: 'Mission Creation',
            description:
              'Here you can Create the mission, for creating the mission you need to add the drone first.',
            showButtons: ['previous', 'next'],
          },
        },
        {
          element: '#nav-item-mission',
          popover: {
            title: 'Blackbox',
            description:
              'Here you can See all the logs and analytics of your created missions.',
            onNextClick: (element, step, { config, state }) => {
              this.operatorApi.skipTourApi(this.profileDetails.UserId);
              driverObj.destroy();
            },
          },
        },
      ],
    });

    // Start the tour
    driverObj.drive();
  }

  goToProfilePage() {
    this.showFirstTimeLoginDialog = false;
    this.router.navigate([
      'operator/operator-app/operators-setting/pilots-profile',
    ]);
  }

  ngOnDestroy(): void {
    this.pointData = [];
    this.polyData = [];
    this.LatitudeArr = [];
    this.LongitudeArr = [];
    this.AltitudeArr = [];
    this.WayPointNum = [];
    this.wayPointsArr = [];
    this.bufferPolygon = [];
    this.bufferPointsArr = [];
    this.distanceData = [];
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
    this.mapLayersService.removeRPTOGeoZone(this.viewer);
    if (this.handler) {
      this.handler.destroy();
    }
    this.isClicked = false;
    if (this.viewer) {
      this.viewer.camera.moveStart.removeEventListener();
    }
    if (this.ScreenSpaceEventHandler) {
      this.ScreenSpaceEventHandler.destroy();
    }
    if (this.guestProfileInitiated) {
      this.guestProfileInitiated.unsubscribe();
    }
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Plane Finder');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Plane Desc Pins');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.droneFollow = false;
    if (this.onTickHandler) {
      this.viewer.clock.onTick.removeEventListener(this.onTickHandler);
      this.onTickHandler = undefined;
    }
    this.viewer.trackedEntity = undefined;
    this.disconnect();
    this.unSubscribe.next();
    this.unSubscribe.complete();
    this.gcsConnected = false;
    this.unSubscribeLiveDataExchange.next();
    this.unSubscribeLiveDataExchange.complete();

    // remove Listener for the camera
    if (this.moveStartEventListener) {
      this.moveStartEventListener();
    }

    // this.planeFinder$ = undefined;
    clearInterval(this.debounceTimer);

    //Live Drone Unsub
    this.liveDroneUnSubscribe.next();
    this.liveDroneUnSubscribe.complete();
    this.notificationService.clearNotifications();
    clearInterval(this.webSocketApiCall);
    clearInterval(this.payloadInterval);
    clearInterval(this.cachedInterval);
    clearInterval(this.missionListTimer);
    clearInterval(this.checkLiveDataTimer);
    clearInterval(this.startMissionTimer);
    clearInterval(this.oneLapTimer);
    window.removeEventListener('beforeunload', this.callReloadEventListener);
    if (this.worker) {
      this.worker.terminate();
    }
    //remove map click listener popup if user is logged in
    this.removeOnClickonMapsGuest();
    // Remove the map scroll popup event listener when the user is logged in
    this.removeMoveStartListener();
  }

  handleMissionDetailsUpdate = (details) => {
    // Update mission details based on the received update
    if (details) {
      this.deconfliction = details.data;
      this.notifyOperator(this.profileDetails?.UserId);
    }
  };

  async getMissionList(initial?) {
    if (
      localStorage.getItem('valueStored') &&
      this.missionListArr?.length > 0
    ) {
      // mission is running and we already have mission array then dont call api
    } else {
      let missionListPayload = {
        OperatorId: this.profileDetails?.UserId,
        Time: this.dateAndTimeFormat.dateAndTimeFormatting(
          new Date(),
          'dateAndTime'
        ),
      };
      const res = await this.operatorApi.getMissionList(missionListPayload);
      if (initial) this.toggleMissionDetailstab = false;
      this.loader = false;
      this.missionListArr = res?.data.MainData;
      this.missionListArr.forEach((arr, index) => {
        let latLongArr = [];

        arr.Latitude.forEach((lat, i) => {
          let latLong = { Latitude: lat, Longitude: arr.Longitude[i] };
          latLongArr.push(latLong);
          return latLong;
        });
        arr.LatLong = latLongArr;
      });
      let activeMission;

      if (localStorage.getItem('isLive') != 'true') {
        activeMission = JSON.parse(localStorage.getItem('valueStored'));
      }

      // if live mission is ended from the backend clear the required cache
      if (activeMission) {
        if (
          this.missionListArr == 0 ||
          !this.missionListArr.filter((mission) => {
            mission.MissionId == activeMission.MissionId;
          })
        ) {
          this.DeleteValue();
        }
      }

      //Need to be tested
      if (this.missionListArr?.length == 0 && !initial) {
        this.missionList = undefined;
        if (this.mapResetFlag) {
          this.mapReset();
        }
      } else {
        this.mapResetFlag = true;
        //Need to be tested
        if (this.missionStarted) {
        } else {
          if (activeMission != null) {
            let activeMissionIndex = this.missionListArr.findIndex(
              (mission, index) => {
                if (mission.MissionId == activeMission.MissionId) {
                  this.missionIndex = index;
                  return mission;
                }
              }
            );
            if (activeMissionIndex != -1) {
              this.missionList = this.missionListArr[activeMissionIndex];
              this.missionIndex = activeMissionIndex;
            } else {
              this.missionList = this.missionListArr[0];
              this.missionIndex = 0;
            }
          } else {
            if (initial) {
              this.missionList = this.missionListArr[0];
              this.missionIndex = 0;
            } else {
              //Need to be tested - Done
              if (this.missionList) {
                let currentMissionIndex = this.missionListArr.findIndex(
                  (mission, index) => {
                    if (mission.MissionId == this.missionList.MissionId) {
                      this.missionIndex = index;
                      return mission;
                    }
                  }
                );
                //Need to be tested - Done
                if (currentMissionIndex != -1) {
                  this.missionList = this.missionListArr[currentMissionIndex];
                  this.missionIndex = currentMissionIndex;
                }
                //Need to be tested - Done
                else {
                  this.missionList = this.missionListArr[0];
                  this.missionIndex = 0;
                }
              }
              //Need to be tested
              else {
                this.missionList = this.missionListArr[0];
                this.missionIndex = 0;
              }
            }
          }
        }
      }

      if (this.missionList) {
        await this.getElevationData(
          this.missionList.Latitude,
          this.missionList.Longitude,
          this.missionList.Altitude,
          this.missionList.AltitudeRef
        );
        if (this.guestUser == false) {
          await this.getsatellitesCount(
            this.missionList?.Latitude[0],
            this.missionList?.Longitude[0],
            this.missionList?.Altitude[0]
          );
        }
        this.checkWapointCorelation(this.missionList?.Correlation);
        await this.getnearbyAirport(this.missionList?.MissionId);
      }
      if (this.missionList?.PermissionStatus) {
        this.missionPermissionsList = [
          { module: 'MissionParameters', category: [] },
          { module: 'WeatherParameters', category: [] },
          { module: 'DroneParameters', category: [] },
        ];

        let defaultPermissionList = [
          {
            Permission: 'Auto-Approve',
            Category: 'Activity Type',
            Module: 'MissionParameters',
          },
          {
            Permission: 'Auto-Approve',
            Category: 'Airspace Restrictions',
            Module: 'MissionParameters',
          },
          {
            Permission: 'Auto-Approve',
            Category: 'Flight Time',
            Module: 'MissionParameters',
          },
          {
            Permission: 'Auto-Approve',
            Category: 'Weather',
            Module: 'WeatherParameters',
          },
          {
            Permission: 'Auto-Approve',
            Category: 'UAV Info',
            Module: 'DroneParameters',
          },
        ];
        defaultPermissionList.forEach((defaultVal) => {
          let defaultCat = this.missionList?.PermissionStatus.some(
            (val) => val.Category == defaultVal.Category
          );
          if (!defaultCat) this.missionList?.PermissionStatus.push(defaultVal);
        });

        this.missionPermissionsList.forEach((modules) => {
          this.missionList?.PermissionStatus.forEach((permission) => {
            if (modules.module == permission.Module) {
              let categoryIndex = modules.category.findIndex(
                (val) => val?.Name == permission?.Category
              );
              if (categoryIndex != -1) {
                if (
                  !modules.category[categoryIndex].types.find(
                    (val) =>
                      val.Type == permission.Type &&
                      val.Permission == permission.Permission
                  )
                ) {
                  modules.category[categoryIndex].types.push(permission);
                }
              } else {
                modules.category.push({
                  Name: permission.Category,
                  types: [permission],
                });
              }
            }
          });
        });
        this.missionPermissionsList.forEach((modules) => {
          modules.category.forEach((category) => {
            category.permission = category.types.some(
              (type) => type.Permission == 'Auto-Reject'
            )
              ? 'Auto-Reject'
              : category.types.some((type) => type.Permission == 'Manual')
              ? 'Manual'
              : 'Auto-Approve';
          });
          modules = {
            ...modules,
          };
        });
        let tempPemissionList = [];
        this.missionPermissionsList.forEach((module) => {
          tempPemissionList.push(...module.category);
        });
        this.missionPermissionsList = tempPemissionList;
      }

      if (
        !this.profileDetails.RPTO &&
        !this.profileDetails.GeoFence &&
        !this.profileDetails?.GeoFence?.FileURL
      ) {
        if (!this.missionStarted) {
          if (
            this.missionList?.Longitude &&
            this.missionList?.Latitude &&
            this.missionList?.Waypoints &&
            this.missionList?.BufferRegion
          ) {
            if (this.missionList?.Latitude?.length != 1) {
              if (this.toggleFlag) {
                this.cesiumFunction.loadWayPoints2D(
                  this.viewer,
                  this.missionList.Longitude,
                  this.missionList.Latitude,
                  this.missionList?.Altitude
                );
              } else {
                this.cesiumFunction.loadWayPoints(
                  this.viewer,
                  this.missionList.Longitude,
                  this.missionList.Latitude,
                  this.missionList?.Altitude
                );
              }
              this.cesiumFunction.labelWaypoints(
                this.viewer,
                this.missionList.Longitude,
                this.missionList.Latitude,
                this.missionList?.Altitude,
                this.missionList.WayPointNum
              );
              if (
                this.missionList?.wayPointFileDetails?.length != 0 &&
                this.missionList?.wayPointFileDetails
              ) {
                this.cesiumFunction.customLabelWaypoints(
                  this.viewer,
                  this.missionList?.wayPointFileDetails,
                  this.missionList?.Altitude
                );
              }
            }

            let entity;
            if (
              this.missionList?.OperationName.includes('MissionWP') &&
              this.missionList?.Longitude.length <= 2
            ) {
              entity = this.cesiumFunction.bufferRegion(
                this.viewer,
                this.missionList?.BufferRegion
              );
            } else {
              entity = await this.cesiumFunction.polylineVolume(
                this.viewer,
                this.missionList?.Longitude,
                this.missionList?.Latitude,
                this.missionList?.Altitude
              );
            }
            if (initial) {
              this.cesiumFunction.zoomEntity1(
                this.viewer,
                entity,
                this.missionList?.BufferRegion
              );
            }
            await this.getActiveAirBufferSpaces();
            if (!localStorage.getItem('isLive')) {
              this.autoMissionStart();
            }
          } else {
            if (initial) {
              if (
                !this.profileDetails.RPTO &&
                !this.profileDetails?.GeoFence?.FileURL
              ) {
                this.cesiumFunction.navigateToCurrrentLocation(this.viewer);
              }
            }
          }
        } else if (this.missionStarted) {
          if (
            this.missionList?.Longitude &&
            this.missionList?.Latitude &&
            this.missionList?.Waypoints &&
            this.missionList?.BufferRegion
          ) {
            if (this.missionList?.Latitude?.length != 1) {
              if (this.toggleFlag) {
                this.cesiumFunction.loadWayPoints2D(
                  this.viewer,
                  this.missionList.Longitude,
                  this.missionList.Latitude,
                  this.missionList?.Altitude
                );
              } else {
                this.cesiumFunction.loadWayPoints(
                  this.viewer,
                  this.missionList.Longitude,
                  this.missionList.Latitude,
                  this.missionList?.Altitude
                );
              }
              this.cesiumFunction.labelWaypoints(
                this.viewer,
                this.missionList.Longitude,
                this.missionList.Latitude,
                this.missionList?.Altitude,
                this.missionList.WayPointNum
              );
              if (
                this.missionList?.wayPointFileDetails?.length != 0 &&
                this.missionList?.wayPointFileDetails
              ) {
                this.cesiumFunction.customLabelWaypoints(
                  this.viewer,
                  this.missionList?.wayPointFileDetails,
                  this.missionList?.Altitude
                );
              }
            }

            let entity;
            if (
              this.missionList?.OperationName.includes('MissionWP') &&
              this.missionList?.Longitude.length <= 2
            ) {
              entity = this.cesiumFunction.bufferRegion(
                this.viewer,
                this.missionList?.BufferRegion
              );
            } else {
              entity = await this.cesiumFunction.polylineVolume(
                this.viewer,
                this.missionList?.Longitude,
                this.missionList?.Latitude,
                this.missionList?.Altitude
              );
            }
            if (initial) {
              this.cesiumFunction.zoomEntity1(
                this.viewer,
                entity,
                this.cesiumFunction.bufferRegion
              );
            }
            await this.getActiveAirBufferSpaces();
            this.autoMissionStart();
          } else {
            if (initial) {
              if (!this.profileDetails.RPTO) {
                this.cesiumFunction.navigateToCurrrentLocation(this.viewer);
              }
            }
          }
        }
      } else {
        if (
          this.missionStarted &&
          this.missionList?.Longitude &&
          this.missionList?.Latitude &&
          this.missionList?.Waypoints &&
          this.missionList?.BufferRegion
        ) {
          await this.getActiveAirBufferSpaces();
        }
        if (!localStorage.getItem('isLive')) {
          this.autoMissionStart();
        }
      }
    }
    if (this.missionListArr.length === 0) {
      // this.viewer.entities.removeAll();
      this.viewer.scene.requestRender();
    }
  }
  //Map Resetting
  async mapReset() {
    if (
      !this.profileDetails.RPTO &&
      !this.profileDetails.GeoFence &&
      !this.profileDetails?.GeoFence?.FileURL
    ) {
      this.cesiumFunction.navigateToCurrrentLocation(this.viewer);
    }
    this.viewer.entities.removeAll();
    this.mapResetFlag = false;
    await this.getMissionList();
  }

  // Multiple Mission
  async getSpecifiedMission(cursorVal) {
    if (!this.missionStarted) {
      if (cursorVal == 'prev') {
        this.missionIndex--;
      } else {
        this.missionIndex++;
      }

      this.unSubscribe.next();
      this.unSubscribe.complete();
      this.missionList = this.missionListArr[this.missionIndex];
      this.getElevationData(
        this.missionList.Latitude,
        this.missionList.Longitude,
        this.missionList.Altitude,
        this.missionList.AltitudeRef
      );

      if (this.missionList) {
        this.missionPermissionsList = [
          { module: 'MissionParameters', category: [] },
          { module: 'DroneParameters', category: [] },
          { module: 'WeatherParameters', category: [] },
        ];

        let defaultPermissionList = [
          {
            Permission: 'Auto-Approve',
            Category: 'Activity Type',
            Module: 'MissionParameters',
          },
          {
            Permission: 'Auto-Approve',
            Category: 'Airspace Restrictions',
            Module: 'MissionParameters',
          },
          {
            Permission: 'Auto-Approve',
            Category: 'Flight Time',
            Module: 'MissionParameters',
          },
          {
            Permission: 'Auto-Approve',
            Category: 'Weather',
            Module: 'WeatherParameters',
          },
          {
            Permission: 'Auto-Approve',
            Category: 'UAV Info',
            Module: 'DroneParameters',
          },
        ];
        defaultPermissionList.forEach((defaultVal) => {
          let defaultCat = this.missionList?.PermissionStatus.some(
            (val) => val.Category == defaultVal.Category
          );
          if (!defaultCat) this.missionList?.PermissionStatus.push(defaultVal);
        });

        this.missionPermissionsList.forEach((modules) => {
          this.missionList?.PermissionStatus.forEach((permission) => {
            if (modules.module == permission.Module) {
              let categoryIndex = modules.category.findIndex(
                (val) => val?.Name == permission?.Category
              );
              if (categoryIndex != -1) {
                if (
                  !modules.category[categoryIndex].types.find(
                    (val) =>
                      val.Type == permission.Type &&
                      val.Permission == permission.Permission
                  )
                ) {
                  modules.category[categoryIndex].types.push(permission);
                }
              } else {
                modules.category.push({
                  Name: permission.Category,
                  types: [permission],
                });
              }
            }
          });
        });
        this.missionPermissionsList.forEach((modules) => {
          modules.category.forEach((category) => {
            category.permission = category.types.some(
              (type) => type.Permission == 'Auto-Reject'
            )
              ? 'Auto-Reject'
              : category.types.some((type) => type.Permission == 'Manual')
              ? 'Manual'
              : 'Auto-Approve';
          });
          modules = {
            ...modules,
          };
        });
        let tempPemissionList = [];
        this.missionPermissionsList.forEach((module) => {
          tempPemissionList.push(...module.category);
        });
        this.missionPermissionsList = tempPemissionList;
      }
      if (
        this.missionList?.Longitude &&
        this.missionList?.Latitude &&
        this.missionList?.Waypoints &&
        this.missionList?.BufferRegion
      ) {
        this.cesiumFunction.removeEntities(this.viewer.entities, 'Label');
        this.cesiumFunction.removeEntities(this.viewer.entities, 'CustomLabel');
        this.cesiumFunction.removeEntities(
          this.viewer.entities,
          'BufferRegion'
        );
        this.cesiumFunction.removeEntities(this.viewer.entities, 'WayPoint');

        if (this.missionList?.Latitude?.length != 1) {
          if (this.toggleFlag) {
            this.cesiumFunction.loadWayPoints2D(
              this.viewer,
              this.missionList.Longitude,
              this.missionList.Latitude,
              this.missionList?.Altitude
            );
          } else {
            this.cesiumFunction.loadWayPoints(
              this.viewer,
              this.missionList.Longitude,
              this.missionList.Latitude,
              this.missionList?.Altitude
            );
          }
          this.cesiumFunction.labelWaypoints(
            this.viewer,
            this.missionList.Longitude,
            this.missionList.Latitude,
            this.missionList?.Altitude,
            this.missionList.WayPointNum
          );
          if (
            this.missionList?.wayPointFileDetails?.length != 0 &&
            this.missionList?.wayPointFileDetails
          ) {
            this.cesiumFunction.customLabelWaypoints(
              this.viewer,
              this.missionList?.wayPointFileDetails,
              this.missionList?.Altitude
            );
          }
        }
        let entity;
        if (
          this.missionList?.OperationName.includes('MissionWP') &&
          this.missionList?.Longitude.length <= 2
        ) {
          entity = this.cesiumFunction.bufferRegion(
            this.viewer,
            this.missionList?.BufferRegion
          );
        } else {
          entity = await this.cesiumFunction.polylineVolume(
            this.viewer,
            this.missionList?.Longitude,
            this.missionList?.Latitude,
            this.missionList?.Altitude
          );
        }
        this.cesiumFunction.zoomEntity1(
          this.viewer,
          entity,
          this.missionList?.BufferRegion
        );

        this.getActiveAirBufferSpaces();
        // let liveMission = JSON.parse( localStorage.getItem('missionStarted'));
        // if(liveMission.MissionId == this.missionList?.MissionId) {
        // }
      } else {
        if (
          !this.profileDetails.RPTO &&
          this.profileDetails?.GeoFence &&
          this.profileDetails?.GeoFence?.FileURL
        ) {
          this.cesiumFunction.navigateToCurrrentLocation(this.viewer);
        }
      }
    }
  }

  getDronesAndGearList(): any {
    let payload = {
      OperatorId: this.profileDetails?.UserId,
    };

    // Now above API used as service
    this.operatorApi.dronesAndGearsData$
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((res) => {
        if (res !== null) {
          this.dronesAndGearList = res?.['data']?.MainData['DronesAndGears'];
          //enable creat-mission button after getting data
          this.createMissionBtnDisabled = false;
        }
        // console.log("subscribe from dashboard itself: ", res)
      });
  }

  //OpenWeather
  onWeatherForm() {
    if (this.cityName) {
      this.flyingtoLoc = true;
      this.operatorApi.getCurrentWeatherByCityName(this.cityName).then(
        (res: any) => {
          this.NotFound = '';
          this.currentWeatherDetails = res;
          this.cityName = res.name;
          this.responseCityName = res.name;
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              this.currentWeatherDetails.coord.lon,
              this.currentWeatherDetails.coord.lat,
              10000
            ),
          });
          setTimeout(() => {
            this.flyingtoLoc = false;
          }, 3000);
        },
        (err) => {
          this.NotFound = err.error.message;
        }
      );
    }
  }

  //WS
  // when we start the mission
  connect(
    missionId,
    missionStatus,
    bufferCoord,
    altitudeArr,
    latitudeArr,
    longitudeArr
  ) {
    this.missionErrFlag = true;
    this.missionstartloader = true;
    if (missionStatus == 'Approved') {
      this.missionErrFlag = false;
      this.webSocketError = false;
      let target = 'ws://localhost:56781/websocket/server';
      if (target == '') {
        alert('Please select server side connection implementation.');
        this.missionstartloader = false;
        return;
      }
      if ('WebSocket' in window) {
        // if (this.ws?.readyState != WebSocket.OPEN) {
        //   this.ws = new WebSocket(target);
        // }
        if ((!this.ws || this.ws.readyState !== WebSocket.OPEN) && !this.mode) {
          this.ws = new WebSocket(target);
        }
        else{
          this.missionstartloader = false;
          if(this.mode){
            this.autoCheckForStartMissionWithoutMP(
              missionId,
              missionStatus,
              bufferCoord,
              altitudeArr,
              latitudeArr,
              longitudeArr
            );
            this.wsConnected = true;
            return;
          }
        }
      } else {
        alert('WebSocket is not supported by this browser.');
        this.missionstartloader = false;
        return;
      }
      this.ws.onopen = () => {
        this.wsConnected = true;
        this.autoCheckForStartMission(
          missionId,
          missionStatus,
          bufferCoord,
          altitudeArr,
          latitudeArr,
          longitudeArr
        );
        if (this.socketCloseErr == true) {
          this.socketCloseErr = false;
          this.notificationService.notify({
            title: 'GCS Connection established',
            type: NotificationType.success,
            message: 'Done',
            duration: 5000,
          });
        }
      };
      this.ws.onerror = (event) => {
        // notification if there is no GCS connection
        this.socketCloseErr = true;
        this.autoCheckForStartMissionWithoutMP(
          missionId,
          missionStatus,
          bufferCoord,
          altitudeArr,
          latitudeArr,
          longitudeArr
        );
        this.wsConnected = false;
        if(this.socketType !== 'OTHER'){
          this.notificationService.notify({
            title: 'GCS Connection is closed',
            type: NotificationType.warning,
            message: 'Please make sure the software is initialized',
            duration: 5000,
          });
        }

        // this.webSocketError = true;
        this.checkForOneLapConnection();
      };

      this.ws.onmessage = (event) => {
        this.webSocketError = false;

        // for changing to one-lap
        // let oneLapConnected = false;
        let realTimeLogs = JSON.parse(event.data);

        if (
          Object.keys(realTimeLogs).length !== 0 &&
          event.data != '{}' &&
          realTimeLogs.hasOwnProperty('firmware') &&
          (realTimeLogs.linkqualitygcs < 50 || realTimeLogs.connected == false)
        ) {
          this.ws.close();
        }
        if(this.socketType === 'MISSION_PLANNER'){
          if (this.wsConnected) {
            this.wsConnectedLogs(event, missionId);
          }
        }else{
          this.ws.close();
        }
      };
      this.ws.onclose = (event) => {
        if (this.webSocketValue != null) {
          this.checkForOneLapConnection();
        }
        this.missionstartloader = false;
      };
    } else this.missionstartloader = false;
  }
  ConnectToOneLap() {
    console.log('Connect To One-Lap');
    this.ws.close();
  }

  terrianAdvisoryNotification(point, alt) {
    const missionData = this.missionList;
    const correlationData = missionData.Correlation;
    let inneryellow = false,
      outeryellow = false,
      redzone = false;
    this.advisoryNotification = {};

    if (this.liveAltitude >= 59) {
      // reservedAirspace
      if (correlationData.airport && correlationData.airport.length > 0) {
        const airport = correlationData.airport;

        for (let i = 0; i < airport.length; i++) {
          const poly = turf.polygon([airport[i].coOrdinates]);
          if (turf.booleanPointInPolygon(point, poly)) {
            if (airport[i].type == 'Red-Zone') {
              redzone = true;
              break;
            }
            if (airport[i].type == 'Outer-Yellow') outeryellow = true;
            if (airport[i].type == 'Inner-Yellow') inneryellow = true;
          }
        }
        if (redzone) {
          this.advisoryNotification = {
            message: `You are intersecting with Red Zone`,
          };
          return;
        } else if (inneryellow) {
          this.advisoryNotification = {
            message: `You are intersecting with Inner Yellow Zone`,
          };
          return;
        } else if (outeryellow) {
          this.advisoryNotification = {
            message: `You are intersecting with Outer Yellow Zone`,
          };
          return;
        } else {
          delete this.advisoryNotification.message;
        }
      }
      // geozone
      if (correlationData.geozone && correlationData.geozone.length > 0) {
        const geozone = correlationData.geozone;
        for (let i = 0; i < geozone.length; i++) {
          const poly = turf.polygon([geozone[i].coOrdinates]);

          if (turf.booleanPointInPolygon(point, poly)) {
            // point in zone
            if (alt > 60)
              this.advisoryNotification = {
                message: `You are intersecting with ${geozone[i].type}`,
              };
            return;
          } else {
            delete this.advisoryNotification.message;
          }
        }
      }
      // greenzone
      if (alt > 120) {
        this.advisoryNotification = {
          message: 'kindly fly your drone below 120m',
        };
      } else {
        delete this.advisoryNotification.message;
      }
    } else {
      // // RPTO geoFence
      if (
        this.profileDetails.RPTO &&
        this.profileDetails?.GeoFence &&
        this.profileDetails?.GeoFence?.FileURL
      ) {
        let structuredGeoFence = [];
        for (let i = 0; i < this.FencePosition.length; i += 3) {
          structuredGeoFence.push([
            parseFloat(this.FencePosition[i]),
            parseFloat(this.FencePosition[i + 1]),
          ]);
        }
        const poly = turf.polygon([structuredGeoFence]);

        if (!turf.booleanPointInPolygon(point, poly)) {
          this.advisoryNotification = {
            message: `You are outside Geo Fence.`,
          };
        }
      } else {
        delete this.advisoryNotification.message;
      }
    }
  }

  wsConnectedLogs(event, missionId) {
    let realTimeLogs;
    if(this.socketType === "MISSION_PLANNER"){
      realTimeLogs = JSON.parse(event.data);
    }else{
      realTimeLogs = event;
    }
    
    if (
      Object.keys(realTimeLogs).length !== 0 &&
      event.data != '{}' &&
      realTimeLogs.hasOwnProperty('firmware') || this.socketType === "OTHER"
    ) {
      //commented for drone test
      // && realTimeLogs.hasOwnProperty("armed")
      // realTimeLogs.hasOwnProperty("sensors_enabled")
      // if (realTimeLogs.sensors_enabled?.motor_control) {
      this.webSocketValue = realTimeLogs;
      if(this.socketType === 'OTHER'){
        this.webSocketValue = realTimeLogs.message;
        this.webSocketValue = {
          ...this.webSocketValue,
          ...this.webSocketValue.navigation,
          ...this.webSocketValue.additional_info,
          ...this.webSocketValue.status,
          ...this.webSocketValue.system,
          lat: this.webSocketValue.position.latitude,
          lng: this.webSocketValue.position.longitude,
          alt: this.webSocketValue.position.altitude,
          battery_remaining: this.webSocketValue.system.battery_remaining,
          battery_voltage: this.webSocketValue.system.battery_voltage,
          groundspeed: this.webSocketValue.additional_info.ground_speed,
          modeVal: this.webSocketValue.status.mode,
          distTraveled : this.webSocketValue.additional_info.dist_traveled,
        }
        realTimeLogs = this.webSocketValue
        if(this.zoomForOtherMission && (this.webSocketValue.lat || this.webSocketValue.lng)){
          this.zoomForOtherMission= false;
          this.zoomOnMap(this.webSocketValue.lat,this.webSocketValue.lng,this.webSocketValue.alt);
        }
      }
      // else{
        // if(this.zoomForMissionPlanner && this.webSocketValue.lat || this.webSocketValue.lng ){
          // this.zoomForMissionPlanner= false;
         // this.zoomOnMap(this.webSocketValue.lat,this.webSocketValue.lng,this.webSocketValue.alt);
        // }
      // }

      this.liveLatitude = this.webSocketValue.lat;
      this.liveLongitude = this.webSocketValue.lng;
      this.liveAltitude = this.webSocketValue.alt;

      this.nav_bearing = this.webSocketValue?.nav_bearing;
      this.nav_pitch = this.webSocketValue?.nav_pitch;
      this.nav_roll = this.webSocketValue?.nav_roll;
      this.liveMessage = this.webSocketValue?.message;

      //message notifications
      this.liveMessage !== ''
        ? (this.liveMessageNotification = true)
        : (this.liveMessageNotification = false);

      // dont call unless drone is on altitude 59m.
      if (this.liveLatitude != 0 && this.liveLongitude != 0) {
        this.terrianAdvisoryNotification(
          [this.webSocketValue.lng, this.webSocketValue.lat],
          this.liveAltitude
        );
      } else {
        if (this.advisoryNotification && this.advisoryNotification.message) {
          delete this.advisoryNotification.message;
        }
      }
      let positions = [];
      var cartographic = Cesium.Cartographic.fromDegrees(
        this.liveLongitude,
        this.liveLatitude,
        this.liveAltitude
      );
      positions.push(cartographic);
      this.droneConnected = true;
      this.missionTime = true;
      this.enableStartMission = true;
      let firstTriggerVal = JSON.parse(localStorage.getItem('wsStartMission'));
      if (
        localStorage.getItem('wsStartMission') === null ||
        firstTriggerVal?.missionId != missionId
      ) {
        if (!this.saveTheLogs) {
          //Call Create Mission Logs
          //Call first Trigger
          this.saveTheLogs = true;
          this.asOfDate = this.dateAndTimeFormat.dateAndTimeFormatting(
            new Date(),
            'date'
          );
          this.CurrentTime = this.dateAndTimeFormat.dateAndTimeFormatting(
            new Date(),
            'time'
          );
          let firstTriggerPayload = {
            MissionId: missionId,
            AsOfDate: this.asOfDate,
            StreamingStartTime: this.CurrentTime,
            motor_control: realTimeLogs?.sensors_enabled?.motor_control ? realTimeLogs?.sensors_enabled?.motor_control : true,
            rc_receiver: realTimeLogs?.sensors_enabled?.rc_receiver ? realTimeLogs?.sensors_enabled?.rc_receiver : true , //WS
            gps: realTimeLogs?.sensors_enabled?.gps ? realTimeLogs?.sensors_enabled?.gps : true, //WS
            logging: realTimeLogs?.sensors_health?.logging ? realTimeLogs?.sensors_health?.logging : true, //WS
            prearm: realTimeLogs?.sensors_enabled?.prearm ? realTimeLogs?.sensors_enabled?.prearm : true , //WS
            alt: realTimeLogs?.alt, //WS
            CreatedById: this.profileDetails?.UserId, //Profile Details
            CreatedByName: this.profileDetails?.FirstName, //Profile Details
            messages: realTimeLogs?.messages ? realTimeLogs?.messages : '' ,
            message: realTimeLogs?.message ? realTimeLogs?.message : 'VTOL approach d=1542.3', //ws
            messageHigh: realTimeLogs?.messageHigh ? realTimeLogs?.messageHigh : '', //ws
            battery_voltage: realTimeLogs?.battery_voltage ? realTimeLogs?.battery_voltage : 0, //ws
            datetimeLog: realTimeLogs?.datetime ? realTimeLogs?.datetime : 
            this.dateAndTimeFormat.dateAndTimeFormatting(
              new Date(),
              'fulldateAndTime'
            ) ,
            datetime: this.dateAndTimeFormat.dateAndTimeFormatting(
              new Date(),
              'fulldateAndTime'
            ),
            gpsstatus: realTimeLogs?.gpsstatus ? realTimeLogs?.gpsstatus : 6,
          };
          this.operatorApi
            .createMissionLogs(firstTriggerPayload)
            .then((res) => {
              this.triggerId = res.data.MainData.TriggerId;
              let firstTrigger = {
                asOfDate: this.asOfDate,
                CurrentTime: this.CurrentTime,
                triggerId: this.triggerId,
                missionId: missionId,
              };
              localStorage.setItem(
                'wsStartMission',
                JSON.stringify(firstTrigger)
              );
              this.missionstartloader = false;
            });
        }
      }

      if (realTimeLogs?.armed && realTimeLogs?.sensors_health?.logging) {
        //Call Second API
        //Update logs API
        this.armedEnabled = true;
        this.droneErrors = '';
      } else if (this.armedEnabled && !realTimeLogs?.armed) {
        //Call Second API
        //Update logs API
        if (realTimeLogs?.landed) {
          this.droneErrors = 'Drone Landed';
        } else {
          this.droneErrors = 'Drone not in use';
        }
      }

      //Added for drone test
      this.secondTrigger = true;

      // }
      if (this.droneStarted && !realTimeLogs?.sensors_enabled.motor_control) {
        this.droneErrors = 'Fail Safe Error';
      }
    }
  }

  autoCheckForStartMission(
    missionId,
    missionStatus,
    bufferCoord,
    altitudeArr,
    latitudeArr,
    longitudeArr
  ) {
    if (
      this.wsConnected &&
      this.enableStartMission &&
      this.droneConnected &&
      missionStatus == 'Approved' &&
      this.missionTime
    ) {
      if (!this.missionStarted || !this.gcsConnected) {
        this.startMission(
          missionId,
          missionStatus,
          bufferCoord,
          altitudeArr,
          latitudeArr,
          longitudeArr
        );
      }
    } else {
      setTimeout(() => {
        this.autoCheckForStartMission(
          missionId,
          missionStatus,
          bufferCoord,
          altitudeArr,
          latitudeArr,
          longitudeArr
        );
      }, 1000);
    }
  }
  disconnect() {
    this.webSocketValue = null;
    if (this.ws != null) {
      this.wsConnected = false;
      this.ws.close();
      this.ws = null;
      // this.endMission(); //@skp : no use calling this as it won't trigger the api hence any other inside it.
      this.socketCloseErr = false;
    }
  }

  //Auto Mission Start
  autoMissionStart() {
    let activeMission;
    // if (localStorage.getItem('isLive') != 'true') {
    activeMission = JSON.parse(localStorage.getItem('valueStored'));
    // }
    if (activeMission != null) {
      this.connect(
        activeMission.MissionId,
        activeMission.MissionStatus,
        activeMission.BufferRegion,
        activeMission.Altitude,
        activeMission.Latitude,
        activeMission.Longitude
      );
    }
  }

  startMission(
    missionId,
    missionStatus,
    bufferCoord,
    altitudeArr,
    latitudeArr,
    longitudeArr
  ) {
    localStorage.setItem('isLive', 'true');

    this.worker = new Worker(
      new URL('./operator-dashboard.worker', import.meta.url),
      {
        type: 'module',
        name: 'worker-one',
      }
    );
    this.StoreValue(this.missionList);
    clearInterval(this.startMissionTimer);
    this.liveDronePath = undefined;
    window.addEventListener('beforeunload', this.callReloadEventListener);
    this.missionStarted = true;
    window.addEventListener('beforeunload', () => {
      if (this.missionStarted == true) {
        localStorage.removeItem('isLive');
      }
    });
    let payload = {
      MissionId: missionId,
    };
    this.operatorApi.startMission(payload).then((res) => {
      this.StoreValue(this.missionList);
      // if(this.socketType == 'OTHER'){
      //   this.redirectToMissionPlanner()
      // }
      // @SL - Updating the stream mode
      this.UAVLogMode = this.StreamModes.MP;
      this.updateLiveStreamMode(missionId, this.StreamModes.MP);

      if (localStorage.getItem('wsStartMission') !== null) {
        let firstTriggerVal = JSON.parse(
          localStorage.getItem('wsStartMission')
        );
        this.asOfDate = firstTriggerVal.asOfDate;
        this.CurrentTime = firstTriggerVal.CurrentTime;
        this.triggerId = firstTriggerVal.triggerId;
        this.webSocketService.sendMessage({
          action: 'set-trigger-to-operator',
          operatorId: this.profileDetails?.UserId,
          triggerId: this.triggerId,
        });
      }
      if (this.webSocketApiCall) {
        clearInterval(this.webSocketApiCall);
      }
      this.webSocketApiCall = setInterval(() => {
        if (this.secondTrigger) {
          this.webSocketApiFunc();
        }
      }, 500);
      if (this.cachedInterval) {
        clearInterval(this.cachedInterval);
      }
      this.cachedInterval = setInterval(() => {
        if (this.secondTrigger) {
          this.reloadCache();
        }
      }, 30000);

      if (this.payloadInterval) {
        clearInterval(this.payloadInterval);
      }
      this.payloadInterval = setInterval(() => {
        // @yash throws error if there is no websocketValue added condition -> this.webSocketValue
        if (this.secondTrigger && this.webSocketValue) {
          this.pushPayload();
        }
      }, 500);
      this.gcsConnected = true;
    });

    // drone Image Function
    this.createAndUpdateDroneWithBuffer(
      bufferCoord,
      altitudeArr,
      latitudeArr,
      longitudeArr
    );
  }
  // all the drone model updating, positioning, buffer region of drone,
  // updating of buffer region, trailing , time
  createAndUpdateDroneWithBuffer(
    bufferCoord,
    altitudeArr,
    latitudeArr,
    longitudeArr
  ) {
    let bufferArr = [];
    bufferCoord.forEach((arr, index) => {
      var cartographic = Cesium.Cartographic.fromCartesian(arr);
      bufferArr.push([
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
      ]);
    });
    var pt = turf.point([this.liveLongitude, this.liveLatitude]);
    var poly = turf.polygon([bufferArr]);
    let maxAlt = Math.max(...altitudeArr) + 50;
    if (!this.droneBufferEntity || !this.droneBufferHierarchy) {
      this.cesiumFunction
        .droneBuffer3D(
          this.viewer,
          this.liveLatitude,
          this.liveLongitude,
          this.liveAltitude
        )
        .then((res: any) => {
          [this.droneBufferEntity, this.droneBufferHierarchy] = res;
        });
    }
    if (!this.liveDronePath) {
      this.liveDronePath = {
        longitude: this.liveLongitude,
        latitude: this.liveLatitude,
        altitude: this.liveAltitude,
      };
    }
    this.droneName = this.missionList?.UAVInfoType?.Value;
    if (!this.droneImageEntity || !this.positionProperty) {
      if (this.droneName == 'Fixed Wing' || this.droneName == 'Hybrid e-VTOL') {
        [this.droneImageEntity, this.positionProperty] =
          this.cesiumFunction.FixedWingdroneImages3D(
            this.viewer,
            this.liveLatitude,
            this.liveLongitude,
            this.liveAltitude,
            this.nav_bearing,
            this.nav_pitch,
            this.nav_roll
          );
      } else {
        [this.droneImageEntity, this.positionProperty] =
          this.cesiumFunction.droneImages3D(
            this.viewer,
            this.liveLatitude,
            this.liveLongitude,
            this.liveAltitude,
            this.nav_bearing,
            this.nav_pitch,
            this.nav_roll
          );
      }
    }
    if (!this.droneImageTimer) {
      this.droneImageTimer = setInterval(async () => {
        if (this.liveLongitude !== 0 && this.liveLatitude !== 0) {
          let pt = turf.point([
            this.liveLongitude,
            this.liveLatitude,
            this.liveAltitude,
          ]);
          var poly = turf.polygon([bufferArr]);
          let horizontalChecking =
            !turf.booleanPointInPolygon(pt, poly) ||
            maxAlt <= this.liveAltitude;
          // vertically
          let verticalChecking = false;
          if (horizontalChecking == false) {
            verticalChecking = await this.verticalDroneLeftitsBuffer(
              pt,
              latitudeArr,
              longitudeArr,
              altitudeArr
            );
          }
          this.droneOutsideBuffer = horizontalChecking || verticalChecking;
          if (this.droneBufferEntity && this.droneBufferHierarchy) {
            this.cesiumFunction.updatedroneBuffer3D(
              this.droneBufferEntity,
              this.liveLatitude,
              this.liveLongitude,
              this.liveAltitude,
              this.deconfliction?.Deconfliction || this.droneOutsideBuffer,
              this.droneBufferHierarchy
            );
          }
          if (
            this.droneName == 'Fixed Wing' ||
            this.droneName == 'Hybrid e-VTOL'
          ) {
            this.cesiumFunction.FixedupdateDroneImage3D(
              this.liveLatitude,
              this.liveLongitude,
              this.liveAltitude,
              this.nav_bearing,
              this.nav_pitch,
              this.nav_roll,
              this.droneImageEntity,
              this.viewer,
              this.positionProperty
            );
          } else {
            this.cesiumFunction.updateDroneImage3D(
              this.liveLatitude,
              this.liveLongitude,
              this.liveAltitude,
              this.nav_bearing,
              this.nav_pitch,
              this.nav_roll,
              this.droneImageEntity,
              this.viewer,
              this.positionProperty
            );
          }
          this.liveAlt = 0;
          this.liveDist = 0;
          this.liveAlt = this.liveAltitude;
          this.liveDist = this.webSocketValue?.distTraveled;
          if (this.liveDist >= this.distances[this.indexs]) {
            this.initBasicAreaEcharts(
              this.elevationData,
              this.droneHeight,
              this.distances,
              this.chartSize,
              this.numfont,
              this.xgap,
              this.ygap,
              this.liveAlt,
              this.liveDist
            );
            this.indexs++;
          }
          if (
            this.liveAlt <= 50 &&
            this.liveDist >= 500 &&
            this.liveAlt >= 48
          ) {
            this.initBasicAreaEcharts(
              this.elevationData,
              this.droneHeight,
              this.distances,
              this.chartSize,
              this.numfont,
              this.xgap,
              this.ygap,
              this.liveAlt,
              this.liveDist
            );
          }
          if (this.liveAlt <= 10 && this.liveDist >= 500 && this.execute) {
            this.initBasicAreaEcharts(
              this.elevationData,
              this.droneHeight,
              this.distances,
              this.chartSize,
              this.numfont,
              this.xgap,
              this.ygap,
              this.liveAlt,
              this.liveDist
            );
            this.execute = false;
          }
        }
        if (
          this.liveDronePath &&
          this.liveDronePath.longitude != this.liveLongitude &&
          this.liveDronePath.latitude != this.liveLatitude
        ) {
          const positions = [
            this.liveDronePath.longitude,
            this.liveDronePath.latitude,
            this.liveDronePath.altitude,
            this.liveLongitude,
            this.liveLatitude,
            this.liveAltitude,
          ];
          this.cesiumFunction.activeDroneTrailing(this.viewer, positions);
        }
        this.liveDronePath = {
          longitude: this.liveLongitude,
          latitude: this.liveLatitude,
          altitude: this.liveAltitude,
        };
        if (this.CurrentTime)
          this.flightTime = this.calculateTimePassed(this.CurrentTime);
      }, 200);
    }
  }
  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }
  // alphabeticValidator(control: AbstractControl): ValidationErrors | null {
  //   const alphabeticRegex = /^[a-zA-Z]+$/;
  //   const valid = alphabeticRegex.test(control.value);
  //   return valid ? { alphabetic: true } : { alphabetic: false };
  // }
  alphabeticValidator(control: AbstractControl): ValidationErrors | null {
    const alphabeticRegex = /^[a-zA-Z\s]+$/;
    const valid = alphabeticRegex.test(control.value);
    return valid ? { alphabetic: true } : { alphabetic: false };
  }

  numericValidator(control: AbstractControl): ValidationErrors | null {
    const numericRegex = /^[0-9]+$/;
    const valid = numericRegex.test(control.value);
    return valid ? { numeric: true } : { numeric: false };
  }
  async verticalDroneLeftitsBuffer(pt, latitudeArr, longitudeArr, altitudeArr) {
    this.result = await this.verticalBuffer(
      pt,
      latitudeArr,
      longitudeArr,
      altitudeArr
    );
    return this.result;
  }
  async verticalBuffer(pt, latitudeArr, longitudeArr, altitudeArr) {
    let liveAlt = this.liveAltitude;
    let payload = {
      pt,
      latitudeArr,
      longitudeArr,
      altitudeArr,
      liveAlt,
    };
    let data = await new Promise((resolve, reject) => {
      this.worker.postMessage({ type: 'buffer', payload });
      this.worker.onmessage = ({ data }) => {
        resolve(data);
      };
    });
    return data;
  }

  endMission(missionId?) {
    this.liveAlt = 0;
    this.liveDist = 0;
    this.loader = true;
    this.mode = false;

    let payload = {
      MissionId: missionId,
    };

    this.operatorApi
      .endMission(payload)
      .then(
        (res) => {
          if (this.onTickHandler) {
            this.viewer.clock.onTick.removeEventListener(this.onTickHandler);
            this.onTickHandler = undefined;
          }
          this.droneFollow = false;
          this.webSocketService.sendMessage({
            action: 'operator-end-mission',
            triggerId: this.triggerId,
          });
          this.gcsConnected = false;
          this.viewer.trackedEntity = undefined;
          this.liveLatitude = undefined;
          this.liveLongitude = undefined;
          this.liveAltitude = undefined;
          this.flightTime = undefined;
          this.missionStarted = null;
          this.webSocketValue = undefined;
          this.droneConnected = undefined;
          this.droneOutsideBuffer = false;
          this.droneErrors = '';
          this.oneLapStarted = false;
          this.secondTrigger = false;
          this.missionEnded = true;
          this.DeleteValue();
          clearInterval(this.webSocketApiCall);
          clearInterval(this.payloadInterval);
          clearInterval(this.cachedInterval);
          clearInterval(this.droneImageTimer);
          clearInterval(this.oneLapTimer);
          window.removeEventListener(
            'beforeunload',
            this.callReloadEventListener
          );
          localStorage.removeItem('wsStartMission');
          localStorage.removeItem('gcsCache');
          localStorage.removeItem('isLive');
          this.unSubscribe.next();
          this.unSubscribe.complete();
          this.liveDroneSubscription.next();
          this.liveDroneSubscription.complete();
          this.viewer.camera.moveStart.removeEventListener();
          if (this.ws != null) {
            this.wsConnected = false;
            this.ws.close();
            this.ws = null;
            this.socketCloseErr = false;
          }
          this.mapReset();
          this.getMissionList();
        },
        (err) => {
          this.loader = false;
        }
      )
      .finally(() => {
        this.notificationService.clearNotifications();
      });
  }

  //Onelap
  checkForOneLapConnection() {
    if (!this.missionEnded) {
      this.getRemoteIdFromDrone();
    }
  }
  async getRemoteIdFromDrone() {
    try {
      //flag for restarting the gcs connection when oneLap fails
      this.gcsConnected = false;

      this.droneName = this.missionList?.UAVInfoType?.Value;
      this.missionStarted = true;
      this.wsConnected = true;
      let missionPayload = {
        MissionId: this.missionList.MissionId,
      };
      if (!JSON.parse(localStorage.getItem('valueStored'))) {
        await this.operatorApi.startMission(missionPayload);
      }

      this.StoreValue(this.missionList);

      let droneIdPayload = {
        DroneId: this.missionList.DroneId,
      };
      // const res2 = await this.operatorApi.getOneLapIdAndToken(droneIdPayload);

      // let tokenAndOneLapId = res2['data'];

      // @SL - Updating the stream mode
      // this.UAVLogMode = this.StreamModes.Onelap;
      // this.updateLiveStreamMode(
      //   this.missionList.MissionId,
      //   this.StreamModes.Onelap
      // );
      this.webSocketService.sendMessage({
        action: 'set-trigger-to-operator',
        operatorId: this.profileDetails?.UserId,
        triggerId: this.triggerId,
      });

      // this.getLatestLogFromOneLap(tokenAndOneLapId.oneLapId, true).then(() => {
      //   // call the droneImage Function now
      //   this.createAndUpdateDroneWithBuffer(
      //     this.missionList.BufferRegion,
      //     this.missionList.Altitude,
      //     this.missionList.Latitude,
      //     this.missionList.Longitude
      //   );
      // });
      // clearInterval(this.oneLapTimer);
      // this.oneLapTimer = setInterval(() => {
      //   if (this.canCallOneLapApi) {
      //     this.canCallOneLapApi = false;
      //     this.getLatestLogFromOneLap(tokenAndOneLapId.oneLapId);
      //   }
      // }, 1000);

      // clearInterval(this.payloadInterval);
      // clearInterval(this.webSocketApiCall);
      // this.webSocketApiCall = setInterval(() => {
      //   if (this.secondTrigger) {
      //     this.reloadCache();
      //     this.webSocketApiFunc();
      //   }
      // }, 1000);

      setTimeout(() => {
        this.droneConnected = null;
        this.autoMissionStart();
      }, 1500);
      
    } catch (error) {
      console.log('Error in getRemoteIdFromDrone', error);
      clearInterval(this.webSocketApiCall);
      clearInterval(this.oneLapTimer);
      setTimeout(() => {
        this.canCallOneLapApi = true;
        this.webSocketError = true;
        // this.socketCloseErr = true;
        // Commented out the code because the webSocketValue was getting empty
        // if(this.socketType && this.socketType !== 'OTHER'){
        //   this.webSocketValue = null;
        // }
        this.droneConnected = null;
        this.autoMissionStart();
      }, 1500);
    } finally {
      this.missionstartloader = false;
    }
  }

  async getLatestLogFromOneLap(data, initial?) {
    return new Promise((resolve, reject) => {
      this.operatorApi
        .getOneLapLiveDataWithToken(data)
        .then(async (res) => {
          let realTimeLogs: any = res;
          this.webSocketValue = realTimeLogs;
          this.liveLatitude = this.webSocketValue.latitude;
          this.liveLongitude = this.webSocketValue.longitude;

          // @yash - removing this because we are not getting the altitude from the oneLap
          this.liveAltitude = this.liveAltitude
            ? this.liveAltitude
            : this.webSocketValue?.altitude || 70;

          this.nav_bearing = -167;
          this.nav_pitch = -1.07585526;
          this.nav_roll = -1.29174006;
          this.droneConnected = true;
          this.missionTime = true;
          this.enableStartMission = true;
          this.asOfDate = this.dateAndTimeFormat.dateAndTimeFormatting(
            new Date(),
            'date'
          );
          if (!this.CurrentTime) {
            this.CurrentTime = this.dateAndTimeFormat.dateAndTimeFormatting(
              new Date(),
              'time'
            );
          }

          let wsVal = {
            ...this.webSocketValue,
            armed: true,
            battery_remaining: 90,
            ch1out: 1000,
            ch2in: 1515,
            ch2out: 1000,
            ch3in: 1014,
            ch3out: 1000,
            ch4in: 1513,
            ch4out: 1000,
            ch5in: 1013,
            ch5out: 1000,
            ch6in: 1013,
            ch6out: 1580,
            ch7in: 1013,
            ch7out: 1497,
            ch8in: 0,
            ch8out: 1410,
            ch9in: 0,
            ch9out: 0,
            DistToHome: 0.118116394,
            failsafe: false,
            groundspeed: 0.03,
            alt: this.liveAltitude,
            lat: this.liveLatitude,
            lng: this.liveLongitude,

            // Live drone Position
            Location: {
              Alt: this.liveAltitude,
              color: 'White',
              Lat: this.liveLatitude,
              Lng: this.liveLongitude,
              Tag: '',
              Tag2: '',
            },

            landed: true,
            mode: this.webSocketValue.mode,
            raw_press: this.webSocketValue.raw_press,
            raw_temp: this.webSocketValue.raw_temp,
            sensors_health: {
              accelerometer: true,
              altitude_control: false,
              compass: true,
              logging: true,
            },
            sensors_enabled: {
              rc_receiver: true,
              motor_control: true,
            },
            battery_voltage: 50.46066092596896,
            datetimeLog: this.dateAndTimeFormat.dateAndTimeFormatting(
              new Date(),
              'fulldateAndTime'
            ),
            datetime: this.dateAndTimeFormat.dateAndTimeFormatting(
              new Date(),
              'fulldateAndTime'
            ),
            gpsstatus: 3,
            //Newly added for Blackbox
            message: 'PreArm: waiting for terrain data',
            messages: [],
            //Values added for Diff Version of mission planner
            lastautowp: 1,
            wpno: 1,

            // 3D Drone image
            nav_bearing: -167,
            nav_pitch: -1.07585526,
            nav_roll: -1.29174006,

            // New parameter added
            distTraveled: 0,

            // Deconfliction
            PlusCode: this.missionList?.PlusCode,
            connected: true,

            // @yash field added
            linkqualitygcs: this.webSocketValue?.linkqualitygcs || 100,
            rxrssi: this.webSocketValue?.rxrssi || 100,
            remrssi: this.webSocketValue?.remrssi || 100,
            verticalspeed: this.webSocketValue?.verticalspeed,
          };
          this.webSocketValue = wsVal;
          if (initial) {
            this.pushPayload();
            let firstTriggerPayload = {
              MissionId: this.missionList.MissionId,
              AsOfDate: this.asOfDate,
              StreamingStartTime: this.CurrentTime,
              motor_control: true,
              rc_receiver: true, //WS
              gps: true, //WS
              logging: true, //WS
              prearm: true, //WS
              // @yash - removing this because we are not getting the altitude from the oneLap
              // alt: realTimeLogs.altitude , //WS
              alt: this.liveAltitude,

              CreatedById: this.profileDetails?.UserId, //Profile Details
              CreatedByName: this.profileDetails?.FirstName, //Profile Details
              messages: [],
              message: '', //ws
              messageHigh: '', //ws
              battery_voltage: 12.587000937804632, //ws
              datetimeLog: '2021-11-24T11:04:51.535468+05:30',
              datetime: this.dateAndTimeFormat.dateAndTimeFormatting(
                new Date(),
                'fulldateAndTime'
              ),
              gpsstatus: 3,
            };
            this.operatorApi
              .createMissionLogs(firstTriggerPayload)
              .then((res) => {
                this.triggerId = res.data.MainData.TriggerId;
                let firstTrigger = {
                  asOfDate: this.asOfDate,
                  CurrentTime: this.CurrentTime,
                  triggerId: this.triggerId,
                  missionId: this.missionList.MissionId,
                };
                localStorage.setItem(
                  'wsStartMission',
                  JSON.stringify(firstTrigger)
                );
                this.secondTrigger = true;
              });
          } else {
            if (
              this.liveLongitude !== undefined &&
              this.liveLatitude !== undefined
            ) {
              this.pushPayload();
            }
          }
          this.canCallOneLapApi = true;
          resolve(true);
        })
        .catch((err) => {
          console.log('error in getLatestLogFromOneLap', err);
          clearInterval(this.webSocketApiCall);
          clearInterval(this.oneLapTimer);
          setTimeout(() => {
            this.canCallOneLapApi = true;
            this.webSocketError = true;
            // this.socketCloseErr = true;
            // Commented out the code because the webSocketValue was getting empty
            // if(this.socketType && this.socketType !== 'OTHER'){
            //    this.webSocketValue = null;
            // }
            this.droneConnected = null;
            this.autoMissionStart();
          }, 1500);
        });
    });
  }

  // @SL - Update live data streaming mode status to Backend
  updateLiveStreamMode(MissionId, UAVLogMode) {
    let payload = {
      MissionId,
      UAVLogMode,
      // :"N-Tracker/Remote-ID"
    };
    this.operatorApi
      .updateLiveStreamMode(payload)
      .then((res) => {})
      .catch((err) => {});
  }

  //Redirect to same URL
  redirectTo(uri: string) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([uri]));
  }

  //Executes on Interval
  webSocketApiFunc(type?) {
    if (this.filteredWsArr?.length != 0) {
      this.dupWsArr = this.filteredWsArr;
      this.filteredWsArr = [];
      let secondTriggerPayload = {
        TriggerId: this.triggerId, //From firstAPI response
        AsOfDate: this.asOfDate, // From variable value assigned on first API call
        StreamingStartTime: this.CurrentTime, // From variable value assigned on first API call
        //@yash rpto flag true for pilot switching in rpto
        RPTO: !!this.missionList?.GeoFence,

        RealTimeLogs: this.dupWsArr[0],
        CreatedById: this.profileDetails?.UserId,
        CreatedByName: this.profileDetails?.FirstName,
        // MissionLogs: this.dupWsArr

        // Deconfliction
        DroneLeftItsBufferRegion: this.droneOutsideBuffer,
        action: 'operator-to-backend',
        DroneUIN: this.missionList?.DroneUIN || null
      };
      // console.log(secondTriggerPayload);

      this.webSocketService.sendMessage(secondTriggerPayload);
      // this.operatorApi.updateMissionLogs(secondTriggerPayload).then(
      //   (res) => {
      //     this.deconfliction = res.data.MainData;
      //     this.notifyOperator(this.profileDetails.UserId);
      //   },
      //   (err) => {}
      // );
    }
  }
  pushPayload() {
    if (this.liveLatitude !== 0 && this.liveLongitude !== 0) {
      // && this.webSocketValue?.connected
      let formattedVal = {
        // ...this.webSocketValue?.channel_inputs,
        // ...this.webSocketValue?.channel_outputs,
        armed: this.webSocketValue?.armed,
        battery_remaining: this.webSocketValue?.battery_remaining,
        ch1in: this.webSocketValue.ch1in ? this.webSocketValue.ch1in : this.webSocketValue?.channel_inputs.ch1_in ,
        ch1out: this.webSocketValue.ch1out ? this.webSocketValue.ch1out : this.webSocketValue?.channel_outputs.ch1_out,
        ch2in: this.webSocketValue.ch2in ? this.webSocketValue.ch2in : this.webSocketValue?.channel_inputs.ch2_in,
        ch2out: this.webSocketValue.ch2out ? this.webSocketValue.ch2out : this.webSocketValue?.channel_outputs.ch2_out,
        ch3in: this.webSocketValue.ch3in ? this.webSocketValue.ch3in : this.webSocketValue?.channel_inputs.ch3_in,
        ch3out: this.webSocketValue.ch3out ? this.webSocketValue.ch3out : this.webSocketValue?.channel_outputs.ch3_out,
        ch4in: this.webSocketValue.ch4in ? this.webSocketValue.ch4in : this.webSocketValue?.channel_inputs.ch4_in,
        ch4out: this.webSocketValue.ch4out ? this.webSocketValue.ch4out : this.webSocketValue?.channel_outputs.ch4_out,
        ch5in: this.webSocketValue.ch5in ? this.webSocketValue.ch5in : this.webSocketValue?.channel_inputs.ch5_in,
        ch5out: this.webSocketValue.ch5out ? this.webSocketValue.ch5out : this.webSocketValue?.channel_outputs.ch5_out,
        ch6in: this.webSocketValue.ch6in ? this.webSocketValue.ch6in : this.webSocketValue?.channel_inputs.ch6_in,
        ch6out: this.webSocketValue.ch6out ? this.webSocketValue.ch6out : this.webSocketValue?.channel_outputs.ch6_out,
        ch7in: this.webSocketValue.ch7in ? this.webSocketValue.ch7in : this.webSocketValue?.channel_inputs.ch7_in,
        ch7out: this.webSocketValue.ch7out ? this.webSocketValue.ch7out : this.webSocketValue?.channel_outputs.ch7_out,
        ch8in: this.webSocketValue.ch8in ? this.webSocketValue.ch8in : this.webSocketValue?.channel_inputs.ch8_in,
        ch8out: this.webSocketValue.ch8out ? this.webSocketValue.ch8out : this.webSocketValue?.channel_outputs.ch8_out,
        ch9in: this.webSocketValue.ch9in ? this.webSocketValue.ch9in : this.webSocketValue?.channel_inputs?.ch9_in,
        ch9out: this.webSocketValue.ch9out ? this.webSocketValue.ch9out : this.webSocketValue?.channel_outputs?.ch9_out,
        DistToHome: this.webSocketValue.DistToHome ? this.webSocketValue.DistToHome : 0,
        failsafe: this.webSocketValue.failsafe ? this.webSocketValue.failsafe : false,
        groundspeed: this.webSocketValue.groundspeed,
        alt: this.liveAltitude,
        lat: this.liveLatitude,
        lng: this.liveLongitude,

        // Live drone Position
        Location: this.webSocketValue.Location ? this.webSocketValue.Location :  {
          Lat: this.liveLatitude,
          Lng: this.liveLongitude,
          Alt: this.liveAltitude,
          Tag: '',
          Tag2: '',
          color: 'White'
        },

        landed: this.webSocketValue.landed,
        mode: this.webSocketValue.mode,
        raw_press: this.webSocketValue.raw_press ? this.webSocketValue.raw_press : 0,
        raw_temp: this.webSocketValue.raw_temp ? this.webSocketValue.raw_temp : 0,
        accelerometer: this.webSocketValue?.sensors_health?.accelerometer ? this.webSocketValue?.sensors_health?.accelerometer :  this.webSocketValue?.system?.accelerometer,
        altitude_control: this.webSocketValue?.sensors_health?.altitude_control ? this.webSocketValue?.sensors_health?.altitude_control : true,
        compass: this.webSocketValue?.sensors_health?.compass ? this.webSocketValue?.sensors_health?.compass : 0 ,
        battery_voltage: this.webSocketValue?.battery_voltage,
        datetimeLog: this.webSocketValue?.datetime ? this.webSocketValue?.datetime :
         this.dateAndTimeFormat.dateAndTimeFormatting(
          new Date(),
          'fulldateAndTime'
        ),
        datetime: this.dateAndTimeFormat.dateAndTimeFormatting(
          new Date(),
          'fulldateAndTime'
        ),
        gpsstatus: this.webSocketValue?.gpsstatus ? this.webSocketValue?.gpsstatus : 0 ,
        //Newly added for Blackbox
        logging: this.webSocketValue?.sensors_health?.logging ? this.webSocketValue?.sensors_health?.logging : true,
        message: this.webSocketValue?.message ? this.webSocketValue?.message : '',
        messages: this.webSocketValue?.messages ? this.webSocketValue?.messages : '',
        //Values added for Diff Version of mission planner
        lastautowp: this.webSocketValue?.lastautowp ? this.webSocketValue?.lastautowp : 1,
        wpno: this.webSocketValue.wpno ? this.webSocketValue.wpno : 1,

        // 3D Drone image
        nav_bearing: this.webSocketValue.nav_bearing,
        nav_pitch: this.webSocketValue.nav_pitch,
        nav_roll: this.webSocketValue.nav_roll,

        // New parameter added
        distTraveled: this.webSocketValue?.distTraveled,
        flightTime: this.flightTime,
        satellitesCount: this.satellitesCount
          ? this.satellitesCount['SatelliteCount']
          : 0,
        planes: this.planes?.length,
        nearbyAirports: this.nearbyAirports?.NearbyAirportDataLength || 0,
        missionId: this.missionList?.MissionId,
        // Deconfliction
        PlusCode: this.missionList?.PlusCode,
        connected: this.webSocketValue?.connected ? this.webSocketValue?.connected : true,

        // @SL - For Streaming mode
        UAVLogMode: this.UAVLogMode,

        // @yash field added
        linkqualitygcs: this.webSocketValue?.linkqualitygcs ? this.webSocketValue?.linkqualitygcs : 100,
        rxrssi: this.webSocketValue?.rxrssi ? this.webSocketValue?.rxrssi : 0,
        // distToHome: this.webSocketValue?.DistToHome,
        remrssi: this.webSocketValue?.remrssi ? this.webSocketValue?.remrssi : 0,
        // @yash for deconfliction sangu said
        verticalspeed: this.webSocketValue?.verticalspeed || 0,
      };

      //For Async Pipe to DOM Events
      let sensors_enabled = this.webSocketValue?.sensors_enabled || false;
      // this.webSocketValue$.next({ ...formattedVal, sensors_enabled });
      //To test weather data is coming from
      // this.webSocketValue$.subscribe((data) => {
      //   console.log("called gpsstatus--",data.gpsstatus)
      // });
      this.filteredWsArr.push(formattedVal);
      this.cachedData.push(formattedVal);
    }
  }
  //Cache Memory
  reloadCache() {
    let cache = this.cachedData;
    this.cachedData = [];
    if (localStorage.getItem('gcsCache') !== null) {
      localStorage.removeItem('gcsCache');
    }
    localStorage.setItem('gcsCache', JSON.stringify(cache));
  }
  get f() {
    return this.createMissionForm.controls;
  }
  // @ViewChild('YourName') YourName: ElementRef;

  private initRandom(): any {
    // const randomSign = () => Math.round(Math.random()) * 2 - 1;
    const staticEntities = [];
    var cameraPosition = this.viewer.scene.camera.positionWC;
    var ellipsoidPosition =
      this.viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
    var distance = Cesium.Cartesian3.magnitude(
      Cesium.Cartesian3.subtract(
        cameraPosition,
        ellipsoidPosition,
        new Cesium.Cartesian3()
      )
    );
    let scale =
      distance >= 100000 && distance <= 500000
        ? 0.2
        : distance > 500000
        ? 0.05
        : 0.4;
    for (let i = 0; i < 1; i++) {
      const lat = this.liveLatitude;
      const long = this.liveLongitude;
      const alt = this.liveAltitude;

      // 3D Drone image
      // this.webSocketValue.nav_bearing
      var heading = Cesium.Math.toRadians(this.webSocketValue.nav_bearing);
      //  Cesium.Math.toRadians(this.webSocketValue.nav_bearing);
      var pitch = Cesium.Math.toRadians(this.webSocketValue.nav_pitch);
      var roll = Cesium.Math.toRadians(this.webSocketValue.nav_roll);
      // nav_pitch nav_roll
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(long, lat, alt),
        hpr
      );
      // const lat = 13.6563435;
      // const long = 80.3555555;
      staticEntities.push({
        id: i.toString(),
        // position: Cesium.Cartesian3.fromDegrees(long, lat, alt + this.terrainAlt),
        position: Cesium.Cartesian3.fromDegrees(long, lat, alt),
        scale: scale,
        orientation: orientation,
      });
    }
    return staticEntities;
  }
  //Camera Coordinates
  getCameraCoordinates() {
    // return a callback function to remove the listener
    this.moveStartEventListener = this.viewer.camera.moveStart.addEventListener(
      () => {
        if (!this.flyingtoLoc) {
          setTimeout(() => {
            this.debouncing();
            clearInterval(this.debounceTimer);
            this.debounceTimer = setInterval(() => {
              this.debouncing();
            }, 15000);
            let cartographic = this.viewer.scene.camera.positionCartographic;
            let lat = Cesium.Math.toDegrees(cartographic.latitude);
            let long = Cesium.Math.toDegrees(cartographic.longitude);

            // New Weather_Union API for Weather
            let weatherAPIPayload = {
              latitude: lat,
              longitude: long,
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
          }, 1000);
        }
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']) {
      this.show = changes['show'].currentValue;
    }
  }
  trackArrayIdGetter(entity: any): string {
    return entity.id;
  }

  //Plane Finder
  //Plane finder - calls on specific debounce interval
  debouncing() {
    if (!this.viewer) return;
    this.entitiesOfRestrictedAreas = [];
    let [IndialatMax, IndialngMax, IndialatMin, IndialngMin] = [
      42.17477643444698, 98.39193134978791, 8.465020978452927,
      69.46937307226474,
    ];
    let [IrelandlatMax, IrelandlngMax, IrelandlatMin, IrelandlngMin] = [
      55.58117283181593, -5.301994459203987, 51.29143611559805,
      -10.561891103258741,
    ];
    // this.getPlanes();
    // UR - Max
    var UR = new Cesium.Cartesian2(this.viewer.container.clientWidth, 0);
    // LL - min
    var LL = new Cesium.Cartesian2(0, this.viewer.container.clientHeight);

    var pickRayUR = this.viewer.scene.camera.getPickRay(UR);
    var pickRayLL = this.viewer.scene.camera.getPickRay(LL);

    var pickPositionUR = this.viewer.scene.globe.pick(
      pickRayUR,
      this.viewer.scene
    );
    var pickPositionLL = this.viewer.scene.globe.pick(
      pickRayLL,
      this.viewer.scene
    );
    let height = this.viewer.scene.camera.positionCartographic.height;
    // if (height >= 50000) {
    //   this.planesVisibility = false;
    // } else {
    //   this.planesVisibility = true;
    // }
    if (pickPositionUR && pickPositionLL) {
      var cameraPosition = this.viewer.scene.camera.positionWC;
      var ellipsoidPosition =
        this.viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(
          cameraPosition
        );
      var distance = Cesium.Cartesian3.magnitude(
        Cesium.Cartesian3.subtract(
          cameraPosition,
          ellipsoidPosition,
          new Cesium.Cartesian3()
        )
      );
      var pickPositionCartographicUR =
        this.viewer.scene.globe.ellipsoid.cartesianToCartographic(
          pickPositionUR
        );
      var pickPositionCartographicLL =
        this.viewer.scene.globe.ellipsoid.cartesianToCartographic(
          pickPositionLL
        );
      let latmax = pickPositionCartographicUR.latitude * (180 / Math.PI);
      let lngmax = pickPositionCartographicUR.longitude * (180 / Math.PI);
      let latmin = pickPositionCartographicLL.latitude * (180 / Math.PI);
      let lngmin = pickPositionCartographicLL.longitude * (180 / Math.PI);
      let country;

      if (
        latmax < IndialatMax &&
        latmax > IndialatMin &&
        lngmax < IndialngMax &&
        lngmax > IndialngMin &&
        latmin < IndialatMax &&
        latmin > IndialatMin &&
        lngmin < IndialngMax &&
        lngmin > IndialngMin
      ) {
        country = 'INDIA';
      } else if (
        latmax < IrelandlatMax &&
        latmax > IrelandlatMin &&
        lngmax < IrelandlngMax &&
        lngmax > IrelandlngMin &&
        latmin < IrelandlatMax &&
        latmin > IrelandlatMin &&
        lngmin < IrelandlngMax &&
        lngmin > IrelandlngMin
      ) {
        country = 'IRELAND';
      }
      // if (distance <= 30000 && distance >= 1000) {
      if (height <= 60000 && height >= 1000) {
        this.planesVisibility = true;
        if (country) {
          this.getPlaneFinderData(country, latmin, lngmin, latmax, lngmax);
        }
      } else {
        this.planesVisibility = false;
      }
    }

    // if (height >= 900000) {
    //   this.warningVisibility = false;
    //   this.geojsonDataSourceWarningZone.show = false;
    // } else {
    //   this.warningVisibility = true;
    //   this.geojsonDataSourceWarningZone.show = true;
    // }
    // this.warningZoneFlag = this.geojsonDataSourceWarningZone.show;
  }
  getPodsData() {
    if (!this.hasPodEntities(this.viewer)) {
      this.operatorApi
        .getPodsData()
        .then((res) => {
          const data = res.body.data;
          this.cesiumFunction.addBillboard(this.viewer, data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
  hasPodEntities(viewer) {
    return viewer.entities.values.some((entity) => entity.id.includes('Pods'));
  }
  //API calls for live flights
  getPlaneFinderData(country, latMin, lngMin, latMax, lngMax) {
    let payload = {
      CountryCode: country, // IRELAND/INDIA,
      x1: latMin,
      y1: lngMin,
      x2: latMax,
      y2: lngMax,
    };
    // this.planeFinder$ = undefined;
    // this.getPodsData();
    this.operatorApi.getLatestPlaneFinderData(payload).then(
      (res) => {
        if (res['data'] && res['data'].MainData) {
          this.planes = res['data'].MainData.planes;
          if (this.planes && this.planes.length > 0) {
            this.cesiumFunction.planeBillboard(this.planes, this.viewer);
          }
        }
        // this.planesObserverable.next(this.planes);
      },
      (err) => {}
    );
  }
  doNotAgree() {
    this.router.navigateByUrl('operator/home');
  }
  doAgree() {
    this.showPopUp = false;
    this.geoZoneTour();
  }

  //Active (reserved) Air Spaces
  async getActiveAirBufferSpaces() {
    let payload = {
      StartTime: this.missionList?.StartTime,
      EndTime: this.missionList?.EndTime,
      OperatorId: this.profileDetails?.UserId,
    };
    this.operatorApi.getActiveBufferRegions(payload).then(
      (res) => {
        this.activeBuffers = res['data'].MainData;
        this.activeBuffers = this.activeBuffers.filter((val) => {
          if (val.MissionId != this.missionList?.MissionId) {
            return val;
          }
        });
        this.cesiumFunction.getActiveAirBufferSpaces(
          this.activeBuffers,
          this.activeAirspaceEntities,
          this.viewer
        );
      },
      (err) => {}
    );
  }
  //Test for disabling routes
  StoreValue(value) {
    localStorage.setItem('valueStored', JSON.stringify(value));
  }
  DeleteValue() {
    localStorage.removeItem('valueStored');
  }

  //Restrict page reload and close tab
  callReloadEventListener(e) {
    e.preventDefault();
    var confirmationMessage =
      'Page cannot be refreshed when your mission is active';
    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
  }

  reDirectToLink(path) {
    if (!localStorage.getItem('valueStored')) {
      // this.activePath = path;
      this.router.navigateByUrl('operator/operator-app/' + path);
    } else {
      this.showSwal('restrict-redirect');
    }
  }

  authorizing(path, redirect?) {
    let profileDetails = this.operatorService.returnProfileDetails();
    let subscriptionPlan = this.profileDetails?.SubscriptionPlan;
    if (profileDetails.SubscriptionPlan == 'Free') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          title: `You are having an '${profileDetails.SubscriptionPlan}' subscription plan`,
          text: `Would you like to upgrade it to access?`,
          focusConfirm: false,
          // icon: 'info',
          showCancelButton: true,
          // cancelButtonText:"No Thanks",
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
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
      profileDetails.SubscriptionPlan == 'Basic' ||
      profileDetails.SubscriptionPlan == 'Advanced'
    ) {
      if (profileDetails.NumberOfFlightSubmission < 1) {
        this.swalWithBootstrapButtons
          .fire({
            title: `Your flight submission plan is exceeded.`,
            text: `upgrade your subscription plan to access it.`,
            focusConfirm: false,
            // icon: 'info',
            showCancelButton: true,
            background: '#1b1f27',
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
        if (this.dronesAndGearList && this.dronesAndGearList.length > 0) {
          this.reDirectToLink(path);
        } else {
          if (redirect) {
            this.reDirectToLink('drones-gears/registration');
          } else {
            this.swalWithBootstrapButtons
              .fire({
                title: `Your don't have any drone registered`,
                text: `Register a drone first to create Mission`,
                focusConfirm: false,
                showCancelButton: true,
                background: '#1b1f27',
                allowOutsideClick: false,
                confirmButtonText: 'Add Drone',
              })
              .then((result) => {
                if (result.isConfirmed)
                  this.reDirectToLink('drones-gears/registration');
              });
          }
        }
      }
    }
  }

  paymentModal(test) {
    this.modalRef = this.modalService.show(test, {
      class: 'modal-dialog-centered gray payment-modal',
      backdrop: 'static',
      keyboard: false,
    });
    // this.test = true;
  }
  toggleData(val: any) {
    this.showSwal('guestLogin');
  }
  // toggleTel(val:any){
  //   this.showSwal('guestLogin');
  // }
  // togglePop(val:any){
  //   this.showSwal('guestLogin');
  // }
  toggle2D3D(val: any) {
    this.toggleFlag = val;
    this.toggleFlag = !this.toggleFlag;
    if (this.onTickHandler) {
      this.viewer.clock.onTick.removeEventListener(this.onTickHandler);
      this.onTickHandler = undefined;
    }
    this.viewer.trackedEntity = undefined;
    this.droneFollow = false;
    if (this.toggleFlag) {
      this.viewer.scene.mode = Cesium?.SceneMode?.SCENE2D;
      if (this.missionList?.Longitude) {
        this.cesiumFunction?.loadWayPoints2D?.(
          this.viewer,
          this.missionList.Longitude,
          this.missionList.Latitude,
          this.missionList?.Altitude
        );
      }
    } else {
      this.viewer.scene.mode = Cesium?.SceneMode?.SCENE3D;
      if (this.missionList?.Longitude) {
        this.cesiumFunction?.loadWayPoints?.(
          this.viewer,
          this.missionList.Longitude,
          this.missionList.Latitude,
          this.missionList?.Altitude
        );
      }
      this.viewer.camera.lookUp(Cesium.Math.toRadians(10.0));
    }
  }
  notifyOperator(OpertatorId: string) {
    if (this.droneOutsideBuffer && !this.notifyoutsideBuffer) {
      this.notifyoutsideBuffer = true;
      this.operatorApi.sendLeftBufferRegionNotification({ OpertatorId });
      // .catch((err) => console.log(err));
    }
    if (!this.droneOutsideBuffer) this.notifyoutsideBuffer = false;
  }

  //trackByFlag
  trackByCategory(index: number, missionPermissionsData: any): string {
    return missionPermissionsData.Name;
  }
  trackByClimate(index: number, currentWeatherData: any): string {
    return currentWeatherData.id;
  }
  //TrackDrone
  TrackDrone() {
    const distanceFromCamera = 3000;

    if (!this.droneFollow && this.droneImageEntity) {
      this.droneFollow = true;

      if (this.viewer.scene.mode === Cesium.SceneMode.SCENE2D) {
        // 2d
        const onTickHandler = () => {
          const position = Cesium.Cartesian3.fromDegrees(
            this.liveLongitude,
            this.liveLatitude,
            Math.abs(this.liveAltitude) + distanceFromCamera
          );
          if (position) {
            this.viewer.camera.setView({
              destination: position,
              orientation: {
                pitch: Cesium.Math.toRadians(-90), // Straight down view
                heading: 0, // North facing
                roll: 0,
              },
            });
            // this.viewer.camera.zoomOut(distanceFromCamera);
          }
        };
        this.viewer.clock.onTick.addEventListener(onTickHandler);
        this.onTickHandler = onTickHandler; // Store reference to the handler for removal later
      } else {
        // 3d
        if (this.onTickHandler) {
          this.viewer.clock.onTick.removeEventListener(this.onTickHandler);
          this.onTickHandler = undefined;
        }
        this.viewer.trackedEntity = this.droneImageEntity;
        this.droneImageEntity.viewFrom = new Cesium.Cartesian3(
          this.liveLongitude,
          this.liveLatitude,
          Math.abs(this.liveAltitude) + distanceFromCamera
        );
      }
    } else {
      this.droneFollow = false;
      if (this.onTickHandler) {
        this.viewer.clock.onTick.removeEventListener(this.onTickHandler);
        this.onTickHandler = undefined;
      }
      this.viewer.trackedEntity = undefined;
      this.droneImageEntity.viewFrom = undefined;
    }
  }

  toggleMissionDetails() {
    this.toggleMissionDetailstab = !this.toggleMissionDetailstab;
  }
  changeTab(tab: string) {
    this.activeTab = tab;
  }
  //getSatellitesCount
  async getsatellitesCount(latitude, longitude, altitude) {
    let payload = {
      latitude,
      longitude,
      altitude,
    };
    this.operatorApi
      .satelliteCount(payload)
      .then((res) => {
        this.satellitesCount = res.data.MainData;
      })
      .catch((err) => console.error(err));
  }
  //NearbyAirport
  async getnearbyAirport(MissionId) {
    this.operatorApi
      .nearbyAirport({ MissionId })
      .then((res) => {
        this.nearbyAirports = res?.data?.MainData;
      })
      .catch((err) => console.error(err));
  }
  //ToggleAccodriaan
  toggleAccordion(index: number) {
    if (this.expandedAccordionIndex === index) {
      this.expandedAccordionIndex = -1; // Collapse the currently expanded accordion
    } else {
      this.expandedAccordionIndex = index; // Expand the clicked accordion
    }
  }
  //Corelation
  checkWapointCorelation(corelations) {
    let inneryellow = [],
      outeryellow = [],
      red = [],
      geozone = [];

    this.missionList.Latitude.forEach((lat, i) => {
      if (corelations.airport.length !== 0) {
        corelations.airport.forEach((zone) => {
          if (zone.type === 'Inner-Yellow') {
            if (inneryellow[i] != true) {
              inneryellow[i] = this.findCorelations(
                zone.coOrdinates,
                lat,
                this.missionList.Longitude[i]
              );
            }
          }
          if (zone.type === 'Outer-Yellow') {
            if (outeryellow[i] != true) {
              outeryellow[i] = this.findCorelations(
                zone.coOrdinates,
                lat,
                this.missionList.Longitude[i]
              );
            }
          }
          if (zone.type === 'Red-Zone') {
            if (red[i] != true) {
              red[i] = this.findCorelations(
                zone.coOrdinates,
                lat,
                this.missionList.Longitude[i]
              );
            }
          }
        });
      }
      if (corelations.geozone.length !== 0) {
        corelations.geozone.forEach((zone) => {
          if (geozone[i] != true) {
            geozone[i] = this.findCorelations(
              zone.coOrdinates,
              lat,
              this.missionList.Longitude[i]
            );
          }
        });
      }
    });
    let yellowzones = 0;
    let redzones = 0;
    let greenzones = 0;
    for (let i = 0; i < this.missionList.Waypoints.length; i++) {
      if (inneryellow[i] || outeryellow[i]) yellowzones++;
      if (red[i] || geozone[i]) redzones++;
      if (!(inneryellow[i] || outeryellow[i] || red[i] || geozone[i]))
        greenzones++;
    }
    if (yellowzones === 0 && redzones === 0)
      greenzones = this.missionList.Latitude.length;
    this.corelation = {
      inneryellow,
      outeryellow,
      red,
      geozone,
      zoneCount: [greenzones, yellowzones, redzones],
    };
  }

  findCorelations(coordinates, lat, lng) {
    const point = turf.point([lng, lat]);
    const polygon = turf.polygon([coordinates]);
    const isInsideZone = turf.booleanPointInPolygon(point, polygon);
    return isInsideZone;
  }

  calculateTimePassed(startTime: string): string {
    const currentTime = new Date();
    const [startHours, startMinutes, startSeconds] = startTime.split(':');
    const start = new Date();
    start.setHours(
      Number(startHours),
      Number(startMinutes),
      Number(startSeconds)
    );
    const timeDiff = currentTime.getTime() - start.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    const formattedTimePassed = `${hours} hours ${minutes} minutes ${seconds} seconds`;

    return formattedTimePassed;
  }

  close(val) {
    this.isView = false;
  }
  // Test for map layer cards
  onClickonMaps() {
    this.ScreenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
    this.ScreenSpaceEventHandler.setInputAction((input) => {
      // this.isView = true;
      if(this.guestUser == false){
        this.mapLayersService
        .onclickmapui(input, this.viewer)
        .then((res: any) => {
          if (res) {
            this.entityDescription = res;
            this.isView = true;
          }
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  //For guest user move or scroll on map
  onMovingCameraGuest() {
    this.moveStartListenerGuest = () => {
      //skip th pop-up for first 2 call for location
      // this.callCounter++;
      // if (this.callCounter > 1) {
      //   clearTimeout(this.timerGuest);
      //   this.timerGuest = setTimeout(() => {
      //     this.showSwal('guestLogin');
      //     //diable or enable scroll and zoom
      //     this.cesiumFunction.disableMapZoomandScrollForGuest(
      //       this.viewer,
      //       false
      //     );
      //   }, 200);
      // if (!this.isLoginPopupDisplayed) {
      //   //skip th pop-up for first 2 call for location
      //   this.callCounter++;
      //   if (this.callCounter > 1) {
      //     // clearTimeout(this.timerGuest);
      //     // this.timerGuest = setTimeout(() => {
      //       this.showSwal('guestLogin');
      //       //diable or enable scroll and zoom
      //       // this.cesiumFunction.disableMapZoomandScrollForGuest(
      //       //   this.viewer,
      //       //   false
      //       // );
      //     // }, 200);
      //   }
      // }
    };
    this.viewer.camera.moveStart.addEventListener(this.moveStartListenerGuest);
  }
  // Reset the listener reference
  removeMoveStartListener() {
    if (this.moveStartListenerGuest) {
      this.viewer.camera.moveStart.removeEventListener(
        this.moveStartListenerGuest
      );
      this.moveStartListenerGuest = null;
    }
  }

  //For guest user click event on map click
  onClickonMapsGuest() {
    // this.mapClickHandlerGuest = new Cesium.ScreenSpaceEventHandler(
    //   this.viewer.scene.canvas
    // );
    // this.mapClickHandlerGuest.setInputAction((input) => {
    //diable or enable scroll and zoom
    // this.cesiumFunction.disableMapZoomandScrollForGuest(this.viewer, false);
    // this.showSwal('guestLogin');
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  // This will remove the event listener
  removeOnClickonMapsGuest() {
    if (this.mapClickHandlerGuest) {
      this.mapClickHandlerGuest.destroy();
      this.mapClickHandlerGuest = null;
    }
  }

  async getElevationData(latGraph, longGraph, altGraph, altRef) {
    this.altitudeRef = [];
    this.altitudeRef = altRef;
    this.elevationData = [];
    this.distances = [];
    this.droneHeight = [];
    this.maxElevation = 0;
    const coordinates: Coordinate[] = [];
    let dist: any = 0;
    this.totalDist = [];

    for (let i = 0; i < latGraph.length; i++) {
      const coordinate: Coordinate = {
        latitude: latGraph[i],
        longitude: longGraph[i],
      };
      coordinates.push(coordinate);
    }

    try {
      if (coordinates.length !== 0) {
        //validating for guest User
        const AccessToken = new CognitoAccessToken({
          AccessToken: localStorage.getItem('userAccessToken'),
        });
        //if guest user
        if (!AccessToken['jwtToken'] || !AccessToken['payload']) {
          this.elevationData = [
            211, 211, 210, 211, 210, 211, 210, 211, 209, 213, 213,
          ];
          // this.operatorApi
          //   .getGuestElevationData()
          //   .then((data) => {
          //     const elevations = data.MainData;
          //     this.elevationData.push(...elevations);
          //   })
          //   .catch((error) => {
          //     // console.error('Error fetching guest elevation data:', error);
          //   });
        }
        //else user is logged in
        else {
          const response = await this.operatorApi.getElevation(coordinates);
          const elevations = response['data']?.MainData;
          this.elevationData.push(...elevations);
        }
      }
      // Distance calculation
      this.distances.push(0);
      for (let i = 0; i < latGraph.length - 1; i++) {
        const point1 = turf.point([longGraph[i], latGraph[i]]);
        const point2 = turf.point([longGraph[i + 1], latGraph[i + 1]]);
        const horizontalDist = Math.abs(turf.distance(point1, point2));
        const horizontalDistance = horizontalDist * 1000;
        const verticalDistance = Math.abs(altGraph[i + 1] - altGraph[i]);
        const distance = Math.sqrt(
          Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2)
        );
        dist += distance;
        const distan = dist.toFixed(3);
        this.distances.push(parseFloat(distan));
      }
      if (this.altitudeRef.length > 0) {
        for (let i = 0; i < latGraph.length; i++) {
          if (this.altitudeRef[i] == 0) {
            this.droneHeight[i] = this.elevationData[i];
          } else if (this.altitudeRef[i] == 3) {
            this.droneHeight[i] =
              altGraph[0] + altGraph[i] + this.elevationData[0];
          } else if (this.altitudeRef[i] == 10) {
            this.droneHeight[i] = this.elevationData[i] + altGraph[i];
          }
        }
      } else {
        this.droneHeight = altGraph;
      }
      const AccessToken = new CognitoAccessToken({
        AccessToken: localStorage.getItem('userAccessToken'),
      });
      //if guest user
      if (!AccessToken['jwtToken'] || !AccessToken['payload']) {
        this.droneHeight = [
          211, 311, 311, 311, 311, 311, 311, 311, 311, 211, 211,
        ];
      }
      this.initBasicAreaEcharts(
        this.elevationData,
        this.droneHeight,
        this.distances,
        this.chartSize,
        this.numfont,
        this.xgap,
        this.ygap,
        this.liveAlt,
        this.liveDist
      );
    } catch (error) {}
  }
  chartSize = 10;
  numfont = 6;
  xgap = 30;
  ygap = 30;
  isToggle = false;
  toggleExpand() {
    this.isToggle = !this.isToggle;
    if (this.isToggle) {
      this.chartSize = 18;
      this.numfont = 14;
      this.xgap = 50;
      this.ygap = 50;
      this.initBasicAreaEcharts(
        this.elevationData,
        this.droneHeight,
        this.distances,
        this.chartSize,
        this.numfont,
        this.xgap,
        this.ygap,
        this.liveAlt,
        this.liveDist
      );
    } else {
      this.chartSize = 10;
      this.numfont = 6;
      this.xgap = 30;
      this.ygap = 30;
      this.initBasicAreaEcharts(
        this.elevationData,
        this.droneHeight,
        this.distances,
        this.chartSize,
        this.numfont,
        this.xgap,
        this.ygap,
        this.liveAlt,
        this.liveDist
      );
    }
  }

  initBasicAreaEcharts(
    elevationData,
    droneHeight,
    distances,
    chartSize,
    numfont,
    xgap,
    ygap,
    liveAlt?,
    liveDist?
  ) {
    let equal =
      distances[distances.length - 1] / (elevationData.length - 1) || 0;
    this.chartOption = {
      // title: {
      //   top: '10%',
      //   left: 'center',
      // },
      tooltip: {
        trigger: 'axis',
        order: 'seriesDesc',
        confine: true,
      },
      grid: {
        top: '7%',
        left: '8%',
        right: '10%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: [
        {
          name: 'Distance travelled by drone(m)',
          nameLocation: 'middle',
          nameGap: xgap,
          min: 0,
          nameTextStyle: {
            verticalAlign: 'bottom',
            fontSize: chartSize,
            // color:'white'
          },
          type: 'category',
          axisLabel: {
            // formatter: (value, index) => {
            //   const step = Math.floor(distances.length / 2); // Adjust this to change the number of ticks shown
            //   if (
            //     index === 0 ||
            //     index === step ||
            //     index === distances.length - 1
            //   ) {
            //     return value;
            //   }
            // },
            formatter: (value, index) => {
              if (index === 0 || index === distances.length - 1) {
                return value;
              }
            },
            fontSize: numfont,
          },
          boundaryGap: false,
          data: distances,
        },
      ],
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      yAxis: [
        {
          name: 'Elevation level(m)',
          nameLocation: 'middle',
          nameGap: ygap, // Adjust the gap as needed
          nameTextStyle: {
            verticalAlign: 'bottom',
            fontSize: chartSize,
          },
          min: 0,
          type: 'value',
          axisLabel: {
            formatter: '{value}',
            fontSize: numfont,
          },
          splitLine: {
            show: false,
          },
          z: 10,
        },
      ],
      series: [
        {
          name: 'Mean sea level(m)',
          type: 'line',
          // stack:'Total',
          data: elevationData,
          itemStyle: {
            color: '#0770FF',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(58,77,233,1)', // Solid blue at the top
              },
              {
                offset: 1,
                color: 'rgba(58,77,233,0)', // Fully transparent at the bottom
              },
            ]),
          },
        },
        {
          name: 'Planned Droned Altitude(m)',
          type: 'line',
          // stack:'Total',
          itemStyle: {
            color: '#F2597F',
          },
          data: droneHeight,
        },

        {
          name: 'Live Data',
          // xAxisIndex:0,
          // yAxisIndex: 0,
          type: 'line',
          stack: 'Total',
          // symbol: 'circle',
          // symbolSize: 12,
          itemStyle: {
            color: '#7581BD',
          },
          markLine: {
            symbol: 'none',
            label: {
              show: true,
              position: 'insideMiddle',
              rich: {
                labelSquare: {
                  align: 'center',
                  width: 40,
                  height: 25,
                  borderWidth: 1,
                  borderColor: '#7581BD',
                },
              },
              formatter: function () {
                return `{labelSquare|${liveAlt.toFixed(0)}}`;
              },
              // formatter:  function (params) {
              //   const liveDist = params.data[0];
              //   return `{labelSquare|${liveDist.toFixed(2)}}`;
              // },
              backgroundColor: '#7581BD',
              color: '#FFFFFF',
              padding: [0, 5],
            },
            lineStyle: {
              width: 3,
              color: '#7581BD',
              type: 'solid',
            },
            data: [
              {
                xAxis: liveDist / equal,
                lineStyle: {
                  type: 'dashed',
                },
              },
            ],
          },
          data: liveDist && liveAlt ? [[liveDist / equal, liveAlt]] : [],
        },
      ],
      // tooltip: {
      //   formatter: function (params) {
      //     const xValue = params.value[0] * equal;
      //     const yValue = params.value[1];
      //     return `Live Distance Travelled: ${xValue.toFixed(
      //       2
      //     )} m<br>Live Drone height: ${yValue.toFixed(2)} m`;
      //   },
      //   order: 'seriesDesc',
      //   confine: true,
      //   hideDelay: 0,
      // },
    };
  }

  //on click of +Create Mission on Guest dashboard Page
  getActivityType() {
    this.activityType.push('LOS');
    this.activityType.push('BVLOS');
  }
  guestRedirect() {
    // this.showSwal('guestLogin2');
    this.missionForm = 1;
    this.createMissionForm.reset();
    this.toggleMissionDetailstab = false;
  }
  backStepper() {
    this.missionForm = 0;
  }

  //guest user side card information
  async guestUserMissionDetails(missionList) {
    //getting Guest User Eleavtion Data
    if (missionList) {
      this.getElevationData(
        missionList.Latitude,
        missionList.Longitude,
        missionList.Altitude,
        missionList.AltitudeRef
      );
      try {
        const data = await this.operatorApi.getGuestNearbyAirport();
        data.MainData.DateTime = this.dateAndTimeFormat.dateAndTimeFormatting(
          new Date(),
          'dateAndTime'
        );
        this.nearbyAirports = data.MainData;
      } catch (error) {
        // console.error('Error fetching nearby airports:', error);
      }
    }

    if (this.missionList?.PermissionStatus) {
      this.missionPermissionsList = [
        { module: 'MissionParameters', category: [] },
        { module: 'WeatherParameters', category: [] },
        { module: 'DroneParameters', category: [] },
      ];

      let defaultPermissionList = [
        {
          Permission: 'Auto-Approve',
          Category: 'Activity Type',
          Module: 'MissionParameters',
        },
        {
          Permission: 'Auto-Approve',
          Category: 'Airspace Restrictions',
          Module: 'MissionParameters',
        },
        {
          Permission: 'Auto-Approve',
          Category: 'Flight Time',
          Module: 'MissionParameters',
        },
        {
          Permission: 'Auto-Approve',
          Category: 'Weather',
          Module: 'WeatherParameters',
        },
        {
          Permission: 'Auto-Approve',
          Category: 'UAV Info',
          Module: 'DroneParameters',
        },
      ];
      defaultPermissionList.forEach((defaultVal) => {
        let defaultCat = this.missionList?.PermissionStatus.some(
          (val) => val.Category == defaultVal.Category
        );
        if (!defaultCat) this.missionList?.PermissionStatus.push(defaultVal);
      });

      this.missionPermissionsList.forEach((modules) => {
        this.missionList?.PermissionStatus.forEach((permission) => {
          if (modules.module == permission.Module) {
            let categoryIndex = modules.category.findIndex(
              (val) => val?.Name == permission?.Category
            );
            if (categoryIndex != -1) {
              if (
                !modules.category[categoryIndex].types.find(
                  (val) =>
                    val.Type == permission.Type &&
                    val.Permission == permission.Permission
                )
              ) {
                modules.category[categoryIndex].types.push(permission);
              }
            } else {
              modules.category.push({
                Name: permission.Category,
                types: [permission],
              });
            }
          }
        });
      });
      this.missionPermissionsList.forEach((modules) => {
        modules.category.forEach((category) => {
          category.permission = category.types.some(
            (type) => type.Permission == 'Auto-Reject'
          )
            ? 'Auto-Reject'
            : category.types.some((type) => type.Permission == 'Manual')
            ? 'Manual'
            : 'Auto-Approve';
        });
        modules = {
          ...modules,
        };
      });
      let tempPemissionList = [];
      this.missionPermissionsList.forEach((module) => {
        tempPemissionList.push(...module.category);
      });
      this.missionPermissionsList = tempPemissionList;
    }
  }

geoZoneTour(){

  type PopoverDOM = {
    wrapper: HTMLElement;
    arrow: HTMLElement;
    title: HTMLElement;
    description: HTMLElement;
    footer: HTMLElement;
    progress: HTMLElement;
    previousButton: HTMLElement;
    nextButton: HTMLElement;
    closeButton: HTMLElement;
    footerButtons: HTMLElement;
  };

  type CustomPopoverRender = (
    popover: PopoverDOM,
    opts: { config: Config; state: State }
  ) => void;

  const customPopoverRender: CustomPopoverRender = (
    popover,
    { config, state }
  ) => {
    const totalSteps = config.steps.length;

    // close button
    // steps div
    const customStepper = document.createElement('div');
    customStepper.innerHTML = `<span class='stepper'>Step ${
      state.activeIndex + 1
    }/${totalSteps}<span>`; // Change the text as needed
    customStepper.className = 'custom-stepper'; // Add custom class for styling
    // button
    const customCloseButton = document.createElement('button');
    customCloseButton.innerText = 'Skip Tour';
    customCloseButton.className = 'custom-close-button';

    // // skip tour click button
    customCloseButton.addEventListener('click', () => {
      driverObj.destroy();
    });

    customStepper.appendChild(customCloseButton);
    // Replace the existing close button with the custom one created
    popover.closeButton.replaceWith(customStepper);
  };

  // steps configration
  const driverObj = driver({
    onPopoverRender: customPopoverRender,
    nextBtnText: 'Next',
    prevBtnText: 'Previous',
    doneBtnText: 'Done',
    smoothScroll: true,
    allowClose: false,
    stagePadding: 5,
    steps: [
      {
        element: '#drawButton',
        popover: {
          title: 'Draw Waypoints',
          description:
            'After clicking this button, you can draw waypoints on the map.',
          showButtons: ['next'],
        },
      },
      {
        element: '.createMissionBtn',
        popover: {
          title: 'Mission Creation',
          description:
            'After clicking this button, you can create the mission.',
          showButtons: ['previous', 'next'],
        },
      },
    ],
  });
  driverObj.destroy();
  // Start the tour
  driverObj.drive();
}

autoCheckForStartMissionWithoutMP(
  missionId,
  missionStatus,
  bufferCoord,
  altitudeArr,
  latitudeArr,
  longitudeArr
) {
  if (
    this.enableStartMission &&
    this.droneConnected &&
    missionStatus == 'Approved' &&
    this.missionTime
  ) {
    if (!this.missionStarted || !this.gcsConnected) {
      this.startMission(
        missionId,
        missionStatus,
        bufferCoord,
        altitudeArr,
        latitudeArr,
        longitudeArr
      );
    }
  } else {
    setTimeout(() => {
      this.autoCheckForStartMission(
        missionId,
        missionStatus,
        bufferCoord,
        altitudeArr,
        latitudeArr,
        longitudeArr
      );
    }, 1000);
  }
}

zoomOnMap(lat: number, long: number, alt :number){
  setTimeout(()=> {
    const distanceFromCamera = 3000;
    const position = Cesium.Cartesian3.fromDegrees(
      long, 
      lat, 
      Math.abs(alt) + distanceFromCamera 
  );
  if (position) {
          this.viewer.camera.flyTo({
              destination: position, 
              orientation: {
                  pitch: Cesium.Math.toRadians(-90), 
                  heading: 0, 
                  roll: 0, 
              },
              duration: 2,
          });
    }
  },3500)
}

getZoneData(){
  this.activeAirspaceEntities = this.viewer.entities;
  this.AuthorityService.getZoneApiData().then((res: any) => {
    let items = res['data']?.items;
    this.cesiumFunction.getActiveAirBufferSpacesForZone(
      items,
      this.activeAirspaceEntities,
      this.viewer
    );
    //  this.profileDetails = res.Main
  });
}

redirectToMissionPlanner() {
    localStorage.removeItem('isLive');
    this.router.navigate(['/operator/operator-app/mission-planner']);
}

}
