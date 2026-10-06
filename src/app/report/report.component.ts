import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import { MapLayersService } from '../custom-services/common/map-layers.service';
import { ReportService } from './report.service';
import * as echarts from 'echarts';
import * as turf from '@turf/turf';
import { CesiumFunctionService } from '../custom-services/common/cesium-function.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import html2PDF from 'jspdf-html2canvas';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit, AfterViewInit {
  viewer;
  activeAirspaceEntities: import('cesium').EntityCollection;
  mapLayersModule: any;
  mapLayers = [];
  profileDetails: any;
  user: string;

  geojsonDataSourceIndiaBoundary = new Cesium.GeoJsonDataSource();
  geojsonDataSourceGeoFenceIndia = new Cesium.GeoJsonDataSource();
  entitiesOfRestrictedAreasIndia = [];
  mapScreenshotURL: any;
  chartOption;
  chartImg: string;
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  missionDetails: any;
  missionId: any;
  reportType;
  blackBoxDetails: any[];
  preFlightDetails: any[];
  inFlightDetails: any[];
  postFlightDetails: any[];
  distanceDetails: any;
  height;
  weatherDetails;

  //INtersection type
  type;

  reportValues;

  //RXJS Subscriptions
  private unSubscribe = new Subject<void>();

  //Base64 format
  base64Report;

  completed;

  constructor(
    private mapLayerService: MapLayersService,
    private api: ReportService,
    private cesiumFunction: CesiumFunctionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(async (params) => {
        this.missionId = atob(params['missionId']);
        this.reportType = atob(params['reportType']);
        // console.log(missionURLDecrypt,reportTypeURLDecrypt);
        // this.missionId = await CryptoJS.AES.decrypt(
        //   String(missionURLDecrypt),
        //   environment.reportKey
        // ).toString(CryptoJS.enc.Utf8);
        // this.reportType = await CryptoJS.AES.decrypt(
        //   String(reportTypeURLDecrypt),
        //   environment.reportKey
        // ).toString(CryptoJS.enc.Utf8);
        console.log(this.missionId, this.reportType);
      });

    // let encrypt = await CryptoJS.AES.encrypt(
    //   'Mission04624',
    //   environment.reportKey
    // );
    // console.log(encrypt,'encrypt')
    // let urlEncrypt = btoa(encrypt);
    // console.log(urlEncrypt,'urlEncrypt');

    // let urlDdecrypt = atob(urlEncrypt);
    // console.log(urlDdecrypt,'urlDdecrypt');
    // let decrypt = await CryptoJS.AES.decrypt(
    //   String(urlDdecrypt),
    //   environment.reportKey
    // ).toString(CryptoJS.enc.Utf8);

    // console.log(decrypt,'decrypt');
    // let encrydata = CryptoJS.AES.encrypt(
    //   'Postflight',
    //   environment.reportKey
    // );
    // let encryData = encrydata.toString();
    // console.log(encryData,'encryData')
  }

  ngAfterViewInit(): void {
    if (environment.production == false) {
      const viewerOptions: any = this.mapLayerService.ViewerOptionDev;
      this.viewer = new Cesium.Viewer('cesium-container', {
        ...viewerOptions,
        requestRenderMode: true,
        maximumRenderTimeChange: Infinity,
        contextOptions: {
          webgl: { preserveDrawingBuffer: true },
        },
      });
    }
    if (environment.production == true) {
      const viewerOptions: any = this.mapLayerService.viewerOptionProd;
      this.viewer = new Cesium.Viewer('cesium-container', {
        ...viewerOptions,
        requestRenderMode: true,
        maximumRenderTimeChange: Infinity,
        contextOptions: {
          webgl: { preserveDrawingBuffer: true },
        },
      });
    }
    this.initialFunction();
  }

  ngOnDestroy() {
    //Subject unsubscription
    this.unSubscribe.next();
    this.unSubscribe.complete();
    // setTimeout(() => {
    // this.viewer.destroy();
    // },10000);
  }
  async initialFunction() {
    this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    this.viewer.animation.container.style.visibility = 'hidden';
    this.viewer.timeline.container.style.visibility = 'hidden';
    this.activeAirspaceEntities = this.viewer.entities;
    await this.getMapLayersCountry(this.viewer);
    if (this.missionId) {
      await this.getmissionDetails(); // Calls mission detail API
      if (this.reportType == 'Postflight') await this.onMissionDetail();
    }
  }
  getmissionDetails() {
    let payload = {
      MissionId: this.missionId,
    };
    this.api.getMissionInfo(payload).then(async (res: any) => {
      this.reportValues = true;
      this.missionDetails = res.data.MainData;
      await this.getWeather(this.missionDetails);
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
      let entity;
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
        await this.getElevationData(
          this.missionDetails.Latitude,
          this.missionDetails.Longitude,
          this.missionDetails?.Altitude
        );

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
      this.flyTo(
        this.missionDetails.Longitude,
        this.missionDetails.Latitude,
        this.missionDetails,
        entity
        // entity
      );
    });
  }
  // Blackbox details
  onMissionDetail() {
    let payload = {
      MissionId: this.missionId,
    };
    this.api.postflightMissionDetails(payload).then(
      (res: any) => {
        let blackBoxDetails = res?.data?.MainData;
        this.distanceDetails = {
          distance: (~~blackBoxDetails?.distanceTraveled).toFixed(2),
          time: (blackBoxDetails?.totalHours / (3600 * 1000)).toFixed(2),
        };
        this.preFlightDetails = blackBoxDetails?.preFlightDetails;
        this.inFlightDetails = blackBoxDetails?.inFlightDetails;
        this.postFlightDetails = blackBoxDetails?.postFlightDetails;
      },
      (err) => {
        this.blackBoxDetails = [];
      }
    );
  }
  getMapLayersCountry(viewer) {
    this.mapLayersModule = [
      'NoFlyZone',
      'GeoZone',
      'FIC',
      'InnerYellowZone',
      'OuterYellowZone',
    ];
    if (this.mapLayersModule?.length != 0) {
      this.getSingleMapLayers();
      this.getGeoFence(viewer);
    }
    this.getIndiaBoundry(viewer);

    this.getFIRs(viewer);
  }
  getSingleMapLayers() {
    this.mapLayersModule.forEach((module) => {
      this.apigetMapLayers(module).then((res: any) => {
        this.mapLayers.push(res);
        let countryCode = 'IN';
        this.mapLayerService.loadMapLayers(res, countryCode, this.viewer);
      });
    });
  }
  apigetMapLayers(module) {
    let mapLayer = this.mapLayers?.find((val) => val.MapLayer == module);
    if (mapLayer) return new Promise((resolve) => resolve(mapLayer));
    let payload = {
      MapLayer: module,
      Country: 'IN',
    };
    return new Promise((resolve) => {
      this.api.getMapLayers(payload).then((res: any) => {
        if (module == 'VFR_IE2') {
          res.data.MainData.data =
            this.mapLayerService.modifyIrelandMilitaryData(
              res.data.MainData.data
            );
          this.mapLayers.push(res.data.MainData);
        } else {
          this.mapLayers.push(res.data.MainData);
        }
        resolve(res.data.MainData);
      });
    });
  }
  getFIRs(viewer) {
    let countryCode = 'IN';
    let payload = {
      CountryCode: countryCode,
    };
    this.api.getFIRs(payload).then((res) => {
      let geoZoneData = res.data.MainData.data;
      this.mapLayerService.CesiumgetFIRs(viewer, geoZoneData);
    });
  }
  getIndiaBoundry(viewer) {
    this.api.getindiaBoudnary().then((res: any) => {
      let geoZoneData = res.data.MainData.data;
      this.mapLayerService.CesiumgetIndiaBoundary(
        viewer,
        geoZoneData,
        this.geojsonDataSourceIndiaBoundary
      );
    });
  }
  getGeoFence(viewer) {
    this.api.apigetGeoFence().then((geoZoneData) => {
      [
        this.geojsonDataSourceGeoFenceIndia,
        this.entitiesOfRestrictedAreasIndia,
      ] = this.mapLayerService.CesiumgetGeoFence(
        viewer,
        geoZoneData,
        this.geojsonDataSourceGeoFenceIndia,
        this.entitiesOfRestrictedAreasIndia
      );
    });
  }
  getActiveAirBufferSpaces(missionDetails) {
    let payload = {
      StartTime: missionDetails.StartTime,
      EndTime: missionDetails.EndTime,
    };
    this.activeAirspaceEntities = this.viewer.entities;
    this.api
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

  flyTo(LongitudeArr, LatitudeArr, missionDetails, entity) {
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
    // Check for completion and trigger screenshot and reportGeneration
    // Adjust the camera altitude based on the calculated zoom ratio
    // let cameraDestination = Cesium.Cartesian3.fromDegrees(
    //   centerLongitude,
    //   centerLatitude,
    //   this.viewer.camera.positionCartographic.height * zoomRatio * 50
    // );
    let complete = false;
    // Fly to the calculated destination
    // this.viewer.camera.flyTo({
    //   destination: cameraDestination,
    //   complete: () => {
    //     setTimeout(() => {
    //       complete = true;
    //     }, 500);
    //   },
    // });
    // this.height = this.cesiumFunction.zoomEntity2(this.viewer, entity,missionDetails?.BufferRegion);
    this.height = null;
    this.cesiumFunction
      .zoomEntity2(this.viewer, entity, missionDetails?.BufferRegion)
      .then((range) => {
        this.height = range;
      });
    let screenshotInterval = setInterval(() => {
      if (this.height && this.viewer.scene.globe.tilesLoaded) {
        const chart = echarts.init(this.chartContainer.nativeElement);
        // var snapshotImage = new Image();
        // snapshotImage.src = chart.getDataURL();
        this.chartImg = chart.getDataURL();
        // Capture screenshot
        this.viewer.render();
        this.mapScreenshotURL = this.viewer.canvas.toDataURL();
        clearInterval(screenshotInterval); // Clear the interval to stop further checks
        // Delay before reportGeneration
        setTimeout(() => {
          this.reportGeneration(this.missionId);
        }, 200);
      }
    }, 1000);
  }

  // flyTo(LongitudeArr, LatitudeArr, missionDetails, entity) {
  //   // Calculate the bounding rectangle of waypoints
  //   // let minLongitude = Math.min(...LongitudeArr);
  //   // let maxLongitude = Math.max(...LongitudeArr);
  //   // let minLatitude = Math.min(...LatitudeArr);
  //   // let maxLatitude = Math.max(...LatitudeArr);

  //   // // Calculate the center of the bounding rectangle
  //   // let centerLongitude = (minLongitude + maxLongitude) / 2;
  //   // let centerLatitude = (minLatitude + maxLatitude) / 2;

  //   // let radius =
  //   //   Math.max(maxLongitude - minLongitude, maxLatitude - minLatitude) * 0.5;

  //   // // Get the dimensions of the viewer's canvas (screen)
  //   // let canvasWidth = this.viewer.canvas.clientWidth;
  //   // let canvasHeight = this.viewer.canvas.clientHeight;

  //   // // Calculate the radius of the canvas (distance from center to corner)
  //   // let canvasRadius = Math.sqrt(
  //   //   Math.pow(canvasWidth * 0.5, 2) + Math.pow(canvasHeight * 0.5, 2)
  //   // );

  //   // Calculate the zoom ratio based on the canvas radius and waypoint radius
  //   // let zoomRatio = radius / canvasRadius;

  //   let complete = false;
  //   this.viewer.zoomTo(this.viewer, entity).then((bool) => {
  //     if (bool) {
  //       complete = true;
  //     }
  //   });

  //   // Check for completion and trigger screenshot and reportGeneration
  //   let screenshotInterval = setInterval(() => {
  //     //
  //     if (complete && this.viewer.scene.globe.tilesLoaded) {
  //       const chart = echarts.init(this.chartContainer.nativeElement);
  //       // var snapshotImage = new Image();
  //       // snapshotImage.src = chart.getDataURL();
  //       this.chartImg = chart.getDataURL();

  //       // Capture screenshot
  //       this.viewer.render();
  //       this.mapScreenshotURL = this.viewer.canvas.toDataURL();
  //       clearInterval(screenshotInterval); // Clear the interval to stop further checks

  //       // Delay before reportGeneration
  //       setTimeout(() => {
  //         this.reportGeneration(this.missionId);
  //       }, 200);
  //     }
  //   }, 1000);
  //   // Adjust the camera altitude based on the calculated zoom ratio
  //   // let cameraDestination = Cesium.Cartesian3.fromDegrees(
  //   //   centerLongitude,
  //   //   centerLatitude,
  //   //   this.viewer.camera.positionCartographic.height * zoomRatio * 50
  //   // );

  //   // Fly to the calculated destination
  //   // this.viewer.camera.flyTo({
  //   //   destination: cameraDestination,
  //   //   complete: () => {
  //   //     setTimeout(() => {
  //   //       complete = true;
  //   //     }, 500);
  //   //   },
  //   // });
  // }
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
        const response: any = await this.api.getElevation(coordinates);

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

      await this.initBasicAreaEcharts(elevationData, droneHeight, distances);
    } catch (error) {}
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

  async getWeather(missionDetails: any) {
    try {
      // this.weatherDetails = await this.api.getCurrentWeather(
      //   missionDetails.Latitude[0],
      //   missionDetails.Longitude[0]
      // );
      let weatherAPIPayload = {
        latitude: missionDetails.Latitude[0],
        longitude: missionDetails.Longitude[0],
      };
      this.api.getCurrentWeather_WeatherUnion(weatherAPIPayload).then((res) => {
        let body = JSON.parse(res?.body);
        this.weatherDetails = body;
        // this.currentWeatherDetails = body;
        // this.cityName = body.name;
        // this.responseCityName = body.name;
        return res;
      });
    } catch (error) {}
  }

  missionPermissionTrackBy(permission: any) {
    return permission.module;
  }

  // Printing mission
  async reportGeneration(missionId) {
    const pages: any = document.getElementsByClassName('page');
    const pdf = await html2PDF(pages, {
      jsPDF: {
        format: 'a4',
        unit: 'px',
      },
      // imageType: 'image/webp',
      imageType: 'image/jpeg',
      imageQuality: 0.5,
      margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
      // output: undefined,
      success: (pdf) => {
        // this.loader = false;
        // pdf.save(this.output);
        var blob = pdf.output('blob');
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          // Added for dev purpose
          // pdf.save('preflight.pdf');

          this.base64Report = reader.result;
          setTimeout(() => {
            this.generateReport(missionId);
          }, 300);
        };
      },
      // devicePixelRatio: 2.5,
      // output: './pdf/generate.pdf',
      // './pdf/generate.pdf'
    });
  }
  //Report Generation API
  generateReport(missionId) {
    let payload = {
      OperatorId: this.missionDetails.CreatedById,
      Base64: this.base64Report,
      DocType: 'pdf',
      MissionId: this.missionId,
    };

    // Addec for dev purpose
    // this.reportValues = false;

    // Commented for dev purpose
    let API =
      this.reportType == 'Postflight'
        ? this.api.postflightDocument(payload)
        : this.api.preflightDocument(payload);
    API.then(
      (res) => {
        this.completed = true;
        this.reportValues = false;
      },
      (err) => {
        this.completed = true;
      }
    );
  }
}
