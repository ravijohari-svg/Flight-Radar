import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';

import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import * as echarts from 'echarts';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';

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
  providers: [],
})
export class BlackboxDetailComponent implements OnInit, OnDestroy {
  missionId!: string;

  // Separate Mission Details
  missionDetails;
  blackBoxDetails;
  elevationData = [];
  droneSeaLevel = [];
  distances = [];
  droneHeight = [];
  waypoint = 0;
  setVariable: boolean = false;

  show = true;
  geojsonDataSourceWarningZone = new Cesium.GeoJsonDataSource();

  // Warning Visibility
  warningVisibility;
  warningZoneFlag;

  //Cesium Viewer
  viewer;
  mapIdObj = {
    mapId: 'cesium-container',
    containerId: 'cesium-container',
  };

  //Loader
  loader = false;
  loaderKey;
  preFlightLoader;
  postFlightLoader;
  //Err message
  errFlag = false;
  elevationflag = false;
  time =[];
  speed = [];
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

  //2D3D
  toggleFlag = true;
  toggleflagText = '2D';

  //Scroll Event Listerner
  scrollEvent;

  //Active airspace - Buffer region
  activeBufferVisibility = true;
  activeBufferRegion;
  activeBuffers = [];

  // = new Cesium.EntityCollection
  activeAirspaceEntities;

  //Restricted Entities
  entitiesOfRestrictedAreas = [];

  //Getting Maps Layer from backend Based on Country initially
  entitiesOfRestrictedAreasIndia = [];
  entitiesOfRestrictedAreasIreland = [];
  entitiesOfRestrictedAreasDubai = [];

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
  chartOption: echarts.EChartsOption;
  chartOption1: echarts.EChartsOption;
  chartOption2: echarts.EChartsOption;
  //To identify which indexrow is selected so that its background color change
  selectedRowIndex: number | null = null;
  //Missions permission list
  missionPermissionsList;
  missionType;

  // OSM buildings
  osmBuilding = false;
  osmTileset;

  // Mapbox
  mapBoxKey = environment.mapBoxKey;
  maptilerkey = environment.maptilerkey;

  profileDetails;
  mapLayersModule;
  mapLayers = [];

  //For drone smoothness
  positionProperty = new Cesium.SampledPositionProperty();
  droneId: any;
  droneName: any;
  webSocketLastlog: any;
  webSocketTrigger: any;
  webSocketLiveLog: any;
  firstCall: boolean;
  position: { lat: any; lng: any; alt: any };
  subscription: any;
  maxElevation: any;
  routeParamsSubscription: any;

  droneMessages: String[];

  constructor(
    private operatorApi: OperatorapisService,
    private cesiumFunction: CesiumFunctionService,
    private mapLayersService: MapLayersService,
    private webSocketService: WebSocketService,
    private route: ActivatedRoute,
    private location: Location,
    private operatorService: OperatorService
  ) {}

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe((params) => {
      this.missionId = params['missionId'];
      let decrypt = CryptoJS.AES.decrypt(
        this.missionId,
        environment.operatorKey
      );
      this.missionId = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    });

    // let decrypt = CryptoJS.AES.decrypt(
    //   localStorage.getItem('UserDetails').toString(),
    //   environment.operatorKey
    // );
    // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.profileDetails = this.operatorService.returnProfileDetails();

    this.subscription = this.webSocketService
      .getMessages()
      .subscribe((message) => {
        if (message.action === 'operator-blackbox-dronetrail') {
          this.handleMissionDetailsUpdate(message);
        }
      });
    this.initialFunction();
  }
  initialFunction() {
    this.setVariable = true;
    this.onMissionDetail();
    this.getMessages();
  }
  ngOnDestroy(): void {
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
  handleMissionDetailsUpdate = (details) => {
    // Update mission details based on the received update
    if (details) {
      this.webSocketLastlog = details.TS_Created;
      this.webSocketTrigger = details.TriggerId;
      this.requestMissionDetails();
    }
    if (this.firstCall) {
      // this.maxElevation = details.maxElevation;
      //firsrt ground level point
      // this.droneHeight[0] = details.modifiedData[0].elevation;
      // this.elevationData[0] = details.modifiedData[0].elevation;

      this.filterDroneTrailing(details.modifiedData, true);
      this.firstCall = false;
    } else {
      this.getDroneTrailingContinuously(details.modifiedData);
    }
  };
  requestMissionDetails = (missionId?) => {
    let payload;
    if (this.webSocketTrigger && this.webSocketLastlog) {
      payload = {
        action: 'operator-second-trail',
        TriggerId: this.webSocketTrigger,
        LastLogTime: this.webSocketLastlog,
      };
    } else if (missionId) {
      payload = {
        action: 'operator-first-trail',
        MissionId: missionId,
      };
    }
    // Send the payload to the WebSocket server
    if (payload) this.webSocketService.sendMessage(payload);
  };
  droneDetails(id) {
    let payload = {
      DroneId: id,
    };
    this.operatorApi.getSingleDroneDetails(payload).then(
      (res: any) => {
        this.droneName = res?.data?.MainData?.UAVInfoType?.Value;
      },
      (err) => {}
    );
  }
  onMissionDetail() {
    //Commented for dev purpose
    this.loader = true;
    this.loaderKey = 'getMissionDetail';
    let payload = {
      MissionId: this.missionId,
    };

    this.operatorApi.getBlackBoxMissionDetail(payload).then(
      (res: any) => {
        if (!res['data']) {
          this.errFlag = true;
        }

        this.loader = false;
        this.missionDetails = res.data.MainData.MissionDetails;
        let blackBoxDetails = res.data.MainData.Blackbox;
        let StartState = blackBoxDetails?.StartState;
        this.droneDetails(this.missionDetails.DroneId);
        if (this.missionId) {
          this.getDroneTrailingInitially();
        }
        this.missionType =
          this.missionDetails.ActivityType.toLowerCase().includes('bvlos')
            ? 'BVLOS'
            : 'LOS';

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
          this.blackBoxDetails.forEach((val, index) => {
            let findIndex = this.blackBoxDetails.findIndex((values) => {
              return values.flight == val.flight;
            });
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
        if (this.missionDetails && this.missionDetails.PermissionStatus) {
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

        //Intersection
        if (this.missionDetails.Correlation) {
          this.interesectionArr = this.missionDetails.Correlation;
          if (this.interesectionArr) {
            if (this.interesectionArr.airport?.length > 0) {
              this.interesectionArr.airport.forEach((zone) => {
                if (zone.type == 'Red-Zone') {
                  this.coRelationFlag.redzone = true;
                  this.coRelationFlag.greenzone = false;
                }
                if (
                  zone.type == 'Inner-Yellow' ||
                  zone.type == 'Outer-Yellow'
                ) {
                  this.coRelationFlag.yellowzone = true;
                  this.coRelationFlag.greenzone = false;
                }
              });
            }
            if (this.interesectionArr.geozone?.length > 0) {
              this.interesectionArr.geozone.forEach((zone) => {
                if (zone.type == 'Red-Zone') {
                  this.coRelationFlag.redzone = true;
                  this.coRelationFlag.greenzone = false;
                }
              });
            }
            if (this.interesectionArr.reservedAirspace.length > 0) {
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
          this.viewer = this.mapLayersService.getViewer();
          this.activeAirspaceEntities = this.viewer.entities;
          this.osmTileset = Cesium.createOsmBuildings();
          this.viewer.scene.primitives.add(this.osmTileset);
          this.osmTileset.show = false;

          if (this.missionDetails.StartTime && this.missionDetails.EndTime) {
            this.getActiveAirBufferSpaces();
          }
          this.getZoomLevel();
          this.cesiumFunction.removeEntities(this.viewer.entities, 'Label');
          this.cesiumFunction.removeEntities(
            this.viewer.entities,
            'CustomLabel'
          );
          this.cesiumFunction.removeEntities(
            this.viewer.entities,
            'BufferRegion'
          );

          if (
            this.missionDetails?.Latitude &&
            this.missionDetails.Latitude.length != 1
          ) {
            this.cesiumFunction.loadWayPoints2D(
              this.viewer,
              this.missionDetails.Longitude,
              this.missionDetails.Latitude,
              this.missionDetails.Altitude
            );

            // this.loadWayPoints(this.missionDetails.Longitude, this.missionDetails.Latitude, this.missionDetails?.Altitude, this.missionDetails.Waypoints);
            this.cesiumFunction.labelWaypoints(
              this.viewer,
              this.missionDetails.Longitude,
              this.missionDetails.Latitude,
              this.missionDetails?.Altitude,
              this.missionDetails.WayPointNum
            );

            // this.loadBufferRegion(this.missionDetails.BufferRegion);
            // this.labelWayPoints(this.missionDetails.Longitude, this.missionDetails.Latitude, this.missionDetails?.Altitude, this.missionDetails?.WayPointNum);
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
          if (this.viewer && this.missionDetails?.BufferRegion) {
            let entity = this.cesiumFunction.polylineVolume(
              this.viewer,
              this.missionDetails?.Longitude,
              this.missionDetails?.Latitude,
              this.missionDetails?.Altitude
            );
            this.cesiumFunction.zoomEntity(
              this.viewer,
              entity,
              this.missionDetails?.BufferRegion
            );
          }
        }, 1000);
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

    this.operatorApi.getBlackboxMessages(payload).then(
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
  // OSM buildings
  osmBuildings() {
    this.osmBuilding = !this.mapLayersService.osmBuildings(
      this.viewer,
      this.osmBuilding,
      this.osmTileset
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
  onTrailingLog(trail) {
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

  onBack() {
    this.location.back();
  }

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
    this.operatorApi
      .preAndPostFlightReportDownload(payload)
      .then((res: any) => {
        const arr = new Uint8Array(res.data.MainData.data);
        var blob = new Blob([arr], { type: 'application/pdf;charset=utf-8' });
        saveAs(
          blob,
          this.missionDetails.OperationName + '_' + reportType + '.pdf'
        );
      })
      .finally(() => {
        this.preFlightLoader = false;
        this.postFlightLoader = false;
      });
  }

  //Angular-Cesium

  getBackgroundColor(plane) {
    return new Cesium.Color(0.048, 0.086, 0.175, 0.8);
    // return Cesium.Color.ROYALBLUE;
  }

  //get Zoom level
  getZoomLevel() {
    this.viewer.camera.moveEnd.addEventListener(() => {
      let height = this.viewer.scene.camera.positionCartographic.height;
      if (height >= 1500000) {
        this.warningVisibility = false;
        this.geojsonDataSourceWarningZone.show = false;
      } else {
        this.warningVisibility = true;
        this.geojsonDataSourceWarningZone.show = true;
      }
      this.warningZoneFlag = this.geojsonDataSourceWarningZone.show;
    });
  }

  //Active Air Spaces
  getActiveAirBufferSpaces() {
    let payload = {
      StartTime: this.missionDetails.StartTime,
      EndTime: this.missionDetails.EndTime,
      OperatorId: this.profileDetails.UserId,
    };
    this.operatorApi.getActiveBufferRegions(payload).then(
      (res: any) => {
        this.activeBuffers = res.data.MainData;
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
      },
      (err) => {}
    );
  }

  toggle2D3D() {
    this.toggleFlag = !this.toggleFlag;
    if (this.toggleFlag) {
      //first off the osmBuildings
      this.osmBuilding = true;
      this.osmBuildings();
      //
      this.toggleflagText = '2D';
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
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
      if (this.missionDetails.Longitude) {
        this.cesiumFunction.loadWayPoints(
          this.viewer,
          this.missionDetails.Longitude,
          this.missionDetails.Latitude,
          this.missionDetails?.Altitude
        );
      }

      this.viewer.camera.lookUp(Cesium.Math.toRadians(10.0));
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
    const res = this.mapLayersService.getElevationBlackBox(
      logs,
      this.setVariable
    );
    this.setVariable = false;
    this.distances = res[0];
    this.droneHeight = res[1];
    this.elevationData = res[2];
    this.initBasicAreaEcharts();
  }
  initBasicAreaEcharts() {
    this.chartOption = {
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
          nameGap: 39, // Adjust the gap as needed
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
  extractTime(datetimeString) {
    const datetime = new Date(datetimeString);

    const hours = datetime.getHours().toString().padStart(2, '0');
    const minutes = datetime.getMinutes().toString().padStart(2, '0');
    const seconds = datetime.getSeconds().toString().padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;

    return time;
}
  velocityGraphData(droneTrail) {
    for(let i=0; i< droneTrail.length; i++){
      this.time.push(this.extractTime(droneTrail[i]?.datetime))
      this.speed.push(droneTrail[i]?.groundspeed);
    }
    this.velocityGraph(this.time, this.speed);
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
  velocityGraph(time, speed){
    this.chartOption1 = {
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
  channelGraph(time, chin){
  if(chin[1] === undefined)
  {
  chin = this.ch2in;
  }
    this.chartOption2 = {
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
