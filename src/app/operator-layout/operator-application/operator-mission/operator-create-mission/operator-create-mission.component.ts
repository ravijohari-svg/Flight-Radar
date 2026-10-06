import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  from as observableFrom,
  interval,
  merge,
  Observable,
  Subject,
} from 'rxjs';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
//Turf
import * as turf from '@turf/turf';

import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';

import { environment } from 'src/environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

//Report generation
import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import { Router } from '@angular/router';
// import { OperatorlivedatacheckService } from 'src/app/custom-services/operator/operatorlivedatacheck.service';
import Swal from 'sweetalert2';
import { PaymentModalService } from 'src/app/custom-services/operator/payment-modal.service';
import { Constants } from 'src/app/constants/constants';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';

// const jsts = require('jsts');
import * as jstsIo from 'jsts/org/locationtech/jts/io';
import * as echarts from 'echarts';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
// declare var turf;

//For elevation graph to store the coordinates
interface Coordinate {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-operator-create-mission',
  templateUrl: './operator-create-mission.component.html',
  styleUrls: ['./operator-create-mission.component.scss'],
  providers: [],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatorCreateMissionComponent implements OnInit {
  //Webworker
  private webworker: Worker;
  errorFind: boolean = false;
  // polylineEditorObservable: PolylineEditorObservable;
  flightPurpose: any;
  reservedData: any;
  MissionFlightPurposeId: any;
  SearchFlightPurpose: any;
  isShowWarning: boolean = false;
  isAgree: boolean = false;
  isFilled: number = 1;
  correlationData;
  isNext: number = 0;
  waypointformSubmitted: boolean;
  formValid: boolean;
  lengthSplit;
  uploadLoader: boolean = false;
  altitudeRef = [];
  poly1;
  lessData: boolean = false;
  entity;
  isDisable: boolean = false;
  isVisible: boolean = false;
  startDraw: boolean = false;
  editPoint: boolean = false;
  onWayChange: boolean = false;
  intersectionTableZones;
  terrainAdvisory;
  completeWaypoint: boolean = false;
  doubleClick: boolean = true;
  handler;
  clickEnabled: boolean = false;
  showCorrelation: boolean = false;
  cameraMoveEndEventListener: any;
  ScreenSpaceEventHandler: any;
  distanceData = [];
  FencePosition;
  subscription: any;
  selectedFile: File;
  selectedFileS3Url: any;

  @ViewChild('uploadwayPoint', { static: false }) set content1(
    content: ElementRef
  ) {
    if (content) {
      // initially setter gets called with undefined
    }
  }
  @ViewChild('operationName') operationName: ElementRef;
  ngAfterViewInit() {
    this.operationName.nativeElement.focus();
  }
  // planes$: Observable<AcNotification>;
  showTracks = true;
  //Polyline
  // editingPolyline$: PolylineEditorObservable;
  // editPolylineOptions = {
  //   polylineProps: {
  //     material: () =>
  //       new Cesium.PolylineDashMaterialProperty({
  //         color: Cesium.Color.fromRgba(0x888e8e8e),
  //         dashLength: 14,
  //       }),
  //     width: 2,
  //   },
  //   pointProps: {
  //     color: Cesium.Color.fromRgba(0xaa8e8e8e),
  //     pixelSize: 9,
  //     outlineColor: Cesium.Color.TRANSPARENT,
  //   },
  // };

  // Custom info box data
  entityDescription;
  isReset = false;
  expandedAccordionIndex: number;

  //Uploaded file Details
  waypoint;
  finalwaypointVal = [];
  wayPointsArr = [];
  LatitudeArr: any = [];
  LongitudeArr: any = [];
  AltitudeArr: any = [];
  WayPointNum: any = [];
  extent;
  //Forms tab
  tabIndex = 0;
  waypointTemplates = [];
  waypointData;
  waypointValues = [];
  fileContent;
  //Create Missions
  createMissionForm: FormGroup;
  missionDetails: FormGroup;
  testForm: FormGroup;
  submitted = false;
  wayPointsInvalid;
  wayPointsInvalidPolygon;
  activityType;
  altitudeUnits = ['Ft', 'm', 'Km'];
  //Drones and Gears
  dronesAndGearList;
  DroneSelected;
  //OperatorsList
  operatorsList;
  //ProfileDetails
  profileDetails;
  //PilotNames
  pilotNames = ['Saradhaa', 'Vikasini'];
  //Disbaled
  disabled = true;
  submitFlag: boolean = false;

  //Waypoints Option
  uploadOption;
  fileName;

  //WayPoints Editable Table
  wayPointsForm: FormGroup;

  //Buffer Region
  bufferPointsArr = [];

  //Warning Visibility
  warningVisibility;
  warningZoneFlag;
  initialPost = false;

  //Template card
  isDropdownOpen = false;
  showdata = false;
  showAccordian = false;
  isView = false;
  makeClose = true;

  //Cesium Viewer
  viewer;
  // mapIdObj = {
  //   mapId: 'cesium-container',
  //   containerId: 'cesium-container',
  // };
  //Loader
  loader = false;
  loaderKey;
  setwaypointloader;

  //Subject
  private unSubscribe = new Subject<void>();

  //Plane Finder
  planesVisibility;
  // planeFinder;
  // planeFinder$: Observable<AcNotification>;
  planes = [];

  //Active airspace - Buffer region
  activeBufferLoader;
  activeBufferVisibility = true;
  activeBufferRegion;
  activeBuffers: any = [];
  // activeBuffers$: Observable<AcNotification>;
  // = new Cesium.EntityCollection
  activeAirspaceEntities;

  //Debouncing logic
  debounceTimer;
  debounceMode;
  debounceCaller;
  latitudeArr = [];
  longitudeArr = [];
  bufferPolygon = [];
  typeIntersect;

  //Co Relation Flag;
  coRelationFlag;

  //To disable the Set Waypoint button
  setWaypointFlag;
  resetFlag;
  completePathFlag;

  //Data Sources for GeoJSON
  geojsonDataSourceIndia = new Cesium.GeoJsonDataSource();
  geojsonDataSourceIreland = new Cesium.GeoJsonDataSource();
  geojsonDataSourceAirportIndia = new Cesium.GeoJsonDataSource();
  geojsonDataSourceAirportIreland = new Cesium.GeoJsonDataSource();
  geojsonDataSourceGreenZoneIndia = new Cesium.GeoJsonDataSource();
  geojsonDataSourceWarningZone = new Cesium.GeoJsonDataSource();
  geojsonDataSourceNoFlyZone = new Cesium.GeoJsonDataSource();
  geojsonDataSourceInnerYellowZone = new Cesium.GeoJsonDataSource();
  geojsonDataSourceYellowZone = new Cesium.GeoJsonDataSource();
  geojsonDataSourceMilitaryZone = new Cesium.GeoJsonDataSource();
  geojsonDataSourceGeoFenceIndia = new Cesium.GeoJsonDataSource();
  geojsonDataSourceFICIndia = new Cesium.GeoJsonDataSource();

  geojsonDataSourceNoFlyZoneDubai = new Cesium.GeoJsonDataSource();
  geojsonDataSourceIndiaBoundary = new Cesium.GeoJsonDataSource();
  geojsonDataSourceFIRs = new Cesium.GeoJsonDataSource();

  //Getting Maps Layer from backend Based on Country initially
  entitiesOfRestrictedAreasIndia = [];
  entitiesOfRestrictedAreasIreland = [];

  //entities for reserved airspace
  entitiesOfReservedAirspaces = [];
  entitiesOfRestrictedAreasDubai = [];
  //Get all the entities
  entitiesOfRestrictedAreas = [];

  //Interesection
  interesectedEntities = [];
  interesectedZone = [];
  greenZoneIntersection = [];
  reservedAirspaceIntersection = [];
  reservedAirspacePos = [];
  entities;
  interesectionArr = {
    vfr: [],
    airport: [],
    greenzone: [],
    geozone: [],
    FIC: [],
    reservedAirspace: [],
    TerrainAdvisory: [],
  };

  mapLayersModule;
  mapLayers = [];

  //Modal
  modalRef: BsModalRef;

  //waypoints values
  validWaypointNum = [16, 21];
  // ,20

  //Document generation
  mainmap = {
    containerId: 'main',
    mapId: 'main-map',
  };
  docmap = {
    containerId: 'doc',
    mapId: 'doc-map',
  };

  mapScreenshotURL;
  base64Report;
  reportValues;
  reportGenerated;

  //Weather details
  // currentWeatherDetails;
  //Type of Mission
  missionType;

  missionPermissionsList;

  //Flying Risk Analysis
  flightriskScore;
  riskChartOptions;

  // OSM buildings
  // osmBuilding = false;
  // osmTileset;

  //Elevation graph
  chartOption: echarts.EChartsOption;
  latGraph: any = [];
  longGraph: any = [];
  altGraph: any = [];
  isMinimized = false;
  isExpanded = false;
  isClicked = false;

  // Mapbox
  mapBoxKey = environment.mapBoxKey;
  maptilerkey = environment.maptilerkey;
  // stadiamapKey= environment.stadimapKey;

  //declarations
  declarationFlag;
  declarationChecked;

  // Mission's FIR
  FIR;

  isDraw = true;

  //The first Cesium.ProviderViewModel represents a Mapbox Dark theme imagery provider and includes a name, a tooltip, an
  //icon URL, and a creation function which returns a Cesium.UrlTemplateImageryProvider object that defines
  //the URL for the Mapbox Dark Theme imagery tiles, which includes a Mapbox access token
  //The {z}, {x}, and {y} parameters in the URL template are placeholders that will be replaced by the zoom level, tile column,
  //and tile row  both providerViewModels are set to image files located in the '../../../../assets/common-layout' directory
  // providerViewModels = [
  //   new Cesium.ProviderViewModel({
  //     name: 'Dark',
  //     // iconUrl: Cesium.buildModuleUrl("path_to_an_icon_image"),
  //     iconUrl: '../../../../assets/common-layout/darkMap.png',
  //     tooltip: 'Mapbox Dark Theme imagery',
  //     creationFunction: () => {
  //       return new Cesium.UrlTemplateImageryProvider({
  //         url:
  //           `https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=` +
  //           this.mapBoxKey,
  //       });
  //     },
  //   }),
  //   new Cesium.ProviderViewModel({
  //     name: 'Light',
  //     // iconUrl: Cesium.buildModuleUrl("path_to_an_icon_image"),
  //     tooltip: 'Mapbox Light Theme imagery',
  //     iconUrl: '../../../../assets/common-layout/grey.png',
  //     creationFunction: () => {
  //       return new Cesium.UrlTemplateImageryProvider({
  //         url:
  //           `https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=` +
  //           this.mapBoxKey,
  //       });
  //     },
  //   }),
  // ];

  // selectedImagery = this.mapLayersService.providerViewModels[0];
  // selectedTerrain = this.mapLayersService.providerViewModel[0];

  //flag for NumberOfFlightSubmission
  limitReach;

  //for error messages
  invalidFile = false;
  dialogRejectedFlag;
  //Swal
  //This function is used to give alert
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
      //  text : 'alert-text'
      // cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false,
  });

  // Open Weather API
  cityName: Observable<any>;
  weatherDetails;
  currentWeatherDetails;
  NotFound;
  responseCityName: Observable<any>;

  //dialog box
  dialogFlag;
  // private editedPolyline: any;
  disableBackground;

  //uploadDocuments form
  uploadDocumentsFlag;

  //document feilds
  document1Flag;
  document1FileName;
  document2FileName;
  document2Flag;
  //document fields
  kmlFlag;
  kmlFileName;
  operationsPlanFileName;
  operationsPlanFlag;
  uinCertificateFileName;
  uinCertificateFlag;
  dgcaCertificateFileName;
  dgcaCertificateFlag;
  insuranceFileName;
  insuranceFlag;
  incorporationFileName;
  incorporationFlag;
  companyProfileFileName;
  companyProfileFlag;
  document3FileName;
  document3Flag;
  document4FileName;
  document4Flag;

  //Error Messages
  kmlFileSizeError = false;
  operationsPlanFileSizeError = false;
  uinCertificateFileSizeError = false;
  dgcaCertificateFileSizeError = false;
  insuranceFileSizeError = false;
  incorporationFileSizeError = false;
  companyProfileFileSizeError = false;
  document1FileSizeError = false;
  document2FileSizeError = false;
  document3FileSizeError = false;
  document4FileSizeError = false;
  kmlFileTypeError = false;
  operationsPlanFileTypeError = false;
  uinCertificateFileTypeError = false;
  dgcaCertificateFileTypeError = false;
  insuranceFileTypeError = false;
  incorporationFileTypeError = false;
  companyProfileFileTypeError = false;
  document1FileTypeError = false;
  document2FileTypeError = false;
  document3FileTypeError = false;
  document4FileTypeError = false;
  generalComplianceSubmit;

  //documents Data
  droneDoc;
  operatorDoc;
  missionDoc;
  operatorDocArr = [];
  missionDocArr = [];
  droneDocArr = [];
  pointData: any = [];
  polyData: any = [];
  // telecom: boolean = false;
  // heatmap: boolean = false;
  // imageryLayer;
  // imgLayer;

  //documents form
  generalCompliance: FormGroup;
  //pop-up reason for rejection
  missionStatus;
  missionList;

  //2D3D
  toggleFlag = true;
  // toggleflagText = '2D';

  constructor(
    private fb: FormBuilder,
    private operatorApi: OperatorapisService,
    private cesiumFunction: CesiumFunctionService,
    private modalService: BsModalService,
    private dateAndTimeFormat: DateTimeFormatService,
    // private sharedDataService: OperatorlivedatacheckService,
    private operatorService: OperatorService,
    private router: Router,
    private paymentModalService: PaymentModalService,
    private mapLayersService: MapLayersService,
    private authorityApi: AuthorityapisService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    // this.uploadDocumentsFlag =true
    // this.dialogFlag =true;
    //to disable the background create-mission modal
    this.disableBackground = false;
    this.distanceData = [];
    this.pointData = [];
    this.polyData = [];

    //To disable the Set Waypoint button
    this.setWaypointFlag = false;
    this.resetFlag = false;
    this.completePathFlag = false;

    //documents fields
    this.kmlFlag = 0;
    this.operationsPlanFlag = 0;
    this.uinCertificateFlag = 0;
    this.dgcaCertificateFlag = 0;
    this.insuranceFlag = 0;
    this.incorporationFlag = 0;
    this.companyProfileFlag = 0;
    this.document1Flag = 0;
    this.document2Flag = 0;
    this.document3Flag = 0;
    this.document4Flag = 0;

    this.limitReach = false;
    this.declarationChecked = true;
    this.declarationFlag = false;
    // let decrypt = CryptoJS.AES.decrypt(
    //   localStorage.getItem('UserDetails').toString(),
    //   environment.operatorKey
    // );
    // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.profileDetails = this.operatorService.returnProfileDetails();

    this.testForm = this.fb.group({
      testing: [''],
    });

    //flag for NumberOfFlightSubmission
    if (this.profileDetails.NumberOfFlightSubmission < 1) {
      this.limitReach = true;
    }

    // this.createMissionForm = this.fb.group({
    this.missionDetails = this.fb.group(
      {
        OperationName: [
          '',
          [
            Validators.required,
            this.noWhitespaceValidator,
            Validators.minLength(3),
          ],
        ],
        // StartDate: ['',Validators.required],
        StartTime: ['', [Validators.required, this.startTime]],
        // EndDate: ['',Validators.required],
        EndTime: ['', Validators.required],
        ActivityType: [
          {
            value: '',
            disabled:
              this.profileDetails?.RPTO &&
              this.profileDetails?.GeoFence &&
              this.profileDetails?.GeoFence?.FileURL,
          },
          Validators.required,
        ],
        FlightPurpose: [
          {
            value: '',
            disabled:
              this.profileDetails?.RPTO &&
              this.profileDetails?.GeoFence &&
              this.profileDetails?.GeoFence?.FileURL,
          },
          Validators.required,
        ],
        MaximumAltitude: [
          120,
          [
            Validators.required,
            Validators.max(120),
            Validators.pattern('^[0-9]*$'),
          ],
        ],
        MaximumAltitudeUnits: ['m', Validators.required],
        // MissionStatus: ['', Validators.required],
        DroneId: ['', Validators.required],
        Pilot: ['', Validators.required],
        PilotContact: ['', Validators.required],
        // }),
      },
      {
        validators: [this.startEndTime.bind(this)],
      }
    );

    //documents fields form
    this.generalCompliance = this.fb.group({
      //kmlFile
      kmlFile: new FormControl('', Validators.required),
      kmlFileType: new FormControl('', Validators.required),
      //Operations Plan
      operationsPlanFile: new FormControl('', Validators.required),
      operationsPlanFileType: new FormControl('', Validators.required),
      //UIN Certificate
      uinCertificateFile: new FormControl('', Validators.required),
      uinCertificateFileType: new FormControl('', Validators.required),
      //DGCA Certificate
      dgcaCertificateFile: new FormControl('', Validators.required),
      dgcaCertificateFileType: new FormControl('', Validators.required),
      //insurance Certificate
      insuranceFile: new FormControl('', Validators.required),
      insuranceFileType: new FormControl('', Validators.required),
      //incorporation Certificate
      incorporationFile: new FormControl(''),
      incorporationFileType: new FormControl(''),
      //comapany Certificate
      companyProfileFile: new FormControl(''),
      companyProfileFileType: new FormControl(''),
      //other document Certificate
      document1File: new FormControl(''),
      document1FileType: new FormControl(''),
      document2File: new FormControl(''),
      document2FileType: new FormControl(''),
      document3File: new FormControl(''),
      document3FileType: new FormControl(''),
      document4File: new FormControl(''),
      document4FileType: new FormControl(''),
    });
    //this function is to call all the predefined waypoint template
    this.waypointTemplate();
    // We make a Cesium Viewer instance from the Maps Manager Service based on the mapIdObj.mapId property.
    // The scene mode of the viewer is set to SCENE2D, which switches the view to a two-dimensional map view
    setTimeout(() => {
      // this.viewer = this.mapsManagerService
      //   .getMap(this.mapIdObj.mapId)
      //   .getCesiumViewer();

      //instead of default2D view
      this.clickEnabled = false;
      this.pointData = [];
      this.polyData = [];
      this.viewer = this.mapLayersService.getViewer();
      this.viewer.entities.removeAll();
      this.viewer.scene.requestRender();
      // this.cesiumFunction.set3DTunnelView(this.viewer);
      // this.entities = this.viewer.entities;
      // this.getMapLayersCountry()
      // this.mapLayersService.getMapLayersCountry(
      //   this.viewer,
      //   this.profileDetails
      // );
      // this.cesiumFunction.loadBingWithLabels(this.viewer);
      this.cesiumFunction.removeTimelineAndClock(this.viewer);
      // this.osmTileset = Cesium.createOsmBuildings();
      // this.viewer.scene.primitives.add(this.osmTileset);
      // this.osmTileset.show = false;

      this.getActiveAirBufferSpaces();
      this.missionDetails.patchValue({
        Pilot: this.profileDetails.FirstName,
        PilotContact: this.profileDetails.PhoneNumber,
        StartTime: this.dateAndTimeFormat.dateAndTimeFormatting(
          new Date(this.addMinutesToDate(new Date(), 3)),
          'dateAndTime'
        ),
        // this.timeFormatting(new Date(this.addMinutesToDate(new Date(), 3))),
        EndTime: this.dateAndTimeFormat.dateAndTimeFormatting(
          new Date(this.addMinutesToDate(new Date(), 13)),
          'dateAndTime'
        ),
      });

      this.initialFunction();
      this.initialAPIs();
      // navigator.geolocation.getCurrentPosition((loc) => {
      //   this.viewer.camera.flyTo({
      //     destination: Cesium.Cartesian3.fromDegrees(
      //       loc.coords.longitude,
      //       loc.coords.latitude,
      //       350
      //     ),
      //   });
      // })
      this.getZoneData();
      this.onClickonMaps();
      this.makePolyLine();
    }, 1000);
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  ngOnDestroy(): void {
    // this.heatmap = false;
    // this.telecom = false;
    // if (this.imageryLayer) {
    //   this.viewer.imageryLayers.remove(this.imageryLayer);
    // }
    // if (this.imgLayer) {
    //   this.viewer.imageryLayers.remove(this.imgLayer);
    // }
    this.mapLayersService.removeRPTOGeoZone(this.viewer);
    if (this.viewer) {
      this.viewer.camera.moveStart.removeEventListener();
      // this.viewer.scene.primitives.remove(this.osmTileset);
    }
    if (this.ScreenSpaceEventHandler) {
      this.ScreenSpaceEventHandler.destroy();
    }
    // remove Listener for the camera
    if (this.cameraMoveEndEventListener) {
      this.cameraMoveEndEventListener();
    }

    clearInterval(this.debounceTimer);
    this.unSubscribe.next();
    this.unSubscribe.complete();
    this.clickEnabled = false;
    // this.osmTileset.show = false;
    this.pointData = [];
    this.polyData = [];
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
    // this.planeFinder$ = undefined;
    clearInterval(this.activeBufferRegion);
    // setTimeout(() => {
    //   this.viewer.camera.moveEnd.removeEventListener();
    // }, 2000);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  initialFunction() {
    this.wayPointsForm = this.fb.group({
      wayPoints: this.fb.array([]),
    });
    if (
      !(
        this.profileDetails?.RPTO &&
        this.profileDetails?.GeoFence &&
        this.profileDetails?.GeoFence?.FileURL
      )
    ) {
      setTimeout(() => {
        // this.cesiumFunction.setView(this.viewer);
        this.cesiumFunction.navigateToCurrrentLocation(this.viewer);

        this.getZoomLevel();
        // this.getMapLayers();
        this.getCameraCoordinates();
      }, 1000);
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
            // let name = res?.body.name;
            // this.currentWeatherDetails = res?.body;
            // this.cityName = name;
            // this.responseCityName = name;
            let body = JSON.parse(res?.body);
            this.currentWeatherDetails = body;
            this.cityName = body.name;
            this.responseCityName = body.name;
            // return res;
          });
      });
    } else {
      //  Fence for RPTO
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

    if (this.webworker) {
      this.webworker.terminate();
    }
    if (this.handler) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    this.subscription = this.webSocketService
    .getMessages()
    .pipe(takeUntil(this.unSubscribe))
    .subscribe((message) => {
      if(message.action === 'check-zone-stream' && message.dataChange){
        this.getZoneData();
      }
    });
  }
  createFormGroup(): FormGroup {
    return this.fb.group({
      Latitude: ['', Validators.required],
      Longitude: ['', Validators.required],
      Altitude: [
        '',
        [Validators.required, Validators.max(120), Validators.min(0)],
      ],
    });
  }
  // OSM buildings
  //This function will show the obstacles buildings that are coming in the region.
  // osmBuildings(val) {
  //   this.osmBuilding = !this.mapLayersService.osmBuildings(
  //     this.viewer,
  //     this.osmBuilding,
  //     this.osmTileset
  //   );
  // }
  initialAPIs() {
    this.returnProfileDetails();
    this.getDronesAndGearList();
    // this.getOperatorsList();
    this.activityTypeApi();
    this.getFlightPurposelist();
    //Maximum Altitude Value Changes
  }
  // getReservedAirSpace(){
  //   this.operatorApi.getReservedAirSpace().then((res:any)=>{
  //     this.reservedData = res.data;
  //   },
  //   (err:any)=>{
  //     // console.log(err);
  //   })
  // }
  returnProfileDetails() {
    // let decrypt = CryptoJS.AES.decrypt(
    //   localStorage.getItem('UserDetails').toString(),
    //   environment.operatorKey
    // );
    // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.profileDetails = this.operatorService.returnProfileDetails();
  }
  //Drones and Gears
  //This function will call an api to give the list of all drones list that are registered by the operator.
  getDronesAndGearList(): any {
    // this.returnProfileDetails();
    // let payload = {
    //   OperatorId: this.profileDetails.UserId,
    // };
    // this.operatorApi.getDronesAndGearsList(payload).then((res: any) => {
    //   this.dronesAndGearList = res.data.MainData['DronesAndGears'];
    //   console.log(this.dronesAndGearList);
    //   //  this.profileDetails = res.Main
    // });
    this.operatorApi.dronesAndGearsData$
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((res) => {
        if (res !== null) {
          this.dronesAndGearList = res?.data?.MainData['DronesAndGears'];
          // console.log('subscribe from create mission: ', res);
        }
      });
  }
  //Operators
  // getOperatorsList() {
  //   let payload = {
  //     OperatorId: this.profileDetails.UserId,
  //   };
  //   this.operatorApi.getOperatorsList(payload).then((res: any) => {
  //     this.operatorsList = res.data.MainData;
  //     //  this.profileDetails = res.Main
  //   });
  // }

  //OnOptionsSelect
  onSelectOption(select) {
    let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
    formArray.clear();
    this.wayPointsArr = [];
    // destroying the clickOnMap handler before drawing polyline or uploading
    if (this.ScreenSpaceEventHandler) {
      this.ScreenSpaceEventHandler.destroy();
    }
    // removing the pin and info
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Location Pin');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Location Info');
    this.cesiumFunction.latLongPinEntity = undefined;
    this.cesiumFunction.latLongInfoEntity = undefined;

    if (select == 'draw') {
      this.clickEnabled = true;
      this.isDraw = false;
      // if (this.editingPolyline$) {
      //   this.editingPolyline$.dispose();
      //   this.editingPolyline$ = undefined;
      // }
      this.tabIndex = 2;
      this.startDrawPolyline(null);
    } else {
      this.isDraw = true;
      this.tabIndex = 3;
      // if (this.editingPolyline$) {
      //   this.editingPolyline$.dispose();
      //   this.editingPolyline$ = undefined;
      // }
      this.fileName = '';
    }
  }
  // telecomApi(val) {
  //   this.telecom = val;
  //   if (this.telecom) {
  //     this.imageryLayer = this.viewer.imageryLayers.addImageryProvider(
  //       new Cesium.IonImageryProvider({ assetId: 2360108 })
  //     );
  //     this.viewer.zoomTo(this.imageryLayer);
  //   } else {
  //     this.viewer.imageryLayers.remove(this.imageryLayer);
  //   }
  // }
  // popHeatmap(val) {
  //   this.heatmap = val;
  //   if (this.heatmap) {
  //     this.imgLayer = this.viewer.imageryLayers.addImageryProvider(
  //       new Cesium.IonImageryProvider({ assetId: 2360681 })
  //     );
  //     this.viewer.zoomTo(this.imgLayer);
  //   } else {
  //     this.viewer.imageryLayers.remove(this.imgLayer);
  //   }
  // }
  //Activity Type
  //This function will call an api getAllActivityType to get all the list of activity type that is shown in the options of flight purpose.
  activityTypeApi() {
    this.operatorApi.getAllActivityType().then((res: any) => {
      this.activityType = res.data.MainData;
      // for RPTO pilot
      if (
        this.profileDetails?.RPTO &&
        this.profileDetails?.GeoFence &&
        this.profileDetails?.GeoFence?.FileURL
      ) {
        const trainingActivity = this.activityType.find(
          (item) =>
            item.ActivityType?.toLowerCase()?.trim() ==
            'VLOS Training'?.toLowerCase()
        );

        if (trainingActivity) {
          this.missionDetails.patchValue({
            ActivityType: trainingActivity,
          });
        } else {
          const othersActivity = this.activityType.find(
            (item) => item.ActivityType?.toLowerCase()?.trim() == 'others'
          );
          this.missionDetails.patchValue({
            ActivityType: othersActivity,
          });
        }
      }
    });
  }
  //Flight Purpose
  //This function will call an api getAllFlightPurpose to get all the list flight purpose data that is shown in the options of Flight purpose.
  getFlightPurposelist() {
    this.operatorApi.getAllFlightPurpose().then((res: any) => {
      this.flightPurpose = res.data.MainData;
      // for RPTO pilot
      if (
        this.profileDetails?.RPTO &&
        this.profileDetails?.GeoFence &&
        this.profileDetails?.GeoFence?.FileURL
      ) {
        const trainingFlightPurpose = this.flightPurpose.find(
          (item) =>
            item.FlightPurpose?.toLowerCase()?.trim() ==
            'Traning'.toLowerCase().trim()
        );

        if (trainingFlightPurpose) {
          this.missionDetails.patchValue({
            FlightPurpose: trainingFlightPurpose,
          });
        } else {
          const otherFilghtPurpose = this.flightPurpose.find(
            (item) => item.FlightPurpose?.toLowerCase() == 'others'
          );
          this.missionDetails.patchValue({
            ActivityType: otherFilghtPurpose,
          });
        }
      }
    });
  }
  //By this function depending on the start and end time we enter in form it will get us the Reserved airspaces in that region
  getActiveAirBufferSpaces() {
    let StartandEndValChanges = merge(
      this.missionDetails.get('StartTime').valueChanges,
      this.missionDetails.get('EndTime').valueChanges
    );
    StartandEndValChanges.subscribe((val) => {
      this.missionDetails.updateValueAndValidity();
      // && this.missionDetails.controls
      if (
        this.missionDetails.get('StartTime').valid &&
        this.missionDetails.get('EndTime').valid &&
        !this.missionDetails?.errors?.startEndTime &&
        !this.missionDetails?.errors?.startTime
      ) {
        this.activeBufferLoader = true;
        let payload = {
          StartTime: this.missionDetails.get('StartTime').value,
          EndTime: this.missionDetails.get('EndTime').value,
          OperatorId: this.profileDetails.UserId,
        };
        this.operatorApi.getActiveBufferRegions(payload).then(
          (res: any) => {
            this.activeAirspaceEntities = this.viewer.entities;
            this.activeBufferLoader = false;
            this.activeBuffers = res.data.MainData;
            this.entitiesOfReservedAirspaces =
              this.cesiumFunction.getActiveAirBufferSpacesOnCoRelation(
                this.activeBuffers,
                this.activeAirspaceEntities,
                this.viewer,
                this.entitiesOfReservedAirspaces
              );
            //   if(this.activeBuffers[3]?.Longitude) {
            //   this.cesiumFunction.polylineVolume(this.viewer,this.activeBuffers[3].Longitude,this.activeBuffers[3].Latitude,this.activeBuffers[3].Altitude);
            //   this.cesiumFunction.loadWayPoints(this.viewer,this.activeBuffers[3].Longitude,this.activeBuffers[3].Latitude,this.activeBuffers[3].Altitude);
            // }
          },
          (err) => {
            this.activeBufferLoader = false;
          }
        );
      }
    });
  }
  // When we click on the complete path button with only 1 way points it will show the pop-up that choose at least two
  onCompletePath() {
    if (this.wayPointsArr.length <= 1) {
      this.showSwal('at-least-two-position', 2);
      return;
    } else {
      this.clickEnabled = false;
      this.completePathFlag = true;
      this.completeWaypoint = true;
      this.updateWayPoints(this.wayPointsArr);
    }
  }

  async downloadWaypoints() {
    let waypointsData = '';
    let coord = [];
    let payload = {
      latitude: this.LatitudeArr[0],
      longitude: this.LongitudeArr[0],
    };
    coord.push(payload);
    const res = await this.operatorApi.getElevation(coord);
    let elevation = res['data']?.MainData;
    elevation = Number(elevation);
    waypointsData += `QGC WPL 110\n`;
    //Setting the home condition for the mision plannar
    const index = 0; // index value
    const frame = Constants.homeFrame; // frame value
    const command = Constants.commandAbsolute; // command value
    const param2 = Constants.loiter; // loiter
    const param3 = 0; // Param3 value
    const param4 = 0; // Param4 value
    const x = 0; // X value
    const y = 0; // Y value
    const lat = this.LatitudeArr[0]; // Latitude value
    const lon = this.LongitudeArr[0]; // Longitude value
    const altitude = elevation; //Altitude value
    const autocontinue = Constants.autocontinue; //Autocontinue value
    waypointsData += `${index}     ${frame}     ${command}     ${param2}     ${param3}     ${param4}     ${x}     ${y}     ${lat}     ${lon}     ${altitude}     ${autocontinue}\n`;

    for (let i = 0; i < this.LatitudeArr.length; i++) {
      const index = i + 1; // Frame value
      const frame = Constants.frame; // Command value
      const command = Constants.commandRelative; // Param1 value
      let param2;
      if (i == 0) {
        param2 = Constants.takeOff; // takeoff condition
      } else if (i == this.LatitudeArr.length - 1) {
        param2 = Constants.land; // landing condition
      } else {
        param2 = Constants.loiter; // loiter
      }
      const param3 = 0.0; // Param3 value
      const param4 = 0.0; // Param4 value
      const x = 0.0; // X value
      const y = 0.0; // Y value
      const lat = this.LatitudeArr[i]; // Latitude value
      const lon = this.LongitudeArr[i]; // Longitude value
      const altitude = this.AltitudeArr[i]; //Altitude value
      const autocontinue = Constants.autocontinue; //Autocontinue value

      waypointsData += `${index}     ${frame}     ${command}     ${param2}     ${param3}     ${param4}     ${x}     ${y}     ${lat}     ${lon}     ${altitude}     ${autocontinue}\n`;
    }
    // Create a Blob with the .waypoints content
    const blob = new Blob([waypointsData], { type: 'text/plain' });
    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UTM.waypoints';
    a.click();
    window.URL.revokeObjectURL(url);
  }
  startDrawPolyline(btn) {
    this.isDisable = false;
    this.distanceData = [];
    if (btn == 'reset') {
      this.showCorrelation = false;
      this.pointData = [];
      this.polyData = [];
      this.viewer.entities.removeAll();
      this.viewer.scene.requestRender();
      this.altitudeRef = [];
      this.isDisable = false;
      this.isVisible = false;
      if (this.completeWaypoint) {
        this.clickEnabled = true;
      }
      this.completeWaypoint = false;
      this.isFilled = 2;
      this.isClicked = false;
      this.correlationData = {
        inneryellow: 0,
        outeryellow: 0,
        red: 0,
        geozone: 0,
        zoneCount: [0, 0, 0],
      };

      this.latitudeArr = [];
      this.longitudeArr = [];
      this.completePathFlag = false;
      let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
      formArray.clear();
      this.wayPointsArr = [];
      this.getZoneData();
    }
    // if (this.editingPolyline$) {
    //   this.editingPolyline$.dispose();
    //   this.editingPolyline$ = undefined;
    // }

    let entities = this.viewer.entities;
    entities.values.forEach((value) => {
      if (value.id.includes('CoRelation')) {
        entities.removeById(value.id);
      }
    });
    // this.editingPolyline$ = this.polylineEditor.create(
    //   this.editPolylineOptions
    // );
    // this.editingPolyline$.subscribe((wayPoints) => {
    // });
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
  makePolyLine() {
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.handler.setInputAction((input: any) => {
      if (this.clickEnabled == true) {
        var pickRay = this.viewer.scene.camera.getPickRay(input.position);
        var cartesian = this.viewer.scene.globe.pick(
          pickRay,
          this.viewer.scene
        );
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
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
            this.AltitudeArr.push(this.missionDetails.value.MaximumAltitude);
            this.WayPointNum.push(String(index));
          });

          if (this.pointData.length >= 2) {
            this.isFilled = 4;
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
            // turfPos.forEach((val,index) => {
            //   eval("var_"+ index +" = "+index);
            // })
            let initialArr = [];
            let latLongArr = [];
            let unionArr = [];
            let maxAltitude =
              Number(this.missionDetails.value.MaximumAltitude) + 50;
            let arr1d = [].concat(...turfPos);
            // let obj = Object.assign({}, ...turfPos );
            // var point = turf.multiPoint(turfPos);

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

                // this.bufferPolygon.push(value[0] + ' ' + value[1]);
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
                // this.bufferPolygon.push(val[0] + ' ' + val[1]);
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

          let diffLength;
          let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
          if (this.LatitudeArr.length > formArray.length) {
            diffLength = this.LatitudeArr.length - formArray.length;
            for (let i = 0; i < diffLength; i++) {
              this.wayPointsVal().push(this.newWayPoint());
            }
          } else if (this.LatitudeArr.length < formArray.length) {
            diffLength = formArray.length - this.LatitudeArr.length;
            for (let i = 0; i < diffLength; i++) {
              formArray.removeAt(formArray.length - 1);
            }
          }
          this.startDraw = true;
          this.checkCorrelationAltitude(
            this.missionDetails.value.MaximumAltitude,
            this.LatitudeArr,
            this.LongitudeArr
          );
          this.LatitudeArr.forEach((val, index) => {
            formArray.at(index).patchValue({
              Latitude: val,
              Longitude: this.LongitudeArr[index],
              // Altitude: this.missionDetails.value.MaximumAltitude,
            });
          });
          if (this.bufferPolygon.length > 0) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
              this.checkCorrelation(this.LatitudeArr, this.LongitudeArr);
            }, 500);
          }
        }
        this.viewer.scene.requestRender();
        console.log(this.longitudeArr);
        
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  onUploadReset() {
    // enable the click on map when not drawing or uploading
    this.distanceData = [];
    if (this.ScreenSpaceEventHandler.isDestroyed()) {
      this.onClickonMaps();
    }
    this.altitudeRef = [];
    this.isDisable = false;
    this.isVisible = false;
    this.errorFind = false;
    this.showCorrelation = false;
    this.completeWaypoint = false;
    this.correlationData = {
      inneryellow: 0,
      outeryellow: 0,
      red: 0,
      geozone: 0,
      zoneCount: [0, 0, 0],
    };
    this.latitudeArr = [];
    this.longitudeArr = [];
    this.isFilled = 2;
    this.isReset = false;
    this.tabIndex = 1;
    this.isClicked = false;
    this.isNext = 0;
    this.pointData = [];
    this.polyData = [];
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
    // if (this.editingPolyline$) {
    //   this.editingPolyline$.dispose();
    //   this.editingPolyline$ = undefined;
    // }
    this.fileName = '';
    this.initialPost = false;
    this.isExpanded = false;
    this.isMinimized = false;
    this.clickEnabled = false;
    this.getZoneData();
  }
  getAltitudeRef(waypoints?, kmlFileVal?) {
    this.altitudeRef = [];
    if (waypoints) {
      for (let i = 1; i < waypoints.length - 1; i++) {
        this.altitudeRef.push(waypoints[i][2]);
      }
      this.altitudeRef.push(waypoints[waypoints.length - 2][2]);
    }
    if (waypoints && waypoints[waypoints.length - 1].length != 0) {
      this.altitudeRef.push(waypoints[waypoints.length - 2][2]);
    }
  }

  // Or Edit from existing points
  editWayPoints(wayPoints?, kmlFileVal?, file?) {
    this.getAltitudeRef(wayPoints, kmlFileVal);
    // if (this.editingPolyline$) {
    //   this.editingPolyline$.dispose();
    //   this.editingPolyline$ = undefined;
    // }
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
            // ,arr[10]

            //2D maps
            if (this.LatitudeArr.length == 1) {
              // Altitude from mean sea level
              // this.AltitudeArr.push(Number(arr[10]));

              // Altitude from ground level
              this.AltitudeArr.push(0);
            } else {
              // this.AltitudeArr.push(
              //   Number(this.AltitudeArr[0]) +
              //   Number(this.AltitudeArr[this.AltitudeArr.length - 1])
              // );
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
        this.AltitudeArr.push(this.missionDetails.value.MaximumAltitude);
        this.WayPointNum.push(String(index));
        initialPos.push(
          Cesium.Cartesian3.fromDegrees(coordinate.lng, coordinate.lat)
        );
      });
    }
    let diffLength;
    let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
    if (this.LatitudeArr.length > formArray.length) {
      diffLength = this.LatitudeArr.length - formArray.length;
      for (let i = 0; i < diffLength; i++) {
        this.wayPointsVal().push(this.newWayPoint());
      }
    } else if (this.LatitudeArr.length < formArray.length) {
      diffLength = formArray.length - this.LatitudeArr.length;
      for (let i = 0; i < diffLength; i++) {
        formArray.removeAt(formArray.length - 1);
      }
    }
    this.LatitudeArr.forEach((val, index) => {
      formArray.at(index).patchValue({
        Latitude: val,
        Longitude: this.LongitudeArr[index],
        Altitude: this.AltitudeArr[index],
      });
    });
    this.editPoint = true;
    this.updateWayPoints(
      initialPos,
      this.LongitudeArr,
      this.LatitudeArr,
      this.AltitudeArr
    );
  }
  //Update Waypoints with initial position
  // If there  is an existing editingPolyline$ object, the method first disposes of it and sets it to undefined.
  // The subscribe method of the editingPolyline$ object is called to listen for changes in the polyline. Whenever a
  // change occurs, the callback function is executed.
  // The callback function first extracts the positions of the polyline and converts them to latitude and longitude
  // values, which are stored in LatitudeArr and LongitudeArr arrays respectively.
  // If the number of positions in the polyline is greater than or equal to two, the method creates a buffer zone
  // around the polyline using the Turf library
  // The buffer polygon is then converted into an array of Cartesian3 objects, which represent the points of the buffer polygon in 3D space.
  // The bufferRegion2D method of cesiumFunction is called to display the buffer polygon on the map
  updateWayPoints(initialPos, LongArr?, LatArr?, AltArr?) {
    // if (this.editingPolyline$) {
    //   this.editingPolyline$.dispose();
    //   this.editingPolyline$ = undefined;
    // }
    // this.editingPolyline$ = this.polylineEditor.edit(
    //   initialPos,
    //   this.editPolylineOptions
    // );
    this.clickEnabled = false;
    this.polyData = [];
    for (let i = 0; i < initialPos.length; i++) {
      var cartographic = Cesium.Cartographic.fromCartesian(initialPos[i]);
      var longitude = Cesium.Math.toDegrees(cartographic.longitude);
      var latitude = Cesium.Math.toDegrees(cartographic.latitude);
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
    // this.editingPolyline$.subscribe((wayPoint) => {
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
      let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
      if (this.LatitudeArr.length > formArray.length) {
        diffLength = this.LatitudeArr.length - formArray.length;
        for (let i = 0; i < diffLength; i++) {
          this.wayPointsVal().push(this.newWayPoint());
          this.AltitudeArr.push(this.AltitudeArr[length - 1]);
        }
      } else if (this.LatitudeArr.length < formArray.length) {
        diffLength = formArray.length - this.LatitudeArr.length;
        for (let i = 0; i < diffLength; i++) {
          formArray.removeAt(formArray.length - 1);
          this.AltitudeArr.pop();
        }
      }
      this.LatitudeArr.forEach((val, index) => {
        formArray.at(index).patchValue({
          Latitude: val,
          Longitude: this.LongitudeArr[index],
          // Altitude: this.AltitudeArr[index],
        });
      });
      if (this.editPoint || this.onWayChange) {
        this.checkCorrelationAltitude(
          this.AltitudeArr,
          this.LatitudeArr,
          this.LongitudeArr
        );
        this.editPoint = false;
      }
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
      // var point = turf.lineString(turfPos);
      // var buffered = turf.buffer(point, Constants.missionBuffer, {
      //   units: 'kilometers',
      //   steps: 2,
      // });
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
          // this.bufferPolygon.push(val[0] + ' ' + val[1]);

          // 2D Maps
          // initialArr.push(Cesium.Cartesian3.fromDegrees(val[0], val[1]));
        });
        this.bufferPointsArr = initialArr;
        // this.editingPolyline$.disable();
        this.isDisable = true;
        this.flyTo(
          this.LongitudeArr,
          this.LatitudeArr,
          this.AltitudeArr,
          initialPos
        );
        if (
          this.bufferPolygon.length > 0 &&
          LatArr != undefined &&
          LongArr != undefined
        ) {
          this.checkCorrelation(LatArr, LongArr);
        }
      });
    }
    // });
    this.isClicked = !this.isClicked;
    this.getElevationData(
      this.LatitudeArr,
      this.LongitudeArr,
      this.AltitudeArr
    );
  }
  // Maximum Altitude Change
  //This function is call when user want to fill the maximum altitute value if user put more than 400 it show pop up
  //it can not be more than 400
  onMaximumAltitudeChange() {
    let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
    this.AltitudeArr = [];
    this.LatitudeArr.forEach((val, index) => {
      this.AltitudeArr.push(this.missionDetails.get('MaximumAltitude').value);
      formArray.at(index).patchValue({
        Altitude: this.missionDetails.get('MaximumAltitude').value,
      });
    });
  }
  //On WayPoint Change
  // This function is call when user want to change the lat,lon value by clicking up down
  // button or directly input the value in the field after selecting the path.
  onWayPointChange() {
    // if (this.editingPolyline$) {
    //   this.editingPolyline$.dispose();
    //   this.editingPolyline$ = undefined;
    // }
    let initialPos = [];
    let totalLatitude = 0;
    let totalLongitude = 0;
    this.AltitudeArr = [];
    this.wayPointsForm.value.wayPoints.forEach((arr, index) => {
      totalLatitude += Number(arr.Latitude);
      totalLongitude += Number(arr.Longitude);
      this.AltitudeArr.push(arr.Altitude);
      initialPos.push(
        Cesium.Cartesian3.fromDegrees(arr.Longitude, arr.Latitude)
      );
    });
    // this.editingPolyline$ = this.polylineEditor.edit(
    //   initialPos,
    //   this.editPolylineOptions
    // );
    this.polyData = [];
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
    for (let i = 0; i < initialPos.length; i++) {
      var cartographic = Cesium.Cartographic.fromCartesian(initialPos[i]);
      var longitude = Cesium.Math.toDegrees(cartographic.longitude);
      var latitude = Cesium.Math.toDegrees(cartographic.latitude);
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
    // this.editingPolyline$.subscribe((wayPoints) => {
    if (initialPos) {
      this.LatitudeArr = [];
      this.LongitudeArr = [];
      this.wayPointsArr = initialPos;
      initialPos.forEach((values, index) => {
        // if (index != 0) {
        var cartographic = Cesium.Cartographic.fromCartesian(values);
        this.LatitudeArr.push(Cesium.Math.toDegrees(cartographic.latitude));
        this.LongitudeArr.push(Cesium.Math.toDegrees(cartographic.longitude));
        // }
      });
      let diffLength;
      let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
      if (this.LatitudeArr.length > formArray.length) {
        diffLength = this.LatitudeArr.length - formArray.length;
        for (let i = 0; i < diffLength; i++) {
          this.wayPointsVal().push(this.newWayPoint());
          this.AltitudeArr.push(this.AltitudeArr[length - 1]);
        }
      } else if (this.LatitudeArr.length < formArray.length) {
        diffLength = formArray.length - this.LatitudeArr.length;
        for (let i = 0; i < diffLength; i++) {
          formArray.removeAt(formArray.length - 1);
          this.AltitudeArr.pop();
        }
      }
      this.LatitudeArr.forEach((val, index) => {
        formArray.at(index).patchValue({
          Latitude: val,
          Longitude: this.LongitudeArr[index],
        });
      });
      this.flyTo(
        this.LongitudeArr,
        this.LatitudeArr,
        this.AltitudeArr,
        initialPos
      );
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
      let arr1d = [].concat(...turfPos);
      let payload = {
        TurfPosition: turfPos,
        BufferType: 'Linestring',
      };
      // var buffered;
      // this.operatorApi.getBuffer(payload).then((res: any) => {
      // buffered = res.data.MainData;
      var point = turf.lineString(turfPos);
      var buffered = turf.buffer(point, Constants.missionBuffer, {
        units: 'kilometers',
        steps: 2,
      });
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
        // this.bufferPolygon.push(val[0] + ' ' + val[1]);
      });
      this.bufferPointsArr = initialArr;
      // this.editingPolyline$.disable();
      if (this.bufferPolygon.length > 0) {
        this.checkCorrelation(this.LatitudeArr, this.LongitudeArr);
      }
      // });
    }
    // });
    this.onWayChange = true;
    this.checkCorrelationAltitude(
      this.AltitudeArr,
      this.LatitudeArr,
      this.LongitudeArr
    );
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
  }
  // getWeather(lat, long) {
  //   this.operatorApi.getCurrentWeather(Number(lat), Number(long)).subscribe((res) => {
  //     this.currentWeatherDetails = res;
  //   })
  // }

  // The mapScreenShot() function appears to take a screenshot of a map displayed in a web-based viewer.
  // this.viewer.canvas.toDataURL() is a method call that generates a data URL for the contents of the canvas, which
  // effectively encodes the canvas as an image.
  // The resulting data URL is assigned to this.mapScreenshotURL, which presumably allows the URL to be saved or used elsewhere in the program
  mapScreenShot() {
    this.viewer.render();
    this.mapScreenshotURL = this.viewer.canvas.toDataURL();
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

  onWayPointsUpload(evt) {
    this.isFilled = 4;
    let files: FileList = evt.target.files;
    let file = files[0];
    this.selectedFile = null;
    if (file.name.endsWith('.kml')) {
      this.isReset = true;
      let fileReader = new FileReader();
      fileReader.onload = async (e: any) => {
        let result = await this.extractKMLCoords(e.target.result);
        //Do something with result object here
        this.editWayPoints(undefined, result);
        this.selectedFile = file;
        this.uploadToS3(file);
      };
      fileReader.readAsText(file);
    } else if (file.name.endsWith('.waypoints')) {
      this.isReset = true;
      let fileReader: FileReader = new FileReader();
      this.selectedFile = file;
      let self = this;
      fileReader.onloadend = async function (x) {
        self.finalwaypointVal = [];
        self.waypoint = fileReader.result;
        // let splitted = self.waypoint.toString().split('\n');
        // for (let i = 0; i < splitted.length; i++) {
        //   let singleVal = splitted[i].toString().split('\t');
        //   self.finalwaypointVal.push(singleVal);
        // }
        // self.finalwaypointVal.filter((e) => e.length);
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
        self.editWayPoints(convertedData, file);
        self.modifyWayPointFileDetails();
        self.uploadToS3(file);
      };
      fileReader.readAsText(file);
    } else {
      return;
    }
  }
  convertWaypoints(inputData) {
    const lines = inputData.split('\n');
    const convertedData = [];
    for (const line of lines) {
      if (line.trim() === '') {
        continue;
      }
      const values = line.split(/\s+/);
      const cleanedValues = values.filter((value) => value.trim() !== '');
      convertedData.push(cleanedValues);
    }
    return convertedData;
  }
  async checkCorrelation(latitudeArr, longitudeArr) {
    this.latitudeArr = [];
    this.latitudeArr = latitudeArr;
    this.lessData = true;
    let payload = {
      BufferPolygon: this.bufferPolygon,
      LessData: this.lessData,
    };
    const res: any = await this.operatorApi
      .getIntersectedEntity(payload)
      .then((res) => res);
    let interesectDetail = res.data.MainData;
    for (
      let i = 0;
      i < interesectDetail.RestrictedEntitiesValueArray.length;
      i++
    ) {
      this.typeIntersect =
        interesectDetail.RestrictedEntitiesValueArray[i].type;
      this.interesectedEntities.push(
        interesectDetail.RestrictedEntitiesValueArray[i]
      );
    }

    this.interesectionArr = {
      vfr: [],
      airport: [],
      greenzone: [],
      geozone: [],
      FIC: [],
      reservedAirspace: [],
      TerrainAdvisory: [],
    };

    this.interesectionArr.greenzone = this.greenZoneIntersection;
    this.interesectedEntities.forEach((value) => {
      if (
        value.zone === 'vfr' ||
        value.zone === 'airport' ||
        value.zone === 'FIC' ||
        value.zone === 'geozone'
      ) {
        value.coRelationType = `${value.zone}-${value.type.toLowerCase()}`;
        if (this.interesectionArr[value.zone])
          this.interesectionArr[value.zone].push(value);
        else this.interesectionArr[value.zone] = [value];
      }
    });
    //add value to the zones

    let inneryellow = [],
      outeryellow = [],
      red = [],
      geozone = [];
    latitudeArr.forEach((lat, i) => {
      if (this.interesectionArr.airport.length !== 0) {
        this.interesectionArr.airport.forEach((zone) => {
          if (zone.type === 'Inner-Yellow') {
            if (inneryellow[i] != true) {
              inneryellow[i] = this.findCorelations(
                zone.coOrdinates,
                lat,
                longitudeArr[i]
              );
            }
          }
          if (zone.type === 'Outer-Yellow') {
            if (outeryellow[i] != true) {
              outeryellow[i] = this.findCorelations(
                zone.coOrdinates,
                lat,
                longitudeArr[i]
              );
            }
          }
          if (zone.type === 'Red-Zone') {
            if (red[i] != true) {
              red[i] = this.findCorelations(
                zone.coOrdinates,
                lat,
                longitudeArr[i]
              );
            }
          }
        });
      }
      if (this.interesectionArr.geozone.length !== 0) {
        this.interesectionArr.geozone.forEach((zone) => {
          if (geozone[i] != true) {
            geozone[i] = this.findCorelations(
              zone.coOrdinates,
              lat,
              longitudeArr[i]
            );
          }
        });
      }
    });

    let yellowzones = 0;
    let redzones = 0;
    let greenzones = 0;
    for (let i = 0; i < latitudeArr.length; i++) {
      if (inneryellow[i] || outeryellow[i]) yellowzones++;
      if (red[i] || geozone[i]) redzones++;
      if (!(inneryellow[i] || outeryellow[i] || red[i] || geozone[i]))
        greenzones++;
    }
    if (yellowzones === 0 && redzones === 0) greenzones = latitudeArr.length;
    this.showCorrelation = true;
    this.correlationData = {
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
  async checkCorrelationAltitude(Altitude, Latitude, Longitude) {
    if (this.startDraw == true || this.onWayChange == true) {
      for (let i = 0; i < Longitude.length; i++) {
        this.altitudeRef[i] = 10;
      }
    }
    let newAlt = [];
    let coordinate = [];
    if (!this.startDraw && !this.onWayChange) {
      let payload = {
        latitude: Latitude[0],
        longitude: Longitude[0],
      };
      coordinate.push(payload);
      const result = await this.operatorApi.getElevation(coordinate);
      let AltRef = 0;
      AltRef = result['data']?.MainData;
      for (let i = 0; i < Longitude.length; i++) {
        if (this.altitudeRef[i] == 0 && i != 0) {
          let coor = [];
          let payload = {
            latitude: Latitude[i],
            longitude: Longitude[i],
          };
          coor.push(payload);
          const res = await this.operatorApi.getElevation(coor);
          const elevation = res['data']?.MainData;
          newAlt[i] = Altitude[i] - elevation;
        } else if (this.altitudeRef[i] == 0 && i == 0) {
          newAlt[i] = Altitude[i];
        } else if (this.altitudeRef[i] == 10) {
          let coord = [];
          let payload = {
            latitude: Latitude[i],
            longitude: Longitude[i],
          };
          coord.push(payload);
          const res = await this.operatorApi.getElevation(coord);
          let elevation = res['data']?.MainData;
          elevation = Number(elevation);
          newAlt[i] = Altitude[i] + elevation - AltRef;
        } else {
          newAlt[i] = Altitude[i];
        }
      }
    }
    if (this.startDraw == true) {
      for (let i = 0; i < Latitude.length; i++) {
        newAlt[i] = Altitude;
      }
    }
    this.startDraw = false;
    if (this.onWayChange == true) {
      for (let i = 0; i < Latitude.length; i++) {
        newAlt[i] = Altitude[i];
      }
    }
    this.onWayChange = false;
    this.startDraw = false;
    let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
    newAlt.forEach((val, index) => {
      formArray.at(index).patchValue({
        Altitude: val,
      });
    });
    this.isVisible = true;
  }
  toggleAccordion(index: number) {
    if (this.expandedAccordionIndex === index) {
      this.expandedAccordionIndex = -1; // Collapse the currently expanded accordion
    } else {
      this.expandedAccordionIndex = index; // Expand the clicked accordion
    }
  }

  // When we upload the KML file for the waypoints so this function extract the coordinates into latitute and longitute.
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

      // for (const item of xmlDoc.getElementsByTagName('Placemark') as any) {
      //   let polygons = item.getElementsByTagName('Polygon');
      //   let lineStrings = item.getElementsByTagName('LineString');
      //   // CLOSED POLYGON
      //   for (const polygon of polygons) {
      //     let coords = polygon.getElementsByTagName('coordinates')[0].childNodes[0].nodeValue.trim()
      //     let points = coords.split(" ")

      //     let PolygonsPaths = []
      //     for (const point of points) {
      //       let coord = point.split(",")
      //       Polygons.push({ lat: +coord[1], lng: +coord[0] })
      //     }
      //   }
      //   // Open LineString
      //   for (const lineString of lineStrings) {
      //     let coords = lineString.getElementsByTagName('coordinates')[0].childNodes[0].nodeValue.trim();
      //     let points = coords.split(" ");
      //     let PolylinePaths = []
      //     for (const point of points) {
      //       let coord = point.split(",")
      //       Polygons.push({ lat: +coord[1], lng: +coord[0] })
      //     }
      //   }
      // }
    } else {
      throw 'error while parsing';
    }
    return Polygons;
  }

  // This function takes in three parameters: longitude, latitude, and height (which is optional). It then uses the
  // Cesium.Cartographic.fromDegrees() method to convert the longitude and latitude coordinates (expressed in degrees)
  // to a Cartographic object, which represents a position on the Earth's surface.
  degreesToCartographic(longitude: number, latitude: number, height?: number) {
    return Cesium.Cartographic.fromDegrees(longitude, latitude, height);
  }
  //Editable Table of WayPoints
  addWayPoint() {
    let formControls = this.wayPointsForm.controls.wayPoints as FormArray;
    this.wayPointsVal().push(this.newWayPoint());
  }
  wayPointsVal(): FormArray {
    return this.wayPointsForm.get('wayPoints') as FormArray;
  }
  newWayPoint(): FormGroup {
    return this.fb.group({
      Latitude: [],
      Longitude: [],
      Altitude: [],
    });
  }
  //Form Submittion
  onNextStepper() {
    this.submitted = true;
    if (this.missionDetails.valid) {
      this.submitted = false;
      this.isFilled = 2;
      this.tabIndex = 1;
    }
  }
  //Back Button
  backStepper() {
    this.isNext = 0;
    this.isFilled = 1;
    this.tabIndex = 0;
  }
  nextOperation() {
    this.isFilled = 3;
    if (this.isNext == 2) {
      this.tabIndex = 2;
      this.onSelectOption('draw');
    } else if (this.isNext == 3) {
      this.clickEnabled = false;
      this.tabIndex = 3;
      this.onSelectOption('upload');
    }
  }
  isDrawPoint() {
    this.isNext = 2;
  }
  isUploaded() {
    this.isNext = 3;
  }

  // Waypoint file details
  modifyWayPointFileDetails() {
    let homeAlt;
    // this.finalwaypointVal - waypoint file details
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
  //Getters and setters
  get f() {
    return this.missionDetails.controls;
  }
  get errors() {
    return this.missionDetails.errors;
  }
  //testing()
  testing() {}

  meterstoDegree(x, y) {
    var lon = (x * 180) / 20037508.34;
    //thanks magichim @ github for the correction
    var lat =
      (Math.atan(Math.exp((y * Math.PI) / 20037508.34)) * 360) / Math.PI - 90;
    return [lon, lat];
  }
  angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
  }
  deg2rad(degrees) {
    let pi = Math.PI;
    return degrees * (pi / 180);
  }
  rad2deg(rad) {
    let pi = Math.PI;
    return rad * (180 / pi);
  }
  Buffer(long1, lat1, long2, lat2) {
    let dlat = this.deg2rad(lat2 - lat1);
    let dlong = this.deg2rad(long2 - long1);
    // angle between two points with respect to a latitude
    let a = Math.atan(dlat / dlong);
    let deltalong = Math.sin(90 - a) * 0.00044915764212305476;
    let deltalat = Math.cos(90 - a) * 0.00044915764212305476;
    // Outer point of first coordinate.
    let Xout1 = lat1 + deltalat;
    let Yout1 = long1 - deltalong;
    // Inner point of the first coordinate.
    let Xin1 = lat1 - deltalat;
    let Yin1 = long1 + deltalong;
    // Outer point of second coordinate.
    let Xout2 = lat2 + deltalat;
    let Yout2 = long2 - deltalong;
    // Inner point of the second coordinate.
    let Xin2 = lat2 - deltalat;
    let Yin2 = long2 + deltalong;
    return [Xin1, Yin1, Xin2, Yin2, Xout1, Yout1, Xout2, Yout2];
  }

  bufferRegion(long1, lat1, long2, lat2) {
    let radius = 0.0005;
    let sl = (long2 - long1) / (lat2 - lat1);
    let slope;
    if (long2 - long1 < 0 || lat2 - lat1 < 0) slope = -sl;
    else slope = sl;
    // let slope = ((long2 - long1)/ (lat2 - lat1));
    let x2in;
    let x2out;
    let x1in;
    let x1out;

    if (slope >= 0) {
      x2in =
        lat2 - Math.sqrt(Math.pow(radius, 2) / (1 + 1 / Math.pow(slope, 2)));
      x2out =
        lat2 + Math.sqrt(Math.pow(radius, 2) / (1 + 1 / Math.pow(slope, 2)));
      x1in =
        lat1 - Math.sqrt(Math.pow(radius, 2) / (1 + 1 / Math.pow(slope, 2)));
      x1out =
        lat1 + Math.sqrt(Math.pow(radius, 2) / (1 + 1 / Math.pow(slope, 2)));
    } else {
      x2in =
        lat2 + Math.sqrt(Math.pow(radius, 2) / (1 + 1 / Math.pow(slope, 2)));
      x2out =
        lat2 - Math.sqrt(Math.pow(radius, 2) / (1 + 1 / Math.pow(slope, 2)));
      x1in =
        lat1 + Math.sqrt(Math.pow(radius, 2) / (1 + 1 / Math.pow(slope, 2)));
      x1out =
        lat1 - Math.sqrt(Math.pow(radius, 2) / (1 + 1 / Math.pow(slope, 2)));
    }

    let y2in = long2 - (x2in - lat2) / slope;
    let y2out = long2 - (x2out - lat2) / slope;
    let y1in = long1 - (x1in - lat1) / slope;
    let y1out = long1 - (x1out - lat1) / slope;

    return [x1in, y1in, x2in, y2in, x1out, y1out, x2out, y2out];
  }
  //get Zoom level
  getZoomLevel() {}
  //This function will give live planes info, with viewport.
  getPlaneFinderData(country, latMin, lngMin, latMax, lngMax) {
    let payload = {
      CountryCode: country, // IRELAND/INDIA,
      x1: latMin,
      y1: lngMin,
      x2: latMax,
      y2: lngMax,
    };
    // this.planeFinder$ = undefined;
    this.operatorApi.getLatestPlaneFinderData(payload).then(
      (res: any) => {
        // this.getPodsData();
        if (res['data'] && res['data'].MainData) {
          this.planes = res['data'].MainData.planes;
          this.cesiumFunction.planeBillboard(this.planes, this.viewer);
        }
        // this.planesObserverable.next(this.planes);
      },
      (err) => {}
    );
  }
  // getPlanes() {
  //   this.planeFinder$ = this.getDataSteamPlaneFinder$()
  //     .pipe(takeUntil(this.unSubscribe))
  //     .pipe(
  //       map((entity) => ({
  //         id: entity.id,
  //         actionType: ActionType.ADD_UPDATE,
  //         entity: entity,
  //       }))
  //     );
  // }
  getDataSteamPlaneFinder$() {
    return interval(2000)
      .pipe(takeUntil(this.unSubscribe))
      .pipe(
        map((intervalValue) => {
          const staticEntities = [];
          this.planes.forEach((val, index) => {
            const lat = val.lat;
            const long = val.lon;
            const alt = val.altitude;
            // const lat = 13.6563435;
            // const long = 80.3555555;
            let id = val.callsign || val.adshex;
            staticEntities.push({
              id: id,
              position: Cesium.Cartesian3.fromDegrees(long, lat, 100),
              description:
                '<p>Latitude : ' +
                val.lat +
                '</p>' +
                '<p>Longitude : ' +
                val.lon +
                '</p>' +
                '<p>Altitude : ' +
                val.altitude +
                '</p>' +
                '<p>Flight Number : ' +
                val.flightNo +
                '</p>',
            });
          });
          // return staticEntities;
          return staticEntities.map((entity) => {
            return entity;
          });
        }),
        mergeMap((entity) => entity)
      );
  }

  // getBuffers() {
  //   this.activeBuffers$ = this.getDataSteamActiveBuffer$()
  //     .pipe(takeUntil(this.unSubscribe))
  //     .pipe(
  //       map((entity) => ({
  //         id: entity.id,
  //         actionType: ActionType.ADD_UPDATE,
  //         entity: entity,
  //       }))
  //     );
  // }
  // getBufferRegions() {
  //   let baseArray = [];
  //   this.activeBuffers.forEach((val, index) => {
  //     let bufferPoints = [];
  //     val.BufferRegion.forEach((values) => {
  //       var cartographic = Cesium.Cartographic.fromCartesian(values);
  //       let lat = Cesium.Math.toDegrees(cartographic.latitude);
  //       let long = Cesium.Math.toDegrees(cartographic.longitude);
  //       // bufferPoints.push(Cesium.Cartesian3.fromDegrees(long, lat));
  //       bufferPoints.push(long, lat);
  //     });
  //     const base: AcNotification = {
  //       id: val.MissionId,
  //       actionType: ActionType.ADD_UPDATE,
  //       entity: {
  //         hierarchy: Cesium.Cartesian3.fromDegreesArray(bufferPoints),
  //         material: Cesium.Color.fromRgba(0x88f09859),
  //         outline: true,
  //         outlineColor: Cesium.Color.fromRgba(0xfff09859),
  //         description: '<p>OperationName : ' + val.OperationName + '</p>',
  //       },
  //     };
  //     baseArray.push(base);
  //   });
  //   // const base1: AcNotification = {
  //   //   id: '0',
  //   //   actionType: ActionType.ADD_UPDATE,
  //   //   entity: {name: 'base alpha', position: Cesium.Cartesian3.fromDegrees(-80, 49), show: true}
  //   // };
  //   // const base2 = {
  //   //   id: '1',
  //   //   actionType: ActionType.ADD_UPDATE,
  //   //   entity: {name: 'base beta', position: Cesium.Cartesian3.fromDegrees(-80, 30), show: true}
  //   // };
  //   // const baseArray = [base1, base2];
  //   this.activeBuffers$ = observableFrom(baseArray);
  // }
  getDataSteamActiveBuffer$() {
    return interval(5000)
      .pipe(takeUntil(this.unSubscribe))
      .pipe(
        map((intervalValue) => {
          const staticEntities = [];
          this.activeBuffers.forEach((val, index) => {
            let bufferPoints = [];
            val.BufferRegion.forEach((values) => {
              var cartographic = Cesium.Cartographic.fromCartesian(values);
              let lat = Cesium.Math.toDegrees(cartographic.latitude);
              let long = Cesium.Math.toDegrees(cartographic.longitude);
              // bufferPoints.push(Cesium.Cartesian3.fromDegrees(long, lat));
              bufferPoints.push(long, lat);
            });
            staticEntities.push({
              id: val.MissionId,
              hierarchy: Cesium.Cartesian3.fromDegreesArray(bufferPoints),
              material: Cesium.Color.fromRgba(0x88f09859),
              outline: true,
              outlineColor: Cesium.Color.fromRgba(0xfff09859),
              description: '<p>OperationName : ' + val.OperationName + '</p>',
            });
          });
          // return staticEntities;
          return staticEntities.map((entity) => {
            return entity;
          });
        }),
        mergeMap((entity) => entity)
      );
    // }
  }

  //Custom Validations
  startEndTime(formgroup: FormGroup) {
    const { value: startTime } = formgroup.get('StartTime');
    const { value: endTime } = formgroup.get('EndTime');
    return new Date(endTime) > new Date(startTime)
      ? null
      : { startEndTime: true };
  }
  startTime(formControl: FormControl) {
    const { value: startTime } = formControl;
    return new Date() <= new Date(startTime) ? null : { startTime: true };
  }

  multiDimensionalUnique(arr) {
    var uniques = [];
    var itemsFound = {};
    for (var i = 0, l = arr.length; i < l; i++) {
      var stringified = JSON.stringify(arr[i]);
      if (itemsFound[stringified]) {
        continue;
      }
      uniques.push(arr[i]);
      itemsFound[stringified] = true;
    }
    return uniques;
  }

  //Debouncing introducing a delay between the triggering of the event and the execution of the
  //event-handling function. During this delay, if the same event is triggered again, the delay is reset
  debouncing() {
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
      // if (distance <= 30000) {
      if (height <= 60000 && height >= 1000) {
        this.planesVisibility = true;
        if (country) {
          this.getPlaneFinderData(country, latmin, lngmin, latmax, lngmax);
        }
      } else {
        this.planesVisibility = false;
      }
    }
    // if (height >= 1500000) {
    //   this.warningVisibility = false;
    //   this.geojsonDataSourceWarningZone.show = false;
    // } else {
    //   this.warningVisibility = true;
    //   this.geojsonDataSourceWarningZone.show = true;
    // }

    // let cartographic = this.viewer.scene.camera.positionCartographic;
    // let lat = Cesium.Math.toDegrees(cartographic.latitude);
    // let long = Cesium.Math.toDegrees(cartographic.longitude);
    // this.operatorApi.getCurrentWeather(lat, long).then((res: any) => {
    //   let name = res.name;
    //   this.currentWeatherDetails = res;
    //   this.cityName = name;
    //   this.responseCityName = name;
    //   return res;
    // });
    // this.warningZoneFlag = this.geojsonDataSourceWarningZone.show;
  }

  // Time Formatting
  timeFormatting(val) {
    let date = new Date(val);
    let year = date.getFullYear();
    let month: any = date.getMonth() + 1;
    let dt: any = date.getDate();
    let hrs: any = date.getHours();
    let mins: any = date.getMinutes();

    if (dt < 10) {
      dt = '0' + dt;
    }
    if (month < 10) {
      month = '0' + month;
    }
    if (hrs < 10) {
      hrs = '0' + hrs;
    }
    if (mins < 10) {
      mins = '0' + mins;
    }
    // 2021-10-28T11:57
    return year + '-' + month + '-' + dt + 'T' + hrs + ':' + mins;
  }

  addMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  //Camera Coordinates
  getCameraCoordinates() {
    // this.getPlanes();

    // return a callback function to remove the listener
    this.cameraMoveEndEventListener =
      this.viewer.camera.moveEnd.addEventListener(() => {
        setTimeout(() => {
          this.debouncing();
          clearInterval(this.debounceTimer);
          this.debounceTimer = setInterval(() => {
            this.debouncing();
          }, 15000);
          let cartographic = this.viewer.scene.camera.positionCartographic;
          let lat = Cesium.Math.toDegrees(cartographic.latitude);
          let long = Cesium.Math.toDegrees(cartographic.longitude);
          // this.operatorApi.getCurrentWeather(lat, long).then((res: any) => {
          //   let name = res.name;
          //   this.currentWeatherDetails = res;
          //   this.cityName = name;
          //   this.responseCityName = name;
          //   return res;
          // });
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
              // return res;
              // let name = res?.body.name;
              // this.currentWeatherDetails = res?.body;
              // this.cityName = name;
              // this.responseCityName = name;
              // return res;
            });
        }, 1000);
      });
  }

  getCountry() {
    let [IndialatMax, IndialngMax, IndialatMin, IndialngMin] = [
      42.17477643444698, 98.39193134978791, 8.465020978452927,
      69.46937307226474,
    ];
    let [IrelandlatMax, IrelandlngMax, IrelandlatMin, IrelandlngMin] = [
      55.58117283181593, -5.301994459203987, 51.29143611559805,
      -10.561891103258741,
    ];
    let [DubailatMax, DubailngMax, DubailatMin, DubailngMin] = [
      26.395942, 56.432076, 22.854615, 52.482196,
    ];

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

    var pickPositionCartographicUR =
      this.viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPositionUR);
    var pickPositionCartographicLL =
      this.viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPositionLL);
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
      country = 'India';
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
      country = 'Ireland';
    } else if (
      latmax < DubailatMax &&
      latmax > DubailatMin &&
      lngmax < DubailngMax &&
      lngmax > DubailngMin &&
      latmin < DubailatMax &&
      latmin > DubailatMin &&
      lngmin < DubailngMax &&
      lngmin > DubailngMin
    ) {
      country = 'United Arab Emirates (the)';
    }
    return country;
  }
  //FlyTo Function
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

    // let flyToVar: any = {
    //   destination: Cesium.Cartesian3.fromDegrees(
    //     totalLongitude / LongitudeArr.length,
    //     totalLatitude / LongitudeArr.length,
    //     LatitudeArr.length == 1 ? 10000 : Math.max(maxLong, maxLat) * 180000
    //   ),
    // };
    // if (formSubmit) {
    //   flyToVar = {
    //     ...flyToVar,
    //     complete: () => {
    //       setTimeout(() => {
    //         complete = true;
    //       }, 100);
    //     },
    //   };
    // }
    let screenshotInterval = setInterval(() => {
      this.viewer.render();
      this.mapScreenshotURL = this.viewer.canvas.toDataURL();
      clearInterval(screenshotInterval);
      if (formSubmit) {
        setTimeout(() => {
          this.onFormSubmit(createMission);
        }, 500);
      }
    }, 100);
    this.zoomToEntity();
    // this.viewer.camera.flyTo(flyToVar);
  }
  //On Submit Button
  checkMissionWithinCountry(intersection, createMission) {
    let coords = this.wayPointsForm.value.wayPoints;
    let index = 0;
    this.checkCountry(coords, index).then((res) => {
      res == true
        ? this.submit(intersection, createMission)
        : this.showSwal('mission-outside-country', this.profileDetails.Country);
    });
  }
  checkCountry(coords, index) {
    let coord = coords[index];
    return this.operatorApi
      .getCityName(coord.Latitude, coord.Longitude)
      .then((res: any) => {
        if (res[0].country == this.profileDetails.Country) {
          if (index != this.wayPointsForm.value.wayPoints.length - 1) {
            index++;
            return this.checkCountry(coords, index);
          } else {
            return true;
            // this.submit(intersection, createMission);
          }
        } else {
          return false;
        }
      });
  }

  //removing dublicate zones in intersection popup table
  removeDuplicatesByPropertyAndValue(arr) {
    const uniqueArray = [];
    arr.forEach((item) => {
      const exists = uniqueArray.some((obj) => {
        return Object.keys(obj).every((key) => obj[key] === item[key]);
      });
      if (!exists) {
        uniqueArray.push(item);
      }
    });
    return uniqueArray;
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
  async rptoSubmit(createMission) {
    try {
      this.setwaypointloader = true;
      this.submitFlag = true;

      let LongitudeArr = [];
      let LatitudeArr = [];
      let AltitudeArr = [];
      for (let i = 0; i < this.FencePosition.length; i += 3) {
        LongitudeArr.push(parseFloat(this.FencePosition[i]));
        LatitudeArr.push(parseFloat(this.FencePosition[i + 1]));
        AltitudeArr.push(parseFloat(this.FencePosition[i + 2]));
      }

      let turfPos = [];

      for (let i = 0; i < LongitudeArr.length; i++) {
        turfPos.push([+LongitudeArr[i], +LatitudeArr[i]]);
      }

      let turfPayload = {
        TurfPosition: turfPos,
        BufferType: 'Linestring',
      };
      this.loaderKey = 'checkingWaypoint';
      const res = await this.operatorApi.getBuffer(turfPayload);

      var buffered = res.data.MainData;

      this.lessData = false;
      let getIntersectedEntityPayload = {
        BufferPolygon: buffered.geometry.coordinates[0],
        LessData: this.lessData,
      };
      const getIntersectedEntity: any = await this.operatorApi
        .getIntersectedEntity(getIntersectedEntityPayload)
        .then((res) => res);

      let interesectDetail = getIntersectedEntity.data.MainData;

      for (
        let i = 0;
        i < interesectDetail.RestrictedEntitiesValueArray.length;
        i++
      ) {
        this.typeIntersect =
          interesectDetail.RestrictedEntitiesValueArray[i].type;
        this.interesectedEntities.push(
          interesectDetail.RestrictedEntitiesValueArray[i]
        );
        let coords = [];
        if (interesectDetail.IntersectionArray[i].geometry.type == 'Polygon') {
          coords.push(
            interesectDetail.IntersectionArray[i].geometry.coordinates.flat(
              Infinity
            )
          );
        } else {
          coords.push(
            interesectDetail.IntersectionArray[i].geometry.coordinates[0].flat(
              Infinity
            )
          );
        }
        coords.forEach((hierarchy, j) => {
          this.viewer.entities.add({
            id:
              'CoRelation' +
              interesectDetail.RestrictedEntitiesValueArray[i].index +
              '' +
              j,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(hierarchy),
              material: Cesium.Color.DARKCYAN.withAlpha(0.5),
              outline: true,
              outlineColor: Cesium.Color.DARKCYAN.withAlpha(0.5),
              outlineWidth: 10.0,
              height: 0,
            },
          });
        });
      }

      this.loaderKey = 'createMission';

      this.poly1 = getIntersectedEntity.data.MainData.Poly1;
      this.FIR = [
        ...new Set(await this.mapLayersService.getFIRValue(this.poly1)),
      ];

      // covert to cartien
      const wayPoints = LongitudeArr.map((long, index) => {
        return Cesium.Cartesian3.fromDegrees(
          +long,
          +LatitudeArr[index],
          AltitudeArr[index]
        ); // longitude, latitude, altitude in meters
      });

      if (
        !(
          LongitudeArr[0] == LongitudeArr[LongitudeArr?.length] &&
          LatitudeArr[0] == LatitudeArr[LongitudeArr?.length]
        )
      ) {
        wayPoints.push(
          Cesium.Cartesian3.fromDegrees(
            LongitudeArr[0],
            LatitudeArr[0],
            AltitudeArr[0]
          )
        );
      }

      this.DroneSelected = this.dronesAndGearList.find((val) => {
        return val.DroneId == this.missionDetails.value.DroneId;
      });

      const Cat3BufferPoly = [];
      buffered.geometry.coordinates[0].forEach((val, index) => {
        Cat3BufferPoly.push(Cesium.Cartesian3.fromDegrees(val[0], val[1], 120));
      });

      const ActivityType = this.activityType.find(
        (item) => item.ActivityType?.toLowerCase() === 'others'
      );

      const FlightPurpose = this.flightPurpose.find(
        (item) => item.FlightPurpose?.toLowerCase() === 'others'
      );

      let payload = {
        GeoFence: true,
        OperatorId: this.profileDetails.UserId,
        CreatedById: this.profileDetails.UserId,
        CreatedByName: this.profileDetails.FirstName,
        Country: this.profileDetails.Country,
        CountryCode: this.profileDetails.CountryCode,
        OperationName: this.missionDetails.value.OperationName,
        FlightPurpose: {
          MissionFlightPurposeId: FlightPurpose.MissionFlightPurposeId,
          FlightPurpose: FlightPurpose.FlightPurpose,
          SearchFlightPurpose: FlightPurpose.SearchFlightPurpose,
        },
        StartTime: this.missionDetails.value.StartTime,
        EndTime: this.missionDetails.value.EndTime,
        ActivityType: ActivityType,
        MaximumAltitude: this.profileDetails?.GeoFence?.MaxAlt || 120, //'Commenting to use Altitude for 3D Maps'  + this.missionDetails.value.MaximumAltitudeUnits
        DroneId: this.missionDetails.value.DroneId,
        DroneName: this.DroneSelected.DroneNum,
        Pilot: this.missionDetails.value.Pilot,
        PilotContact: this.missionDetails.value.PilotContact,

        Waypoints: wayPoints,

        BufferRegion: Cat3BufferPoly,
        Latitude: LatitudeArr,
        Longitude: LongitudeArr,
        // 3D Maps
        Altitude: AltitudeArr,
        //Custom labelling
        WayPointNum: LatitudeArr.map((l, index) => index.toString()),
        // CoRelation
        Correlation: this.interesectionArr,

        //Waypoint File Val
        wayPointFileDetails: [],

        // FIRs
        FIRID: this.FIR,
        AltitudeRef: LatitudeArr.map(() => 10),
      };

      try {
        let MissionResponse = await this.operatorApi.createMission(payload);

        if (MissionResponse.data.MainData) {
          this.loader = false;
          let Profilepayload = {
            EmailId: this.profileDetails.EmailId,
            UserId: this.profileDetails.EmailId,
          };
          this.operatorDoc = MissionResponse.data?.MainData?.OperatorDoc;
          this.droneDoc = MissionResponse.data?.MainData?.DroneDoc;
          this.missionDoc = MissionResponse.data?.MainData?.MissionDoc;
          //pop-up reason for rejection
          this.missionStatus = MissionResponse?.data?.MainData?.MissionStatus;
          this.missionList = MissionResponse?.data?.MainData;
          this.loaderKey = 'setMissionEnvironment';
          const profileDetails = await this.operatorApi.getProfileDetails(
            Profilepayload
          );

          this.profileDetails = profileDetails.data.MainData;
          // this.sharedDataService.updatenewMissionData(newMissionData);
          this.getEncry(this.profileDetails).then((res: any) => {
            let encryData = res;
            localStorage.setItem('UserDetails', encryData);
          });
          if (
            (this.missionStatus == 'Pending' ||
              this.missionStatus == 'Rejected') &&
            this.missionList?.PermissionStatus
          ) {
            this.missionParameter();
          }
          this.openModal(createMission);
        }
      } catch (err) {
        this.loader = false;
        if (
          err.error.error.type == 'SubscriptionPlanExpired' ||
          err.error.error.type == 'FlightRequestCountExceeded'
        ) {
          this.showSwal('error-message', err.error.error.message);
        }
      }
    } catch (e) {
      console.log(e);
      console.log('Problem in submiting mission');
    } finally {
      this.submitFlag = false;
      this.setwaypointloader = false;
      this.loader = false;
    }
  }

  async submit(intersection, createMission) {
    this.isFilled = 4;
    if (this.wayPointsArr.length <= 1) {
      this.showSwal('at-least-two-position', 2);
      return;
    }
    this.cesiumFunction.removeEntities(this.viewer.entities, 'CoRelation');
    this.cesiumFunction.removeEntities(
      this.viewer.entities,
      'ReservedAirspace'
    );
    // Commented for dev purpose
    this.reportValues = true;
    this.coRelationFlag = false;
    this.submitFlag = true;

    //to disable the button
    this.setWaypointFlag = true;
    this.resetFlag = true;
    this.completePathFlag = true;

    this.missionType =
      this.missionDetails.value.ActivityType.ActivityType.toLowerCase().includes(
        'bvlos'
      )
        ? 'BVLOS'
        : 'LOS';

    this.DroneSelected = this.dronesAndGearList.find((val) => {
      return val.DroneId == this.missionDetails.value.DroneId;
    });
    this.interesectedEntities = [];
    this.interesectedZone = [];
    this.reservedAirspaceIntersection = [];
    let initialPos = [];
    this.wayPointsForm.value.wayPoints.forEach((arr, index) => {
      initialPos.push(
        Cesium.Cartesian3.fromDegrees(arr.Longitude, arr.Latitude)
      );
    });

    //Entities and Co-Relation
    let restrictedEntities = this.entitiesOfRestrictedAreas;
    this.lessData = false;
    let payload = {
      BufferPolygon: this.bufferPolygon,
      LessData: this.lessData,
    };
    const res: any = await this.operatorApi
      .getIntersectedEntity(payload)
      .then((res) => res);
    let interesectDetail = res.data.MainData;
    for (
      let i = 0;
      i < interesectDetail.RestrictedEntitiesValueArray.length;
      i++
    ) {
      this.typeIntersect =
        interesectDetail.RestrictedEntitiesValueArray[i].type;
      this.interesectedEntities.push(
        interesectDetail.RestrictedEntitiesValueArray[i]
      );
      let coords = [];
      if (interesectDetail.IntersectionArray[i].geometry.type == 'Polygon') {
        coords.push(
          interesectDetail.IntersectionArray[i].geometry.coordinates.flat(
            Infinity
          )
        );
      } else {
        coords.push(
          interesectDetail.IntersectionArray[i].geometry.coordinates[0].flat(
            Infinity
          )
        );
      }
      coords.forEach((hierarchy, j) => {
        this.viewer.entities.add({
          id:
            'CoRelation' +
            interesectDetail.RestrictedEntitiesValueArray[i].index +
            '' +
            j,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(hierarchy),
            material: Cesium.Color.DARKCYAN.withAlpha(0.5),
            outline: true,
            outlineColor: Cesium.Color.DARKCYAN.withAlpha(0.5),
            outlineWidth: 10.0,
            height: 0,
          },
        });
      });
    }
    this.poly1 = res.data.MainData.Poly1;
    this.FIR = [
      ...new Set(await this.mapLayersService.getFIRValue(this.poly1)),
    ];

    // let poly1 = turf.polygon([this.bufferPolygon]);

    // Get FIRs
    // restrictedEntities.forEach((values, index) => {
    //   let poly2 = turf.polygon([values.coOrdinates]);
    //   let intersection: any = turf.intersect(poly1, poly2);
    //   if (intersection) {
    //     console.log(values,"values");
    //     this.typeIntersect = values.type;
    //     console.log(this.typeIntersect,"intersecttype");
    //     this.interesectedEntities.push(values);
    //     let coords = [];
    //     if (intersection.geometry.type == 'Polygon') {
    //       coords.push(intersection.geometry.coordinates.flat(Infinity));
    //     } else {
    //       coords.push(intersection.geometry.coordinates[0].flat(Infinity));
    //     }
    //     coords.forEach((hierarchy, i) => {
    //       this.viewer.entities.add({
    //         id: 'CoRelation' + index + '' + i,
    //         polygon: {
    //           hierarchy: Cesium.Cartesian3.fromDegreesArray(hierarchy),
    //           material: Cesium.Color.DARKCYAN.withAlpha(0.5),
    //           outline: true,
    //           outlineColor: Cesium.Color.DARKCYAN.withAlpha(0.5),
    //           outlineWidth: 10.0,
    //           height: 0,
    //         },
    //       });
    //     });
    //   }
    // });
    let payloads = {
      BufferPolygon: this.bufferPolygon,
      BufferRegion: this.activeBuffers,
    };
    if (this.activeBuffers.length > 0) {
      const result = await this.operatorApi
        .getReservedEntity(payloads)
        .then((res) => res);
      let reservedDetail = result.data.MainData;
      for (
        let i = 0;
        i < reservedDetail.RestrictedEntitiesValueArray.length;
        i++
      ) {
        if (
          this.verticalIntersection(
            reservedDetail.RestrictedEntitiesValueArray[i]
          )
        ) {
          this.reservedAirspaceIntersection.push(
            reservedDetail.RestrictedEntitiesValueArray[i]
          );
          let coords = [];
          if (reservedDetail.IntersectionArray[i].geometry.type == 'Polygon') {
            coords.push(
              reservedDetail.IntersectionArray[i].geometry.coordinates.flat(
                Infinity
              )
            );
          } else {
            coords.push(
              reservedDetail.IntersectionArray[i].geometry.coordinates[0].flat(
                Infinity
              )
            );
          }
          coords.forEach((hierarchy, j) => {
            this.viewer.entities.add({
              id:
                'ReservedAirspace' +
                reservedDetail.RestrictedEntitiesValueArray[i].index +
                '' +
                j,
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(hierarchy),
                material: Cesium.Color.DARKCYAN.withAlpha(0.5),
                outline: true,
                outlineColor: Cesium.Color.DARKCYAN.withAlpha(0.5),
                outlineWidth: 10.0,
                height: 0,
              },
            });
          });
        }
      }
    }
    // this.entitiesOfReservedAirspaces.forEach((values, index) => {
    //   let poly1 = turf.polygon([this.bufferPolygon]);
    //   let poly2 = turf.polygon([values.coOrdinates]);

    //   let intersection: any = turf.intersect(poly1, poly2);
    //   if (intersection) {
    //     if (this.verticalIntersection(values)) {
    //       this.reservedAirspaceIntersection.push(values);
    //       let coords = [];
    //       if (intersection.geometry.type == 'Polygon') {
    //         coords.push(intersection.geometry.coordinates.flat(Infinity));
    //       } else {
    //         coords.push(intersection.geometry.coordinates[0].flat(Infinity));
    //       }
    //       coords.forEach((hierarchy, i) => {
    //         this.viewer.entities.add({
    //           id: 'ReservedAirspace' + index + '' + i,
    //           polygon: {
    //             hierarchy: Cesium.Cartesian3.fromDegreesArray(hierarchy),
    //             material: Cesium.Color.DARKCYAN.withAlpha(0.5),
    //             outline: true,
    //             outlineColor: Cesium.Color.DARKCYAN.withAlpha(0.5),
    //             outlineWidth: 10.0,
    //             height: 0,
    //           },
    //         });
    //       });
    //     }
    //   }
    // });
    this.interesectionArr = {
      vfr: [],
      airport: [],
      greenzone: [],
      geozone: [],
      FIC: [],
      reservedAirspace: [],
      TerrainAdvisory: [],
    };

    this.interesectionArr.greenzone = this.greenZoneIntersection;
    this.interesectionArr.reservedAirspace = this.reservedAirspaceIntersection;
    this.interesectedEntities.forEach((value) => {
      if (
        value.zone === 'vfr' ||
        value.zone === 'airport' ||
        value.zone === 'FIC' ||
        value.zone === 'geozone'
      ) {
        value.coRelationType = `${value.zone}-${value.type.toLowerCase()}`;
        if (this.interesectionArr[value.zone])
          this.interesectionArr[value.zone].push(value);
        else this.interesectionArr[value.zone] = [value];
      }
    });
    this.intersectionTableZones = [];
    this.interesectedEntities.forEach((element) => {
      let obj = {
        [element.value]: element.type,
      };
      this.intersectionTableZones.push(obj);
    });
    this.checkIntersectionData();
    const uniqueArray = this.removeDuplicatesByPropertyAndValue(
      this.intersectionTableZones
    );
    this.interesectedZone = uniqueArray.map((item) => {
      const key = Object.keys(item)[0];
      const value = item[key];
      return { zone: key, type: value };
    });

    if (
      this.interesectionArr.vfr.length != 0 ||
      this.interesectionArr.airport.length != 0 ||
      this.interesectionArr.reservedAirspace.length != 0 ||
      this.interesectionArr.geozone.length != 0 ||
      this.interesectionArr.FIC.length != 0 ||
      this.intersectionTableZones.length != 0
    ) {
      this.submitFlag = false;
      this.coRelationFlag = true;
    } else {
      this.coRelationFlag = false;
      this.submitFlag = false;
    }

    // Commented for testing purpose
    if (this.handler && !this.coRelationFlag) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    if (!this.coRelationFlag) {
      // create mission from here
      this.flyTo(
        this.LongitudeArr,
        this.LatitudeArr,
        this.AltitudeArr,
        initialPos,
        'formSubmit',
        createMission
      );
    } else {
      this.setwaypointloader = false;
      this.openModal(intersection);
    }
    // this.isClicked = !this.isClicked;
    // this.getElevationData(this.latGraph, this.longGraph, this.altGraph);
  }

  // verticalIntersection(activeAirspace) {
  //   let activeCords = activeAirspace.coOrdinates;

  //   for (let i = 0; i < activeCords.length - 2; i++) {
  //     let activeSpace = turf.lineString([activeCords[i], activeCords[i + 1]]);
  //     for (let j = 0; j < this.LongitudeArr.length - 2; j++) {
  //       let currentCord = turf.lineString([
  //         [this.LongitudeArr[j], this.LatitudeArr[j]],
  //         [this.LongitudeArr[j + 1], this.LatitudeArr[j + 1]],
  //       ]);
  //       if (booleanIntersects(currentCord, activeSpace)) {
  //         let currentAltMax =
  //           Math.max(this.AltitudeArr[j], this.AltitudeArr[j + 1]) + 50;
  //         let currentAltMin =
  //           Math.min(this.AltitudeArr[j], this.AltitudeArr[j + 1]) - 50;
  //         let activeAltMax =
  //           Math.max(activeCords[i][2], activeCords[i + 1][2]) + 50;
  //         let activeAltMin =
  //           Math.min(activeCords[i][2], activeCords[i + 1][2]) - 50;
  //         // console.log(currentAltMax,currentAltMin,activeAltMax,activeAltMin);
  //         if (currentAltMin > activeAltMax || currentAltMax < activeAltMin) {
  //         } else {
  //           return true;
  //         }
  //       }
  //     }
  //   }
  //   return false;
  // }
  checkIntersectionData() {
    let restrictYellow = {};
    let restrictGreen = {};
    this.terrainAdvisory = [];
    if (this.correlationData) {
      if (this.correlationData.outeryellow.length > 0) {
        for (let i = 0; i < this.correlationData.outeryellow.length; i++) {
          if (this.correlationData.outeryellow[i] == true) {
            if (this.wayPointsForm.value.wayPoints[i].Altitude > 60) {
              restrictYellow[i] =
                this.wayPointsForm.value.wayPoints[i].Altitude;
              let obj = {
                coOrdinates: [
                  [
                    this.wayPointsForm.value.wayPoints[i].Latitude,
                    this.wayPointsForm.value.wayPoints[i].Longitude,
                  ],
                ],
                zone: 'Outer-Yellow',
                value: this.wayPointsForm.value.wayPoints[i].Altitude,
                index: i,
                coRelationType: 'OuterYellow-MaxHeight',
              };
              this.interesectionArr.TerrainAdvisory.push(obj);
            }
          }
        }
      }
      let max = Math.max(
        this.correlationData.inneryellow.length,
        this.correlationData.outeryellow.length,
        this.correlationData.red.length,
        this.correlationData.geozone.length
      );
      if (max == 0) {
        max = this.correlationData.zoneCount[0];
      }
      for (let k = 0; k < max; k++) {
        if (
          (this.correlationData.inneryellow[k] == false ||
            this.correlationData.inneryellow[k] == undefined) &&
          (this.correlationData.outeryellow[k] == false ||
            this.correlationData.outeryellow[k] == undefined) &&
          (this.correlationData.red[k] == false ||
            this.correlationData.red[k] == undefined) &&
          (this.correlationData.geozone[k] == false ||
            this.correlationData.geozone[k] == undefined)
        ) {
          if (this.wayPointsForm.value.wayPoints[k].Altitude > 120) {
            restrictGreen[k] = this.wayPointsForm.value.wayPoints[k].Altitude;
            let obj = {
              coOrdinates: [
                this.wayPointsForm.value.wayPoints[k].Latitude,
                this.wayPointsForm.value.wayPoints[k].Longitude,
              ],
              zone: 'Green-Zone',
              value: this.wayPointsForm.value.wayPoints[k].Altitude,
              index: k,
              coRelationType: 'GreenZone-MaxHeight',
            };
            this.interesectionArr.TerrainAdvisory.push(obj);
          }
        }
      }
      if (Object.keys(restrictYellow).length != 0) {
        let obj = {
          'Altitude Breach': 'Outer-Yellow',
        };
        this.intersectionTableZones.push(obj);
      }
      if (Object.keys(restrictGreen).length != 0) {
        let obj = {
          'Altitude Breach': 'Green-Zone',
        };
        this.intersectionTableZones.push(obj);
      }
    }
  }
  verticalIntersection(activeAirspace) {
    return new Promise((resolve, reject) => {
      let vertLong = this.LongitudeArr;
      let vertLat = this.LatitudeArr;
      let vertAlt = this.AltitudeArr;
      let payload = {
        activeAirspace,
        vertLong,
        vertLat,
        vertAlt,
      };
      this.webworker = new Worker(
        new URL('./operator-create-mission.worker', import.meta.url),
        {
          type: 'module',
          name: 'worker-two',
        }
      );
      this.webworker.postMessage({ type: 'verticalIntersection', payload });
      this.webworker.onmessage = ({ data }) => {
        resolve(data);
      };
    });
  }
  onFormSubmit(createMission) {
    this.submitted = true;
    if (this.missionDetails.valid) {
      // Commented for dev purpose
      this.setwaypointloader = true;
      this.loaderKey = 'checkingWaypoint';
      // if (this.editingPolyline$) {
      //   this.editingPolyline$.subscribe((wayPoints) => {
      //     this.wayPointsInvalid = wayPoints.editAction;
      //   });
      // }

      // if (this.wayPointsInvalid != undefined && this.wayPointsInvalid != null) {
      this.DroneSelected = this.dronesAndGearList.find((val) => {
        return val.DroneId == this.missionDetails.value.DroneId;
      });

      let payload = {
        OperatorId: this.profileDetails.UserId,
        CreatedById: this.profileDetails.UserId,
        CreatedByName: this.profileDetails.FirstName,
        Country: this.profileDetails.Country,
        CountryCode: this.profileDetails.CountryCode,
        OperationName: this.missionDetails.value.OperationName,
        FlightPurpose: {
          MissionFlightPurposeId:
            this.missionDetails.value.FlightPurpose.MissionFlightPurposeId,
          FlightPurpose: this.missionDetails.value.FlightPurpose.FlightPurpose,
          SearchFlightPurpose:
            this.missionDetails.value.FlightPurpose.SearchFlightPurpose,
        },
        StartTime: this.missionDetails.value.StartTime,
        EndTime: this.missionDetails.value.EndTime,
        ActivityType: this.missionDetails.value.ActivityType,
        MaximumAltitude: this.missionDetails.value.MaximumAltitude, //'Commenting to use Altitude for 3D Maps'  + this.missionDetails.value.MaximumAltitudeUnits
        DroneId: this.missionDetails.value.DroneId,
        DroneName: this.DroneSelected.DroneNum,
        Pilot: this.missionDetails.value.Pilot,
        PilotContact: this.missionDetails.value.PilotContact,
        Waypoints: this.wayPointsArr,
        BufferRegion: this.bufferPointsArr,
        Latitude: this.LatitudeArr,
        Longitude: this.LongitudeArr,
        // 3D Maps
        Altitude: this.AltitudeArr,
        //Custom labelling
        WayPointNum: this.WayPointNum,
        // CoRelation
        Correlation: this.interesectionArr,

        //Waypoint File Val
        wayPointFileDetails: this.finalwaypointVal,

        // FIRs
        FIRID: this.FIR,
        AltitudeRef: this.altitudeRef,
        WaypointFile: this.selectedFileS3Url || ''
      };
      this.loaderKey = 'createMission';
      this.operatorApi
        .createMission(payload)
        .then(
          (res) => {
            this.loader = false;
            let newMissionData = {
              apiResponse: res?.data?.MainData,
              mapScreenshotURL: this.mapScreenshotURL,
              missionDetails: payload,
              coRelationFlag: this.coRelationFlag,
            };
            let Profilepayload = {
              EmailId: this.profileDetails.EmailId,
              UserId: this.profileDetails.EmailId,
            };
            this.operatorDoc = res.data?.MainData?.OperatorDoc;
            this.droneDoc = res.data?.MainData?.DroneDoc;
            this.missionDoc = res.data?.MainData?.MissionDoc;
            //pop-up reason for rejection
            this.missionStatus = res?.data?.MainData?.MissionStatus;
            this.missionList = res?.data?.MainData;
            this.loaderKey = 'setMissionEnvironment';
            this.operatorApi
              .getProfileDetails(Profilepayload)
              .then((res: any) => {
                this.profileDetails = res.data.MainData;
                // this.sharedDataService.updatenewMissionData(newMissionData);
                this.getEncry(this.profileDetails).then((res: any) => {
                  let encryData = res;
                  localStorage.setItem('UserDetails', encryData);
                });
                // this.profileDetails.NumberOfFlightSubmission = this.profileDetails.NumberOfFlightSubmission - 1;
                // let encryData = CryptoJS.AES.encrypt(
                //   JSON.stringify(this.profileDetails),
                //   environment.operatorKey
                // );
                //pop-up reason for rejection
                if (
                  (this.missionStatus == 'Pending' ||
                    this.missionStatus == 'Rejected') &&
                  this.missionList?.PermissionStatus
                ) {
                  this.missionParameter();
                }
                this.openModal(createMission);
              });
          },
          (err) => {
            this.loader = false;
            if (
              err.error.error.type == 'SubscriptionPlanExpired' ||
              err.error.error.type == 'FlightRequestCountExceeded'
            ) {
              this.showSwal('error-message', err.error.error.message);
            }
          }
        )
        .finally(() => (this.setwaypointloader = false));
      // }
    }
  }
  getEncry(data) {
    return new Promise((resolve, reject) => {
      let payload = {
        data,
      };
      this.webworker = new Worker(
        new URL('./operator-create-mission.worker', import.meta.url),
        {
          type: 'module',
          name: 'worker-five',
        }
      );
      this.webworker.postMessage({ type: 'encrypt', payload });
      this.webworker.onmessage = ({ data }) => {
        resolve(data);
      };
    });
  }
  coRelationFormSubmit(createMission,reservedAirspaceIntersection) {
    // Commented for dev purpose
    if(this.interesectedZone[this.interesectedZone.length - 1].zone === "Authority Zones"){
      this.getZoneData();
      this.swalShow();
      this.onUploadReset();
      this.startDrawPolyline('reset');
      this.setWaypointFlag = false;
      this.resetFlag = false;
      this.completePathFlag = false;
      return;
    }
    this.loader = true;
    let initialPos = [];
    this.wayPointsForm.value.wayPoints.forEach((arr, index) => {
      initialPos.push(
        Cesium.Cartesian3.fromDegrees(arr.Longitude, arr.Latitude)
      );
    });
    if (this.handler) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    this.flyTo(
      this.LongitudeArr,
      this.LatitudeArr,
      this.AltitudeArr,
      initialPos,
      'formSubmit',
      createMission
    );
  }

  //Check for Intersection
  checkIntersection(poly1, poly2) {
    const reader = new jstsIo.WKTReader();
    const p1 = reader.read(this.createPolyString(poly1.toString()));
    const p2 = reader.read(this.createPolyString(poly2.toString()));
    return p1.intersects(p2);
  }
  createPolyString(str) {
    return `POLYGON ((${str}))`;
  }
  createMultiPolygonString(polys) {
    let multiPolyString = '';
    polys.forEach((poly) => (multiPolyString += `((${poly.toString()})),`));
    multiPolyString = multiPolyString.slice(0, -1);
    return `MULTIPOLYGON (${multiPolyString})`;
  }
  returnIntersection(poly1, poly2) {
    const reader = new jstsIo.WKTReader();
    const p1 = reader.read(this.createPolyString(poly1.toString()));
    const p2 = reader.read(this.createPolyString(poly2.toString()));
    return p1.intersection(p2);
  }

  // Getting Maps from backend based on Country only once
  // Code to be removed in future when data is received with resp to viewport
  getMapLayers() {
    // this.getvfrs('INDIA', 8.465020978452927, 69.46937307226474, 42.17477643444698, 98.39193134978791);
    this.getWarning();
    this.getvfrs(
      'IRELAND',
      51.29143611559805,
      -10.561891103258741,
      55.58117283181593,
      -5.301994459203987
    );
    this.getAirports(
      'IRELAND',
      51.29143611559805,
      -10.561891103258741,
      55.58117283181593,
      -5.301994459203987
    );
    this.getMilitaryNoFlyZone();

    this.getAirports(
      'INDIA',
      8.465020978452927,
      69.46937307226474,
      42.17477643444698,
      98.39193134978791
    );
    this.getNoFlyZone();
    this.getInnerYellowZone();
    this.getYellowZone();
    this.getGeoFence();
    // this.getDubaiNoFlyZone();
  }

  getGeoFence() {
    this.cesiumFunction.apigetGeoFence().then((geoZoneData) => {
      [
        this.geojsonDataSourceGeoFenceIndia,
        this.entitiesOfRestrictedAreasIndia,
      ] = this.cesiumFunction.getGeoFence(
        this.viewer,
        geoZoneData,
        this.geojsonDataSourceGeoFenceIndia,
        this.entitiesOfRestrictedAreasIndia
      );
    });
  }

  getvfrs(country, latmin, lngmin, latmax, lngmax) {
    this.cesiumFunction
      .apigetvfrs(country, latmin, lngmin, latmax, lngmax)
      .then((vfrData) => {
        [this.geojsonDataSourceIreland, this.entitiesOfRestrictedAreasIreland] =
          this.cesiumFunction.getvfrs(
            this.viewer,
            vfrData,
            this.geojsonDataSourceIreland,
            this.entitiesOfRestrictedAreasIreland
          );
      });
  }
  getAirports(country, latmin, lngmin, latmax, lngmax) {
    this.cesiumFunction
      .apigetAirports(country, latmin, lngmin, latmax, lngmax)
      .then((airportData) => {
        let entitiesOfRestrictedAreas =
          country == 'INDIA'
            ? this.entitiesOfRestrictedAreasIndia
            : this.entitiesOfRestrictedAreasIreland;
        let geojsonAirport =
          country == 'INDIA'
            ? this.geojsonDataSourceAirportIndia
            : this.geojsonDataSourceAirportIreland;
        [geojsonAirport, entitiesOfRestrictedAreas] =
          this.cesiumFunction.getAirports(
            this.viewer,
            airportData,
            geojsonAirport,
            entitiesOfRestrictedAreas
          );
      });
  }
  getWarning() {
    this.cesiumFunction.apigetWarning().then((geoZoneData) => {
      this.geojsonDataSourceWarningZone = this.cesiumFunction.getWarningZones(
        this.viewer,
        geoZoneData,
        this.geojsonDataSourceWarningZone
      );
    });
  }
  getNoFlyZone() {
    this.cesiumFunction.apigetNoFlyZone().then((geoZoneData) => {
      [this.geojsonDataSourceNoFlyZone, this.entitiesOfRestrictedAreasIndia] =
        this.cesiumFunction.getNoFlyZone(
          this.viewer,
          geoZoneData,
          this.geojsonDataSourceNoFlyZone,
          this.entitiesOfRestrictedAreasIndia
        );
    });
  }
  getInnerYellowZone() {
    this.cesiumFunction.apigetInnerYellowZone().then((geoZoneData) => {
      [
        this.geojsonDataSourceInnerYellowZone,
        this.entitiesOfRestrictedAreasIndia,
      ] = this.cesiumFunction.getInnerYellowZone(
        this.viewer,
        geoZoneData,
        this.geojsonDataSourceInnerYellowZone,
        this.entitiesOfRestrictedAreasIndia
      );
    });
  }
  getYellowZone() {
    this.cesiumFunction.apigetYellowZone().then((geoZoneData) => {
      [this.geojsonDataSourceYellowZone, this.entitiesOfRestrictedAreasIndia] =
        this.cesiumFunction.getInnerYellowZone(
          this.viewer,
          geoZoneData,
          this.geojsonDataSourceYellowZone,
          this.entitiesOfRestrictedAreasIndia
        );
    });
  }
  getDubaiNoFlyZone() {
    this.cesiumFunction.apigetNoFlyZoneDubai().then((geoZoneData) => {
      [
        this.geojsonDataSourceNoFlyZoneDubai,
        this.entitiesOfRestrictedAreasDubai,
      ] = this.cesiumFunction.getNoFlyZoneDubai(
        this.viewer,
        geoZoneData,
        this.geojsonDataSourceNoFlyZoneDubai,
        this.entitiesOfRestrictedAreasDubai
      );
    });
  }

  //New VFRs for Ireland
  getMilitaryNoFlyZone() {
    this.cesiumFunction.apigetMilitaryNoFlyZone().then((geoZoneData) => {
      [
        this.geojsonDataSourceMilitaryZone,
        this.entitiesOfRestrictedAreasIreland,
      ] = this.cesiumFunction.getMilitaryNoFlyZone(
        this.viewer,
        geoZoneData,
        this.geojsonDataSourceMilitaryZone,
        this.entitiesOfRestrictedAreasIreland
      );
    });
  }

  getMapLayersCountry() {
    this.mapLayersModule = this.profileDetails.MapLayers;
    let index = 0;
    if (this.mapLayersModule?.length != 0) {
      this.getSingleMapLayers(this.mapLayersModule[index], index);
    }
    this.getIndiaBoundry();
    // this.getFIR();
    this.mapLayersService.getFIRs(this.viewer, this.profileDetails);
  }

  //By using this function we call an api to  get a border on the boundary of the india by using the geoJSON data
  getIndiaBoundry() {
    this.operatorApi.getindiaBoudnary().then((res: any) => {
      let geoZoneData = res.data.MainData.data;

      this.cesiumFunction.getIndiaBoundary(
        this.viewer,
        geoZoneData,

        this.geojsonDataSourceIndiaBoundary
      );
    });
  }
  // getFIR() {
  //   let payload = {
  //     "CountryCode": this.profileDetails.CountryCode
  //   };
  //   this.operatorApi.getFIRs(payload).then((res) => {
  //     let geoZoneData = res.data.MainData.data;

  //     this.cesiumFunction.getFIRs(
  //       this.viewer,
  //       geoZoneData,
  //       this.geojsonDataSourceFIRs
  //     );
  //   });
  // }
  getSingleMapLayers(module, index) {
    this.cesiumFunction
      .apigetMapLayers(module, this.profileDetails)
      .then((res: any) => {
        this.mapLayers.push(res);
        this.loadMapLayers(res, this.profileDetails.CountryCode);
        if (index != this.mapLayersModule.length - 1) {
          index++;
          this.getSingleMapLayers(this.mapLayersModule[index], index);
        }
      });
  }

  loadMapLayers(mapLayer, country) {
    if (country == 'IN') {
      switch (mapLayer.MapLayer) {
        case 'InnerYellowZone': {
          [
            this.geojsonDataSourceInnerYellowZone,
            this.entitiesOfRestrictedAreas,
          ] = this.cesiumFunction.getInnerYellowZone(
            this.viewer,
            mapLayer.data,
            this.geojsonDataSourceInnerYellowZone,
            this.entitiesOfRestrictedAreas
          );
          break;
        }
        case 'OuterYellowZone': {
          [this.geojsonDataSourceYellowZone, this.entitiesOfRestrictedAreas] =
            this.cesiumFunction.getYellowZone(
              this.viewer,
              mapLayer.data,
              this.geojsonDataSourceYellowZone,
              this.entitiesOfRestrictedAreas
            );
          break;
        }
        case 'NoFlyZone': {
          [this.geojsonDataSourceNoFlyZone, this.entitiesOfRestrictedAreas] =
            this.cesiumFunction.getNoFlyZone(
              this.viewer,
              mapLayer.data,
              this.geojsonDataSourceNoFlyZone,
              this.entitiesOfRestrictedAreas
            );
          break;
        }
        case 'GeoZone': {
          [
            this.geojsonDataSourceGeoFenceIndia,
            this.entitiesOfRestrictedAreas,
          ] = this.cesiumFunction.getGeoFence(
            this.viewer,
            mapLayer.data,
            this.geojsonDataSourceGeoFenceIndia,
            this.entitiesOfRestrictedAreas
          );
          break;
        }
        case 'FIC': {
          [this.geojsonDataSourceFICIndia, this.entitiesOfRestrictedAreas] =
            this.cesiumFunction.getFIC(
              this.viewer,
              mapLayer.data,
              this.geojsonDataSourceFICIndia,
              this.entitiesOfRestrictedAreas
            );
          break;
        }
        // case 'VFR_IE2': {
        //   this.cesiumFunction.getMilitaryNoFlyZone(
        //     this.viewer,
        //     mapLayer.data,
        //     this.geojsonDataSourceMilitaryZone,
        //     this.entitiesOfRestrictedAreasIreland
        //   );
        //   break;
        // }
        // case 'AIRPORT_IE': {
        //   this.cesiumFunction.getAirports(
        //     this.viewer,
        //     mapLayer.data,
        //     this.geojsonDataSourceAirportIreland,
        //     this.entitiesOfRestrictedAreasIreland
        //   );
        //   break;
        // }
        // case 'VFR_IE': {
        //   this.cesiumFunction.getvfrs(
        //     this.viewer,
        //     mapLayer.data,
        //     this.geojsonDataSourceIreland,
        //     this.entitiesOfRestrictedAreasIreland
        //   );
        //   break;
        // }
        // case 'DUBAI_NOFLYZONE': {
        //   this.cesiumFunction.getNoFlyZoneDubai(
        //     this.viewer,
        //     mapLayer.data,
        //     this.geojsonDataSourceIreland,
        //     this.entitiesOfRestrictedAreasDubai
        //   );
        //   break;
        // }
        default:
          break;
      }
    }

    // if(mapLayer.MapLayer == 'TROPOGO_YELLOWINNER')
  }

  //Based on Country Show and Hide Maps
  removeVFRFlyZoneCountry(e) {
    if (!e.target.checked) {
      this.geojsonDataSourceIreland.show = false;
      // this.geojsonDataSourceIndia.show = false;

      //New VFRs for India
      this.geojsonDataSourceYellowZone.show = false;
      this.geojsonDataSourceInnerYellowZone.show = false;
      this.geojsonDataSourceNoFlyZone.show = false;

      //New VFs for Ireland
      this.geojsonDataSourceMilitaryZone.show = false;

      // Dubai
      this.geojsonDataSourceNoFlyZoneDubai.show = false;
    } else {
      this.geojsonDataSourceIreland.show = true;

      //New VFRs for India
      this.geojsonDataSourceYellowZone.show = true;
      this.geojsonDataSourceInnerYellowZone.show = true;
      this.geojsonDataSourceNoFlyZone.show = true;

      //New VFs for Ireland
      this.geojsonDataSourceMilitaryZone.show = true;

      // Dubai
      this.geojsonDataSourceNoFlyZoneDubai.show = true;
    }
  }
  removeAirportZoneCountry(e) {
    if (!e.target.checked) {
      this.geojsonDataSourceAirportIndia.show = false;
      this.geojsonDataSourceAirportIreland.show = false;
    } else {
      this.geojsonDataSourceAirportIndia.show = true;
      this.geojsonDataSourceAirportIreland.show = true;
    }
  }
  removeGeoFence(e) {
    if (!e.target.checked) {
      this.geojsonDataSourceGeoFenceIndia.show = false;
    } else {
      this.geojsonDataSourceGeoFenceIndia.show = true;
    }
  }

  openModal(intersection: TemplateRef<any>) {
    this.modalRef = this.modalService.show(intersection, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
  }

  showSwal(type, option?) {
    if (type == 'error-message') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          title: `${option}`,
          text: `Do you like to upgrade?`,
          focusConfirm: false,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.paymentModalService.setPaymentModal(true);
          }
        });
    } else if (type == 'mission-outside-country') {
      this.swalWithBootstrapButtons.fire({
        background: '#1b1f27',
        title: `Your mission is outside ${option}`,
        text: `Please create missions within your country`,
        focusConfirm: false,
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
      });
    } else if (type == 'at-least-two-position') {
      this.swalWithBootstrapButtons.fire({
        background: '#1b1f27',
        title: `At least ${option} waypoints required`,
        text: `Click on a location to add path`,
        focusConfirm: false,
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
      });
    } else if (type == 'Documents stored successfully') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          text: 'Documents uploaded successfully',
          icon: 'success',
          focusConfirm: false,
          showCancelButton: false,
          showConfirmButton: true,
          allowOutsideClick: false,
          // timer: 1000,
          confirmButtonText: 'Okay',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['operator/operator-app/dashboard']);
          }
        });
    }
  }

  operatorOpen() {
    this.isShowWarning = true;
  }
  closeMission() {
    this.clickEnabled = false;
    this.pointData = [];
    this.polyData = [];
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
    this.router.navigate(['operator/operator-app/dashboard']);
  }
  closePopUp() {
    this.isShowWarning = false;
  }
  isAgreed() {
    this.isAgree = !this.isAgree;
  }

  //OpenWeather
  //When user set the city name in the input field and then click into the arrow this fucntion call and then fetch the
  //the weather data of that city.
  onWeatherForm() {
    if (this.cityName) {
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
        },
        (err) => {
          this.NotFound = err.error.message;
        }
      );
    }
  }

  declaration() {
    this.declarationFlag = !this.declarationFlag;
    this.declarationChecked = !this.declarationChecked;
  }

  //Upload Document Form
  //This function will call when user want to plan his flight in the restricted zone for this he has to upload
  // some documents
  documentFormUploadFile(evt, documentNo) {
    const files = evt.target.files; // FileList object
    const file = files[0];
    // if(!file.name.endsWith('.kml') && !file.name.endsWith('.waypoints')) {
    //   //invalidFile error
    //  return this.invalidFile= true;
    // } else{
    //   this.invalidFile= false;
    // }
    if (documentNo === 'document1Flag') {
      this.document1FileName = file.name;
      this.document1Flag = 1;
    } else if (documentNo === 'document2Flag') {
      this.document2FileName = file.name;
      this.document2Flag = 1;
    }
  }
  // uploadRequiredDocuments() {
  //   this.dialogFlag = false;
  //   this.uploadDocumentsFlag = true;
  // }

  //pop-up reason for rejection
  missionParameter() {
    this.missionPermissionsList = [
      { module: 'MissionParameters', category: [] },
      { module: 'WeatherParameters', category: [] },
      { module: 'DroneParameters', category: [] },
      { module: 'TerrainHeightParameters', category: [] },
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
        Category: 'Terrain-Restriction',
        Module: 'TerrainHeightParameters',
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

  //TrackBy option implementation
  getActivity(index: number, activityType: any): string {
    return activityType.ActivityType;
  }
  getDrone(index: number, droneAndGear: any): string {
    return droneAndGear.DroneNum;
  }
  getEntity(index: number, entity: any): string {
    return entity.value;
  }
  getEntitys(index: number, entity: any): string {
    return entity.value;
  }
  getClimate(index: number, climate: any): string {
    return climate.description;
  }
  getFlight(index: number, flight: any): string {
    return flight.FlightPurpose;
  }
  mapReset() {
    // this.cesiumFunction.navigateToCurrrentLocation(this.viewer);
    this.cesiumFunction.removeEntities(this.viewer.entities, 'WayPoint');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Label');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'CustomLabel');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'BufferRegion');
    // this.viewer.removeEntity(this.viewer.entities, 'Live Drone Path');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Live Drone Path');
    // if (this.editingPolyline$) {
    //   this.editingPolyline$.dispose();
    //   this.editingPolyline$ = undefined;
    // }
  }
  toggle2D3D(val: any) {
    this.toggleFlag = val;
    this.toggleFlag = !this.toggleFlag;
    if (this.toggleFlag) {
      //first off the osmBuildings
      // this.osmBuilding = true;
      // this.osmBuildings(val);
      // this.toggleflagText = '2D';
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    } else {
      // this.toggleflagText = '3D';
      this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
      this.viewer.camera.lookUp(Cesium.Math.toRadians(10.0));
    }
  }
  //Methods to get form values
  get kmlFile() {
    return this.generalCompliance.get('kmlFile');
  }
  get kmlFileType() {
    return this.generalCompliance.get('kmlFileType');
  }
  get operationsPlanFile() {
    return this.generalCompliance.get('operationsPlanFile');
  }
  get operationsPlanFileType() {
    return this.generalCompliance.get('operationsPlanFileType');
  }
  get uinCertificateFile() {
    return this.generalCompliance.get('uinCertificateFile');
  }
  get uinCertificateFileType() {
    return this.generalCompliance.get('uinCertificateFileType');
  }
  get dgcaCertificateFile() {
    return this.generalCompliance.get('dgcaCertificateFile');
  }
  get dgcaCertificateFileType() {
    return this.generalCompliance.get('dgcaCertificateFileType');
  }
  get insuranceFile() {
    return this.generalCompliance.get('insuranceFile');
  }
  get insuranceFileType() {
    return this.generalCompliance.get('insuranceFileType');
  }
  get incorporationFile() {
    return this.generalCompliance.get('incorporationFile');
  }
  get incorporationFileType() {
    return this.generalCompliance.get('incorporationFileType');
  }
  get companyProfileFile() {
    return this.generalCompliance.get('companyProfileFile');
  }
  get companyProfileFileType() {
    return this.generalCompliance.get('companyProfileFileType');
  }
  get document1File() {
    return this.generalCompliance.get('document1File');
  }
  get document1FileType() {
    return this.generalCompliance.get('document1FileType');
  }
  get document2File() {
    return this.generalCompliance.get('document2File');
  }
  get document2FileType() {
    return this.generalCompliance.get('document2FileType');
  }
  get document3File() {
    return this.generalCompliance.get('document3File');
  }
  get document3FileType() {
    return this.generalCompliance.get('document3FileType');
  }
  get document4File() {
    return this.generalCompliance.get('document4File');
  }
  get document4FileType() {
    return this.generalCompliance.get('document4FileType');
  }
  //On click of kml field
  kmlFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.kml') || file.name.endsWith('.waypoints')) &&
      file.size <= 500000
    ) {
      this.kmlFileSizeError = false;
      this.kmlFileTypeError = false;
      this.kmlFlag = 1;
      this.kmlFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          kmlFile: splitArr[1],
          kmlFileType: file.name.endsWith('.kml') ? 'kml' : 'waypoints',
        });
      });
    } else {
      this.kmlFlag = 0;
      if (file.name.endsWith('.kml') || file.name.endsWith('.waypoints')) {
        this.kmlFileSizeError = true;
        this.kmlFileTypeError = false;
      } else {
        this.kmlFileSizeError = false;
        this.kmlFileTypeError = true;
      }
    }
  }

  //reset functinality
  resetKmlFileUploads() {
    this.generalCompliance.patchValue({
      kmlFile: '',
      kmlFileType: '',
    });
    this.kmlFileSizeError = false;
    this.kmlFileTypeError = false;
    this.kmlFileName = '';
    this.kmlFlag = 0;
  }

  //On click of operation plan field
  operationsPlanFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.operationsPlanFileSizeError = false;
      this.operationsPlanFileTypeError = false;
      this.operationsPlanFlag = 1;
      this.operationsPlanFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          operationsPlanFile: splitArr[1],
          operationsPlanFileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.operationsPlanFlag = 0;
      if (
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')
      ) {
        this.operationsPlanFileSizeError = true;
        this.operationsPlanFileTypeError = false;
      } else {
        this.operationsPlanFileTypeError = true;
        this.operationsPlanFileSizeError = false;
      }
    }
  }

  //reset functinality
  resetOperationsFileUploads() {
    this.generalCompliance.patchValue({
      operationsPlanFile: '',
      operationsPlanFileType: '',
    });
    this.operationsPlanFileSizeError = false;
    this.operationsPlanFileTypeError = false;
    this.operationsPlanFileName = '';
    this.operationsPlanFlag = 0;
  }
  //On click of UIN certificate fields
  uinCertificateFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.uinCertificateFileSizeError = false;
      this.uinCertificateFileTypeError = false;
      this.uinCertificateFlag = 1;
      this.uinCertificateFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          uinCertificateFile: splitArr[1],
          uinCertificateFileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.uinCertificateFlag = 0;
      if (
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')
      ) {
        this.uinCertificateFileSizeError = true;
        this.uinCertificateFileTypeError = false;
      } else {
        this.uinCertificateFileSizeError = false;
        this.uinCertificateFileTypeError = true;
      }
    }
  }
  //reset functinality
  resetUinCertificateFileUploads() {
    this.generalCompliance.patchValue({
      uinCertificateFile: '',
      uinCertificateFileType: '',
    });
    this.uinCertificateFileSizeError = false;
    this.uinCertificateFileTypeError = false;
    this.uinCertificateFileName = '';
    this.uinCertificateFlag = 0;
  }

  //On click of UIN certificate fields
  dgcaCertificateFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.dgcaCertificateFileSizeError = false;
      this.dgcaCertificateFileTypeError = false;
      this.dgcaCertificateFlag = 1;
      this.dgcaCertificateFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          dgcaCertificateFile: splitArr[1],
          dgcaCertificateFileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.dgcaCertificateFlag = 0;
      if (
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')
      ) {
        this.dgcaCertificateFileSizeError = true;
        this.dgcaCertificateFileTypeError = false;
      } else {
        this.dgcaCertificateFileSizeError = false;
        this.dgcaCertificateFileTypeError = true;
      }
    }
  }
  //reset functinality
  resetDgcaCertificateFileUploads() {
    this.generalCompliance.patchValue({
      dgcaCertificateFile: '',
      dgcaCertificateFileType: '',
    });
    this.dgcaCertificateFileSizeError = false;
    this.dgcaCertificateFileTypeError = false;
    this.dgcaCertificateFileName = '';
    this.dgcaCertificateFlag = 0;
  }

  //On click of insurance fields
  insuranceFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.insuranceFileSizeError = false;
      this.insuranceFileTypeError = false;
      this.insuranceFlag = 1;
      this.insuranceFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          insuranceFile: splitArr[1],
          insuranceFileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.insuranceFlag = 0;
      if (
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')
      ) {
        this.insuranceFileSizeError = true;
        this.insuranceFileTypeError = false;
      } else {
        this.insuranceFileSizeError = false;
        this.insuranceFileTypeError = true;
      }
    }
  }
  //reset functinality
  resetInsuranceFileUploads() {
    this.generalCompliance.patchValue({
      insuranceFile: '',
      insuranceFileType: '',
    });
    this.insuranceFileSizeError = false;
    this.insuranceFileTypeError = false;
    this.insuranceFileName = '';
    this.insuranceFlag = 0;
  }

  //On click of insurance fields
  incorporationFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.incorporationFileSizeError = false;
      this.incorporationFileTypeError = false;
      this.incorporationFlag = 1;
      this.incorporationFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          incorporationFile: splitArr[1],
          incorporationFileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.incorporationFlag = 0;
      if (
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')
      ) {
        this.incorporationFileSizeError = true;
        this.incorporationFileTypeError = false;
      } else {
        this.incorporationFileSizeError = false;
        this.incorporationFileTypeError = true;
      }
    }
  }
  //reset functinality
  resetIncorporationFileUploads() {
    this.generalCompliance.patchValue({
      incorporationFile: '',
      incorporationFileType: '',
    });
    this.incorporationFileSizeError = false;
    this.incorporationFileTypeError = false;
    this.incorporationFileName = '';
    this.incorporationFlag = 0;
  }

  //On click of Company Profile fields
  companyProfileFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.companyProfileFileSizeError = false;
      this.companyProfileFileTypeError = false;
      this.companyProfileFlag = 1;
      this.companyProfileFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          companyProfileFile: splitArr[1],
          companyProfileFileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.companyProfileFlag = 0;
      if (
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')
      ) {
        this.companyProfileFileSizeError = true;
        this.companyProfileFileTypeError = false;
      } else {
        this.companyProfileFileSizeError = false;
        this.companyProfileFileTypeError = true;
      }
    }
  }
  //reset functinality
  resetCompanyProfileFileUploads() {
    this.generalCompliance.patchValue({
      companyProfileFile: '',
      companyProfileFileType: '',
    });
    this.companyProfileFileSizeError = false;
    this.companyProfileFileTypeError = false;
    this.companyProfileFileName = '';
    this.companyProfileFlag = 0;
  }
  //On click of document1 fields
  document1FileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.document1FileSizeError = false;
      this.document1FileTypeError = false;
      this.document1Flag = 1;
      this.document1FileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          document1File: splitArr[1],
          document1FileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.document1Flag = 0;
      if (
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')
      ) {
        this.document1FileSizeError = true;
        this.document1FileTypeError = false;
      } else {
        this.document1FileSizeError = false;
        this.document1FileTypeError = true;
      }
    }
  }
  //reset functinality
  resetDocument1FileUploads() {
    this.generalCompliance.patchValue({
      document1File: '',
      document1FileType: '',
    });
    this.document1FileSizeError = false;
    this.document1FileTypeError = false;
    this.document1FileName = '';
    this.document1Flag = 0;
  }
  //On click of document2 fields
  document2FileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.document2FileSizeError = false;
      this.document2FileTypeError = false;
      this.document2Flag = 1;
      this.document2FileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          document2File: splitArr[1],
          document2FileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.document2Flag = 0;
      if (
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')
      ) {
        this.document2FileSizeError = true;
        this.document2FileTypeError = false;
      } else {
        this.document2FileSizeError = false;
        this.document2FileTypeError = true;
      }
    }
  }
  //reset functinality
  resetDocument2FileUploads() {
    this.generalCompliance.patchValue({
      document2File: '',
      document2FileType: '',
    });
    this.document2FileSizeError = false;
    this.document2FileTypeError = false;
    this.document2FileName = '';
    this.document2Flag = 0;
  }
  //On click of Document3 fields
  document3FileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.document3FileSizeError = false;
      this.document3FileTypeError = false;
      this.document3Flag = 1;
      this.document3FileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          document3File: splitArr[1],
          document3FileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.document3Flag = 0;
      if (
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')
      ) {
        this.document3FileSizeError = true;
        this.document3FileTypeError = false;
      } else {
        this.document3FileSizeError = false;
        this.document3FileTypeError = true;
      }
    }
  }
  //reset functinality
  resetDocument3FileUploads() {
    this.generalCompliance.patchValue({
      document3File: '',
      document3FileType: '',
    });
    this.document3FileSizeError = false;
    this.document3FileTypeError = false;
    this.document3FileName = '';
    this.document3Flag = 0;
  }
  //On click of document4 fields
  document4FileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.document4FileSizeError = false;
      this.document4FileTypeError = false;
      this.document4Flag = 1;
      this.document4FileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.generalCompliance.patchValue({
          document4File: splitArr[1],
          document4FileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.document4Flag = 0;
      if (
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.png')
      ) {
        this.document4FileSizeError = true;
        this.document4FileTypeError = false;
      } else {
        this.document4FileSizeError = false;
        this.document4FileTypeError = true;
      }
    }
  }
  //reset functinality
  resetDocument4FileUploads() {
    this.generalCompliance.patchValue({
      document4File: '',
      document4FileType: '',
    });
    this.document4FileSizeError = false;
    this.document4FileTypeError = false;
    this.document4FileName = '';
    this.document4Flag = 0;
  }

  // File to base64
  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  //dialog for manualApprovalRequired
  manualApprovalRequired() {
    this.dialogFlag = true;
    //to disable the background create-mission modal
    this.disableBackground = true;
  }
  missionRejected() {
    this.dialogRejectedFlag = true;
    //to disable the background create-mission modal
    this.disableBackground = true;
  }
  //document form for manualApprovalRequired
  uploadRequiredDocuments() {
    this.dialogFlag = false;
    this.doubleClick = false;
    this.dialogRejectedFlag = false;
    this.documentsExistChecker();
    this.uploadDocumentsFlag = true;
    //to disable the background create-mission modal
    this.disableBackground = true;
  }
  //Upload Document Form
  uploadRequiredDocumentsSubmit() {
    this.generalComplianceSubmit = true;
    if (this.generalCompliance.valid) {
      this.uploadLoader = true;
      let payload: any = {
        MissionId: this.missionList.MissionId,
        DroneId: this.missionDetails.value.DroneId,
        OperatorId: this.profileDetails.UserId,
      };
      this.operatorDocPayloadFormer();
      payload.MissionDoc = this.missionDocArr;
      payload.OperatorDoc = this.operatorDocArr;
      payload.DroneDoc = this.droneDocArr;
      this.loader = true;
      this.operatorApi.storeDocuments(payload).then((res) => {
        this.loader = false;
        this.missionDocArr = [];
        this.operatorDocArr = [];
        this.droneDocArr = [];
        let storeFlag = res.data?.MainData;
        //pop-up to say docoument stored successfully
        if (storeFlag == 'Documents stored successfully') {
          this.uploadLoader = false;
          //to enable the background create-mission modal
          this.disableBackground = false;
          this.uploadDocumentsFlag = false;
          this.showSwal(storeFlag);
        }
      });

      //need to empty the arr
    }
  }
  //documents already exists or not available
  documentsExistChecker() {
    if (this.operatorDoc && this.operatorDoc.length !== 0) {
      this.operatorDoc.forEach((element) => {
        if (element.docName == Constants.insuranceDocumentType) {
          this.insuranceFlag = 1;
          this.insuranceFileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            insuranceFile: 'already_present',
            insuranceFileType: 'already_present',
          });
        }
        if (element.docName == Constants.incorporationDocumentType) {
          this.incorporationFlag = 1;
          this.incorporationFileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            incorporationFile: 'already_present',
            incorporationFileType: 'already_present',
          });
        }
        if (element.docName == Constants.companyProfileDocumentType) {
          this.companyProfileFlag = 1;
          this.companyProfileFileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            companyProfileFile: 'already_present',
            companyProfileFileType: 'already_present',
          });
        }
      });
    }
    if (this.missionDoc && this.missionDoc.length !== 0) {
      this.missionDoc.forEach((element) => {
        if (element.docName == Constants.kmlFileDocumentType) {
          this.kmlFlag = 1;
          this.kmlFileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            kmlFile: 'already_present',
            kmlFileType: 'already_present',
          });
        }
        if (element.docName == Constants.operationsPlanDocumentType) {
          this.operationsPlanFlag = 1;
          this.operationsPlanFileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            operationsPlanFile: 'already_present',
            operationsPlanFileType: 'already_present',
          });
        }
        if (element.docName == Constants.uinOfDronesDocumentType) {
          this.uinCertificateFlag = 1;
          this.uinCertificateFileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            uinCertificateFile: 'already_present',
            uinCertificateFileType: 'already_present',
          });
        }
        if (element.docName == Constants.document1DocumentType) {
          this.document1Flag = 1;
          this.document1FileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            document1File: 'already_present',
            document1FileType: 'already_present',
          });
        }
        if (element.docName == Constants.document2DocumentType) {
          this.document2Flag = 1;
          this.document2FileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            document2File: 'already_present',
            document2FileType: 'already_present',
          });
        }
        if (element.docName == Constants.document3DocumentType) {
          this.document3Flag = 1;
          this.document3FileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            document3File: 'already_present',
            document3FileType: 'already_present',
          });
        }
        if (element.docName == Constants.document4DocumentType) {
          this.document4Flag = 1;
          this.document4FileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            document4File: 'already_present',
            document4FileType: 'already_present',
          });
        }
      });
    }
    if (this.droneDoc && this.droneDoc.length !== 0) {
      this.droneDoc.forEach((element) => {
        if (element.docName == Constants.dgcaCertificateDocumentType) {
          this.dgcaCertificateFlag = 1;
          this.dgcaCertificateFileName = 'Already Uploaded';
          this.generalCompliance.patchValue({
            dgcaCertificateFile: 'already_present',
            dgcaCertificateFileType: 'already_present',
          });
        }
      });
    }
  }
  // Elevation graph
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.initialPost = true;
    if (this.isExpanded) {
      this.isExpanded = false;
    }
  }
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.initialPost = false;
    if (this.isMinimized) {
      this.isMinimized = false;
    }
  }

  async getElevationData(latGraph, longGraph, altGraph) {
    let elevationData = [];
    let distances = [];
    let droneHeight = [];
    const coordinates: Coordinate[] = [];
    let dist: any = 0;

    for (let i = 0; i < latGraph.length; i++) {
      const coordinate: Coordinate = {
        latitude: latGraph[i],
        longitude: longGraph[i],
      };
      coordinates.push(coordinate);
    }

    try {
      if (coordinates.length !== 0) {
        const response = await this.operatorApi.getElevation(coordinates);
        const elevations = response['data']?.MainData;
        elevationData.push(...elevations);
      }

      // Distance calculation
      distances.push(0);
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
        distances.push(parseFloat(distan));
      }

      // For drone Height
      if (this.altitudeRef.length > 0) {
        for (let i = 0; i < altGraph.length; i++) {
          if (this.altitudeRef[i] == 0) {
            droneHeight[i] = elevationData[i];
          } else if (this.altitudeRef[i] == 3) {
            droneHeight[i] = altGraph[0] + altGraph[i] + elevationData[0];
          } else if (this.altitudeRef[i] == 10) {
            droneHeight[i] = elevationData[i] + altGraph[i];
          }
        }
      } else if (this.altitudeRef.length == 0) {
        for (let i = 0; i < altGraph.length; i++) {
          droneHeight[i] = altGraph[i] + elevationData[i];
        }
      }
      this.initBasicAreaEcharts(elevationData, droneHeight, distances);
    } catch (error) {}
  }

  initBasicAreaEcharts(elevationData, droneHeight, distances) {
    this.chartOption = {
      title: {
        top: '10%',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        order: 'seriesDesc',
        confine: true,
      },
      grid: {
        top: '10%',
        left: '10%',
        right: '10%',
        bottom: '16%',
        containLabel: true,
      },
      xAxis: [
        {
          name: 'Distance travelled by drone(m)',
          nameLocation: 'middle',
          nameGap: 50,
          min: 0,

          nameTextStyle: {
            verticalAlign: 'bottom',
            fontSize: 17,
            // color:'white'
          },
          type: 'category',
          axisLabel: {
            formatter: '{value} m',
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
          nameGap: 60, // Adjust the gap as needed
          nameTextStyle: {
            verticalAlign: 'bottom',
            fontSize: 18,
          },
          min: 0,

          type: 'value',
          axisLabel: {
            formatter: '{value} m',
          },
          splitLine: {
            show: false,
          },
          z: 10,
        },
      ],
      series: [
        {
          name: 'Mean sea leve(m)',
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
          name: 'Planned Drone Altitude(m)',
          type: 'line',
          // stack:'Total',
          itemStyle: {
            color: '#F2597F',
          },
          data: droneHeight,
        },
      ],
    };
  }

  //method to check documents for payload
  operatorDocPayloadFormer() {
    //missionDoc payload
    if (
      this.generalCompliance.value.kmlFile !== '' &&
      this.generalCompliance.value.kmlFile !== 'already_present'
    ) {
      this.missionDocArr.push({
        fileType: this.generalCompliance.value.kmlFileType,
        data: this.generalCompliance.value.kmlFile, // base64 encoded document
        docName: Constants.kmlFileDocumentType,
        alreadyUpload: false,
      });
    } else {
      this.missionDocArr.push({
        docName: Constants.kmlFileDocumentType,
        alreadyUpload: true,
      });
    }
    if (
      this.generalCompliance.value.operationsPlanFile !== '' &&
      this.generalCompliance.value.operationsPlanFile !== 'already_present'
    ) {
      this.missionDocArr.push({
        fileType: this.generalCompliance.value.operationsPlanFileType,
        data: this.generalCompliance.value.operationsPlanFile, // base64 encoded document
        docName: Constants.operationsPlanDocumentType,
        alreadyUpload: false,
      });
    } else {
      this.missionDocArr.push({
        docName: Constants.operationsPlanDocumentType,
        alreadyUpload: true,
      });
    }
    if (
      this.generalCompliance.value.uinCertificateFile !== '' &&
      this.generalCompliance.value.uinCertificateFile !== 'already_present'
    ) {
      this.missionDocArr.push({
        fileType: this.generalCompliance.value.uinCertificateFileType,
        data: this.generalCompliance.value.uinCertificateFile, // base64 encoded document
        docName: Constants.uinOfDronesDocumentType,
        alreadyUpload: false,
      });
    } else {
      this.missionDocArr.push({
        docName: Constants.uinOfDronesDocumentType,
        alreadyUpload: true,
      });
    }
    if (
      this.generalCompliance.value.document1File !== '' &&
      this.generalCompliance.value.document1File !== 'already_present'
    ) {
      this.missionDocArr.push({
        fileType: this.generalCompliance.value.document1FileType,
        data: this.generalCompliance.value.document1File, // base64 encoded document
        docName: Constants.document1DocumentType,
        alreadyUpload: false,
      });
    } else {
      this.missionDocArr.push({
        docName: Constants.document1DocumentType,
        alreadyUpload: false,
      });
    }
    if (
      this.generalCompliance.value.document2File !== '' &&
      this.generalCompliance.value.document2File !== 'already_present'
    ) {
      this.missionDocArr.push({
        fileType: this.generalCompliance.value.document2FileType,
        data: this.generalCompliance.value.document2File, // base64 encoded document
        docName: Constants.document2DocumentType,
        alreadyUpload: false,
      });
    } else {
      this.missionDocArr.push({
        docName: Constants.document2DocumentType,
        alreadyUpload: false,
      });
    }
    if (
      this.generalCompliance.value.document3File !== '' &&
      this.generalCompliance.value.document3File !== 'already_present'
    ) {
      this.missionDocArr.push({
        fileType: this.generalCompliance.value.document3FileType,
        data: this.generalCompliance.value.document3File, // base64 encoded document
        docName: Constants.document3DocumentType,
        alreadyUpload: false,
      });
    } else {
      this.missionDocArr.push({
        docName: Constants.document3DocumentType,
        alreadyUpload: false,
      });
    }
    if (
      this.generalCompliance.value.document4File !== '' &&
      this.generalCompliance.value.document4File !== 'already_present'
    ) {
      this.missionDocArr.push({
        fileType: this.generalCompliance.value.document4FileType,
        data: this.generalCompliance.value.document4File, // base64 encoded document
        docName: Constants.document4DocumentType,
        alreadyUpload: false,
      });
    } else {
      this.missionDocArr.push({
        docName: Constants.document4DocumentType,
        alreadyUpload: false,
      });
    }
    //operatorDoc payload
    if (
      this.generalCompliance.value.insuranceFile !== '' &&
      this.generalCompliance.value.insuranceFile !== 'already_present'
    ) {
      this.operatorDocArr.push({
        fileType: this.generalCompliance.value.insuranceFileType,
        data: this.generalCompliance.value.insuranceFile, // base64 encoded document
        docName: Constants.insuranceDocumentType,
        alreadyUpload: false,
      });
    } else {
      this.operatorDocArr.push({
        docName: Constants.insuranceDocumentType,
        alreadyUpload: true,
      });
    }
    if (
      this.generalCompliance.value.incorporationFile !== '' &&
      this.generalCompliance.value.incorporationFile !== 'already_present'
    ) {
      this.operatorDocArr.push({
        fileType: this.generalCompliance.value.incorporationFileType,
        data: this.generalCompliance.value.incorporationFile, // base64 encoded document
        docName: Constants.incorporationDocumentType,
        alreadyUpload: false,
      });
    } else {
      for (let i = 0; i < this.operatorDoc.length; i++) {
        if (this.operatorDoc[i].docName == 'INCORPORATION_DOCUMENT') {
          this.operatorDocArr.push({
            docName: Constants.incorporationDocumentType,
            alreadyUpload: true,
          });
          break;
        }
        if (
          i == this.operatorDoc.length - 1 &&
          this.operatorDoc[i].docName != 'INCORPORATION_DOCUMENT'
        ) {
          this.operatorDocArr.push({
            docName: Constants.incorporationDocumentType,
            alreadyUpload: false,
          });
        }
      }
    }
    if (
      this.generalCompliance.value.companyProfileFile !== '' &&
      this.generalCompliance.value.companyProfileFile !== 'already_present'
    ) {
      this.operatorDocArr.push({
        fileType: this.generalCompliance.value.companyProfileFileType,
        data: this.generalCompliance.value.companyProfileFile, // base64 encoded document
        docName: Constants.companyProfileDocumentType,
        alreadyUpload: false,
      });
    } else {
      for (let i = 0; i < this.operatorDoc.length; i++) {
        if (this.operatorDoc[i].docName == 'COMPANY_PROFILE') {
          this.operatorDocArr.push({
            docName: Constants.companyProfileDocumentType,
            alreadyUpload: true,
          });
          break;
        }
        if (
          i == this.operatorDoc.length - 1 &&
          this.operatorDoc[i].docName != 'COMPANY_PROFILE'
        ) {
          this.operatorDocArr.push({
            docName: Constants.companyProfileDocumentType,
            alreadyUpload: false,
          });
        }
      }
    }
    //droneDoc payload
    if (
      this.generalCompliance.value.dgcaCertificateFile !== '' &&
      this.generalCompliance.value.dgcaCertificateFile !== 'already_present'
    ) {
      this.droneDocArr.push({
        fileType: this.generalCompliance.value.dgcaCertificateFileType,
        data: this.generalCompliance.value.dgcaCertificateFile, // base64 encoded document
        docName: Constants.dgcaCertificateDocumentType,
        alreadyUpload: false,
      });
    } else {
      this.droneDocArr.push({
        docName: Constants.dgcaCertificateDocumentType,
        alreadyUpload: true,
      });
    }
  }
  toggleDrop() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  showdatas() {
    this.showdata = !this.showdata;
    this.showAccordian = true;
  }
  close() {
    this.makeClose = !this.makeClose;
    this.isView = false;
    this.showAccordian = false;
  }

  // Test for map layer cards
  onClickonMaps() {
    this.ScreenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );

    this.ScreenSpaceEventHandler.setInputAction((input) => {
      // if (this.isDraw == true) {
      this.mapLayersService
        .onclickmapui(input, this.viewer)
        .then((res: any) => {
          if (res) {
            this.entityDescription = res;
            this.isView = true;
          }
        });
      // }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  onValueChange(event) {
    this.wayPointsForm
      .get('wayPoints')
      ['controls'][event.index].patchValue(event.value);
    clearTimeout(this.debounceMode);
    this.debounceMode = setTimeout(() => {
      this.onWayPointChange();
    }, 1000);
  }

  onErrorFind(event) {
    if (event.error != null) {
      this.errorFind = true;
    } else {
      this.errorFind = false;
    }
  }
  onWaypointSelected(index, value) {
    for (const item of this.waypointData.WaypointArray) {
      const name = Object.values(item)[0];
      this.waypointValues.push(name);
    }
    this.operatorApi
      .getFileContent(this.waypointValues[index])
      .then((data: string) => {
        this.missionCreation(data, this.waypointValues[index]);
      })
      .catch((error) => {
        console.error('Error fetching file:', error);
      });
  }
  missionCreation(fileContent, file) {
    file = file.toLowerCase();
    this.isFilled = 4;
    this.isReset = true;
    if (file.endsWith('.kml')) {
      let result = this.extractKMLCoords(fileContent);
      result.then((result) => {
        this.editWayPoints(undefined, result);
        this.tabIndex = 3;
      });
    }
    if (file.endsWith('.waypoints')) {
      // let finalwaypointVals = [];
      // let splitted = fileContent.toString().split('\n');
      // for (let i = 0; i < splitted.length; i++) {
      //   let singleVal = splitted[i].toString().split('\t');
      //   finalwaypointVals.push(singleVal);
      // }
      // finalwaypointVals.filter((e) => e.length);
      // this.editWayPoints(finalwaypointVals);
      const lines = fileContent.split('\n');
      let convertedData = [];
      for (const line of lines) {
        if (line.trim() === '') {
          continue;
        }
        const values = line.split(/\s+/);
        const cleanedValues = values.filter((value) => value.trim() !== '');
        convertedData.push(cleanedValues);
      }
      // self.editWayPoints(convertedData);
      this.editWayPoints(convertedData);
      this.tabIndex = 3;
      this.modifyWayPointFileDetails();
    }
  }
  waypointTemplate() {
    let payload = {
      UserId: this.profileDetails.UserId,
    };
    this.operatorApi.waypointTemplate(payload).then((res: any) => {
      const parsedRes = JSON.parse(res.body);
      this.waypointData = parsedRes;
      for (const item of parsedRes.WaypointArray) {
        const name = Object.keys(item)[0];
        this.waypointTemplates.push(name);
      }
    });
  }

  getZoneData(){
    this.activeAirspaceEntities = this.viewer.entities;
    this.viewer.entities.removeAll();
    this.authorityApi.getZoneApiData().then((res: any) => {
      let items = res['data']?.items;
      this.cesiumFunction.getActiveAirBufferSpacesForZone(
        items,
        this.activeAirspaceEntities,
        this.viewer
      );
      //  this.profileDetails = res.Main
    });
  }

  swalShow(){
    this.swalWithBootstrapButtons.fire({
      background: '#1b1f27',
      title: `Restricted Zone`,
      text: `You have intersected a red zone`,
      focusConfirm: false,
      showCancelButton: false,
      allowOutsideClick: false,
      confirmButtonText: 'Okay',
    });
  }

  uploadToS3(fileData: any) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];

        const payload = {
          base64: base64,
          fileName: fileData?.name,
          contentType: fileData?.type || 'text/plain',
          folder: 'waypoints'
        };

        this.operatorApi.uploadWaypointFile(payload).then(
          (res) => {
            const data = res?.data;
            if(data){
              this.selectedFileS3Url = data?.url;
            }
          },
          (err) => {
            this.showSwal('error-message', err.error.error.message);
          }
        );
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };

      reader.readAsDataURL(fileData);
    }
}
