import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import * as echarts from 'echarts';
import * as turf from '@turf/turf';

import { AuthorityApplicationComponent } from '../authority-application.component';
import { ActivatedRoute } from '@angular/router';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
@Component({
  selector: 'app-authority-preflight-report',
  templateUrl: './authority-preflight-report.component.html',
  styleUrls: ['./authority-preflight-report.component.scss'],
})
export class AuthorityPreflightReportComponent
  implements OnInit, AfterViewInit
{
  profileDetails: any;
  missionId: any;
  missionDetails: any;
  missionPermissionsList: any;
  type: string;
  weatherDetails: any;
  viewer: any;
  activeAirspaceEntities: any;
  mapScreenshotURL: any;

  //Elevation graph
  chartOption: echarts.EChartsOption;
  latGraph: any = [];
  longGraph: any = [];
  altGraph: any = [];
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  chartImg: any;
  constructor(
    private route: ActivatedRoute,
    private authorityApplicationComponent: AuthorityApplicationComponent,
    private authorityApi: AuthorityapisService,
    private cesiumFunction: CesiumFunctionService,
    private mapLayersService: MapLayersService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.missionId = params['missionId'];
    });
    this.profileDetails = this.authorityApplicationComponent.getDecryptData();
    this.getmissionDetails();
  }
  ngAfterViewInit() {
    this.viewer = this.mapLayersService.getViewer();
  }

  getmissionDetails() {
    let payload = {
      MissionId: this.missionId,
    };

    this.authorityApi.getMissionInfo(payload).then((res: any) => {
      this.missionDetails = res.data.MainData;
      this.type = this.missionDetails.IntersectionType.replace(
        ' ',
        ''
      ).toLowerCase();
      let initialPos = [];
      this.missionDetails.Longitude.forEach((val, index) => {
        initialPos.push(
          Cesium.Cartesian3.fromDegrees(
            val,
            this.missionDetails.Latitude[index]
          )
        );
      });

      this.flyTo(
        this.missionDetails.Longitude,
        this.missionDetails.Latitude,
        this.missionDetails
      );
      this.getWeather(this.missionDetails);
      if (this.missionDetails.Latitude.length != 1) {
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
        this.getActiveAirBufferSpaces(this.missionDetails);
        this.getElevationData(
          this.missionDetails.Latitude,
          this.missionDetails.Longitude,
          this.missionDetails?.Altitude
        );
        let entity;
        if (
          this.missionDetails?.OperationName.includes('MissionWP') &&
          this.missionDetails?.Longitude.length <= 2
        ) {
          entity = this.cesiumFunction.bufferRegion(
            this.viewer,
            this.missionDetails?.BufferRegion
          );
        } else {
          entity = this.cesiumFunction.polylineVolume(
            this.viewer,
            this.missionDetails?.Longitude,
            this.missionDetails?.Latitude,
            this.missionDetails?.Altitude
          );
        }
      }
    });
  }
  missionPermissionTrackBy(permission: any) {
    return permission.module;
  }

  async getWeather(missionDetails: any) {
    try {
      // this.weatherDetails = await this.authorityApi.getCurrentWeather(
      //   missionDetails.Latitude[0],
      //   missionDetails.Longitude[0]
      // );
      let weatherAPIPayload = {
        latitude: missionDetails.Latitude[0],
        longitude: missionDetails.Longitude[0],
      };
      this.authorityApi
        .getCurrentWeather_WeatherUnion(weatherAPIPayload)
        .then((res) => {
          this.weatherDetails = res?.body;
          let body = JSON.parse(res?.body);
          this.weatherDetails = body;
          // this.cityName = body.name;
          // this.responseCityName = body.name;
          return res;
        });
    } catch (error) {
      console.log('error');
    }
  }
  getActiveAirBufferSpaces(missionDetails) {
    let payload = {
      StartTime: missionDetails.StartTime,
      EndTime: missionDetails.EndTime,
    };
    this.activeAirspaceEntities = this.viewer.entities;
    this.authorityApi
      .getActiveBufferRegions(payload)
      .then((res: any) => {
        let activeBuffers = res.data.MainData;
        activeBuffers = activeBuffers.filter((val) => {
          if (val.MissionId != missionDetails.MissionId) {
            return val;
          }
        });

        this.cesiumFunction.getActiveAirBufferSpaces(
          activeBuffers,
          this.activeAirspaceEntities
        );
      })
      .catch((err) => {});
  }
  flyTo(LongitudeArr, LatitudeArr, missionDetails) {
    // Calculate the bounding rectangle of waypoints
    let minLongitude = Math.min(...LongitudeArr);
    let maxLongitude = Math.max(...LongitudeArr);
    let minLatitude = Math.min(...LatitudeArr);
    let maxLatitude = Math.max(...LatitudeArr);

    // Calculate the center of the bounding rectangle
    let centerLongitude = (minLongitude + maxLongitude) / 2;
    let centerLatitude = (minLatitude + maxLatitude) / 2;

    let radius =
      Math.max(maxLongitude - minLongitude, maxLatitude - minLatitude) * 0.5;

    // Get the dimensions of the viewer's canvas (screen)
    let canvasWidth = this.viewer.canvas.clientWidth;
    let canvasHeight = this.viewer.canvas.clientHeight;

    // Calculate the radius of the canvas (distance from center to corner)
    let canvasRadius = Math.sqrt(
      Math.pow(canvasWidth * 0.5, 2) + Math.pow(canvasHeight * 0.5, 2)
    );

    // Calculate the zoom ratio based on the canvas radius and waypoint radius
    let zoomRatio = radius / canvasRadius;

    // Adjust the camera altitude based on the calculated zoom ratio
    let cameraDestination = Cesium.Cartesian3.fromDegrees(
      centerLongitude,
      centerLatitude,
      this.viewer.camera.positionCartographic.height * zoomRatio * 50
    );
    let complete = false;
    // Fly to the calculated destination
    this.viewer.camera.flyTo({
      destination: cameraDestination,
      complete: () => {
        complete = true;
      },
    });

    // Check for completion and trigger screenshot and reportGeneration
    let screenshotInterval = setInterval(() => {
      if (complete && this.viewer.scene.globe.tilesLoaded) {
        clearInterval(screenshotInterval); // Clear the interval to stop further checks
        const chart = echarts.init(this.chartContainer.nativeElement);
        var snapshotImage = new Image();
        snapshotImage.src = chart.getDataURL();
        this.chartImg = snapshotImage.src;
        // Capture screenshot
        this.viewer.render();
        this.mapScreenshotURL = this.viewer.canvas.toDataURL();
        this.viewer.destroy();
        // Delay before reportGeneration
      }
    }, 400);
  }

  async getElevationData(latGraph, longGraph, altGraph) {
    let elevationData = [];
    let distances = [];
    let droneHeight = [];
    let maxElevation;
    const coordinates = [];
    let dist: any = 0;

    for (let i = 0; i < latGraph.length; i++) {
      const coordinate = {
        latitude: latGraph[i],
        longitude: longGraph[i],
      };
      coordinates.push(coordinate);
    }

    try {
      if (coordinates.length !== 0) {
        const response: any = await this.authorityApi.getElevation(coordinates);

        elevationData = response.data.MainData;
      }
      maxElevation = Math.max(...elevationData);

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
      for (let i = 0; i < altGraph.length; i++) {
        droneHeight[i] = maxElevation + altGraph[i];
      }
      if (
        coordinates[coordinates.length - 1] ===
        coordinates[coordinates.length - 2]
      ) {
        elevationData.pop();
        droneHeight.pop();
        distances.pop();
      }

      this.initBasicAreaEcharts(elevationData, droneHeight, distances);
    } catch (error) {
      console.log('err', error);
    }
  }

  initBasicAreaEcharts(elevationData, droneHeight, distances) {
    this.chartOption = {
      grid: {
        top: '10%',
        left: '10%',
        right: '10%',
        bottom: '16%',
        containLabel: true,
      },
      backgroundColor: '#100C2A',
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
          name: 'Terrain Altitude(m) from Sea Level',
          type: 'line',
          symbol: 'circle',
          stack: 'a',
          symbolSize: 5,
          sampling: 'average',
          itemStyle: {
            color: '#0770FF',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(58,77,233,0.8)',
              },
              {
                offset: 1,
                color: 'rgba(58,77,233,0.3)',
              },
            ]),
          },
          data: elevationData,
        },
        {
          name: 'Drone Altitude(m) with respect to ground',
          type: 'line',
          symbol: 'circle',
          symbolSize: 5,
          sampling: 'average',
          itemStyle: {
            color: '#F2597F',
          },
          data: droneHeight,
        },
      ],
    };
  }
}
