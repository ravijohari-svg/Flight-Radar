import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import { CustomerapisService } from 'src/app/custom-services/customer/customerapis.service';
import * as turf from '@turf/turf';
import { environment } from 'src/environments/environment';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss'],
  providers: [],
})
export class CustomerDashboardComponent implements OnInit {
  // Angular cesium
  viewer;
  mapIdObj = {
    mapId: 'customer-dashboard',
    containerId: 'customer-dashboard-container',
  };
  // Loader
  loader;
  // Missions
  //Specific Mission Details
  missionDetail;
  currentMission;

  //Whole Mission List;
  onGoingMissionsList;
  missionSection;

  //Active airspace - Buffer region
  activeBufferVisibility = true;
  activeBufferRegion;
  activeBuffers = [];
  activeAirspaceEntities;

  //Real-time
  onGoingInterval;
  previousOnGoingMissionsList = [];
  onGoingIntervalTiming = 3000;
  droneImageEntity;

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

  // 3d Drone image
  nav_bearing;
  nav_pitch;
  nav_roll;

  //initial Mission Logs
  initialLogs;
  //Latest Mission Logs
  latestMissionLogs;

  initialMissionLogs;

  //Time Intervals
  updatedMissionsApiCall;

  // Complaince
  missionPermissionsList;

  private unSubscribe = new Subject();

  // Mapbox
  mapBoxKey = environment.mapBoxKey;

  providerViewModels = [
    new Cesium.ProviderViewModel({
      name: 'Dark',
      // iconUrl: Cesium.buildModuleUrl("path_to_an_icon_image"),
      iconUrl: '../../../../assets/common-layout/darkMap.png',
      tooltip: 'Mapbox Dark Theme imagery',
      creationFunction: () => {
        return new Cesium.UrlTemplateImageryProvider({
          url:
            `https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=` +
            this.mapBoxKey,
        });
      },
    }),
    new Cesium.ProviderViewModel({
      name: 'Light',
      // iconUrl: Cesium.buildModuleUrl("path_to_an_icon_image"),
      tooltip: 'Mapbox Light Theme imagery',
      iconUrl: '../../../../assets/common-layout/grey.png',
      creationFunction: () => {
        return new Cesium.UrlTemplateImageryProvider({
          url:
            `https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=` +
            this.mapBoxKey,
        });
      },
    }),
  ];

  constructor(
    private cesiumFunction: CesiumFunctionService,
    private dateAndTimeFormat: DateTimeFormatService,
    private customerApi: CustomerapisService,
    private mapLayersService:MapLayersService
  ) {
    this.viewer = this.mapLayersService.getViewer();
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.viewer.animation.container.style.visibility = 'hidden';
      this.viewer.timeline.container.style.visibility = 'hidden';
      // this.cesiumFunction.set3DTunnelView(this.viewer);
      // this.cesiumFunction.loadBingWithLabels(this.viewer);
      this.cesiumFunction.removeTimelineAndClock(this.viewer);
      this.getOnGoingMissionsList();
    }, 500);
  }
  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

  //Get Ongoing Missions
  getOnGoingMissionsList(initial?, mapReset?) {
    if (initial) {
      this.loader = true;
    }
    let payload = {
      Time: this.dateAndTimeFormat.dateAndTimeFormatting(
        new Date(),
        'dateAndTime'
      ),
    };
    this.customerApi.getOnGoingMissionList(payload).subscribe(
      (res) => {
        this.loader = false;
        res.data.MainData?.OnGoingMissionList.forEach((onGoingMission) => {
          onGoingMission.DistanceBtwnPoints = [];
          onGoingMission.totalDistance = 0;
          onGoingMission.Latitude.forEach((lat, index) => {
            if (index < onGoingMission.Latitude.length - 1) {
              let from = turf.point([lat, onGoingMission.Longitude[index]]);
              let to = turf.point([
                onGoingMission.Latitude[index + 1],
                onGoingMission.Longitude[index + 1],
              ]);
              let distance = turf.distance(from, to);
              onGoingMission.DistanceBtwnPoints.push(distance);
              onGoingMission.totalDistance =
                onGoingMission.totalDistance + distance;
            }
          });
          onGoingMission.totalDistance *= 1000;
        });
        let missionsList = [];
        missionsList = res.data.MainData.OnGoingMissionList;
        this.activeBuffers = res.data.MainData.OnGoingMissionList;
        this.activeAirspaceEntities = this.viewer.entities;
        if (initial || mapReset) {
          this.onGoingMissionsList = res.data.MainData.OnGoingMissionList;
          this.previousOnGoingMissionsList = this.onGoingMissionsList;
          this.cesiumFunction.getActiveAirBufferSpaces(
            this.activeBuffers,
            this.activeAirspaceEntities,
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
          } else {
            //New Conditions to remove a specific viewed mission
            let selectedMissionsList = missionsList.find(
              (mission) => this.missionDetail.MissionId === mission.MissionId
            );
            if (!selectedMissionsList) {
              let oldMissionIndex = this.onGoingMissionsList.findIndex(
                (mission) => this.missionDetail.MissionId === mission.MissionId
              );
              this.onGoingMissionsList.splice(oldMissionIndex, 1);
              if (this.onGoingMissionsList.length == 0) {
                this.mapReset();
              } else {
                let newMission = this.onGoingMissionsList[0];
                this.onGoingMissionsList[0].IsOpen = true;
                this.missionDetail = newMission;
                this.getSpecifiedMission(newMission.MissionId, true);
              }
            }

            missionsList.forEach((mission, index) => {
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

            this.onGoingMissionsList.forEach((mission, index) => {
              if (this.missionDetail.MissionId != mission.MissionId) {
                let newMission = missionsList.some(
                  (val) => val.MissionId === mission.MissionId
                );
                if (!newMission) {
                  this.onGoingMissionsList.splice(index, 1);
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
          }
        }

        let latLongArr = [];
        this.onGoingMissionsList.forEach((val) => {
          val.Latitude.forEach((lat, i) => {
            let latLong = { Latitude: lat, Longitude: val.Longitude[i] };
            latLongArr.push(latLong);
            return latLong;
          });
          val.LatLong = latLongArr;
        });
        this.previousOnGoingMissionsList = this.onGoingMissionsList;

        clearTimeout(this.onGoingInterval);
        this.onGoingInterval = setTimeout(() => {
          this.getOnGoingMissionsList();
        }, 60000);
      },
      (err) => {
        this.loader = false;
      }
    );
  }

  //View one specific mission details
  getSpecifiedMission(missionId, callMissionAPI?) {
    this.currentMission = this.missionDetail;
    this.latestMissionLogs = undefined;
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
      // this.cesiumFunction.highAltitudeFlyTo(
      //   this.viewer,
      //   this.missionDetail.Longitude,
      //   this.missionDetail.Latitude
      // );
      this.cesiumFunction.removeEntities(this.viewer.entities, 'Label');
      this.cesiumFunction.removeEntities(this.viewer.entities, 'CustomLabel');
      this.cesiumFunction.removeEntities(this.viewer.entities, 'BufferRegion');
      this.cesiumFunction.removeEntities(this.viewer.entities, 'Mission');
      this.cesiumFunction.removeEntities(this.viewer.entities, 'Drone Image');

      if (this.missionDetail?.Latitude.length != 1) {
        this.cesiumFunction.loadWayPoints(
          this.viewer,
          this.missionDetail.Longitude,
          this.missionDetail.Latitude,
          this.missionDetail?.Altitude
        );
        this.cesiumFunction.labelWaypoints(
          this.viewer,
          this.missionDetail.Longitude,
          this.missionDetail.Latitude,
          this.missionDetail?.Altitude,
          this.missionDetail.WayPointNum
        );
        if (
          this.missionDetail?.wayPointFileDetails.length !== 0 &&
          this.missionDetail?.wayPointFileDetails
        ) {
          this.cesiumFunction.customLabelWaypoints(
            this.viewer,
            this.missionDetail?.wayPointFileDetails,
            this.missionDetail?.Altitude
          );
        }
        // if (this.missionDetail?.wayPointFileDetails) {
        //   this.modifyWayPointFile(this.missionDetail?.wayPointFileDetails);
        // }
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
      let entity;
      if (
        this.missionDetail?.OperationName.includes('MissionWP') &&
        this.missionDetail?.Longitude.length <= 2
      ) {
        entity = this.cesiumFunction.bufferRegion(
          this.viewer,
          this.missionDetail?.BufferRegion
        );
      } else {
        entity = this.cesiumFunction.polylineVolume(
          this.viewer,
          this.missionDetail?.Longitude,
          this.missionDetail?.Latitude,
          this.missionDetail?.Altitude
        );
      }
      this.cesiumFunction.zoomEntity(this.viewer, entity,this.missionDetail?.BufferRegion);

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

      if (this.missionDetail.LiveStatus == 'Active') {
        this.missionSection = 0;
        // this.showDrone = true;
        if (this.firstTrigger) clearInterval(this.firstTrigger);
        this.firstTrigger = setInterval(() => {
          this.onSpecificMissionCall(this.missionDetail.MissionId);
        }, 3000);
      } else {
        this.missionSection = 1;
        // this.showDrone = false;
      }
    } else if (this.missionDetail?.MissionId == missionId) {
      this.mapReset();
    }
  }
  onSpecificMissionCall(MissionId) {
    let Firstpayload = {
      MissionId: MissionId,
    };
    this.customerApi.getRespectiveMissionLogs(Firstpayload).subscribe(
      (res) => {
        this.loader = false;
        if (res.data.MainData[0].RealTimeLogs[0]) {
          if (this.firstTrigger) {
            clearInterval(this.firstTrigger);
          }
          this.droneImageFlag = true;
          this.initialLogs = res.data.MainData[0];
          this.initialLogs.RealTimeLogs = this.initialLogs.RealTimeLogs.flat();
          this.latestMissionLogs = this.initialLogs.RealTimeLogs[0];

          this.liveLatitude = this.latestMissionLogs?.lat;
          this.liveLongitude = this.latestMissionLogs?.lng;
          this.liveAltitude = this.latestMissionLogs?.alt;
          this.nav_bearing = this.latestMissionLogs?.nav_bearing;
          this.nav_pitch = this.latestMissionLogs?.nav_pitch;
          this.nav_roll = this.latestMissionLogs?.nav_roll;

          this.latestMissionLogs.ETA = this.getETAValue(
            this.missionDetail.totalDistance,
            this.latestMissionLogs.distTraveled,
            10
          );

          this.droneImageEntity = this.cesiumFunction.droneImages3D(
            this.viewer,
            this.liveLatitude,
            this.liveLongitude,
            this.liveAltitude,
            this.nav_bearing,
            this.nav_pitch,
            this.nav_roll
          );

          if (this.updatedMissionsApiCall)
            clearInterval(this.updatedMissionsApiCall);
          this.updatedMissionsApiCall = setInterval(() => {
            this.updatedMissionLogs();
          }, 3000);
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
      },
      (err) => {
        this.loader = false;
      }
    );
  }
  //API calls for getting updated mission logs
  updatedMissionLogs() {
    let Firstpayload = {
      TriggerId: this.latestMissionLogs?.TriggerId,
      LastLogTime: this.latestMissionLogs?.TS_Created,
    };
    this.customerApi.getUpdatedMissionLogs(Firstpayload).subscribe((res) => {
      if (res.data.MainData.RealTimeLogs[0]) {
        this.droneImageFlag = true;
        //  this.initialMissionLogs = res.data.MainData.RealTimeLogs[0];
        // let lat = [34.45, 25.456, 26.234, 30.566];
        // let lng = [74.45, 74.456, 74.234, 74.566];
        let realTimeLogs = res.data.MainData.RealTimeLogs.flat();
        if (realTimeLogs[0]?.lat && realTimeLogs[0]?.nav_bearing) {
          this.latestMissionLogs = realTimeLogs[0];
          this.liveLatitude = this.latestMissionLogs.lat;
          this.liveLongitude = this.latestMissionLogs.lng;
          this.liveAltitude = this.latestMissionLogs.alt;
          this.nav_bearing = this.latestMissionLogs.nav_bearing;
          this.nav_pitch = this.latestMissionLogs.nav_pitch;
          this.nav_roll = this.latestMissionLogs.nav_roll;

          this.latestMissionLogs.ETA = this.getETAValue(
            this.missionDetail.totalDistance,
            this.latestMissionLogs.distTraveled,
            10
          );
          this.cesiumFunction.updateDroneImage3D(
            this.liveLatitude,
            this.liveLongitude,
            this.liveAltitude,
            this.nav_bearing,
            this.nav_pitch,
            this.nav_roll,
            this.droneImageEntity
          );
          // this.cesiumFunction.droneImages3D(this.mapsManagerService,this.liveLatitude,this.liveLongitude,this.liveAltitude,this.nav_bearing,this.nav_pitch,this.nav_roll);
          let positions = [];

          var cartographic = Cesium.Cartographic.fromDegrees(
            this.liveLongitude,
            this.liveLatitude,
            this.liveAltitude
          );
          positions.push(cartographic);
          Cesium.sampleTerrain(this.viewer.terrainProvider, 11, positions).then(
            (samples) => {
              samples.forEach((cartographic, index) => {
                this.terrainAlt = cartographic.height;
              });
            }
          );
        }
      }
    });
  }
  getETAValue(totalDistance, distTraveled, speed) {
    let eta = (totalDistance - distTraveled) / speed;
    if (eta < 0) {
      return 0;
    } else {
      return eta / 60;
    }
  }

  //Map Resetting
  mapReset() {
    clearInterval(this.updatedMissionsApiCall);
    this.unSubscribe.next();
    this.unSubscribe.complete();
    this.cesiumFunction.setView(this.viewer);
    this.cesiumFunction.removeEntities(this.viewer.entities, 'WayPoint');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Label');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'CustomLabel');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'BufferRegion');
    this.cesiumFunction.removeEntities(this.viewer.entities, 'Drone Image');

    this.missionDetail = undefined;
    this.activeBuffers = undefined;
    this.currentMission = undefined;
    this.getOnGoingMissionsList(undefined, true);
  }
}
