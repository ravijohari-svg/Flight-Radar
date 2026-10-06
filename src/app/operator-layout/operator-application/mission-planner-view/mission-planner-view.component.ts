// import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChangeDetectionStrategy, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
// import { OperatorService } from 'src/app/custom-services/operator/operator.service';

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
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';
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
import { WebSocket4GService } from 'src/app/custom-services/common/websocket4G.service';
interface Coordinate {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-mission-planner-view',
  templateUrl: './mission-planner-view.component.html',
  styleUrls: ['./mission-planner-view.component.scss'],
})
export class MissionPlannerViewComponent {
  readonly panelOpenState = signal(false);
  actionViewData: any = [
    {
      title: 'Battery',
      value: '100%',
      icon: 'assets/icons/battery1.svg'
    },
    {
      title: 'Altitude',
      value: '0m ',
      icon: 'assets/icons/altitude1.svg'
    },
    {
      title: 'Terrain Elevation',
      value: '30 m',
      icon: 'assets/icons/terrain.svg'
    },
    {
      title: 'Ground Speed',
      value: '30',
      icon: 'assets/icons/speed1.svg'
    },
    {
      title: 'Air Speed',
      value: '0 m',
      icon: 'assets/icons/rocket.svg'
    },
    {
      title: 'Latitude',
      value: '0 m',
      icon: 'assets/icons/location1.svg'
    },
    {
      title: 'Longitude',
      value: '0 m',
      icon: 'assets/icons/location1.svg'
    },
    {
      title: 'Mode',
      value: 'Loiter',
      icon: ''
    }
  ];

  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  expandedIndex = 0;

  panels = [
    { title: 'Accordion Panel 1', content: 'This is the content of panel 1' },
    { title: 'Accordion Panel 2', content: 'This is the content of panel 2' },
    { title: 'Accordion Panel 3', content: 'This is the content of panel 3' },
  ];

  isChecked = false;

  pitch = 0;
  roll = 0;

  pitchMarks = [30, 40, 50, 60, 70];
  private intervalId: any;
  private direction = 1;

  @ViewChild('attitudeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('compassCanvas') canvasRef1!: ElementRef<HTMLCanvasElement>;
  // pitch = 0;
  // roll = 0;
  // private intervalId: any;
  // private direction = 1;
  private ctx!: CanvasRenderingContext2D;
  private needleImage = new Image();

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
  wayBackened = [];
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

  activeTab: string = 'GENERAL';
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
  latLong: any[];
  selectedAction: String;
  modes: string[] = ['RTL', 'AUTO', 'LAND', 'LOITER', 'GUIDED', 'ALT_HOLD', 'STABILIZE', 'ARM', 'DISARM'];
  selectedModeVal: string = '';
  droneUIN: string;
  activeMission: any;
  eventMessages = [];
  showTakeoffModal = false;
  takeoffAltitude = 30;
  commandSnackbar = {
    visible: false,
    message: '',
  };
  private commandSnackbarTimer: ReturnType<typeof setTimeout>;
  commandButtons = [
    { label: 'ARM', action: 'ARM', icon: 'assets/icons/lock-keyhole-square.svg' },
    { label: 'DISARM', action: 'DISARM', icon: 'assets/icons/lock-keyhole-square.svg', variant: 'danger' },
    { label: 'TAKEOFF', action: 'TAKEOFF', icon: 'assets/icons/travel.svg', variant: 'primary' },
    { label: 'LAND', action: 'LAND', icon: 'assets/icons/arrivals.svg' },
    { label: 'RTL', action: 'RTL', icon: 'assets/icons/home.svg' },
    { label: 'AUTO MODE', action: 'UPLOAD_MISSION', icon: 'assets/icons/Refresh.svg' },
    { label: 'BACK TO BASE', action: 'UPLOAD_RETURN_MISSION', icon: 'assets/icons/locationCompass.png.png' },
    { label: 'CLEAR MISSION', action: 'CLEAR_MISSION', icon: 'assets/icons/delete-pop.svg', variant: 'danger' },
  ];

  get telemetryStrip() {
    const mode =
      this.webSocketValue?.status?.mode ||
      this.webSocketValue?.mode ||
      this.actionViewData.find((item) => item.title === 'Mode')?.value ||
      'AUTO';

    return [
      { label: 'Longitude', value: this.liveLongitude ? (Number(this.liveLongitude).toFixed(5)) : '0.00000' },
      { label: 'Latitude', value: this.liveLatitude ? (Number(this.liveLatitude).toFixed(5)) : '0.00000' },
      { label: 'Altitude', value: `${this.liveAltitude ? Number(this.liveAltitude).toFixed(5) : '0.00000' } m` },
      {
        label: 'G-Speed',
        value: `${ Number(this.webSocketValue?.groundspeed ?? 0).toFixed(3)} m/s`,
      },
      {
        label: 'Air-Speed',
        value: `${ Number(this.webSocketValue?.airspeed ?? 0).toFixed(3) } m/s`,
      },
     { label: 'Pitch', value: `${Number(this.webSocketValue?.pitch ?? 0).toFixed(3)} deg` },
     { label: 'Roll', value: `${Number(this.webSocketValue?.roll ?? 0).toFixed(3)} deg` },
      { label: 'HDOP', value: `${Number(this.webSocketValue?.hdop ?? 0).toFixed(3)}`},
    ];
  }

  get satelliteVisibleCount() {
    return (
      this.webSocketValue?.gps?.satellites_visible ||
      this.webSocketValue?.gps?.satellitesVisible ||
      this.webSocketValue?.satellites_visible ||
      this.webSocketValue?.satellitesCount ||
      this.satellitesCount ||
      0
    );
  }

  get preFlightChecks() {
    const gpsFixType = this.webSocketValue?.gps?.fix_type || this.webSocketValue?.gpsstatus || 0;
    const satellitesVisible = this.satelliteVisibleCount;
    const batteryVoltage =
      this.webSocketValue?.battery_voltage ||
      this.webSocketValue?.system?.battery_voltage ||
      0;
    const ekfVariance =
      this.webSocketValue?.ekf_variance ||
      this.webSocketValue?.system?.ekf_variance ||
      this.webSocketValue?.sensors_health?.ekf ||
      this.webSocketValue?.system?.ekf;
    const imuVariance =
      this.webSocketValue?.imu_variance ||
      this.webSocketValue?.system?.imu_variance ||
      this.webSocketValue?.sensors_health?.imu ||
      this.webSocketValue?.system?.imu;
    const controlSurface =
      this.webSocketValue?.control_surface ||
      this.webSocketValue?.sensors_health?.control_surface ||
      this.webSocketValue?.system?.control_surface ||
      this.webSocketValue?.sensors_health?.servo_output;

    return [
      {
        label: 'GPS Fix Type',
        value: gpsFixType || '--',
        status: gpsFixType >= 3 ? 'ok' : 'warn',
      },
      {
        label: 'Satellites Visible',
        value: satellitesVisible || '--',
        status: satellitesVisible >= 6 ? 'ok' : 'warn',
      },
      {
        label: 'Battery Voltage Level',
        value: batteryVoltage ? `${this.formatToTwoDecimals(batteryVoltage)} V` : '--',
        status: !batteryVoltage || batteryVoltage >= 10.5 ? 'ok' : 'warn',
      },
      // {
      //   label: 'EKF Variance Status',
      //   value: ekfVariance === undefined ? '--' : ekfVariance,
      //   status: this.isHealthyCheck(ekfVariance) ? 'ok' : 'warn',
      // },
      // {
      //   label: 'IMU Calibration Variance',
      //   value: imuVariance === undefined ? '--' : imuVariance,
      //   status: this.isHealthyCheck(imuVariance) ? 'ok' : 'warn',
      // },
      // {
      //   label: 'Control Surface Check',
      //   value: controlSurface === undefined ? '--' : controlSurface,
      //   status: this.isHealthyCheck(controlSurface) ? 'ok' : 'warn',
      // },
      {
        label: 'Armed',
        value: this.webSocketValue?.armed === undefined ? '--' : this.webSocketValue?.armed,
        status: this.webSocketValue?.armed ? 'ok' : 'warn',
      },
    ];
  }

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
    private AuthorityService: AuthorityapisService,
    private webSocket4GService: WebSocket4GService
  ) { }

  ngOnInit(): void {
    this.initialFunction();
    this.getActivityType();
  }

  ngAfterViewInit() {
    // const canvas = this.canvasRef.nativeElement;
    // this.ctx = canvas.getContext('2d')!;
    // this.animate();
    // this.needleImage.src = 'assets/icons/pin323.png';
    // this.drawCanvas();
    // this.intervalId = setInterval(() => this.update(), 70);
    // this.sendMessage();

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
                  (err) => { }
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

      setTimeout(()=>{
        if(this.mode){
          let distanceFromCamera = 3000;
          this.zoomOnMap(
              
            this.liveLatitude,
            this.liveLongitude,
            Math.abs(this.liveAltitude) + distanceFromCamera
          );
        }
      },5000)
  }

  // This will remove the event listener
  removeOnClickonMapsGuest() {
    if (this.mapClickHandlerGuest) {
      this.mapClickHandlerGuest.destroy();
      this.mapClickHandlerGuest = null;
    }
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

  sendMessage() {
    this.operatorService.updateMessage('UpdateSidebar');
  }

  // update(): void {
    // const sampleData = {
    //   attitude: {
    //     pitch: 15.2,
    //     roll: -10.4
    //   }
    // };
    // this.pitch += this.direction * 2;
    // if (this.pitch >= 50 || this.pitch <= -50) {
    //   this.direction *= -1;
    // }

    // this.roll = 30 * Math.sin(Date.now() / 1000);
    // this.draw();
  // }
smoothing = 0.05;
  
update(): void {
  const targetPitch = (this.webSocketValue?.navigation?.nav_pitch ?? 0) * 100;
  const targetRoll = (this.webSocketValue?.navigation?.nav_roll ?? 0) * 100;

  this.pitch += (targetPitch - this.pitch) * this.smoothing;
  this.roll += (targetRoll - this.roll) * this.smoothing;

  this.pitch = Math.max(-50, Math.min(50, this.pitch));
  this.roll = Math.max(-50, Math.min(50, this.roll));

  // this.draw();

  // Keep updating every animation frame
  // requestAnimationFrame(() => this.update());
}

  draw(): void {
    const ctx = this.ctx;
    const w = 200;
    const h = 200;
    const radius = w / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    ctx.translate(w / 2, h / 2 + 20);
    ctx.rotate((this.roll * Math.PI) / 180);

    ctx.fillStyle = '#0067ce';
    ctx.fillRect(-w, -h + this.pitch, w * 2, h);

    ctx.fillStyle = '#6EA536';
    ctx.fillRect(-w, this.pitch, w * 2, h * 2);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w, this.pitch);
    ctx.lineTo(w, this.pitch);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    for (let i = -90; i <= 90; i += 10) {
      const y = this.pitch - i;
      if (y > -70 && y < 100) {
        const isMajor = i % 30 === 0;
        const lineWidth = isMajor ? 40 : 20;

        ctx.beginPath();
        ctx.moveTo(-lineWidth, y);
        ctx.lineTo(lineWidth, y);
        ctx.stroke();

        if (i !== 0 && isMajor) {
          ctx.fillText(`${-i}°`, -lineWidth - 10, y + 3);
          ctx.fillText(`${-i}°`, lineWidth + 10, y + 3);
        }
      }
    }

    ctx.restore();

    ctx.save();
    ctx.translate(w / 2, h / 2);
    const arcRadius = radius - 5;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;

    const startAngle = ((-50 - 90) * Math.PI) / 180;
    const endAngle = ((50 - 90) * Math.PI) / 180;

    ctx.beginPath();
    ctx.arc(0, 0, arcRadius, startAngle, endAngle);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let angle = -50; angle <= 50; angle += 10) {
      const rad = ((angle - 90) * Math.PI) / 180;

      const tickLength = 6;
      const outerX = arcRadius * Math.cos(rad);
      const outerY = arcRadius * Math.sin(rad);
      const innerX = (arcRadius - tickLength) * Math.cos(rad);
      const innerY = (arcRadius - tickLength) * Math.sin(rad);

      ctx.beginPath();
      ctx.moveTo(outerX, outerY);
      ctx.lineTo(innerX, innerY);
      ctx.stroke();

      const labelX = (arcRadius - 14) * Math.cos(rad);
      const labelY = (arcRadius - 14) * Math.sin(rad);
      // ctx.fillText(`${angle}`, labelX, labelY);
    }

    ctx.restore();

    ctx.save();
    ctx.translate(w / 2, h / 2);
    const pointerAngle = (-90 + this.roll) * (Math.PI / 180);
    const pointerX = arcRadius * Math.cos(pointerAngle);
    const pointerY = arcRadius * Math.sin(pointerAngle);

    ctx.translate(pointerX, pointerY);
    ctx.rotate(pointerAngle + Math.PI / 2);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, -10);
    ctx.lineTo(6, -10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(w / 2, h / 2);
    const rollAngle = this.roll * (Math.PI / 180);
    ctx.rotate(rollAngle);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    const offsetY1 = 20;
    const offsetY2 = 20;

    ctx.beginPath();
    ctx.moveTo(0, offsetY1 - 0);
    ctx.lineTo(-16, offsetY1 + 11);
    ctx.lineTo(16, offsetY1 + 11);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-65, offsetY1);
    ctx.lineTo(-20, offsetY1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(20, offsetY2);
    ctx.lineTo(58, offsetY2);
    ctx.stroke();

    ctx.restore();
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    this.draw();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  drawCanvas() {
    const canvas = this.canvasRef1.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    const needleWidth = 20;
    const needleHeight = 120;

    let currentAngle = 0;
    const drawCompass = (angle: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();

      for (let i = 0; i < 360; i += 10) {
        const tickLength = i % 90 === 0 ? 18 : 11;
        const angleRad = (i * Math.PI) / 180;
        const xStart = centerX + (radius - tickLength) * Math.cos(angleRad);
        const yStart = centerY + (radius - tickLength) * Math.sin(angleRad);
        const xEnd = centerX + radius * Math.cos(angleRad);
        const yEnd = centerY + radius * Math.sin(angleRad);

        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }

      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('N', centerX, centerY - radius + 35);
      ctx.fillText('S', centerX, centerY + radius - 20);
      ctx.fillText('E', centerX + radius - 30, centerY + 8);
      ctx.fillText('W', centerX - radius + 30, centerY + 8);

      ctx.save();

      ctx.translate(centerX, centerY);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(this.needleImage, -needleWidth / 2, -needleHeight / 2, needleWidth, needleHeight);

      ctx.restore();

      ctx.fillStyle = '#dedede';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      // ctx.fillText(`${angle}°`, centerX, centerY + 50);
    };

    this.needleImage.onload = () => {
      setInterval(() => {
        // currentAngle = (currentAngle + 1) % 360; 
        drawCompass(40);
      }, 100);
    };
  }

  initialFunction() {
    //validating AccessToken for User
    this.activeMission = JSON.parse(localStorage.getItem('valueStored'));
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

    // this.getDronesAndGearList();

    //subscribing web socket service
    this.subscription = this.webSocketService
      .getMessages()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((message) => {
        let body;
        // console.log(message);
        
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
            if (!this.mode) {
              this.notificationService.notify({
                title: 'Drone module connection is established',
                type: NotificationType.success,
                message: 'Done',
                duration: 5000,
              });
            }
            this.mode = true;
            this.wsConnectedLogs(message, activeMission.MissionId);
          }
        }
        if (message.action === 'Operator-take-events') {
          this.handleOperatorEvent(message);
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
        if (message.action === 'check-zone-stream' && message.dataChange) {
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

    this.webSocket4GService.connectWebSocket(
      environment.websocket4GKey + 'clientId=',
      this.profileDetails
    );

    this.subscription = this.webSocket4GService
      .get4GMessages()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((message) => {
        this.notificationService.notify({
                title: `${this.selectedAction} command is received`,
                type: NotificationType.success,
                message: 'Done',
                duration: 5000,
              });
        let body;
        if (message.body) {
          body = JSON.parse(message?.body);
        }
      });
  }


  handleMissionDetailsUpdate = (details) => {
    // Update mission details based on the received update
    if (details) {
      this.deconfliction = details.data;
      this.notifyOperator(this.profileDetails?.UserId);
    }
  };

  handleOperatorEvent(event) {
    const eventBody = event?.message?.payload?.body || event?.payload?.body || event?.body;

    if (!eventBody) {
      return;
    }

    const level = (eventBody.level || eventBody.type || 'INFO').toString();
    const eventName = eventBody.event ? `[${eventBody.event}] ` : '';
    const eventMessage = eventBody.message || '';

    this.eventMessages = [
      {
        time: this.formatEventTime(eventBody.timestamp),
        type: level.toLowerCase(),
        message: `[${level}] ${eventName}${eventMessage}`,
      },
      ...this.eventMessages,
    ].slice(0, 100);
  }

  formatEventTime(timestamp) {
    if (!timestamp) {
      return this.dateAndTimeFormat.dateAndTimeFormatting(new Date(), 'time');
    }

    const eventDate = new Date(timestamp);
    if (Number.isNaN(eventDate.getTime())) {
      return timestamp;
    }

    return eventDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  isHealthyCheck(value) {
    if (value === undefined || value === null || value === '') {
      return true;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value <= 1;
    }

    const normalizedValue = value.toString().toLowerCase();
    return !['false', 'fail', 'failed', 'warn', 'warning', 'error', 'bad'].includes(normalizedValue);
  }

  notifyOperator(OpertatorId: string) {
    if (this.droneOutsideBuffer && !this.notifyoutsideBuffer) {
      this.notifyoutsideBuffer = true;
      this.operatorApi.sendLeftBufferRegionNotification({ OpertatorId });
      // .catch((err) => console.log(err));
    }
    if (!this.droneOutsideBuffer) this.notifyoutsideBuffer = false;
  }

  wsConnectedLogs(event, missionId) {
    let realTimeLogs;
    if (this.socketType === "MISSION_PLANNER") {
      realTimeLogs = JSON.parse(event.data);
    } else {
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
      // console.log(this.webSocketValue);
      
      if (this.socketType === 'OTHER') {
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
          groundspeed: this.webSocketValue.navigation?.ground_speed,
          modeVal: this.webSocketValue.status.mode,
          distTraveled: this.webSocketValue.additional_info.dist_traveled,
          ...this.webSocketValue?.gps
        }
        realTimeLogs = this.webSocketValue
        if (this.zoomForOtherMission && (this.webSocketValue.lat || this.webSocketValue.lng)) {
          this.zoomForOtherMission = false;
          // this.zoomOnMap(this.webSocketValue.lat, this.webSocketValue.lng, this.webSocketValue.alt);
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

      const altitudeItem = this.actionViewData.find(item => item.title === 'Altitude');
      if (altitudeItem) {
        altitudeItem.value = this.liveAltitude;
      }
      const latitudeItem = this.actionViewData.find(item => item.title === 'Latitude');
      if (latitudeItem) {
        latitudeItem.value = this.liveLatitude;
      }
      const longitudeItem = this.actionViewData.find(item => item.title === 'Longitude');
      if (longitudeItem) {
        longitudeItem.value = this.liveLongitude;
      }

      const batteryItem = this.actionViewData.find(item => item.title === 'Battery');
      if (batteryItem) {
        batteryItem.value = this.webSocketValue.system.battery_remaining + '%'; 
      }

      const modeItem = this.actionViewData.find(item => item.title === 'Mode');
      if (modeItem) {
        modeItem.value = this.webSocketValue.status.mode; 
      }
      
      const groundSpeedItem = this.actionViewData.find(item => item.title === 'Ground Speed');
      if (groundSpeedItem) {
        const raw = this.webSocketValue?.additional_info?.ground_speed;
        groundSpeedItem.value = this.formatToTwoDecimals(raw);
      }

      const airSpeedItem = this.actionViewData.find(item => item.title === 'Air Speed');
      if (airSpeedItem) {
        const raw = this.webSocketValue?.navigation?.airspeed;
        airSpeedItem.value = this.formatToTwoDecimals(raw);
      }

       this.update();
      // this.webSocketValue?.navigation?.nav_pitch;
      // this.webSocketValue?.navigation?.nav_roll;

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
            rc_receiver: realTimeLogs?.sensors_enabled?.rc_receiver ? realTimeLogs?.sensors_enabled?.rc_receiver : true, //WS
            gps: realTimeLogs?.sensors_enabled?.gps ? realTimeLogs?.sensors_enabled?.gps : true, //WS
            logging: realTimeLogs?.sensors_health?.logging ? realTimeLogs?.sensors_health?.logging : true, //WS
            prearm: realTimeLogs?.sensors_enabled?.prearm ? realTimeLogs?.sensors_enabled?.prearm : true, //WS
            alt: realTimeLogs?.alt, //WS
            CreatedById: this.profileDetails?.UserId, //Profile Details
            CreatedByName: this.profileDetails?.FirstName, //Profile Details
            messages: realTimeLogs?.messages ? realTimeLogs?.messages : '',
            message: realTimeLogs?.message ? realTimeLogs?.message : 'VTOL approach d=1542.3', //ws
            messageHigh: realTimeLogs?.messageHigh ? realTimeLogs?.messageHigh : '', //ws
            battery_voltage: realTimeLogs?.battery_voltage ? realTimeLogs?.battery_voltage : 0, //ws
            datetimeLog: realTimeLogs?.datetime ? realTimeLogs?.datetime :
              this.dateAndTimeFormat.dateAndTimeFormatting(
                new Date(),
                'fulldateAndTime'
              ),
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
      const selectedMissionId = this.activeMission?.MissionId;
      this.droneUIN  = this.activeMission?.DroneUIN;
      this.missionListArr
        .filter(arr =>
          arr.MissionId === selectedMissionId && arr.DroneUIN === this.droneUIN)
        .forEach((arr) => {
          const latLongArr = [];
          const latLongAltArr = [];
          arr.Latitude.forEach((lat, i) => {
            latLongArr.push({
              Latitude: lat,
              Longitude: arr.Longitude[i]
            });
            latLongAltArr.push({
              lat: lat,
              lon: arr.Longitude[i],
              alt: arr.Altitude[i],
              command: 16
            });
          });
          arr.LatLong = latLongArr;
          this.latLong = latLongAltArr; 
        });
      let activeMission;

      if (localStorage.getItem('isLive') != 'true') {
        activeMission = JSON.parse(localStorage.getItem('valueStored'));
      }
      console.log("activeMission",activeMission);
      

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
              try {
                  this.cesiumFunction.zoomEntity1(
                    this.viewer,
                    entity,
                    this.missionList?.BufferRegion
                  );
                } catch (err) {
                  console.error('zoomEntity1 failed', err);
              }
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
              try{
              // this.cesiumFunction.zoomEntity1(
              //   this.viewer,
              //   entity,
              //   this.cesiumFunction.bufferRegion
              // );
              } catch (err) {
                  console.error('zoomEntity1 failed', err);
              }
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
 this.missionStarted = true;
    this.createAndUpdateDroneWithBuffer(
      this.missionList.BufferRegion,
      this.AltitudeArr,
      this.LatitudeArr,
      this.LongitudeArr
    );
  }


  getZoneData() {
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

  zoomOnMap(lat: number, long: number, alt: number) {
    setTimeout(() => {
      const distanceFromCamera = 4000;
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
    }, 3500)
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

  DeleteValue() {
    localStorage.removeItem('valueStored');
  }


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
      // this.initBasicAreaEcharts(
      //   this.elevationData,
      //   this.droneHeight,
      //   this.distances,
      //   this.chartSize,
      //   this.numfont,
      //   this.xgap,
      //   this.ygap,
      //   this.liveAlt,
      //   this.liveDist
      // );
    } catch (error) { }
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
        console.log(res);
        
        this.satellitesCount = res.data.MainData?.SatelliteCount;
      })
      .catch((err) => console.error(err));
  }

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

  //NearbyAirport
  async getnearbyAirport(MissionId) {
    this.operatorApi
      .nearbyAirport({ MissionId })
      .then((res) => {
        this.nearbyAirports = res?.data?.MainData;
      })
      .catch((err) => console.error(err));
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
      (err) => { }
    );
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
        else {
          this.missionstartloader = false;
          if (this.mode) {
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
      }
      else {
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
        if (this.socketType !== 'OTHER') {
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
        if (this.socketType === 'MISSION_PLANNER') {
          if (this.wsConnected) {
            this.wsConnectedLogs(event, missionId);
          }
        } else {
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

  //Cache Memory
  reloadCache() {
    let cache = this.cachedData;
    this.cachedData = [];
    if (localStorage.getItem('gcsCache') !== null) {
      localStorage.removeItem('gcsCache');
    }
    localStorage.setItem('gcsCache', JSON.stringify(cache));
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

  pushPayload() {
    if (this.liveLatitude !== 0 && this.liveLongitude !== 0) {
      // && this.webSocketValue?.connected
      let formattedVal = {
        // ...this.webSocketValue?.channel_inputs,
        // ...this.webSocketValue?.channel_outputs,
        armed: this.webSocketValue?.armed,
        battery_remaining: this.webSocketValue?.battery_remaining,
        ch1in: this.webSocketValue.ch1in ? this.webSocketValue.ch1in : this.webSocketValue?.channel_inputs.ch1_in,
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
        Location: this.webSocketValue.Location ? this.webSocketValue.Location : {
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
        accelerometer: this.webSocketValue?.sensors_health?.accelerometer ? this.webSocketValue?.sensors_health?.accelerometer : this.webSocketValue?.system?.accelerometer,
        altitude_control: this.webSocketValue?.sensors_health?.altitude_control ? this.webSocketValue?.sensors_health?.altitude_control : true,
        compass: this.webSocketValue?.sensors_health?.compass ? this.webSocketValue?.sensors_health?.compass : 0,
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
        gpsstatus: this.webSocketValue?.gpsstatus ? this.webSocketValue?.gpsstatus : 0,
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

  //Test for disabling routes
  StoreValue(value) {
    localStorage.setItem('valueStored', JSON.stringify(value));
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
      .then((res) => { })
      .catch((err) => { });
  }

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
            // this.initBasicAreaEcharts(
            //   this.elevationData,
            //   this.droneHeight,
            //   this.distances,
            //   this.chartSize,
            //   this.numfont,
            //   this.xgap,
            //   this.ygap,
            //   this.liveAlt,
            //   this.liveDist
            // );
            this.indexs++;
          }
          if (
            this.liveAlt <= 50 &&
            this.liveDist >= 500 &&
            this.liveAlt >= 48
          ) {
            // this.initBasicAreaEcharts(
            //   this.elevationData,
            //   this.droneHeight,
            //   this.distances,
            //   this.chartSize,
            //   this.numfont,
            //   this.xgap,
            //   this.ygap,
            //   this.liveAlt,
            //   this.liveDist
            // );
          }
          if (this.liveAlt <= 10 && this.liveDist >= 500 && this.execute) {
            // this.initBasicAreaEcharts(
            //   this.elevationData,
            //   this.droneHeight,
            //   this.distances,
            //   this.chartSize,
            //   this.numfont,
            //   this.xgap,
            //   this.ygap,
            //   this.liveAlt,
            //   this.liveDist
            // );
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
      new URL('./mission-planner.worker', import.meta.url),
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


  async verticalDroneLeftitsBuffer(pt, latitudeArr, longitudeArr, altitudeArr) {
    this.result = await this.verticalBuffer(
      pt,
      latitudeArr,
      longitudeArr,
      altitudeArr
    );
    return this.result;
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

  //Restrict page reload and close tab
  callReloadEventListener(e) {
    e.preventDefault();
    var confirmationMessage =
      'Page cannot be refreshed when your mission is active';
    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
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


  // Test for map layer cards
  onClickonMaps() {
    this.ScreenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
    this.ScreenSpaceEventHandler.setInputAction((input) => {
      // this.isView = true;
      if (this.guestUser == false) {
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
      (err) => { }
    );
  }

  getActivityType() {
    this.activityType.push('LOS');
    this.activityType.push('BVLOS');
  }

  //TrackDrone
  TrackDrone() {
    const distanceFromCamera = 5500;

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

  handleCommandClick(command) {
    if (command.action === 'CLEAR') {
      this.clearMission();
      return;
    }

    if (command.action === 'TAKEOFF') {
      this.openTakeoffModal();
      return;
    }

    this.confirmDroneAction(command.action);
  }

  openTakeoffModal() {
    this.takeoffAltitude = this.takeoffAltitude || 30;
    this.showTakeoffModal = true;
  }

  closeTakeoffModal() {
    this.showTakeoffModal = false;
  }

  confirmTakeoff() {
    this.droneAction('TAKEOFF', this.takeoffAltitude);
    this.closeTakeoffModal();
  }

  get waypointFileUrl() {
    return this.activeMission?.WaypointFile;
  }

  requiresWaypointFile(command: string) {
    return ['AUTO', 'UPLOAD_MISSION', 'UPLOAD_RETURN_MISSION'].includes(command);
  }

  isDroneCommandDisabled(command: string) {
    return !command || (this.requiresWaypointFile(command) && !this.waypointFileUrl);
  }

  executeSelectedMode() {
    this.confirmDroneAction(this.selectedModeVal);
  }

  confirmDroneAction(command: string, takeoffAltitude?: number) {
    if (this.isDroneCommandDisabled(command)) {
      this.showCommandSnackbar('Waypoint file is required for this command');
      return;
    }

    this.swalWithBootstrapButtons
      .fire({
        background: '#1b1f27',
        title: 'Confirm Drone Command',
        text: `Send ${command} command to the drone?`,
        focusConfirm: false,
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Send Command',
        cancelButtonText: 'Cancel',
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.droneAction(command, takeoffAltitude);
        }
      });
  }

  showCommandSnackbar(message: string) {
    this.commandSnackbar = {
      visible: true,
      message,
    };

    if (this.commandSnackbarTimer) {
      clearTimeout(this.commandSnackbarTimer);
    }

    this.commandSnackbarTimer = setTimeout(() => {
      this.commandSnackbar.visible = false;
    }, 3500);
  }

  droneAction(value: String, takeoffAltitude?: number){
    this.selectedAction = value;
    const command = String(value);
    const payload = {
      action: "send_command",
      UIN: this.droneUIN,
      clientId: this.profileDetails?.UserId,
      command: value,
      ...(value === "TAKEOFF" && { takeoff_altitude: Number(takeoffAltitude) || 15 }),
      ...(value === "UPLOAD_MISSION" && { mission : this.latLong }),
      ...(this.requiresWaypointFile(command) && { WaypointFileUrl: this.waypointFileUrl }),
      mode: "GUIDED",
    }
    // this.showCommandSnackbar(`${value} command is sent`);
    this.webSocket4GService.sendMessage(payload);
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

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
          this.router.navigate(['/operator/operator-app/dashboard']);
        },
        (err) => {
          this.loader = false;
        }
      )
      .finally(() => {
        this.notificationService.clearNotifications();
      });
  }

  checker(){
    this.notificationService.notify({
                title: 'Mode Changed',
                type: NotificationType.success,
                message: 'Done',
                duration: 5000,
              });
  }

  clearMission(){
     this.initializeActionViewData();
  }

  initializeActionViewData(){
      this.actionViewData = this.actionViewData.map(item => ({
      ...item,
      value: '0'
    }));
  }

  formatToTwoDecimals(value: number | undefined | null): string {
  if (typeof value !== 'number' || isNaN(value)) return '0.00';
  return value.toFixed(2); 
}

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

   toggleData(val: any) {
    this.showSwal('guestLogin');
  }

  
}
