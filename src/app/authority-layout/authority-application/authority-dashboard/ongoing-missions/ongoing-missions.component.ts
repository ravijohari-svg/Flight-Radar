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
import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import { environment } from 'src/environments/environment';

import * as turf from '@turf/turf';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
import { AuthorityApplicationComponent } from '../../authority-application.component';
import { Constants } from 'src/app/constants/constants';
@Component({
  selector: 'app-ongoing-missions',
  templateUrl: './ongoing-missions.component.html',
  styleUrls: ['./ongoing-missions.component.scss'],
})
export class OngoingMissionsComponent implements OnInit, OnDestroy {
  profileDetails;
  //Ongoing Mission Index
  onGoingMissionIndex = 0;

  //Tab Value
  tab = 0;
  //Specific Mission Details
  missionDetail;
  currentMission;
  //Whole Mission List;
  onGoingMissionsList;

  //Time Intervals
  updatedMissionsApiCall;

  //initial Mission Logs
  initialLogs;
  //Latest Mission Logs
  latestMissionLogs;

  initialMissionLogs;

  //Live Drone
  liveDrone;
  droneImageFlag;
  firstTrigger;
  liveLatitude;
  liveLongitude;
  liveAltitude;
  terrainAlt;
  liveDroneOptions = {
    allowDrag: false,
  };

  show = true;

  // Warning Visibility
  warningVisibility;
  warningZoneFlag;

  //Loader
  loader;

  //Plane Finder
  planeFinder;
  planes = [];
  planesVisibility;

  //Active airspace - Buffer region
  activeBufferVisibility = true;
  activeBufferRegion;
  activeBuffers = [];
  // = new Cesium.EntityCollection
  activeAirspaceEntities;
  activeAirspaceImageEntities;

  //Map Layer from backend
  geojsonvfr = new Cesium.GeoJsonDataSource();
  geojsonAirport = new Cesium.GeoJsonDataSource();

  //Restricted Entities
  entitiesOfRestrictedAreas = [];

  //Getting Maps Layer from backend Based on Country initially
  entitiesOfRestrictedAreasIndia = [];
  entitiesOfRestrictedAreasIreland = [];
  entitiesOfRestrictedAreasDubai = [];

  //Accordion
  missionSection = 0;
  @Input() ongoingMissionCount;
  @Output() ongoingMissionCountChange = new EventEmitter<string>();

  @Input() upcomingMissionCount;
  @Output() upcomingMissionCountChange = new EventEmitter<string>();

  // 3d Drone image
  nav_bearing;
  nav_pitch;
  nav_roll;

  //Real-time
  onGoingInterval;
  previousOnGoingMissionsList = [];
  onGoingIntervalTiming = 3000;
  // Drone Image real-time
  // showDrone;
  droneImageEntity;

  // Custom info box data
  entityDescription;

  //viewer
  viewer;
  mapIdObj = {
    mapId: 'authority-ongoing',
    containerId: 'authority-ongoing-container',
  };
  //Missions permission list
  missionPermissionsList;

  // OSM buildings
  // osmBuilding = false;
  // osmTileset;

  //Template card
  isView = false;

  //For drone smoothness
  positionProperty = new Cesium.SampledPositionProperty();

  //2D3D
  toggleFlag = true;
  // toggleflagText = '2D';

  // Mapbox
  mapBoxKey = environment.mapBoxKey;
  maptilerkey = environment.maptilerkey;
  // Drone boundary
  droneBufferEntity;
  droneBufferHierarchy;
  droneBufferMaterial;
  liveMission: boolean = true;

  droneName: any;
  liveDronePath;
  removeDronePath: void;
  ente: any;
  webSocketTrigger: any;
  webSocketLastlog: any;
  debouncingTimeout: any;
  webSocketLiveLog: any;
  firstCall: any;
  subscription: any;
  selectedMission: any;
  wpno: any;

  droneFollow: any = false;
  onTickHandler: () => void;

  ScreenSpaceEventHandler: any;
  //Drone Trailing

  constructor(
    private authorityApi: AuthorityapisService,
    private cesiumFunction: CesiumFunctionService,
    private dateAndTimeFormat: DateTimeFormatService,
    private mapLayersService: MapLayersService,
    private webSocketService: WebSocketService,
    private authorityApplicationComponent: AuthorityApplicationComponent
  ) {}
  currentWeatherDetails;
  responseCityName;
  toggleMissionDetailstab;
  toggleMissionDetails() {
    this.toggleMissionDetailstab = !this.toggleMissionDetailstab;
  }

  ngOnInit(): void {
    this.loader = true;
    this.profileDetails = this.authorityApplicationComponent.getDecryptData();
    this.checkWebSocketService();
    setTimeout(() => {
      this.viewer = this.mapLayersService.getViewer();
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
      this.getZoneData();
      // this.osmTileset = Cesium.createOsmBuildings();
      // this.viewer.scene.primitives.add(this.osmTileset);
      // this.osmTileset.show = false;
      this.initialFunction();
      this.onClickonMaps();
    }, 1000);
  }

  checkWebSocketService() {
    this.subscription = this.webSocketService
      .getMessages()
      .subscribe((message) => {
        // console.log(message);

        if (message.action === 'Authority_Take_Logs') {
          // Process the mission details update
          if (message?.message?.CreatedById === this.missionDetail?.CreatedById)
            this.handleMissionDetailsUpdate(message.message);
        }
        if (message.action === Constants.checkLiveStream) {
          if (message.dataChange) {
            this.getOnGoingMissionsList();
          }
        }
      });
  }
  // telecomApi(val: any): void {
  //   if (val) {
  //     this.imageryLayer = this.viewer.imageryLayers.addImageryProvider(
  //       new Cesium.IonImageryProvider({ assetId: 2360108 })
  //     );
  //     this.viewer.zoomTo(this.imageryLayer);
  //   } else {
  //     this.viewer.imageryLayers.remove(this.imageryLayer);
  //   }
  // }

  ngOnDestroy() {
    // if (this.imageryLayer) {
    //   this.viewer.imageryLayers.remove(this.imageryLayer);
    // }
    // if (this.imgLayer) {
    //   this.viewer.imageryLayers.remove(this.imgLayer);
    // }
    if (this.viewer) {
      this.viewer.camera.moveStart.removeEventListener();
      // this.viewer.scene.primitives.remove(this.osmTileset);
    }
    if (this.ScreenSpaceEventHandler) {
      this.ScreenSpaceEventHandler.destroy();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.droneFollow = false;
    if (this.onTickHandler) {
      this.viewer.clock.onTick.removeEventListener(this.onTickHandler);
      this.onTickHandler = undefined;
    }
    this.viewer.trackedEntity = undefined;

    //Live Drone Unsub
    // this.liveDroneUnSubscribe.next();
    // this.liveDroneUnSubscribe.complete();
    // clearInterval(this.onGoingInterval);
    if (this.firstTrigger) clearInterval(this.firstTrigger);
  }
  initialFunction() {
    this.getOnGoingMissionsList(true);
    // this.checkForDataExchange();
  }
  // Handle mission details update
  handleMissionDetailsUpdate = (details) => {
    // Update mission details based on the received update
    if (details) {
      this.webSocketTrigger = details.TriggerId;
      this.webSocketLiveLog = details;
      this.updatedMissionLogs();
    }
  };
  stoplogs(MissionId) {
    if (this.onTickHandler) {
      this.viewer.clock.onTick.removeEventListener(this.onTickHandler);
      this.onTickHandler = undefined;
    }
    this.viewer.trackedEntity = undefined;
    this.droneFollow = false;
    this.mapLayersService.removeRPTOGeoZone(this.viewer);
    if (this.selectedMission === MissionId) {
      this.selectedMission = null;

      this.mapReset();
      const payload = {
        action: 'stop-taking-logs',
        triggerId: this.webSocketTrigger,
        authorityId: this.profileDetails.UserId,
      };
      this.webSocketService.sendMessage(payload);
    } else {
      this.selectedMission = MissionId;
      this.getSpecifiedMission(MissionId);
    }
  }
  getWeatherDetails(lat, long) {
    // this.webSocketService.getCurrentWeather(lat, long).then((res: any) => {
    //   this.currentWeatherDetails = res;
    //   this.responseCityName = res.name;
    // });
    let weatherAPIPayload = {
      latitude: lat,
      longitude: long,
    };
    this.authorityApi
      .getCurrentWeather_WeatherUnion(weatherAPIPayload)
      .then((res) => {
        let body = JSON.parse(res?.body);
        this.currentWeatherDetails = body;
        // this.cityName = body.name;
        this.responseCityName = body.name;
        return res;
        // this.currentWeatherDetails = res?.body;
        // this.responseCityName = res?.body.name;
      });
  }
  // Send mission ID to request mission details
  requestMissionDetails = (missionId?) => {
    let payload;
    if (missionId) {
      payload = {
        action: 'backend-to-authority',
        MissionId: missionId,
        authorityId: this.profileDetails.UserId,
      };
    }
    // console.log('payload', payload);

    // Send the payload to the WebSocket server
    if (payload) this.webSocketService.sendMessage(payload);
  };

  // OSM buildings
  // osmBuildings(val: any) {
  //   this.osmBuilding = val;
  //   if (this.osmBuilding) {
  //     this.osmTileset.show = true;
  //     this.viewer.terrainProvider = Cesium.createWorldTerrain();
  //     // this.viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
  //     //   url:
  //     //     'https://api.maptiler.com/tiles/terrain-quantized-mesh-v2?key=' +
  //     //     this.maptilerkey,
  //     // });
  //   } else {
  //     this.osmTileset.show = false;
  //     this.viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider(
  //       {}
  //     );
  //   }
  // }
  // popHeatmap(val: any): void {
  //   if (val) {
  //     this.imgLayer = this.viewer.imageryLayers.addImageryProvider(
  //       new Cesium.IonImageryProvider({ assetId: 2360681 })
  //     );
  //     this.viewer.zoomTo(this.imgLayer);
  //   } else {
  //     this.viewer.imageryLayers.remove(this.imgLayer);
  //   }
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
      //first off the osmBuildings
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
      if (this.missionDetail?.Longitude) {
        this.cesiumFunction?.loadWayPoints2D?.(
          this.viewer,
          this.missionDetail.Longitude,
          this.missionDetail.Latitude,
          this.missionDetail?.Altitude
        );
      }
    } else {
      // this.toggleflagText = '3D';
      this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
      if (this.missionDetail?.Longitude) {
        this.cesiumFunction?.loadWayPoints?.(
          this.viewer,
          this.missionDetail.Longitude,
          this.missionDetail.Latitude,
          this.missionDetail?.Altitude
        );
      }
      this.viewer.camera.lookUp(Cesium.Math.toRadians(10.0));
    }
  }

  //Get Ongoing Missions
  async getOnGoingMissionsList(initial?, mapReset?) {
    if (initial) {
      this.loader = true;
    }
    let payload = {
      Time: this.dateAndTimeFormat.dateAndTimeFormatting(
        new Date(),
        'dateAndTime'
      ),
      Role: this.profileDetails.Role,
      CountryCode: this.profileDetails.Country,
      UserId: this.profileDetails.UserId,
    };
    let upcomingPayload = {
      Time: this.dateAndTimeFormat.dateAndTimeFormatting(
        new Date(),
        'dateAndTime'
      ),
      CountryCode: this.profileDetails.Country,
      Role: this.profileDetails.Role,
      UserId: this.profileDetails.UserId,
      count: true,
    };
    const onGoingMissionPromise =
      this.authorityApi.getOnGoingMissionList(payload);
    const upcomingMissionPromise =
      this.authorityApi.getUpcomingMissionList(upcomingPayload);

    Promise.all([onGoingMissionPromise, upcomingMissionPromise])
      .then(async ([res, res2]: any[]) => {
        this.loader = false;
        let missionsList = [];
        missionsList = res.data.MainData.OnGoingMissionList;
        this.activeBuffers = res.data.MainData.OnGoingMissionList;

        this.activeAirspaceEntities = this.viewer.entities;
        this.activeAirspaceImageEntities = this.viewer.entities;

        let hubs = {};
        missionsList?.forEach((mission, index) => {
          if (mission.LiveStatus == 'Active' && mission?.Longitude) {
            let lngLat = mission.Longitude.map((val, index) => [
              val,
              mission.Latitude[index],
            ]);
            if (hubs.hasOwnProperty(mission.PlusCode)) {
              // hubs[mission.PlusCode] =
              hubs[mission.PlusCode].push(...lngLat);
            } else {
              hubs[mission.PlusCode] = lngLat;
            }
          }
        });
        this.cesiumFunction.removeEntities(this.viewer.entities, 'Hub ');
        // for (let hub in hubs) {
        //   if (hubs[hub].length > 1) {
        //     let line = turf.lineString(hubs[hub]);
        //     let bbox = turf.bbox(line);
        //     let bboxPolygon = turf.bboxPolygon(bbox);
        //     let scaledPoly: any = turf.transformScale(bboxPolygon, 1.1);
        //     console.log(scaledPoly,"scale");
        //     this.cesiumFunction.createHub(
        //       this.viewer,
        //       scaledPoly.geometry.coordinates[0].flat(),
        //       hub
        //     );
        //   }
        // }
        let payloads = {
          Hubs: hubs,
        };
        const result: any = await this.authorityApi
          .getHubs(payloads)
          .then((result) => result);
        if (result.data.MainData && result.data.MainData.length > 0) {
          for (let i = 0; i < result.data.MainData[0].length; i++) {
            let scale = result.data.MainData[i].ScaledPoly;
            let hub = result.data.MainData[i].ScaledPoly;
            this.cesiumFunction.createHub(
              this.viewer,
              scale.geometry.coordinates[0].flat(),
              hub
            );
          }
        }

        if (initial || mapReset) {

          this.onGoingMissionsList = res.data.MainData.OnGoingMissionList;
          this.previousOnGoingMissionsList = this.onGoingMissionsList;
          this.cesiumFunction.getActiveAirBufferSpaces(
            this.activeBuffers,
            this.activeAirspaceEntities,
            this.viewer
          );
          this.cesiumFunction.billboardForActiveAirspace(
            this.activeBuffers,
            this.activeAirspaceImageEntities,
            this.viewer
          );
        } else {
          if (!this.missionDetail) {
            this.onGoingMissionsList = missionsList;
            this.cesiumFunction.getActiveAirBufferSpaces(
              this.activeBuffers,
              this.activeAirspaceEntities,
              this.viewer
            );
            this.cesiumFunction.billboardForActiveAirspace(
              this.activeBuffers,
              this.activeAirspaceImageEntities,
              this.viewer
            );
          } else {
            //New Conditions to remove a specific viewed mission
            // if mission end and we are viewing it
            let selectedMissionsList = missionsList?.find(
              (mission) => this.missionDetail.MissionId === mission.MissionId
            );
            if (!selectedMissionsList) {
              let oldMissionIndex = this.onGoingMissionsList.findIndex(
                (mission) => this.missionDetail.MissionId === mission.MissionId
              );
              this.onGoingMissionsList.splice(oldMissionIndex, 1);
              if (this.onGoingMissionsList?.length == 0) {
                this.mapReset();
              } else {
                let newMission = this.onGoingMissionsList[0];
                this.onGoingMissionsList[0].IsOpen = true;
                this.missionDetail = newMission;
                this.latestMissionLogs = undefined;
                this.mapLayersService.removeRPTOGeoZone(this.viewer);
                this.getSpecifiedMission(newMission.MissionId, true);
              }
              if (this.onTickHandler) {
                this.viewer.clock.onTick.removeEventListener(
                  this.onTickHandler
                );
                this.onTickHandler = undefined;
              }
              this.viewer.trackedEntity = undefined;
              this.droneFollow = false;
              this.latestMissionLogs = undefined;
            }

            missionsList?.forEach((mission, index) => {
              if (this.missionDetail.MissionId != mission.MissionId) {
                let newMission = this.onGoingMissionsList.some(
                  (val) => val.MissionId === mission.MissionId
                );
                if (!newMission) {
                  this.onGoingMissionsList.push(mission);
                } else {
                  let updationIndex = this.onGoingMissionsList.findIndex(
                    (val) => val.MissionId === mission.MissionId
                  );
                  this.onGoingMissionsList[updationIndex] = mission;
                }
              }
            });

            this.onGoingMissionsList?.forEach((mission, index) => {
              if (this.missionDetail.MissionId != mission.MissionId) {
                let newMission = missionsList.some(
                  (val) => val.MissionId === mission.MissionId
                );
                if (!newMission) {
                  this.onGoingMissionsList.splice(index, 1);
                  this.mapLayersService.removeRPTOGeoZone(this.viewer);
                }
              }
            });

            // Modification in specific mission
            let specificMissionsList = missionsList.find(
              (mission) => this.missionDetail.MissionId === mission.MissionId
            );
            let onGoingMissionsListIndex = this.onGoingMissionsList.findIndex(
              (mission) => this.missionDetail.MissionId === mission.MissionId
            );
            if (onGoingMissionsListIndex != -1 && specificMissionsList) {
              if (
                this.onGoingMissionsList[onGoingMissionsListIndex].LiveStatus !=
                specificMissionsList.LiveStatus
              ) {
                if (specificMissionsList.LiveStatus == 'Active') {
                  this.onGoingMissionsList[
                    onGoingMissionsListIndex
                  ].LiveStatus = specificMissionsList.LiveStatus;
                  this.getSpecifiedMission(
                    specificMissionsList.MissionId,
                    true
                  );
                }
              }
            }

            let activeBuffers = [];
            if (this.missionDetail?.MissionId) {
              activeBuffers = this.activeBuffers.filter((val) => {
                if (val.MissionId != this.missionDetail?.MissionId) {
                  return val;
                }
              });
            }
            this.cesiumFunction.getActiveAirBufferSpaces(
              activeBuffers,
              this.activeAirspaceEntities,
              this.viewer
            );
            this.cesiumFunction.billboardForActiveAirspace(
              this.activeBuffers,
              this.activeAirspaceImageEntities,
              this.viewer
            );
          }
        }
        this.ongoingMissionCount = this.onGoingMissionsList?.length;
        this.ongoingMissionCountChange.emit(this.ongoingMissionCount);

        this.upcomingMissionCount = res2.data.MainData.UpcomingCount;
        this.upcomingMissionCountChange.emit(this.upcomingMissionCount);

        let latLongArr = [];
        if (this.onGoingMissionsList?.Latitude) {
          this.onGoingMissionsList.forEach((val) => {
            val.Latitude.forEach((lat, i) => {
              let latLong = { Latitude: lat, Longitude: val.Longitude[i] };
              latLongArr.push(latLong);
              return latLong;
            });
            val.LatLong = latLongArr;
          });
          this.previousOnGoingMissionsList = this.onGoingMissionsList;
        }
        this.toggleMissionDetailstab = true;
        // clearInterval(this.onGoingInterval);
        // this.onGoingInterval = setTimeout(() => {
        //   this.getOnGoingMissionsList();
        // }, 60000);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  droneDetails(id: any, missionId: any) {
    let payload = {
      DroneId: id,
    };
    this.authorityApi.getSingleDroneDetails(payload).then(
      (res) => {
        this.droneName = res['data']?.MainData?.UAVInfoType?.Value;
        this.onSpecificMissionCall();
        this.requestMissionDetails(missionId);
      },
      (err) => {}
    );
  }
  resetlogs() {
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Label');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'WayPoint');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'CustomLabel');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'BufferRegion');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Mission');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Drone Image');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Drone Boundary');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'BufferRegion2D');
    this.firstCall = false;
    this.removeDroneTrailPath();
    this.liveDronePath = undefined;
    this.latestMissionLogs = undefined;
    this.webSocketLiveLog = undefined;
    this.webSocketLastlog = undefined;
    this.webSocketTrigger = undefined;
    this.droneImageEntity = undefined;
    this.droneBufferEntity = undefined;
    this.droneBufferHierarchy = undefined;
    this.wpno = -1;
  }
  //View one specific mission details
  getSpecifiedMission(missionId, callMissionAPI?) {
    this.resetlogs();
    this.currentMission = this.missionDetail;

    if (
      this.missionDetail?.MissionId != missionId ||
      !this.missionDetail ||
      callMissionAPI
    ) {
      //Commented for dev purpose
      // this.missionDetail = this.onGoingMissionsList.find((val, index) => missionId == val.MissionId);

      // Added for dev purpose
      this.missionDetail = this.previousOnGoingMissionsList.find(
        (val, index) => missionId == val.MissionId
      );

      if (
        this.missionDetail?.Latitude &&
        this.missionDetail?.Latitude?.length != 1
      ) {
        this.getWeatherDetails(
          this.missionDetail?.Latitude[0],
          this.missionDetail?.Longitude[0]
        );
        this.cesiumFunction.missionFlyTo(
          this.viewer,
          this.missionDetail.Longitude,
          this.missionDetail.Latitude
        );
        if (this.missionDetail.GeoFence) {
          const positions = [];
          for (let i = 0; i < this.missionDetail.Longitude.length; i++) {
            positions.push(
              this.missionDetail.Longitude[i],
              this.missionDetail.Latitude[i],
              this.missionDetail.Altitude[i]
            );
          }

          this.mapLayersService.addRPTOGeoZone(
            this.viewer,
            positions,
            this.profileDetails?.GeoFence?.MaxAlt,
            true
          );
        } else {
          if (this.toggleFlag) {
            this.cesiumFunction.loadWayPoints2D(
              this.viewer,
              this.missionDetail.Longitude,
              this.missionDetail.Latitude,
              this.missionDetail?.Altitude
            );
          } else {
            this.cesiumFunction.loadWayPoints(
              this.viewer,
              this.missionDetail.Longitude,
              this.missionDetail.Latitude,
              this.missionDetail?.Altitude
            );
          }
          this.cesiumFunction.labelWaypoints(
            this.viewer,
            this.missionDetail.Longitude,
            this.missionDetail.Latitude,
            this.missionDetail?.Altitude,
            this.missionDetail.WayPointNum
          );
          if (
            this.missionDetail?.wayPointFileDetails?.length != 0 &&
            this.missionDetail?.wayPointFileDetails
          ) {
            this.cesiumFunction.customLabelWaypoints(
              this.viewer,
              this.missionDetail?.wayPointFileDetails,
              this.missionDetail?.Altitude
            );
          }
        }
      }
      if (this.missionDetail?.PermissionStatus) {
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
          let defaultCat = this.missionDetail?.PermissionStatus.some(
            (val) => val.Category == defaultVal.Category
          );
          if (!defaultCat)
            this.missionDetail?.PermissionStatus.push(defaultVal);
        });

        this.missionPermissionsList.forEach((modules) => {
          this.missionDetail?.PermissionStatus.forEach((permission) => {
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
      if (this.missionDetail?.Latitude && !this.missionDetail.GeoFence) {
        this.cesiumFunction.polylineVolume(
          this.viewer,
          this.missionDetail?.Longitude,
          this.missionDetail?.Latitude,
          this.missionDetail?.Altitude
        );
      }

      let activeBuffers = [];
      if (this.missionDetail?.MissionId) {
        activeBuffers = this.activeBuffers.filter((val) => {
          if (val.MissionId != this.missionDetail?.MissionId) {
            return val;
          }
        });
      }
      this.activeAirspaceEntities = this.viewer.entities;
      this.cesiumFunction.getActiveAirBufferSpaces(
        activeBuffers,
        this.activeAirspaceEntities,
        this.viewer
      );
      this.cesiumFunction.billboardForActiveAirspace(
        this.activeBuffers,
        this.activeAirspaceImageEntities,
        this.viewer
      );
      if (
        this.missionDetail?.LiveStatus &&
        this.missionDetail.LiveStatus == 'Active'
      ) {
        this.missionSection = 0;
        this.droneDetails(this.missionDetail.DroneId, missionId);
      } else {
        this.missionSection = 1;
        // this.showDrone = false;
      }
    }
  }
  onSpecificMissionCall() {
    this.firstCall = true;
    let activeBuffers = [];
    if (this.missionDetail?.MissionId) {
      activeBuffers = this.activeBuffers.filter((val) => {
        if (val.MissionId != this.missionDetail?.MissionId) {
          return val;
        }
      });
    }
    this.cesiumFunction.getActiveAirBufferSpaces(
      activeBuffers,
      this.activeAirspaceEntities,
      this.viewer
    );
    this.cesiumFunction.billboardForActiveAirspace(
      this.activeBuffers,
      this.activeAirspaceImageEntities,
      this.viewer
    );
  }
  updatedMissionLogs() {
    if (this.webSocketLiveLog?.wpno > this.wpno) {
      this.wpno = this.webSocketLiveLog?.wpno;
      this.getWeatherDetails(
        this.webSocketLiveLog?.lat,
        this.webSocketLiveLog?.lng
      );
    }

    if (!this.droneBufferEntity) {
      this.droneImageFlag = true;
      this.latestMissionLogs = this.webSocketLiveLog;
      this.liveLatitude = this.latestMissionLogs?.lat;
      this.liveLongitude = this.latestMissionLogs?.lng;
      this.liveAltitude = this.latestMissionLogs?.alt;
      this.nav_bearing = this.latestMissionLogs?.nav_bearing
        ? this.latestMissionLogs?.nav_bearing
        : 90;
      this.nav_pitch = this.latestMissionLogs?.nav_pitch
        ? this.latestMissionLogs?.nav_pitch
        : 0;
      this.nav_roll = this.latestMissionLogs?.nav_roll
        ? this.latestMissionLogs?.nav_roll
        : 0;
      // drone buffer
      if (this.liveLatitude !== 0 && this.liveLongitude !== 0) {
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
        // drone image
        if (
          this.droneName == 'Fixed Wing' ||
          this.droneName == 'Hybrid e-VTOL'
        ) {
          [this.droneImageEntity, this.positionProperty] =
            this.cesiumFunction.NewFixedWingdroneImages3D(
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
            this.cesiumFunction.NewdroneImages3D(
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
      this.liveDronePath = {
        longitude: this.liveLongitude,
        latitude: this.liveLatitude,
        altitude: this.liveAltitude,
      };
    }
    if (this.webSocketLiveLog) {
      this.droneImageFlag = true;
      if (this.webSocketLiveLog?.lat && this.webSocketLiveLog?.lng) {
        this.latestMissionLogs = this.webSocketLiveLog;
        this.liveLatitude = this.latestMissionLogs.lat;
        this.liveLongitude = this.latestMissionLogs.lng;
        this.liveAltitude = this.latestMissionLogs.alt;

        this.nav_bearing = this.latestMissionLogs?.nav_bearing
          ? this.latestMissionLogs?.nav_bearing
          : 90;
        this.nav_pitch = this.latestMissionLogs?.nav_pitch
          ? this.latestMissionLogs?.nav_pitch
          : 0;
        this.nav_roll = this.latestMissionLogs?.nav_roll
          ? this.latestMissionLogs?.nav_roll
          : 0;

        if (this.liveLatitude !== 0 && this.liveLongitude !== 0) {
          // Update the drone buffer  position
          if (this.droneBufferHierarchy && this.droneBufferEntity) {
            this.cesiumFunction.updatedroneBuffer3D(
              this.droneBufferEntity,
              this.liveLatitude,
              this.liveLongitude,
              this.liveAltitude,
              this.latestMissionLogs?.Deconfliction?.Deconfliction ||
                this.latestMissionLogs?.DroneLeftItsBufferRegion,
              this.droneBufferHierarchy
            );
          }
          // update the drone image
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

          if (this.liveDronePath) {
            const positions = [
              this.liveDronePath.longitude,
              this.liveDronePath.latitude,
              this.liveDronePath.altitude,
              this.liveLongitude,
              this.liveLatitude,
              this.liveAltitude,
            ];
            setTimeout(() => {
              this.cesiumFunction.activeDroneTrailing(this.viewer, positions);
            }, 300);
          }
          this.liveDronePath = {
            longitude: this.liveLongitude,
            latitude: this.liveLatitude,
            altitude: this.liveAltitude,
          };

          // let positions = [];

          // var cartographic = Cesium.Cartographic.fromDegrees(
          //   this.liveLongitude,
          //   this.liveLatitude,
          //   this.liveAltitude
          // );
          // positions.push(cartographic);
          // Cesium.sampleTerrain(this.viewer.terrainProvider, 11, positions).then(
          //   (samples) => {
          //     samples.forEach((cartographic, index) => {
          //       this.terrainAlt = cartographic.height;
          //     });
          //   }
          // );
        }
      }
    }
  }

  // getColorBasedOnAltitude(altitude) {
  //   // Define your color logic based on altitude range
  //   // Example: Set color to red for altitudes above 1000 meters, green for altitudes between 500-1000 meters, and blue for altitudes below 500 meters
  //   let altitudeColor = Cesium.Color.fromAlpha(Cesium.Color.BLUE, 1);
  //   if (altitude < 0) {
  //     altitudeColor = Cesium.Color.fromAlpha(Cesium.Color.BLUE, 0.4);
  //   } else if (altitude < 30) {
  //     altitudeColor = Cesium.Color.fromAlpha(Cesium.Color.BLUE, 0.6);
  //   } else if (altitude < 60) {
  //     altitudeColor = Cesium.Color.fromAlpha(Cesium.Color.BLUE, 0.8);
  //   } else if (altitude < 90) {
  //     altitudeColor = Cesium.Color.fromAlpha(Cesium.Color.BLUE, 1);
  //   }

  //   return altitudeColor;
  // }

  //Map Resetting
  mapReset() {
    this.cesiumFunction.setView(this.viewer);
    this.removeDroneTrailPath();
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Label');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'WayPoint');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'CustomLabel');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'BufferRegion');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Mission');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Drone Image');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Drone Boundary');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'BufferRegion2D');

    this.missionDetail = undefined;
    this.activeBuffers = [];
    this.currentMission = undefined;
    this.getOnGoingMissionsList(undefined, true);
  }

  //Angular Cesium func
  getBackgroundColor(plane) {
    return new Cesium.Color(0.048, 0.086, 0.175, 0.8);
    // return Cesium.Color.ROYALBLUE;
  }

  //RemoveDroneTrailPath when changing to another mission
  removeDroneTrailPath() {
    this.liveDronePath = undefined;
    const ente = this.viewer;
    const removeEntries = ente.entities[`_entities`]['_array'].filter(
      (entity) => entity.name == 'Live Drone Path'
    );
    removeEntries.forEach((entity) => {
      this.cesiumFunction.removeEntities(ente.entities, entity.id);
    });
  }
  //TrackDrone
  TrackDrone() {
    const distanceFromCamera = 1000;

    if (!this.droneFollow && this.droneImageEntity) {
      // this.cesiumFunction.flyToLocation(
      //   this.viewer,
      //   this.liveLongitude,
      //   this.liveLatitude
      // );

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

  //Template card
  close(val) {
    this.isView = false;
  }

  //for map layer cards
  onClickonMaps() {
    this.ScreenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
    this.ScreenSpaceEventHandler.setInputAction((input) => {
      this.mapLayersService
        .onclickmapui(input, this.viewer)
        .then((res: any) => {
          if (res) {
            this.entityDescription = res;
            this.isView = true;
          }
        });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  getZoneData(){
    this.activeAirspaceEntities = this.viewer.entities;
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
}
