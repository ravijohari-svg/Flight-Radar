import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';

import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';

import * as CryptoJS from 'crypto-js';
import * as echarts from 'echarts';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AuthorityApplicationComponent } from '../../authority-application.component';

type CoRelationFlag = {
  greenzone: boolean;
  redzone: boolean;
  orangezone: boolean;
  yellowzone: boolean;
};
//For elevation graph to store the coordinates
interface Coordinate {
  latitude: number;
  longitude: number;
}
@Component({
  selector: 'app-blackbox-detail',
  templateUrl: './blackbox-detail.component.html',
  styleUrls: ['./blackbox-detail.component.scss'],
})
export class BlackboxDetailComponent implements OnInit, OnDestroy {
  @Input() blackBoxIndex;
  @Output() blackBoxIndexChange = new EventEmitter<string>();
  @Input() operatorId;
  @Output() operatorIdChange = new EventEmitter<string>();
  @Input() missionId;
  @Output() missionIdChange = new EventEmitter<string>();
  @Input() missionStatus;

  profileDetails;
  speed = [];
  time = [];

  // Separate Mission Details
  missionDetails;
  blackBoxDetails;
  //If error from API
  errFlag = false;
  elevationData = [];
  droneSeaLevel = [];
  distances = [];
  droneHeight = [];
  waypoint = 0;

  show = true;
  ch1in=[];
  ch1out=[];
  ch2in=[];
  ch2out=[];
  ch3in=[];
  ch3out=[];
  ch4in=[];
  ch4out=[];
  ch5in=[];
  ch5out=[];
  ch6in=[];
  ch6out=[];
  ch7in=[];
  ch7out=[];
  ch8in=[];
  ch8out=[];
  ch9in=[];
  ch9out=[];
  chin=[];
  chout=[];

  //Loader
  loader;
  loaderKey;
  preFlightLoader;
  postFlightLoader;

  //Active airspace - Buffer region
  activeBufferVisibility = true;
  activeBufferRegion;
  activeBuffers = [];
  // = new Cesium.EntityCollection
  activeAirspaceEntities;

  //Restricted Entities
  entitiesOfRestrictedAreas = [];

  // Cesium viewer
  viewer;
  //Intersection

  coRelationFlag: CoRelationFlag = {
    greenzone: true,
    redzone: false,
    orangezone: false,
    yellowzone: false,
  };
  interesectionArr;

  //Drone Trailing
  lastLog;
  droneTrailing;
  droneTrailingInterval;
  droneTrailingEntity;
  dronePathCord = [];
  dronePathValue = [];
  droneImageEntity;
  trailingFlag;
  //For elevation graph
  elevationLat;
  setVariable:boolean = false;
  chartOption1: echarts.EChartsOption;
  chartOption2: echarts.EChartsOption;
  chartOption3: echarts.EChartsOption;
  //To identify which index row is selected so that its background color change
  selectedRowIndex: number | null = null;

  //Missions permission list
  missionPermissionsList;

  // OSM buildings
  osmBuilding = false;
  osmTileset;

  //2D3D
  toggleFlag = true;
  toggleflagText = '2D';

  // Mapbox
  mapBoxKey = environment.mapBoxKey;
  maptilerkey = environment.maptilerkey;

  //For drone smoothness
  positionProperty = new Cesium.SampledPositionProperty();

  // selectedImagery = this.providerViewModels[0];
  // selectedTerrain = this.providerViewModel[0];
  droneName: any;
  missionType;
  webSocketLastlog: any;
  webSocketTrigger: any;
  webSocketLiveLog: any;
  firstCall: boolean;
  position: { lat: any; lng: any; alt: any };
  subscription: any;
  displayGraph;
  maxElevation: any;
  routeParamsSubscription: any;

  droneMessages: String[];


  constructor(
    private authorityApi: AuthorityapisService,
    private cesiumFunction: CesiumFunctionService,
    private route: ActivatedRoute,
    private location: Location,
    private mapLayersService: MapLayersService,
    private webSocketService: WebSocketService,
    private authorityApplicationComponent: AuthorityApplicationComponent
  ) {}

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.subscribe((params) => {
      this.missionId = params['missionId'];
      let decrypt = CryptoJS.AES.decrypt(
        this.missionId,
        environment.authorityKey
      );
      this.missionId = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    });
    this.initialFunction();
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.camera.moveStart.removeEventListener();
      this.viewer.scene.primitives.remove(this.osmTileset);
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
  }

  //Contain those functionality needed at first run of this component
  initialFunction() {
    this.setVariable = true;
    this.profileDetails = this.authorityApplicationComponent.getDecryptData();
    this.onMissionDetail();
    this.getMessages();
    this.subscription = this.webSocketService
      .getMessages()
      .subscribe((message) => {
        if (message.action === 'authority-blackbox-dronetrail') {
          // Process the mission details update
          this.handleMissionDetailsUpdate(message);
        }
      });
  }
  handleMissionDetailsUpdate = (details) => {
    // Update mission details based on the received update
    clearTimeout(this.displayGraph);
    if (details) {
      this.webSocketLastlog = details.TS_Created;
      this.webSocketTrigger = details.TriggerId;
      this.requestMissionDetails();
    }
    if (this.firstCall) {
      // this.maxElevation = details.maxElevation;
      // this.droneHeight[0] = details.modifiedData[0].elevation;
      // this.elevationData[0] = details.modifiedData[0].elevation;
      this.filterDroneTrailing(details.modifiedData, true);
      this.firstCall = false;
    } else this.getDroneTrailingContinuously(details.modifiedData);
  };
  requestMissionDetails = (missionId?) => {
    let payload;
    if (this.webSocketTrigger && this.webSocketLastlog) {
      payload = {
        action: 'authority-second-trail',
        TriggerId: this.webSocketTrigger,
        LastLogTime: this.webSocketLastlog,
      };
    } else if (missionId) {
      payload = {
        action: 'authority-first-trail',
        MissionId: missionId,
      };
    }
    // Send the payload to the WebSocket server
    if (payload) this.webSocketService.sendMessage(payload);
  };
  droneDetails(id) {
    // this.loaderKey = 'getDroneDetail';
    let payload = {
      DroneId: id,
    };
    this.authorityApi.getSingleDroneDetails(payload).then(
      (res) => {
        this.droneName = res['data']?.MainData?.UAVInfoType?.Value;
      },
      (err) => {
        // console.log("err--", err)
      }
    );
  }

  // OSM buildings
  osmBuildings() {
    this.osmBuilding = !this.mapLayersService.osmBuildings(
      this.viewer,
      this.osmBuilding,
      this.osmTileset
    );
  }

  //Missions and blackbox details API call and stucturing
  onMissionDetail() {
    this.loader = true;
    this.loaderKey = 'getMissionDetail';
    let payload = {
      MissionId: this.missionId,
    };
    this.authorityApi.getBlockBoxMissionDetail(payload).then(
      (res) => {
        this.loader = false;
        if (!res['data']) {
          this.errFlag = true;
        } else {
          this.missionDetails = res['data'].MainData.MissionDetails;
          let blackBoxDetails = res['data'].MainData.Blackbox;
          let StartState = blackBoxDetails?.StartState;
          let EndState = blackBoxDetails?.EndState;
          this.droneDetails(this.missionDetails.DroneId);
          if (this.missionDetails.PermissionStatus) {
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
              let defaultCat = this.missionDetails?.PermissionStatus.some(
                (val) => val.Category == defaultVal.Category
              );
              if (!defaultCat)
                this.missionDetails?.PermissionStatus.push(defaultVal);
            });

            this.missionPermissionsList.forEach((modules) => {
              this.missionDetails?.PermissionStatus.forEach((permission) => {
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
          // let blackboxArr =
          let sortable = [];
          if (blackBoxDetails) {
            for (let [key, value] of Object.entries(blackBoxDetails)) {
              if (key != 'StartState' && key != 'EndState') {
                let concatObj: any = value;
                concatObj.CurrentState = key;
                sortable.push(concatObj);
              }
            }
            // this.blackBoxDetails =
            let previousStateObj;
            let sortedArr = [];
            sortable.forEach((state, index) => {
              let currentStateObj;
              if (index == 0) {
                currentStateObj = sortable.find(
                  (val) => val.CurrentState == StartState
                );
              } else {
                currentStateObj = sortable.find(
                  (val) => val.CurrentState == previousStateObj?.NextState
                );
              }
              previousStateObj = currentStateObj;
              sortedArr.push(currentStateObj);
            });
            this.blackBoxDetails = sortedArr.filter((val) => val);
            this.blackBoxDetails.forEach((val, index, self) => {
              // console.log(val);
              let findIndex = this.blackBoxDetails.findIndex((values) => {
                return values?.flight == val?.flight;
              });
              // if(findIndex == index) {
              //   val.flightVisibility = true;
              // } else {
              //   val.flightVisibility = true;
              // }
              val.flightVisibility = findIndex == index ? true : false;
            });
          }

          let latLongArr = [];
          this.missionDetails?.Latitude?.forEach((lat, i) => {
            let latLong = {
              Latitude: lat,
              Longitude: this.missionDetails.Longitude[i],
            };
            latLongArr.push(latLong);
            return latLong;
          });
          this.missionDetails.LatLong = latLongArr;

          //Intersection
          if (this.missionDetails.Correlation) {
            this.interesectionArr = this.missionDetails.Correlation;
            if (this.interesectionArr) {
              if (this.interesectionArr.airport?.length > 0) {
                this.interesectionArr.airport.forEach((zone) => {
                  if (zone.type == 'Red-Zone') {
                    this.coRelationFlag.redzone = true;
                  }
                });
                if (this.coRelationFlag.redzone != true)
                  this.interesectionArr.airport.forEach((zone) => {
                    if (
                      zone.type == 'Inner-Yellow' ||
                      zone.type == 'Outer-Yellow'
                    ) {
                      this.coRelationFlag.yellowzone = true;
                    }
                  });

                this.coRelationFlag.greenzone = false;
              } else if (this.interesectionArr.geozone?.length > 0) {
                this.interesectionArr.geozone.forEach((zone) => {
                  if (zone.type == 'Red-Zone') {
                    this.coRelationFlag.redzone = true;
                  }
                });
                this.coRelationFlag.greenzone = false;
              } else if (this.interesectionArr.reservedAirspace.length > 0) {
                this.coRelationFlag.orangezone = true;
                this.coRelationFlag.greenzone = false;
              }
            }
            //   if (
            //     this.interesectionArr &&
            //     (this.interesectionArr.vfr?.length != 0 ||
            //       this.interesectionArr.airport?.length != 0 ||
            //       this.interesectionArr.greenzone?.length != 0)
            //   ) {
            //     this.interesectionArr.vfr.forEach((zone) => {
            //       if (
            //         zone.type === 'Inner Yellow Zone' ||
            //         zone.type === 'Outer Yellow Zone'
            //       )
            //         this.coRelationFlag.yellowzone = true;
            //       if (zone.type === 'red zone')
            //         this.coRelationFlag.redzone = true;
            //     });
            //     this.coRelationFlag.greenzone = false;
            //   }
            // if (
            //   this.interesectionArr &&
            //   this.interesectionArr.reservedAirspace?.length != 0
            // ) {
            //   this.coRelationFlag.orangezone = true;
            //   this.coRelationFlag.greenzone = false;
            // }
          }
          setTimeout(() => {
            // SKP : changed to single viewer to avoid rerendering of map.
            this.viewer = this.mapLayersService.getViewer();
            this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
            //instead of default2D view
            this.osmTileset = Cesium.createOsmBuildings();
            this.viewer.scene.primitives.add(this.osmTileset);
            this.osmTileset.show = false;
            if (blackBoxDetails) {
              this.getDroneTrailingInitially();
            }
            if (this.missionDetails.StartTime && this.missionDetails.EndTime) {
              this.getActiveAirBufferSpaces();
            }

            if (
              this.missionDetails?.Latitude &&
              this.missionDetails.Latitude.length != 1
            ) {
              this.cesiumFunction.loadWayPoints2D(
                this.viewer,
                this.missionDetails.Longitude,
                this.missionDetails.Latitude,
                this.missionDetails?.Altitude
              );
              this.cesiumFunction.labelWaypoints(
                this.viewer,
                this.missionDetails.Longitude,
                this.missionDetails.Latitude,
                this.missionDetails?.Altitude,
                this.missionDetails.WayPointNum
              );
              if (
                this.missionDetails?.wayPointFileDetails?.length != 0 &&
                this.missionDetails?.wayPointFileDetails
              ) {
                this.cesiumFunction.customLabelWaypoints(
                  this.viewer,
                  this.missionDetails?.wayPointFileDetails,
                  this.missionDetails?.Altitude
                );
              }
            }
            // this.loadBufferRegion(this.missionDetails.BufferRegion);
            // let entity = this.cesiumFunction.bufferRegion(
            //   this.viewer,
            //   this.missionDetails?.BufferRegion
            // );
            let entity = this.cesiumFunction.polylineVolume(
              this.viewer,
              this.missionDetails.Longitude,
              this.missionDetails.Latitude,
              this.missionDetails?.Altitude
            );
            this.cesiumFunction.zoomEntity(this.viewer, entity,this.missionDetails?.BufferRegion);
          }, 1000);
        }
      },
      (err) => {
        this.loader = false;
        this.errFlag = true;
      }
    );
  }
  getMessages() {
    let payload = {
      MissionId: this.missionId,
    };

    this.authorityApi.getBlackboxMessages(payload).then(
      (res: any) => {
        if(typeof res?.body == 'object') {
          this.droneMessages = res.body;
        }
      },
      (err) => {
        this.loader = false;
        this.errFlag = true;
      }
    );
  }

  //Drone Trailing
  getDroneTrailingInitially() {
    this.firstCall = true;
    this.requestMissionDetails(this.missionId);
  }
  getDroneTrailingContinuously(details) {
    if (details.length != 0 && details) {
      this.filterDroneTrailing(details, undefined);
    } else {
      if (this.dronePathValue.length > 0) {
        this.dronePathCord = this.dronePathCord.concat([this.dronePathValue]);
      }
      this.cesiumFunction.droneTrailingBillboard(
        this.droneTrailing,
        this.viewer
      );
    }
  }
  filterDroneTrailing(droneTrail, initially?) {
    let dronePathArr = [];
    this.trailingFlag = true;
    this.getElevationData(droneTrail);
    this.velocityGraphData(droneTrail);
    this.channelGraphData(droneTrail);
    droneTrail.forEach((value) => {
      if (value.lng !== 0 && value.lat !== 0) {
        if (!value.connected) {
          this.dronePathValue.push(value.lng, value.lat, value.alt + 1);

          dronePathArr.push(this.dronePathValue);
          this.dronePathValue = [];
          this.position = undefined;
        } else {
          this.dronePathValue.push(value.lng, value.lat, value.alt + 1);
          const positions = [
            this.position?.lng,
            this.position?.lat,
            this.position?.alt,
            value.lng,
            value.lat,
            value.alt,
          ];

          if (positions[0]) {
            this.cesiumFunction.activeDroneTrailing(this.viewer, positions);
          }
          this.position = {
            lat: value.lat,
            lng: value.lng,
            alt: value.alt,
          };
        }
      }
    });

    this.dronePathCord = this.dronePathCord.concat(dronePathArr);

    let latestLog;
    if (initially) {
      this.droneTrailing = droneTrail;
      latestLog = this.droneTrailing[this.droneTrailing.length - 1];
      if (latestLog.lat !== 0 && latestLog.lng !== 0) {
        // this.droneTrailingEntity = this.cesiumFunction.droneTrailingParts(
        //   this.viewer,
        //   this.dronePathCord
        // );

        if (
          this.droneName == 'Fixed Wing' ||
          this.droneName == 'Hybrid e-VTOL'
        ) {
          [this.droneImageEntity, this.positionProperty] =
            this.cesiumFunction.FixedWingdroneImages3D(
              this.viewer,
              latestLog.lat,
              latestLog.lng,
              latestLog.alt,
              latestLog.nav_bearing,
              latestLog.nav_pitch,
              latestLog.nav_roll
            );
        } else {
          [this.droneImageEntity, this.positionProperty] =
            this.cesiumFunction.droneImages3D(
              this.viewer,
              latestLog.lat,
              latestLog.lng,
              latestLog.alt,
              latestLog.nav_bearing,
              latestLog.nav_pitch,
              latestLog.nav_roll
            );
        }
      }
    } else {
      this.droneTrailing = this.droneTrailing.concat(droneTrail);
      latestLog = this.droneTrailing[this.droneTrailing.length - 1];
      if (latestLog.lat !== 0 && latestLog.lng !== 0) {
        // this.droneTrailingEntity = this.cesiumFunction.droneTrailingParts(
        //   this.viewer,
        //   this.dronePathCord,
        //   this.droneTrailingEntity
        // );
        if (
          this.droneName == 'Fixed Wing' ||
          this.droneName == 'Hybrid e-VTOL'
        ) {
          this.cesiumFunction.FixedupdateDroneImage3D(
            latestLog.lat,
            latestLog.lng,
            latestLog.alt,
            latestLog.nav_bearing,
            latestLog.nav_pitch,
            latestLog.nav_roll,
            this.droneImageEntity,
            this.viewer,
            this.positionProperty
          );
        } else {
          this.cesiumFunction.updateDroneImage3D(
            latestLog.lat,
            latestLog.lng,
            latestLog.alt,
            latestLog.nav_bearing,
            latestLog.nav_pitch,
            latestLog.nav_roll,
            this.droneImageEntity,
            this.viewer,
            this.positionProperty
          );
        }
      }
    }
  }

  //OnSpecific log called
  onTrailingLog(trail, i) {
    this.selectedRowIndex = trail;
    if (this.droneName == 'Fixed Wing' || this.droneName == 'Hybrid e-VTOL') {
      this.cesiumFunction.FixedupdateDroneImage3D(
        trail.lat,
        trail.lng,
        trail.alt,
        trail.nav_bearing,
        trail.nav_pitch,
        trail.nav_roll,
        this.droneImageEntity,
        this.viewer,
        this.positionProperty
      );
    } else {
      this.cesiumFunction.updateDroneImage3D(
        trail.lat,
        trail.lng,
        trail.alt,
        trail.nav_bearing,
        trail.nav_pitch,
        trail.nav_roll,
        this.droneImageEntity,
        this.viewer,
        this.positionProperty
      );
    }
    this.cesiumFunction.flyToLocation(this.viewer, trail.lng, trail.lat);
  }

  //Back to blackbox list
  onBack() {
    this.location.back();
    // this.blackBoxIndex = 0;
    // this.blackBoxIndexChange.emit(this.blackBoxIndex);
  }

  //Reports
  downloadReport(reportType) {
    let reportURL;
    if (reportType == 'Preflight') {
      reportURL = this.missionDetails.PreflightURL;
      this.preFlightLoader = true;
    } else {
      reportURL = this.missionDetails.PostflightURL;
      this.postFlightLoader = true;
    }
    //  = reportType == 'Preflight' ? this.missionDetails.PreflightURL : this.missionDetails.PostflightURL
    // missionDetails.MissionId, missionDetails.PreflightURL, missionDetails.OperationName,
    let payload = {
      MissionId: this.missionDetails.MissionId,
      PreAndPostFlightURL: reportURL,
    };
    this.authorityApi
      .preAndPostFlightReportDownload(payload)
      .then(
        (res) => {
          const arr = new Uint8Array(res['data'].MainData.data);
          var blob = new Blob([arr], { type: 'application/pdf;charset=utf-8' });
          saveAs(
            blob,
            this.missionDetails.OperationName + '_' + reportType + '.pdf'
          );
        },
        (err) => {}
      )
      .finally(() => {
        if (reportType == 'Preflight') {
          this.preFlightLoader = false;
        } else {
          this.postFlightLoader = false;
        }
      });
  }

  //Angular-Cesium functions
  getBackgroundColor(plane) {
    return new Cesium.Color(0.048, 0.086, 0.175, 0.8);

    // return Cesium.Color.ROYALBLUE;
  }

  //Active Air Spaces
  getActiveAirBufferSpaces() {
    let payload = {
      StartTime: this.missionDetails.StartTime,
      EndTime: this.missionDetails.EndTime,
    };
    this.activeAirspaceEntities = this.viewer.entities;
    this.authorityApi
      .getActiveBufferRegions(payload)
      .then((res: any) => {
        this.activeBuffers = res['data']?.MainData;
        this.activeBuffers = this.activeBuffers.filter((val) => {
          if (val.MissionId != this.missionDetails.MissionId) {
            return val;
          }
        });
        this.cesiumFunction.getActiveAirBufferSpaces(
          this.activeBuffers,
          this.activeAirspaceEntities,
          this.viewer
        );
      })
      .catch((err) => {});
  }

  // Getting Maps from backend based on Country only once
  // Code to be removed in future when data is received with resp to viewport

  toggle2D3D() {
    this.toggleFlag = !this.toggleFlag;

    if (this.toggleFlag) {
      //first off the osmBuildings
      this.osmBuilding = true;
      this.osmBuildings();
      //
      this.toggleflagText = '2D';
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
      // this.viewer.camera.flyTo({
      //   destination : Cesium.Cartesian3.fromDegrees(78.9629, 25.5937, 6000000.0),
      //   orientation : {
      //     heading : Cesium.Math.toRadians(0.0),
      //     pitch : Cesium.Math.toRadians(-90.0),
      //     roll : Cesium.Math.toRadians(0.0)
      //   },
      //   duration : 3
      // });
      if (this.missionDetails.Longitude) {
        this.cesiumFunction.loadWayPoints2D(
          this.viewer,
          this.missionDetails.Longitude,
          this.missionDetails.Latitude,
          this.missionDetails?.Altitude
        );
      }
    } else {
      this.toggleflagText = '3D';
      this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
      // this.viewer.camera.lookUp(Cesium.Math.toRadians(50.0));
      // this.viewer.camera.flyTo({
      //   // for india
      //   // destination : Cesium.Cartesian3.fromDegrees(78.9629, 20.5937, 20000000.0),
      //   //customized view
      //   destination : Cesium.Cartesian3.fromDegrees(78.9629, 6.6937, 3000000.0),
      //   orientation : {
      //     heading : Cesium.Math.toRadians(0.0),
      //     pitch : Cesium.Math.toRadians(-65.0),
      //     roll : Cesium.Math.toRadians(0.0)
      //   },
      //   duration : 3
      // });
      this.viewer.camera.lookUp(Cesium.Math.toRadians(10.0));
      if (this.missionDetails.Longitude) {
        this.cesiumFunction.loadWayPoints(
          this.viewer,
          this.missionDetails.Longitude,
          this.missionDetails.Latitude,
          this.missionDetails?.Altitude
        );
      }
    }
  }
  //trackBy function for waypoints
  trackByBlackBoxDetails(index: number, blackBox: any): string {
    return blackBox.CurrentState;
  }
  //trackBy function for trailing
  trackByDroneTrailing(index: number, trail: any): string {
    return trail.LogId;
  }
  trackByDroneMessages(index: number): number {
    return index;
  }

  getElevationData(logs) {
    const res = this.mapLayersService.getElevationBlackBox(logs,this.setVariable);
    this.setVariable = false;
    this.distances = res[0];
    this.droneHeight = res[1];
    this.elevationData = res[2];
    this.initBasicAreaEcharts();
  }
  extractTime(datetimeString) {
    const datetime = new Date(datetimeString);
    const hours = datetime.getHours().toString().padStart(2, '0');
    const minutes = datetime.getMinutes().toString().padStart(2, '0');
    const seconds = datetime.getSeconds().toString().padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;

    return time;
}
  initBasicAreaEcharts() {
    this.chartOption1 = {
      title: {
        top: '20px',
        left: 'center',
        text: 'Elevation Graph',
      },
      tooltip: {
        trigger: 'axis',
        order: 'seriesDesc',
      },
      grid: {
        left: '6%',
        right: '5%',
        bottom: '8%',
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
            formatter: '{value}',
          },
          boundaryGap: false,
          data: this.distances,
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
          nameGap: 35, // Adjust the gap as needed
          nameTextStyle: {
            verticalAlign: 'bottom',
            fontSize: 18,
          },
          min: 0,

          type: 'value',
          axisLabel: {
            formatter: '{value}',
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
          data: this.elevationData,
          itemStyle: {
            color: 'rgba(58,77,233,1)',
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
          name: 'Drone altitude during mission(m)',
          type: 'line',
          // stack:'Total',
          itemStyle: {
            color: '#F2597F',
          },
          data: this.droneHeight,
        },
      ],
    };
  }
  velocityGraphData(droneTrail) {
    for(let i=0; i< droneTrail.length; i++){
      this.time.push(this.extractTime(droneTrail[i]?.datetime))
      this.speed.push(droneTrail[i]?.groundspeed);
    }
    this.velocityGraph(this.time, this.speed);
  }
  velocityGraph(time, speed){
    this.chartOption2 = {
      title: {
        top: '20px',
        left: 'center',
        text: 'Velocity Graph',
      },
      tooltip: {
        trigger: 'axis',
        order: 'seriesDesc',
      },
      grid: {
        left: '6%',
        right: '5%',
        bottom: '8%',
        containLabel: true,
      },
      xAxis: [
        {
          name: 'Time',
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
            formatter: '{value}',
          },
          boundaryGap: false,
          data: time,
        },
      ],
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      yAxis: [
        {
          name: 'Ground speed(m/sec)',
          nameLocation: 'middle',
          nameGap: 35,
          nameTextStyle: {
            verticalAlign: 'bottom',
            fontSize: 18,
          },
          min: 0,

          type: 'value',
          axisLabel: {
            formatter: '{value}',
          },
          splitLine: {
            show: false,
          },
          z: 10,
        },
      ],
      series: [
        {
          name: 'Ground speed(m/sec)',
          type: 'line',
          data: speed,
          itemStyle: {
            color: 'rgba(58,77,233,1)',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(58,77,233,1)',
              },
              {
                offset: 1,
                color: 'rgba(58,77,233,0)',
              },
            ]),
          },
        },
      ],
    };
  }
  channelGraphData(droneTrail) {
    for(let i=0; i< droneTrail.length; i++){
      this.ch1in.push(droneTrail[i].ch1in)
      this.ch1out.push(droneTrail[i].ch1out)
      this.ch2in.push(droneTrail[i].ch2in)
      this.ch2out.push(droneTrail[i].ch2out)
      this.ch3in.push(droneTrail[i].ch3in)
      this.ch3out.push(droneTrail[i].ch3out)
      this.ch4in.push(droneTrail[i].ch4in)
      this.ch4out.push(droneTrail[i].ch4out)
      this.ch5in.push(droneTrail[i].ch5in)
      this.ch5out.push(droneTrail[i].ch5out)
      this.ch6in.push(droneTrail[i].ch6in)
      this.ch6out.push(droneTrail[i].ch6out)
      this.ch7in.push(droneTrail[i].ch7in)
      this.ch7out.push(droneTrail[i].ch7out)
      this.ch8in.push(droneTrail[i].ch8in)
      this.ch8out.push(droneTrail[i].ch8out)
      this.ch9in.push(droneTrail[i].ch9in)
      this.ch9out.push(droneTrail[i].ch9out)
    }
    this.chin = this.ch1in;
    this.chout = this.ch1out;
    this.channelGraph(this.time,this.chin);
  }
  changeOption(data: string){
   if(data === 'ch1'){
    this.channelGraph(this.time, this.ch1in);
   }
   if(data === 'ch2'){
    this.channelGraph(this.time, this.ch2in);
   }
   if(data === 'ch3'){
    this.channelGraph(this.time, this.ch3in);
   }
   if(data === 'ch4'){
    this.channelGraph(this.time, this.ch4in);
   }
   if(data === 'ch5'){
    this.channelGraph(this.time, this.ch5in);
   }
   if(data === 'ch6'){
    this.channelGraph(this.time, this.ch6in);
   }
   if(data === 'ch7'){
    this.channelGraph(this.time, this.ch7in);
   }
   if(data === 'ch8'){
    this.channelGraph(this.time, this.ch8in);
   }
   if(data === 'ch9'){
    this.channelGraph(this.time, this.ch9in);
   }

  }
  channelGraph(time, chin){
    if(chin[1] === undefined)
    {
    chin = this.ch2in;
    }
      this.chartOption3 = {
        title: {
          top: '20px',
          left: 'center',
          text: 'Pilot input data',
        },
        tooltip: {
          trigger: 'axis',
          order: 'seriesDesc',
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '8%',
          containLabel: true,
        },
        xAxis: [
          {
            name: 'Time',
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
              formatter: '{value}',
            },
            boundaryGap: false,
            data: time,
          },
        ],
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        yAxis: [
          {
            name: 'pwm',
            nameLocation: 'middle',
            nameGap: 45,
            nameTextStyle: {
              verticalAlign: 'bottom',
              fontSize: 18,
            },
            min: 0,
            type: 'value',
            axisLabel: {
              formatter: '{value}',
            },
            splitLine: {
              show: false,
            },
            z: 10,
          },
        ],
        series: [
          {
            name: 'Chin',
            type: 'line',
            itemStyle: {
              color: '#00FF00',
            },
            data: chin,
          },
          // {
          //   name: 'Chout',
          //   type: 'line',
          //   itemStyle: {
          //     color: '#00FF00',
          //   },
          //   data: chout,
          // },
        ],
      };
    }
}
