import { Injectable } from '@angular/core';
import circleToPolygon from 'circle-to-polygon';
import * as turf from '@turf/turf';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { arcgisToGeoJSON } from '@esri/arcgis-to-geojson-utils';
import { OperatorapisService } from '../operator/operatorapis.service';
import { AuthorityapisService } from '../authority/authorityapis.service';
import { DateTimeFormatService } from './date-time-format.service';
import { Constants } from 'src/app/constants/constants';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// import { } from '../../../assets/common-layout/CesiumDrone.glb'

@Injectable({
  providedIn: 'root',
})
export class CesiumFunctionService {
  // Warning Visibility
  warningVisibility;
  warningZoneFlag;
  bingKey = environment.bingKey;

  //Map-Layers Data
  vfrDataIreland;
  airportDataIreland;

  airportDataIndia;
  noFlyZoneIndia;
  outerYellowZoneIndia;
  innerYellowZoneIndia;
  geoFenceIndia;
  noFlyZoneIndiaDubai;

  warningZoneData;
  militaryZoneData;

  //maptiler key
  // maptilerkey = environment.maptilerkey;
  // terrainProvider = Cesium.createWorldTerrain();
  // terrainProvider = new Cesium.CesiumTerrainProvider({
  //   url:
  //     'https://api.maptiler.com/tiles/terrain-quantized-mesh-v2?key=' +
  //     this.maptilerkey,
  // });
  //user module
  moduleApi;
  user;
  //FIR Coordinates
  firCoords = [];

  // Map Layers entities
  entitiesOfRestrictedAreasIndia;
  entitiesOfRestrictedAreasIreland;

  //Map Layers Based on Country
  mapLayers = [];

  //Subject
  private unSubscribe = new Subject();
  latLongPinEntity: any;
  latLongInfoEntity: any;

  constructor(
    private http: HttpClient,
    private operatorApi: OperatorapisService,
    private authorityApi: AuthorityapisService,
    private dateAndTimeFormat: DateTimeFormatService
  ) {}

  access(user) {
    this.user = user;
    this.moduleApi = user == 'pilot' ? this.operatorApi : this.authorityApi;
  }
  loadBingWithLabels(viewer) {
    let scene = viewer.scene;
    let bingMap = new Cesium.BingMapsImageryProvider({
      url: 'https://dev.virtualearth.net',
      key: this.bingKey,
      mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS,
      minimumLevel: 14,
      maximumLevel: 16,
    });
    bingMap.readyPromise.then((val) => {
      if (val) {
        bingMap._minimumLevel = 13;
        bingMap._maximumLevel = 18;
        let bing = new Cesium.ImageryLayer(bingMap);
        scene.globe.tileCacheSize = 1000;
        scene.logarithmicDepthBuffer = false;
        scene.imageryLayers.add(bing);

        // viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        //   url : 'https://a.data.osmbuildings.org/0.2/ph2apjye/tile' + '/15/21411/14013.json'
        //   // /{z}/{x}/{y}.json
        // }));
        // https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json
        // viewer.scene.primitives.add(Cesium.createOsmBuildings());
      }
    });
  }
  removeTimelineAndClock(viewer) {
    viewer.animation.container.style.visibility = 'hidden';
    viewer.timeline.container.style.visibility = 'hidden';
    viewer.scene.fxaa = false;
    // viewer.scene.globe.maximumScreenSpaceError = 1.33;
    // viewer.resolutionScale = 2;
  }
  set3DTunnelView(viewer) {
    let imageryLayer = viewer.imageryLayers.addImageryProvider(
      new Cesium.IonImageryProvider({ assetId: 1528908 })
      //Mohith
      // new Cesium.IonImageryProvider({ assetId: 1406902 })
    );
    // setTimeout(() => {
    //   viewer.zoomTo(imageryLayer);
    // },10000);
  }
  setView(viewer) {
    let lat, lon;
    let [IndialatMax, IndialngMax, IndialatMin, IndialngMin] = [
      42.17477643444698, 98.39193134978791, 8.465020978452927,
      69.46937307226474,
    ];
    let [IrelandlatMax, IrelandlngMax, IrelandlatMin, IrelandlngMin] = [
      55.58117283181593, -5.301994459203987, 51.29143611559805,
      -10.561891103258741,
    ];
    let country;
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;

        if (
          lat < IndialatMax &&
          lat > IndialatMin &&
          lon < IndialngMax &&
          lon > IndialngMin
        ) {
          country = 'INDIA';
          var west = 68.0;
          var south = 7.0;
          var east = 89.0;
          var north = 35.0;
        } else if (
          lat < IrelandlatMax &&
          lat > IrelandlatMin &&
          lon < IrelandlngMax &&
          lon > IrelandlngMin
        ) {
          country = 'IRELAND';
          var west = -10;
          var south = 51.0;
          var east = -5.0;
          var north = 56.0;
        }
        if (west && south && east && north) {
          var rectangle = Cesium.Rectangle.fromDegrees(
            west,
            south,
            east,
            north
          );
          viewer.camera.setView({
            destination: rectangle,
          });
        }
      },
      (error) => {
        this.getDeviceIP()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe({
            next: (res) => {
              if (res.query) {
                this.getIPLocation(res.query)
                  .pipe(takeUntil(this.unSubscribe))
                  .subscribe({
                    next: (result) => {
                      if (result.latitude && result.longitude) {
                        lat = result.latitude;
                        lon = result.longitude;
                        if (
                          lat < IndialatMax &&
                          lat > IndialatMin &&
                          lon < IndialngMax &&
                          lon > IndialngMin
                        ) {
                          country = 'INDIA';
                          var west = 68.0;
                          var south = 7.0;
                          var east = 89.0;
                          var north = 35.0;
                        } else if (
                          lat < IrelandlatMax &&
                          lat > IrelandlatMin &&
                          lon < IrelandlngMax &&
                          lon > IrelandlngMin
                        ) {
                          country = 'IRELAND';
                          var west = -10;
                          var south = 51.0;
                          var east = -5.0;
                          var north = 56.0;
                        }
                        if (west && south && east && north) {
                          var rectangle = Cesium.Rectangle.fromDegrees(
                            west,
                            south,
                            east,
                            north
                          );
                          var cartesian = Cesium.Cartesian3.fromDegrees(
                            78.8718,
                            21.7679
                          );
                          viewer.camera.setView({
                            destination: rectangle,
                          });
                        }
                      }
                    },
                    error: (err) => {
                      this.setDefaultView(viewer);
                    },
                  });
              }
            },
            error: (err) => {
              this.setDefaultView(viewer);
            },
          });

        // this.getDeviceIP()
        //   .pipe(takeUntil(this.unSubscribe))
        //   .subscribe(
        //     (res) => {
        //       if (res.query) {
        //         this.getIPLocation(res.query)
        //           .pipe(takeUntil(this.unSubscribe))
        //           .subscribe(
        //             (result) => {
        //               if (result.latitude && result.longitude) {
        //                 lat = result.latitude;
        //                 lon = result.longitude;
        //                 if (
        //                   lat < IndialatMax &&
        //                   lat > IndialatMin &&
        //                   lon < IndialngMax &&
        //                   lon > IndialngMin
        //                 ) {
        //                   country = 'INDIA';
        //                   var west = 68.0;
        //                   var south = 7.0;
        //                   var east = 89.0;
        //                   var north = 35.0;
        //                 } else if (
        //                   lat < IrelandlatMax &&
        //                   lat > IrelandlatMin &&
        //                   lon < IrelandlngMax &&
        //                   lon > IrelandlngMin
        //                 ) {
        //                   country = 'IRELAND';
        //                   var west = -10;
        //                   var south = 51.0;
        //                   var east = -5.0;
        //                   var north = 56.0;
        //                 }
        //                 if (west && south && east && north) {
        //                   var rectangle = Cesium.Rectangle.fromDegrees(
        //                     west,
        //                     south,
        //                     east,
        //                     north
        //                   );
        //                   var cartesian = Cesium.Cartesian3.fromDegrees(
        //                     78.8718,
        //                     21.7679
        //                   );
        //                   viewer.camera.setView({
        //                     destination: rectangle,
        //                   });
        //                 }
        //               }
        //             },
        //             (err) => {
        //               this.setDefaultView(viewer);
        //             }
        //           );
        //       }
        //     },
        //     (err) => {
        //       this.setDefaultView(viewer);
        //     }
        //   );
      }
    );
  }
  //Sets default view to India
  setDefaultView(viewer) {
    var west = 68.0;
    var south = 7.0;
    var east = 89.0;
    var north = 35.0;
    var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);
    viewer.camera.setView({
      destination: rectangle,
    });
  }

  disableMapZoomandScrollForGuest(viewer, toggle) {
    // Disable zoom and scroll by removing default event handlers
    //  toggle = true/false
    viewer.scene.screenSpaceCameraController.enableZoom = toggle;
    viewer.scene.screenSpaceCameraController.enableTilt = toggle;
    viewer.scene.screenSpaceCameraController.enableRotate = toggle;
    viewer.scene.screenSpaceCameraController.enableTranslate = toggle;
  }

  navigateToLocationGuest(viewer, longitude, latitude, height, tiltDegrees) {
    var destination = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
    );

    var heading = Cesium.Math.toRadians(0); // You can change the heading if needed
    var pitch = Cesium.Math.toRadians(-tiltDegrees); // Tilt angle in degrees, negative for tilt
    var range = Cesium.Cartesian3.distance(viewer.camera.position, destination);

    viewer.camera.flyTo({
      destination: destination,
      orientation: {
        heading: heading,
        pitch: pitch,
        range: range,
      },
      duration: 2, // Duration of the flight animation in seconds
    });
  }

  navigateToCurrrentLocationGuest(viewer) {
    let lat, lon;
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
        let rectangle = Cesium.Rectangle.fromDegrees(
          lon - 0.1,
          lat - 0.1,
          lon + 0.1,
          lat + 0.1
        );
        viewer.camera.setView({
          destination: rectangle,
        });
      },
      (error) => {
        this.getDeviceIP()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            if (res.query) {
              this.getIPLocation(res.query)
                .pipe(takeUntil(this.unSubscribe))
                .subscribe((result) => {
                  if (result.latitude && result.longitude) {
                    lat = result.latitude;
                    lon = result.longitude;
                    let rectangle = Cesium.Rectangle.fromDegrees(
                      lon - 0.1,
                      lat - 0.1,
                      lon + 0.1,
                      lat + 0.1
                    );
                    viewer.camera.setView({
                      destination: rectangle,
                    });
                  }
                });
            }
          });
      }
    );
  }

  navigateToCurrrentLocation(viewer) {
    let lat, lon;
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
        let rectangle = Cesium.Rectangle.fromDegrees(
          lon - 0.1,
          lat - 0.1,
          lon + 0.1,
          lat + 0.1
        );
        viewer.camera.setView({
          destination: rectangle,
        });
      },
      (error) => {
        this.getDeviceIP()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            if (res.query) {
              this.getIPLocation(res.query)
                .pipe(takeUntil(this.unSubscribe))
                .subscribe((result) => {
                  if (result.latitude && result.longitude) {
                    lat = result.latitude;
                    lon = result.longitude;
                    let rectangle = Cesium.Rectangle.fromDegrees(
                      lon - 0.1,
                      lat - 0.1,
                      lon + 0.1,
                      lat + 0.1
                    );
                    viewer.camera.setView({
                      destination: rectangle,
                    });
                  }
                });
            }
          });
      }
    );
  }

  addCellTowers(mapsManagerService) {
    var entities;
    let geoJsonCellTower = new Cesium.GeoJsonDataSource();
    // ../../../assets/files/../../../assets/files/Network_tower.geojson
    // https://swatapi.tropogo.com/geoserver/tropogo_maps/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=tropogo_maps%3Adrone_incidents_world&maxFeatures=1000&outputFormat=application%2Fjson
    var promise = geoJsonCellTower.load(
      '../../../assets/files/networkIndia.geojson',
      {
        stroke: Cesium.Color.HOTPINK,
        fill: Cesium.Color.PINK,
        strokeWidth: 3,
        markerSymbol: '?',
      }
    );
    promise.then(function (dataSource) {
      this.viewer.dataSources.add(dataSource);
    });
    return geoJsonCellTower;
  }

  //Getting Map Layers from backend server
  getvfrs(viewer, jsonData, geojsonDataSource, entitiesOfRestrictedAreas) {
    viewer.dataSources.remove(geojsonDataSource);
    var geojsonPoint = arcgisToGeoJSON(jsonData);
    for (let i = 0; i < geojsonPoint['features'].length; i++) {
      for (
        let j = 0;
        j < geojsonPoint['features'][i]['geometry']['coordinates'].length;
        j++
      ) {
        for (
          let k = 0;
          k < geojsonPoint['features'][i]['geometry']['coordinates'][j].length;
          k++
        ) {
          var pt = turf.point(
            geojsonPoint['features'][i]['geometry']['coordinates'][j][k]
          );
          var converted = turf.toWgs84(pt);
          geojsonPoint['features'][i]['geometry']['coordinates'][j][k] =
            converted.geometry.coordinates;
        }
      }
    }
    var entities;
    var promise = geojsonDataSource.load(geojsonPoint);

    promise.then((dataSource) => {
      // viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var features = entity.properties.TYPE;
        let positions = entity.polygon.hierarchy.getValue().positions;
        let coOrdinates = [];
        let altCoordinate = [];
        positions.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          coOrdinates.push([
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ]);
          altCoordinate.push(
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
            entity.properties.FID == 52 ? 20000 : features == 'T' ? 13000 : 3500
          );
        });
        entitiesOfRestrictedAreas.push({
          coOrdinates: coOrdinates,
          type: features._value,
          zone: 'vfr',
          value: 'VFR',
        });

        var color =
          features == 'M'
            ? Cesium.Color.fromRgba(0x154380e4)
            : features == 'D' || features == 'A'
            ? Cesium.Color.fromRgba(0x158f9ca1)
            : features == 'P' || features == 'R'
            ? Cesium.Color.fromRgba(0x159c5108)
            : features == 'T' || features == 'W'
            ? Cesium.Color.fromRgba(0x15ccfcff)
            : '';
        var OutlineColor =
          features == 'M'
            ? Cesium.Color.fromRgba(0xdd4380e4)
            : features == 'D' || features == 'A'
            ? Cesium.Color.fromRgba(0xdd8f9ca1)
            : features == 'P' || features == 'R'
            ? Cesium.Color.fromRgba(0xdd9c5108)
            : features == 'T' || features == 'W'
            ? Cesium.Color.fromRgba(0xddccfcff)
            : '';
        entity.polygon.hierarchy._value.positions =
          Cesium.Cartesian3.fromDegreesArrayHeights(altCoordinate);

        entity.polygon.fill = true;
        entity.polygon.material = color;
        entity.polygon.outline = true;
        entity.polygon.outlineColor = OutlineColor;
        entity.polygon.height = 400;
        entity.polygon.extrudedHeight = 0;
        entity.polygon.extrudedHeightReference =
          Cesium.HeightReference.CLAMP_TO_GROUND;
        entity.polygon.perPositionHeight = true;
      }
    });
    viewer.dataSources.add(geojsonDataSource);
    // .otherwise(function (error) { });
    return [geojsonDataSource, entitiesOfRestrictedAreas];
    // }
  }
  getFIRs(viewer, dataSource, geojsonDataSourceFIRs) {
    var promise = geojsonDataSourceFIRs.load(dataSource);
    promise.then((res) => {
      viewer.dataSources.add(res);
      var entities;
      entities = res.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.polygon.fill = false;
        // 4B5CFF
        entity.polygon.outline = true;
        entity.polygon.outlineColor = Cesium.Color.fromRgba(0x11ff5c4b);
        entity.polygon.height = 0;
        let positions = entity.polygon.hierarchy.getValue().positions;
        // console.log(positions);
        let coOrdinates = [];
        positions.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          coOrdinates.push([
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ]);
        });
        this.firCoords.push({
          coOrdinates,
          FIR: entity.properties.ID._value,
        });
      }
      // console.log(this.firCoords);
    });
  }
  getAirports(
    viewer,
    jsonData,
    geojsonDataSourceAirport,
    entitiesOfRestrictedAreas
  ) {
    viewer.dataSources.remove(geojsonDataSourceAirport);
    var geojsonPoint = arcgisToGeoJSON(jsonData);
    for (let i = 0; i < geojsonPoint['features'].length; i++) {
      // geojsonPoint['features'][i]['properties']['radius'] = 1000;
      geojsonPoint['features'][i]['geometry'].type = 'Polygon';
      const coordinates = [
        Number(geojsonPoint['features'][i]['properties'].WGS_DLONG),
        Number(geojsonPoint['features'][i]['properties'].WGS_DLAT),
      ]; //[lon, lat]
      const radius = 5000; // in meters
      const numberOfEdges = 32; //optional that defaults to 32

      let polygon = circleToPolygon(coordinates, radius, numberOfEdges);
      geojsonPoint['features'][i]['geometry']['coordinates'] =
        polygon.coordinates;
    }
    var entities;
    var promise = geojsonDataSourceAirport.load(geojsonPoint);

    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var features = entity.properties.TYPE;
        let positions = entity.polygon.hierarchy.getValue().positions;
        let coOrdinates = [];
        positions.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          coOrdinates.push([
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ]);
        });
        entitiesOfRestrictedAreas.push({
          coOrdinates: coOrdinates,
          type: features._value,
          zone: 'airport',
          value: 'Airport Zones',
        });
        //   0000ff
        var color = Cesium.Color.fromRgba(0x104f6fff);
        var OutlineColor = Cesium.Color.fromRgba(0x100000ff);
        entity.polygon.fill = true;
        entity.polygon.material = color;
        entity.polygon.outline = true;
        entity.polygon.outlineColor = OutlineColor;
        // entity.polygon.outlineWidth = 5;
        entity.polygon.extrudedHeight = 1000;
        entity.polygon.height = 400;
        entity.polygon.perPositionHeight = false;
      }
    });

    viewer.dataSources.add(geojsonDataSourceAirport);
    // .otherwise(function (error) { });
    return [geojsonDataSourceAirport, entitiesOfRestrictedAreas];
    // }
  }
  getWarningZones(viewer, dataSource, geojsonDataSourceWarningZone) {
    var entities;
    viewer.dataSources.remove(geojsonDataSourceWarningZone);
    var promise = geojsonDataSourceWarningZone.load(dataSource);
    promise.then(function (dataSource) {
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        if (Cesium.defined(entity.billboard)) {
          let customBillboard = {
            image: '../../../../assets/common-layout/Warning.svg', // default: undefined
            show: true, // default
            scale: 1.5, // default: 1.0
            alignedAxis: Cesium.Cartesian3.ZERO, // default
            width: 13, // default: undefined
            height: 13, // default: undefined
            // sizeInMeters : true,
          };
          entity.billboard = customBillboard;
        }
      }
    });
    return geojsonDataSourceWarningZone;
  }
  getGeoFence(
    viewer,
    dataSource,
    geojsonDataSourceGeoZoneIndia,
    entitiesOfRestrictedAreas
  ) {
    var entities;
    viewer.dataSources.remove(geojsonDataSourceGeoZoneIndia);

    var promise = geojsonDataSourceGeoZoneIndia.load(
      dataSource
      // , {
      //   clampToGround: true,
      // }
    );
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];

        // ff6344
        let color = Cesium.Color.fromRgba(0x084463ff);
        // 404463ff 636BCD
        let OutlineColor = Cesium.Color.fromRgba(0xaa636bcd);

        let positions = entity.polygon.hierarchy.getValue().positions;
        let coOrdinates = [];
        let altCoordinate = [];
        positions.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          coOrdinates.push([
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ]);
          altCoordinate.push(
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
            1200
          );
        });
        entitiesOfRestrictedAreas.push({
          coOrdinates: coOrdinates,
          type: 'Red-Zone',
          zone: 'geozone',
          value: 'Airspace Geozones',
        });
        entity.polygon.hierarchy._value.positions =
          Cesium.Cartesian3.fromDegreesArrayHeights(altCoordinate);
        entity.polygon.fill = true;
        entity.polygon.material = color;
        entity.polygon.outline = true;
        entity.polygon.outlineColor = OutlineColor;
        entity.polygon.height = 400;
        entity.polygon.outlineWidth = 2;
        entity.polygon.extrudedHeight = 0;
        // entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
        entity.polygon.extrudedHeightReference =
          Cesium.HeightReference.CLAMP_TO_GROUND;
        entity.polygon.perPositionHeight = true;
        entity.polygon.closeBottom = false;
      }
    });
    return [geojsonDataSourceGeoZoneIndia, entitiesOfRestrictedAreas];
  }

  getFIC(
    viewer,
    dataSource,
    geojsonDataSourceFICIndia,
    entitiesOfRestrictedAreas
  ) {
    var entities;
    viewer.dataSources.remove(geojsonDataSourceFICIndia);

    var promise = geojsonDataSourceFICIndia.load(
      dataSource
      // , {
      //   clampToGround: true,
      // }
    );
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];

        let type = entity.properties.TYPE;
        // ff6344
        let color =
          type == 'M'
            ? Cesium.Color.fromRgba(0x304380e4)
            : type == 'D' || type == 'A'
            ? Cesium.Color.fromRgba(0x308f9ca1)
            : type == 'P' || type == 'R'
            ? Cesium.Color.fromRgba(0x309c5108)
            : type == 'T' || type == 'W'
            ? Cesium.Color.fromRgba(0x30ccfcff)
            : '';

        let positions = entity.polygon.hierarchy.getValue().positions;
        let coOrdinates = [];
        let altCoordinate = [];
        positions.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          coOrdinates.push([
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ]);
          altCoordinate.push(
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
            1200
          );
        });
        entitiesOfRestrictedAreas.push({
          coOrdinates: coOrdinates,
          type: type._value,
          zone: 'FIC',
          value: 'FIC',
        });
        entity.polygon.hierarchy._value.positions =
          Cesium.Cartesian3.fromDegreesArrayHeights(altCoordinate);
        entity.polygon.fill = true;
        entity.polygon.material = Cesium.Color.fromRgba(0x01c37b2e);

        entity.polygon.outline = true;
        entity.polygon.outlineColor = color;
        entity.polygon.height = 0;
        // entity.polygon.outlineWidth = 555;

        // entity.polygon.fill = true;
        // entity.polygon.material = color;
        // entity.polygon.outline = false;
        // // // entity.polygon.outlineColor = OutlineColor;
        // // // entity.polygon.outlineWidth = 5;
        // // entity.polygon.extrudedHeight = 0;
        // // // entity.polygon.height = 0;
        // // // entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
        // // entity.polygon.extrudedHeightReference =
        // //   Cesium.HeightReference.CLAMP_TO_GROUND;
        // // entity.polygon.perPositionHeight = true;
      }
    });
    return [geojsonDataSourceFICIndia, entitiesOfRestrictedAreas];
  }

  getNoFlyZone(
    viewer,
    dataSource,
    geojsonDataSourceNoFlyZone,
    entitiesOfRestrictedAreas
  ) {
    var entities;
    viewer.dataSources.remove(geojsonDataSourceNoFlyZone);
    var promise = geojsonDataSourceNoFlyZone.load(dataSource);
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var features = entity.properties.TYPE;

        let positions = entity.polygon.hierarchy.getValue().positions;
        let coOrdinates = [];
        let altCoordinate = [];
        positions.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          coOrdinates.push([
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ]);
          altCoordinate.push(
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
            1000
          );
        });
        entitiesOfRestrictedAreas.push({
          coOrdinates: coOrdinates,
          type: 'Red-Zone',
          zone: 'airport',
          value: 'Airport',
        });

        // Assign random colors
        var color = Cesium.Color.fromRgba(0x084747ff);
        var OutlineColor = Cesium.Color.fromRgba(0xaa4747ff);

        entity.polygon.hierarchy._value.positions =
          Cesium.Cartesian3.fromDegreesArrayHeights(altCoordinate);
        entity.polygon.outline = true;
        entity.polygon.outlineColor = OutlineColor;
        entity.polygon.height = 400;
        entity.polygon.fill = true;
        entity.polygon.material = color;
        entity.polygon.extrudedHeight = 0;
        entity.polygon.extrudedHeightReference =
          Cesium.HeightReference.CLAMP_TO_GROUND;
        entity.polygon.perPositionHeight = true;
        entity.polygon.closeBottom = false;
      }
    });
    return [geojsonDataSourceNoFlyZone, entitiesOfRestrictedAreas];
  }
  getInnerYellowZone(
    viewer,
    dataSource,
    geojsonDataSourceInnerYellowZone,
    entitiesOfRestrictedAreas
  ) {
    var entities;
    viewer.dataSources.remove(geojsonDataSourceInnerYellowZone);
    var promise = geojsonDataSourceInnerYellowZone.load(dataSource);
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var features = entity.properties.TYPE;
        let positions = entity.polygon.hierarchy.getValue().positions;
        let coOrdinates = [];
        let altCoordinate = [];
        positions.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          coOrdinates.push([
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ]);
          altCoordinate.push(
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
            1000
          );
        });
        entitiesOfRestrictedAreas.push({
          coOrdinates: coOrdinates,
          type: 'Inner-Yellow',
          zone: 'airport',
          value: 'Airport',
        });

        var color = Cesium.Color.fromRgba(0x0895ebfa);
        // 4095ebfa ADE8ED DFD395
        var OutlineColor = Cesium.Color.fromRgba(0x5595d3d1);

        entity.polygon.hierarchy._value.positions =
          Cesium.Cartesian3.fromDegreesArrayHeights(altCoordinate);

        entity.polygon.fill = true;
        entity.polygon.outline = true;
        entity.polygon.outlineColor = OutlineColor;
        entity.polygon.height = 400;

        entity.polygon.fill = true;
        entity.polygon.material = color;
        entity.polygon.extrudedHeight = 0;
        entity.polygon.extrudedHeightReference =
          Cesium.HeightReference.CLAMP_TO_GROUND;
        entity.polygon.perPositionHeight = true;
        entity.polygon.closeBottom = false;
      }
    });
    return [geojsonDataSourceInnerYellowZone, entitiesOfRestrictedAreas];
  }
  getYellowZone(
    viewer,
    dataSource,
    geojsonDataSourceYellowZone,
    entitiesOfRestrictedAreas
  ) {
    var entities;

    var promise = geojsonDataSourceYellowZone.load(dataSource);
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var features = entity.properties.TYPE;
        let positions = entity.polygon.hierarchy.getValue().positions;
        let coOrdinates = [];
        let altCoordinate = [];
        positions.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          coOrdinates.push([
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ]);
          altCoordinate.push(
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
            1000
          );
        });
        entitiesOfRestrictedAreas.push({
          coOrdinates: coOrdinates,
          type: 'Outer-Yellow',
          zone: 'airport',
          value: 'Airport',
        });

        var color = Cesium.Color.fromRgba(0x0889f6ff);
        var outlineColor = Cesium.Color.fromRgba(0xaa89f6ff);
        //FFF689
        // 402fdefb
        entity.polygon.hierarchy._value.positions =
          Cesium.Cartesian3.fromDegreesArrayHeights(altCoordinate);

        entity.polygon.fill = true;
        entity.polygon.outline = true;
        entity.polygon.outlineColor = outlineColor;
        entity.polygon.height = 400;

        entity.polygon.fill = true;
        entity.polygon.material = color;
        entity.polygon.extrudedHeight = 0;
        entity.polygon.extrudedHeightReference =
          Cesium.HeightReference.CLAMP_TO_GROUND;
        entity.polygon.perPositionHeight = true;
        entity.polygon.closeBottom = false;
      }
    });
    return [geojsonDataSourceYellowZone, entitiesOfRestrictedAreas];
  }
  getNoFlyZoneDubai(
    viewer,
    geoZoneData,
    geojsonDataSourceNoFlyDubaiZone,
    entitiesOfRestrictedAreas
  ) {
    const promise = geojsonDataSourceNoFlyDubaiZone.load(
      geoZoneData
      //   , {
      //   clampToGround: true,
      // }
    );
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      let entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let positions = entity.polygon.hierarchy.getValue().positions;
        let coOrdinates = [];
        let altCoordinate = [];
        if (entity.properties.name != 'Green') {
          positions.forEach((values, index) => {
            var cartographic = Cesium.Cartographic.fromCartesian(values);
            // coOrdinates.push(
            //   Cesium.Math.toDegrees(cartographic.longitude) +
            //     ' ' +
            //     Cesium.Math.toDegrees(cartographic.latitude)
            // );
            coOrdinates.push([
              Cesium.Math.toDegrees(cartographic.longitude),
              Cesium.Math.toDegrees(cartographic.latitude),
            ]);
            altCoordinate.push(
              Cesium.Math.toDegrees(cartographic.longitude),
              Cesium.Math.toDegrees(cartographic.latitude),
              3200
            );
          });
          entitiesOfRestrictedAreas.push({
            coOrdinates: coOrdinates,
            type: 'No Fly Zone',
            zone: 'vfr',
            value: 'VFR',
          });
          entity.polygon.hierarchy._value.positions =
            Cesium.Cartesian3.fromDegreesArrayHeights(altCoordinate);

          entity.polygon.fill = true;
          entity.polygon.outlineColor = entity.polygon.material.color._value;
          entity.polygon.material.color._value =
            Cesium.Color.fromRgba(0x014463ff);
          entity.polygon.outline = true;

          entity.polygon.height = 0;
          // entity.polygon.outline = false;
          // entity.polygon.extrudedHeight = 0;
          // entity.polygon.extrudedHeightReference =
          //   Cesium.HeightReference.CLAMP_TO_GROUND;
          // entity.polygon.perPositionHeight = true;
        }
      }
    });
    return [geojsonDataSourceNoFlyDubaiZone, entitiesOfRestrictedAreas];
  }
  getMilitaryNoFlyZone(
    viewer,
    geoJSONdataSource,
    geojsonDataSourceMilitaryZone,
    entitiesOfRestrictedAreas
  ) {
    viewer.dataSources.remove(geojsonDataSourceMilitaryZone);

    var entities;

    var promise = geojsonDataSourceMilitaryZone.load(geoJSONdataSource);
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        let properties = entity.properties;
        let type = properties['ASPC CLASS']._value;
        var color;

        // Assign random colors
        if (type == 'Class C') {
          color = Cesium.Color.fromRgba(0x3095ebfa);
          // OutlineColor = Cesium.Color.fromRgba(0x6695ebfa);
        } else {
          color = Cesium.Color.fromRgba(0x304747ff);
          // OutlineColor = Cesium.Color.fromRgba(0x664747ff);
        }

        let positions = entity.polygon.hierarchy.getValue().positions;
        let coOrdinates = [];
        let altCoordinate = [];
        positions.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          coOrdinates.push([
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ]);
          altCoordinate.push(
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
            properties['RADIUS\n(M)'] == 'N/A' ? 500 : 1000
          );
        });
        entitiesOfRestrictedAreas.push({
          coOrdinates: coOrdinates,
          type: 'Military ' + type,
          zone: 'vfr',
          value: 'VFR',
        });
        entity.polygon.hierarchy._value.positions =
          Cesium.Cartesian3.fromDegreesArrayHeights(altCoordinate);

        entity.polygon.fill = true;
        entity.polygon.material = color;
        entity.polygon.outline = false;

        entity.polygon.extrudedHeight = 0;
        entity.polygon.extrudedHeightReference =
          Cesium.HeightReference.CLAMP_TO_GROUND;
        entity.polygon.perPositionHeight = true;
      }
    });

    return [geojsonDataSourceMilitaryZone, entitiesOfRestrictedAreas];
  }

  getIndiaBoundary(viewer, dataSource, geojsonDataSourceIndiaBoundary) {
    // viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../../../assets/files/Dubai NoFlyZone.geojson', {
    //   stroke: Cesium.Color.HOTPINK,
    //   // fill: Cesium.Color.PINK,
    //   strokeWidth: 3,
    //   markerSymbol: '?'
    // }));
    var promise = geojsonDataSourceIndiaBoundary.load(dataSource);
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);

      var entities;
      entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.polyline.outline = true;
        entity.polyline.width = 6;
        // FFFC1C
        entity.polyline.material = Cesium.Color.fromRgba(0x807077d3); //red
        // width: 3,
        // ffb731 8e8e8e
        // material: Cesium.Color.fromRgba(0x888e8e8e),
      }
    });
  }
  apigetIndiaBoundary() {
    if (!this.geoFenceIndia) {
      return new Promise((resolve) => {
        this.moduleApi
          .getGeoFence()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            this.geoFenceIndia = res.data.MainData.data;

            resolve(this.geoFenceIndia);
          });
      });
    } else {
      return new Promise((resolve) => resolve(this.geoFenceIndia));
    }
  }

  apigetGeoFence() {
    if (!this.geoFenceIndia) {
      return new Promise((resolve) => {
        this.moduleApi
          .getGeoFence()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            this.geoFenceIndia = res.data.MainData;

            resolve(this.geoFenceIndia);
          });
      });
    } else {
      return new Promise((resolve) => resolve(this.geoFenceIndia));
    }
  }
  apigetvfrs(country, latmin, lngmin, latmax, lngmax) {
    if (!this.vfrDataIreland) {
      return new Promise((resolve) => {
        var minpt = turf.point([lngmin, latmin]);
        var convertedmin = turf.toMercator(minpt);
        var maxpt = turf.point([lngmax, latmax]);
        var convertedmax = turf.toMercator(maxpt);

        let payload = {
          CountryCode: country,
          xmin: convertedmin.geometry.coordinates[0],
          ymin: convertedmin.geometry.coordinates[1],
          xmax: convertedmax.geometry.coordinates[0],
          ymax: convertedmax.geometry.coordinates[1],
        };
        this.moduleApi
          .getvfrs(payload)
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            this.vfrDataIreland = res.data.MainData.data;

            resolve(this.vfrDataIreland);
          });
      });
    } else {
      return new Promise((resolve) => resolve(this.vfrDataIreland));
    }
  }
  apigetAirports(country, latmin, lngmin, latmax, lngmax) {
    if (
      (country == 'INDIA' && !this.airportDataIndia) ||
      (country == 'IRELAND' && !this.airportDataIreland)
    ) {
      return new Promise((resolve) => {
        var minpt = turf.point([lngmin, latmin]);
        var convertedmin = turf.toMercator(minpt);
        var maxpt = turf.point([lngmax, latmax]);
        var convertedmax = turf.toMercator(maxpt);
        let payload = {
          CountryCode: country,
          xmin: convertedmin.geometry.coordinates[0],
          ymin: convertedmin.geometry.coordinates[1],
          xmax: convertedmax.geometry.coordinates[0],
          ymax: convertedmax.geometry.coordinates[1],
        };
        this.moduleApi
          .getAirports(payload)
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            if (country == 'INDIA') {
              this.airportDataIndia = res.data.MainData.data;
              resolve(this.airportDataIndia);
            } else {
              this.airportDataIreland = res.data.MainData.data;
              resolve(this.airportDataIreland);
            }
          });
      });
    } else {
      return new Promise((resolve) => {
        if (country == 'INDIA') {
          resolve(this.airportDataIndia);
        } else {
          resolve(this.airportDataIreland);
        }
      });
    }
  }
  apigetWarning() {
    if (!this.warningZoneData) {
      return new Promise((resolve) => {
        this.moduleApi
          .getWarning()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            this.warningZoneData = res.data.MainData.data;
            resolve(this.warningZoneData);
          });
      });
    } else {
      return new Promise((resolve) => resolve(this.warningZoneData));
    }
  }
  apigetNoFlyZone() {
    if (!this.warningZoneData) {
      return new Promise((resolve) => {
        this.moduleApi
          .getNoFlyZone()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            this.noFlyZoneIndia = res.data.MainData.data;
            resolve(this.noFlyZoneIndia);
          });
      });
    } else {
      return new Promise((resolve) => resolve(this.noFlyZoneIndia));
    }
  }
  apigetInnerYellowZone() {
    if (!this.innerYellowZoneIndia) {
      return new Promise((resolve) => {
        this.moduleApi
          .getInnerYellowZone()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            this.innerYellowZoneIndia = res.data.MainData.data;
            resolve(this.innerYellowZoneIndia);
          });
      });
    } else {
      return new Promise((resolve) => resolve(this.innerYellowZoneIndia));
    }
  }
  apigetYellowZone() {
    if (!this.outerYellowZoneIndia) {
      return new Promise((resolve) => {
        this.moduleApi
          .getYellowZone()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            this.outerYellowZoneIndia = res.data.MainData.data;
            resolve(this.outerYellowZoneIndia);
          });
      });
    } else {
      return new Promise((resolve) => resolve(this.outerYellowZoneIndia));
    }
  }
  apigetNoFlyZoneDubai() {
    if (!this.noFlyZoneIndiaDubai) {
      return new Promise((resolve) => {
        this.moduleApi
          .getNoFlyZoneDubai()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            this.noFlyZoneIndiaDubai = res.data.MainData.data;
            resolve(this.noFlyZoneIndiaDubai);
          });
      });
    } else {
      return new Promise((resolve) => resolve(this.noFlyZoneIndiaDubai));
    }
  }
  apigetMilitaryNoFlyZone() {
    if (!this.militaryZoneData) {
      return new Promise((resolve) => {
        this.moduleApi
          .getMilitaryNoFlyZone()
          .pipe(takeUntil(this.unSubscribe))
          .subscribe((res) => {
            this.militaryZoneData = res.data.MainData.data;
            this.militaryZoneData.features =
              this.militaryZoneData.features.filter((feature) => {
                let properties = feature.properties;
                let geometry = feature.geometry;
                if (geometry) {
                  geometry.type = 'Polygon';
                  const coordinates = [
                    Number(geometry.coordinates[0]),
                    Number(geometry.coordinates[1]),
                  ]; //[lon, lat]
                  const radius = Number(
                    properties['RADIUS\n(M)'].replace(/,/g, '')
                  ); // in meters
                  const numberOfEdges = 32; //optional that defaults to 32
                  let polygon = circleToPolygon(
                    coordinates,
                    radius,
                    numberOfEdges
                  );
                  geometry.coordinates = polygon.coordinates;
                  return feature;
                } else {
                  let tempgeometry = {
                    type: undefined,
                    coordinates: undefined,
                  };
                  let alterRadius = 50;
                  tempgeometry.type = 'Polygon';
                  if (properties.LONGITUDE && properties.LATITUDE) {
                    let longDMS = properties.LONGITUDE.substring(
                      0,
                      properties.LONGITUDE.length - 1
                    ).split(' ');
                    let longDir = properties.LONGITUDE.substring([
                      properties.LONGITUDE.length - 1,
                    ]);
                    let longDD = this.ConvertDMSToDD(
                      longDMS[0],
                      longDMS[1],
                      longDMS[2],
                      longDir
                    );

                    let latDMS = properties.LATITUDE.substring(
                      0,
                      properties.LATITUDE.length - 1
                    ).split(' ');
                    let latDir = properties.LATITUDE.substring([
                      properties.LATITUDE.length - 1,
                    ]);
                    let latDD = this.ConvertDMSToDD(
                      latDMS[0],
                      latDMS[1],
                      latDMS[2],
                      latDir
                    );

                    const coordinates = [longDD, latDD]; //[lon, lat]
                    const radius = isNaN(
                      Number(properties['RADIUS\n(M)'].replace(/,/g, ''))
                    )
                      ? alterRadius
                      : Number(properties['RADIUS\n(M)'].replace(/,/g, '')); // in meters
                    const numberOfEdges = 32; //optional that defaults to 32
                    let polygon = circleToPolygon(
                      coordinates,
                      radius,
                      numberOfEdges
                    );
                    tempgeometry.coordinates = polygon.coordinates;
                    feature.geometry = tempgeometry;
                    return feature;
                  }
                }
              });

            resolve(this.militaryZoneData);
          });
      });
    } else {
      return new Promise((resolve) => resolve(this.militaryZoneData));
    }
  }

  apigetMapLayers(module, profileDetails) {
    let mapLayer = this.mapLayers.find((val) => val.MapLayer == module);
    if (!mapLayer) {
      let payload: any;
      if (this.user == 'pilot') {
        payload = {
          MapLayer: module,
          UserId: profileDetails.UserId,
          Country: profileDetails.CountryCode,
        };
      } else {
        payload = {
          MapLayer: module,
          UserId: profileDetails.UserId,
          Country: profileDetails.Country,
        };
        if (profileDetails.State) {
          payload.State = profileDetails.State;
        } else if (profileDetails.FIR) {
          payload.FIR = profileDetails.FIR;
        }
      }
      return new Promise((resolve) => {
        this.moduleApi.getMapLayers(payload).then((res) => {
          if (module == 'VFR_IE2') {
            res.data.MainData.data = this.modifyIrelandMilitaryData(
              res.data.MainData.data
            );
            this.mapLayers.push(res.data.MainData);
          } else {
            this.mapLayers.push(res.data.MainData);
          }

          resolve(res.data.MainData);
        });
        // .catch((err) =>  console.log(err) );
      });
    } else {
      return new Promise((resolve) => resolve(mapLayer));
    }
  }

  modifyIrelandMilitaryData(militaryZoneData) {
    militaryZoneData.features = militaryZoneData.features.filter((feature) => {
      let properties = feature.properties;
      let geometry = feature.geometry;
      if (geometry) {
        geometry.type = 'Polygon';
        const coordinates = [
          Number(geometry.coordinates[0]),
          Number(geometry.coordinates[1]),
        ]; //[lon, lat]
        const radius = Number(properties['RADIUS\n(M)'].replace(/,/g, '')); // in meters
        const numberOfEdges = 32; //optional that defaults to 32
        let polygon = circleToPolygon(coordinates, radius, numberOfEdges);
        geometry.coordinates = polygon.coordinates;
        return feature;
      } else {
        let tempgeometry = {
          type: undefined,
          coordinates: undefined,
        };
        let alterRadius = 50;
        tempgeometry.type = 'Polygon';
        if (properties.LONGITUDE && properties.LATITUDE) {
          let longDMS = properties.LONGITUDE.substring(
            0,
            properties.LONGITUDE.length - 1
          ).split(' ');
          let longDir = properties.LONGITUDE.substring([
            properties.LONGITUDE.length - 1,
          ]);
          let longDD = this.ConvertDMSToDD(
            longDMS[0],
            longDMS[1],
            longDMS[2],
            longDir
          );

          let latDMS = properties.LATITUDE.substring(
            0,
            properties.LATITUDE.length - 1
          ).split(' ');
          let latDir = properties.LATITUDE.substring([
            properties.LATITUDE.length - 1,
          ]);
          let latDD = this.ConvertDMSToDD(
            latDMS[0],
            latDMS[1],
            latDMS[2],
            latDir
          );

          const coordinates = [longDD, latDD]; //[lon, lat]
          const radius = isNaN(
            Number(properties['RADIUS\n(M)'].replace(/,/g, ''))
          )
            ? alterRadius
            : Number(properties['RADIUS\n(M)'].replace(/,/g, '')); // in meters
          const numberOfEdges = 32; //optional that defaults to 32
          let polygon = circleToPolygon(coordinates, radius, numberOfEdges);
          tempgeometry.coordinates = polygon.coordinates;
          feature.geometry = tempgeometry;
          return feature;
        }
      }
    });
    return militaryZoneData;
  }

  //Active AirSpaces
  getActiveAirBufferSpaces(activeBuffers, activeAirspaceEntities, viewer?) {
    this.removeEntities(activeAirspaceEntities, 'Mission');
    // activeAirspaceEntities.removeAll();
    // activeAirspaceEntities.values.forEach((value) => {
    //   if (value.id.includes("Mission")) {
    //     activeAirspaceEntities.removeById(value.id);
    //   }
    // })
    activeBuffers.forEach((val, index) => {
      let bufferPoints = [];
      let positions = [];
      let coOrdinates = [];
      val.BufferRegion.forEach((values) => {
        var cartographic = Cesium.Cartographic.fromCartesian(values);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let long = Cesium.Math.toDegrees(cartographic.longitude);
        // bufferPoints.push(Cesium.Cartesian3.fromDegrees(long, lat));
        bufferPoints.push(long, lat);
        positions.push(cartographic);
        coOrdinates.push(long + ' ' + lat);
      });

      activeAirspaceEntities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(bufferPoints),
          material: Cesium.Color.fromRgba(0x30008eff),
          outline: true,
          outlineColor: Cesium.Color.fromRgba(0x88008eff),
          outlineWidth: 10.0,
          height: 0,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            50000.0
          ),
          // Cesium.Color.fromRgba(0xFFF09859),
          // fill: true,
        },
        id: val.MissionId,
        description:
          '<p>Operation Name : ' +
          val.OperationName +
          '</p>' +
          '<p>End Time : ' +
          this.dateAndTimeFormat.dateAndTimeFormatting(
            new Date(val.EndTime),
            'dateAndTime'
          ) +
          '</p>',
      });
    });
  }
  getActiveAirBufferSpacesOnCoRelation(
    activeBuffers,
    activeAirspaceEntities,
    viewer?,
    entitiesOfReservedAirspaces?
  ) {
    this.removeEntities(activeAirspaceEntities, 'Mission');
    entitiesOfReservedAirspaces = [];

    activeBuffers.forEach((val, index) => {
      let bufferPoints = [];
      let positions = [];
      let coOrdinates = [];
      val.BufferRegion.forEach((values) => {
        var cartographic = Cesium.Cartographic.fromCartesian(values);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let long = Cesium.Math.toDegrees(cartographic.longitude);
        // bufferPoints.push(Cesium.Cartesian3.fromDegrees(long, lat));

        bufferPoints.push(long, lat);
        positions.push([long, lat, cartographic.height]);
        coOrdinates.push(long + ' ' + lat);
      });
      entitiesOfReservedAirspaces.push({
        coOrdinates: positions,
        type: 'Active',
        zone: 'reservedAirspaces',
        value: 'Reserved Airspaces',
      });

      activeAirspaceEntities.add({
        polygon: {
          // hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(bufferPoints),
          hierarchy: Cesium.Cartesian3.fromDegreesArray(bufferPoints),

          material: Cesium.Color.fromRgba(0x30008eff),
          outline: true,
          outlineColor: Cesium.Color.fromRgba(0x88008eff),
          outlineWidth: 10.0,
          // height: 0,
          extrudedHeight: 0,
          perPositionHeight: true,
          // Cesium.Color.fromRgba(0xFFF09859),
          // fill: true,
        },
        id: val.MissionId,
        description:
          '<p>Operation Name : ' +
          val.OperationName +
          '</p>' +
          '<p>Start Time : ' +
          this.dateAndTimeFormat.dateAndTimeFormatting(
            new Date(val.StartTime),
            'dateAndTime'
          ) +
          '</p>' +
          '<p>End Time : ' +
          this.dateAndTimeFormat.dateAndTimeFormatting(
            new Date(val.EndTime),
            'dateAndTime'
          ) +
          '</p>',
      });
    });
    return entitiesOfReservedAirspaces;
  }
  //Display billboard for active airspace
  billboardForActiveAirspace(
    activeBuffers,
    activeAirspaceImageEntities,
    viewer
  ) {
    this.removeEntities(activeAirspaceImageEntities, 'ActiveAirspace');
    activeBuffers.forEach((val, index) => {
      let cartographic = Cesium.Cartographic.fromCartesian(val.BufferRegion[0]);
      let lat = Cesium.Math.toDegrees(cartographic.latitude);
      let long = Cesium.Math.toDegrees(cartographic.longitude);

      activeAirspaceImageEntities.add({
        position: Cesium.Cartesian3.fromDegrees(long, lat, 130),
        // , 10000
        billboard: {
          image: '../../../../assets/common-layout/Drone - AFinal.svg',
          // DroneLight.svg
          // Navifly_loader_transparent.gif
          // Drone - A.svg

          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            50000.0,
            5000000.0
          ),
          scaleByDistance: new Cesium.NearFarScalar(50000, 1.2, 5000000.0, 1.0),
          // height: 30,
          // width:100
          // scale: 1.2,
        },
        id: 'ActiveAirspace' + index,
      });
    });
  }
  //2d Load Waypoints
  loadWayPoints2D(viewer, LongitudeArr, LatitudeArr, AltitudeArr) {
    this.removeEntities(viewer.entities, 'WayPoint');
    let positions = [];
    LongitudeArr.forEach((val, index) => {
      positions.push(val, LatitudeArr[index]);
    });
    viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(positions),
        width: 3,
        // ffb731 8e8e8e
        material: Cesium.Color.fromRgba(0x888e8e8e),
      },
      id: 'WayPoint',
    });
  }

  //3d Load Waypoints
  loadWayPoints(viewer, LongitudeArr, LatitudeArr, AltitudeArr) {
    this.removeEntities(viewer.entities, 'WayPoint');
    let positions = [];
    LongitudeArr.forEach((val, index) => {
      positions.push(val, LatitudeArr[index], AltitudeArr[index]);
    });
    viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
        width: 3,
        // ffb731 8e8e8e
        material: Cesium.Color.fromRgba(0x888e8e8e),
      },
      id: 'WayPoint',
    });
  }

  //Label Waypoints
  labelWaypoints(viewer, Long, Lat, Alt, wayPointsNum) {
    //Long, Lat, Alt - Mission Values
    // LongitudeArr, LatitudeArr, AltitudeArr - Terrain Calculated Values
    this.removeEntities(viewer.entities, 'Label');

    for (let i = 0; i < Long.length; i++) {
      viewer.entities.add({
        id: 'Label' + Number(i + 1),
        label: {
          id: 'Label' + Number(i) + 1,
          text: String(Number(i) + 1),
          font: '18px sans-serif',
          showBackground: true,
          backgroundColor: Cesium.Color.TRANSPARENT,
          // ffb731  8e8e8e
          fillColor: Cesium.Color.fromRgba(0xff8e8e8e),
        },
        position: Cesium.Cartesian3.fromDegrees(
          Number(Long[i]) + 0.000001,
          Number(Lat[i]) + 0.000001,
          Number(Alt[i]) + 0.000001
        ),
        showBackground: true,
      });
    }
  }

  // Buffer Region
  bufferRegion(viewer, bufferCoordinates) {
    this.removeEntities(viewer.entities, 'BufferRegion');
    let bufferArr = [];

    bufferCoordinates.forEach((arr, index) => {
      var cartographic = Cesium.Cartographic.fromCartesian(arr);
      bufferArr.push(
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
        cartographic.height
      );
    });

    let entity = viewer.entities.add({
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(bufferArr),
        material: Cesium.Color.fromRgba(0x11ffb731), // Cesium.Color.fromRgba(0x40f6f6f6),
        outline: false,
        // outlineColor: Cesium.Color.fromRgba(0x99f6f6f6),
        fill: true,
        extrudedHeight: 0,
        perPositionHeight: true,
      },
      id: 'BufferRegion',
    });
    return entity;
  }
  bufferRegion2D(viewer, bufferCoordinates) {
    this.removeEntities(viewer.entities, 'BufferRegion2D');

    let bufferArr = [];
    bufferCoordinates.forEach((value, index) => {
      bufferArr.push(value[0], value[1]);
    });
    viewer.entities.add({
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(bufferArr),
        // Cesium.Color.fromRgba(0x40f6f6f6)
        material: Cesium.Color.fromRgba(0x11ffb731),
        outline: false,
        extrudedHeight: 0,
        perPositionHeight: true,
      },
      id: 'BufferRegion2D',
    });
  }
  bufferRegion2Ds(viewer, bufferCoordinates) {
    this.removeEntities(viewer.entities, 'BufferRegion2D');

    let bufferArr = [];
    bufferCoordinates.forEach((value, index) => {
      bufferArr.push(value[0], value[1]);
    });
    let entity = viewer.entities.add({
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(bufferArr),
        // Cesium.Color.fromRgba(0x40f6f6f6)
        material: Cesium.Color.fromRgba(0x11ffb731),
        outline: false,
        extrudedHeight: 0,
        perPositionHeight: true,
      },
      id: 'BufferRegion2D',
    });
    return entity;
  }
  removeBuffer2D(viewer) {
    this.removeEntities(viewer.entities, 'BufferRegion2D');
  }
  // polylineVolume(viewer, Longitude, Latitude, Altitude) {
  //   console.log("hit");
  //   this.removeEntities(viewer.entities, 'BufferRegion');
  //   let pos = [];
  //   Longitude.forEach((long, index) => {
  //     if (Altitude[index - 1] == 0 && index != 0) {
  //       //Takeoff
  //       if (Latitude[index + 1]) {
  //         let line = turf.lineString([
  //           [long, Latitude[index]],
  //           [Longitude[index + 1], Latitude[index + 1]],
  //         ]);
  //         let along = turf.along(line, 0.01, { units: 'kilometers' }).geometry
  //           .coordinates;
  //         // (Altitude[index]/3333)
  //         pos.push(...along, Number(Altitude[index]) - 50);
  //       } else {
  //         pos.push(long, Latitude[index], Number(Altitude[index]) - 50);
  //       }
  //     } else if (Altitude[index + 1] == 0 && index != 0) {
  //       //Land
  //       if (Latitude[index - 1]) {
  //         let line = turf.lineString([
  //           [long, Latitude[index]],
  //           [Longitude[index - 1], Latitude[index - 1]],
  //         ]);
  //         let along = turf.along(line, 0.01, { units: 'kilometers' }).geometry
  //           .coordinates;

  //         pos.push(...along, Number(Altitude[index]) - 50);
  //       } else {
  //         pos.push(long, Latitude[index], Number(Altitude[index]) - 50);
  //       }
  //     } else if (Altitude[index] == 0) {
  //       // if(index == 0 && Latitude[index]==Latitude[index+1] && long == Longitude[index+1] && Latitude[index+2]) {
  //       //   let diffLat = Latitude[index+2]-Latitude[index+1];
  //       //   let diffLng = Longitude[index+2]-Longitude[index+1];
  //       //   console.log(diffLat,diffLng,Altitude[index]);
  //       //   pos.push(diffLng<0 ? Number(long)+0.00007 : Number(long)-0.00007, diffLat<0 ? Number(Latitude[index])+0.00007 : Number(Latitude[index])-0.00007, Number(Altitude[index])-50);
  //       // } else {
  //       //   pos.push(long, Latitude[index], Number(Altitude[index]));
  //       // }

  //       pos.push(long, Latitude[index], Number(Altitude[index]));
  //     } else {
  //       pos.push(long, Latitude[index], Number(Altitude[index]) - 50);
  //     }

  //     //       if(Latitude[index]==Latitude[index-1] && long==Longitude[index-1]) {
  //     // console.log(Latitude[index-1]-Latitude[index-2],Longitude[index-1]-Longitude[index-2])
  //     //         // console.log(pos[pos.length-1]);
  //     //         // pos[pos.length-1] = pos[pos.length-1]/2;
  //     //         pos.push(long+0.0005,Latitude[index]+0.0005,Number(Altitude[index])-50);
  //     //         // Altitude[index]==0? 15 :
  //     //       } else {
  //     //         pos.push(long,Latitude[index],Number(Altitude[index])-50)
  //     //       }
  //   });
  //   console.log(pos,"pos");
  //   const entity = viewer.entities.add({
  //     polylineVolume: {
  //       positions: Cesium.Cartesian3.fromDegreesArrayHeights(pos),
  //       shape: [
  //         new Cesium.Cartesian2(-50, -50),
  //         new Cesium.Cartesian2(50, -50),
  //         new Cesium.Cartesian2(50, 50),
  //         new Cesium.Cartesian2(-50, 50),
  //       ],
  //       cornerType: Cesium.CornerType.MITERED,
  //       // material: Cesium.Color.GREEN.withAlpha(0.5),
  //       outline: false,
  //       material: Cesium.Color.fromRgba(0x11ffb731),
  //       // outlineColor: Cesium.Color.BLACK,
  //     },
  //     id: 'BufferRegion',
  //   });
  //   // viewer.flyTo(entity);
  //   return entity;
  // }

  async polylineVolume(viewer, Longitude, Latitude, Altitude) {
    this.removeEntities(viewer.entities, 'BufferRegion');
    let pos = [];
    let payload = {
      Latitude: Latitude,
      Longitude: Longitude,
      Altitude: Altitude,
    };
    const res = await this.operatorApi
      .getPolyLineVolume(payload)
      .then((res) => res);
    pos = res.data.MainData;
    const entity = viewer.entities.add({
      polylineVolume: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(pos),
        shape: [
          new Cesium.Cartesian2(-50, -50),
          new Cesium.Cartesian2(50, -50),
          new Cesium.Cartesian2(50, 50),
          new Cesium.Cartesian2(-50, 50),
        ],
        cornerType: Cesium.CornerType.MITERED,
        // material: Cesium.Color.GREEN.withAlpha(0.5),
        outline: false,
        material: Cesium.Color.fromRgba(0x11ffb731),
        // outlineColor: Cesium.Color.BLACK,
      },
      id: 'BufferRegion',
    });
    // viewer.flyTo(entity);
    return entity;
  }

  //Zoom to entity
  zoomEntity(viewer, entity, waypointPath) {
    const boundingSphere = Cesium.BoundingSphere.fromPoints(waypointPath);
    const range = boundingSphere.radius * 2;
    const offset = new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(0),
      Cesium.Math.toRadians(-30),
      range * 2
    );
    viewer.zoomTo(entity, offset);
  }
  zoomEntity1(viewer, entity, waypointPath) {
    const boundingSphere = Cesium.BoundingSphere.fromPoints(waypointPath);
    const range = boundingSphere.radius * 2;
    const offset = new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(0),
      Cesium.Math.toRadians(-30),
      range * 3
    );
    viewer.zoomTo(entity, offset);
  }
//  zoomEntity1(viewer, entity, waypointPath) {
//     try {
//       if (!waypointPath?.length) return;
//       const boundingSphere = Cesium.BoundingSphere.fromPoints(waypointPath);
//       const range = boundingSphere.radius * 2;
//       const offset = new Cesium.HeadingPitchRange(
//         Cesium.Math.toRadians(0),
//         Cesium.Math.toRadians(-30),
//         range * 3
//       );
//       viewer?.zoomTo(entity, offset);
//     } catch (error) {
//       console.error('zoomEntity1 failed:', error);
//     }
//   }
  zoomEntity2(viewer, entity, waypointPath) {
    return new Promise((resolve) => {
      const boundingSphere = Cesium.BoundingSphere.fromPoints(waypointPath);
      const range = boundingSphere.radius * 2;
      const offset = new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(-30),
        range * 2
      );
      viewer.zoomTo(entity, offset);
      viewer.camera.moveEnd.addEventListener(() => {
        resolve(range);
      });
    });
  }

  // Hubs
  createHub(viewer, poly, PlusCode) {
    // FC6CDA
    viewer.entities.add({
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(poly),
        // Cesium.Color.fromRgba(0x40f6f6f6)
        material: Cesium.Color.fromRgba(0x08da6cfc),
        outline: true,
        outlineColor: Cesium.Color.fromRgba(0xffda6cfc),
        // extrudedHeight: 0,
        // perPositionHeight: true,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      id: 'Hub ' + PlusCode,
    });
  }
  //3D Models
  // droneImages3D(viewer, lat, long, alt, nav_bearing, nav_pitch, nav_roll) {
  //   var cameraPosition = viewer.scene.camera.positionWC;
  //   var ellipsoidPosition =
  //     viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
  //   var distance = Cesium.Cartesian3.magnitude(
  //     Cesium.Cartesian3.subtract(
  //       cameraPosition,
  //       ellipsoidPosition,
  //       new Cesium.Cartesian3()
  //     )
  //   );
  //   let scale =
  //     distance >= 100000 && distance <= 500000
  //       ? 0.002
  //       : distance > 500000
  //       ? 0.0001
  //       : 0.2;

  //   // const lat = 13.6563435;
  //   // const long = 80.3555555;

  //   // 3D Drone image
  //   // this.webSocketValue.nav_bearing
  //   var heading = Cesium.Math.toRadians(nav_bearing - 90);
  //   //  Cesium.Math.toRadians(this.webSocketValue.nav_bearing);
  //   var pitch = Cesium.Math.toRadians(nav_pitch);
  //   var roll = Cesium.Math.toRadians(nav_roll);
  //   // nav_pitch nav_roll
  //   var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  //   var orientation = Cesium.Transforms.headingPitchRollQuaternion(
  //     Cesium.Cartesian3.fromDegrees(long, lat, alt),
  //     hpr
  //   );

  //   const position = Cesium.Cartesian3.fromDegrees(long,lat,alt);
  //   this.removeEntities(viewer.entities, 'Drone Image');
  //   let droneEntity = viewer.entities.add({
  //     name: 'Drone Image',
  //     id: 'Drone Image',
  //     position:position,
  //     scale: scale,
  //     orientation: orientation,
  //     model: {
  //       uri: '../../../assets/common-layout/CesiumDrone.glb',
  //       minimumPixelSize: 100,
  //       maximumScale: 100,
  //       scale: scale,
  //     },
  //   });
  //   return droneEntity;
  // }

  droneImages3D(viewer, lat, long, alt, nav_bearing, nav_pitch, nav_roll) {
    var cameraPosition = viewer.scene.camera.positionWC;
    var ellipsoidPosition =
      viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
    var distance = Cesium.Cartesian3.magnitude(
      Cesium.Cartesian3.subtract(
        cameraPosition,
        ellipsoidPosition,
        new Cesium.Cartesian3()
      )
    );
    let scale =
      distance >= 100000 && distance <= 500000
        ? 0.002
        : distance > 500000
        ? 0.0001
        : 0.2;

    // const lat = 13.6563435;
    // const long = 80.3555555;

    // 3D Drone image
    // this.webSocketValue.nav_bearing
    var heading = Cesium.Math.toRadians(nav_bearing - 90);
    //  Cesium.Math.toRadians(this.webSocketValue.nav_bearing);
    var pitch = Cesium.Math.toRadians(nav_pitch);
    var roll = Cesium.Math.toRadians(nav_roll);
    // nav_pitch nav_roll
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(long, lat, alt),
      hpr
    );
    const positionProperty = new Cesium.SampledPositionProperty();
    positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
    const time = Cesium.JulianDate.now();
    const position = Cesium.Cartesian3.fromDegrees(long, lat, alt);
    positionProperty.addSample(time, position);
    this.removeEntities(viewer.entities, 'Drone Image');
    let droneEntity = viewer.entities.add({
      name: 'Drone Image',
      id: 'Drone Image',
      position: positionProperty,
      scale: scale,
      orientation: orientation,
      model: {
        uri: '../../../assets/common-layout/CesiumDrone.glb',
        minimumPixelSize: 100,
        maximumScale: 100,
        scale: scale,
      },
    });
    viewer.scene.requestRender();
    return [droneEntity, positionProperty];
  }

  NewdroneImages3D(viewer, lat, long, alt, nav_bearing, nav_pitch, nav_roll) {
    var cameraPosition = viewer.scene.camera.positionWC;
    var ellipsoidPosition =
      viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
    var distance = Cesium.Cartesian3.magnitude(
      Cesium.Cartesian3.subtract(
        cameraPosition,
        ellipsoidPosition,
        new Cesium.Cartesian3()
      )
    );
    let scale =
      distance >= 100000 && distance <= 500000
        ? 2
        : distance > 500000
        ? 0.7
        : 1;
    // const lat = 13.6563435;
    // const long = 80.3555555;

    // 3D Drone image
    // this.webSocketValue.nav_bearing
    var heading = Cesium.Math.toRadians(nav_bearing - 90);
    //  Cesium.Math.toRadians(this.webSocketValue.nav_bearing);
    var pitch = Cesium.Math.toRadians(nav_pitch);
    var roll = Cesium.Math.toRadians(nav_roll);
    // nav_pitch nav_roll
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(long, lat, alt),
      hpr
    );
    const positionProperty = new Cesium.SampledPositionProperty();
    positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
    const time = Cesium.JulianDate.now();
    const position = Cesium.Cartesian3.fromDegrees(long, lat, alt);
    positionProperty.addSample(time, position);
    this.removeEntities(viewer.entities, 'Drone Image');

    let droneEntity;

    if (alt > 121.92) {
      droneEntity = viewer.entities.add({
        name: 'Drone Image',
        id: 'Drone Image',
        position: positionProperty,
        billboard: {
          image: '../assets/icons/active-flight-altitude.svg',
          scale: scale,
          scaleByDistance: new Cesium.NearFarScalar(100000, 1.0, 500000, 0.5),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    } else {
      droneEntity = viewer.entities.add({
        name: 'Drone Image',
        id: 'Drone Image',
        position: positionProperty,
        billboard: {
          image: '../assets/icons/active-flight.svg',
          scale: scale,
          scaleByDistance: new Cesium.NearFarScalar(100000, 1.0, 500000, 0.5),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    }

    return [droneEntity, positionProperty];
  }

  FixedWingdroneImages3D(
    viewer,
    lat,
    long,
    alt,
    nav_bearing,
    nav_pitch,
    nav_roll
  ) {
    var cameraPosition = viewer.scene.camera.positionWC;
    var ellipsoidPosition =
      viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
    var distance = Cesium.Cartesian3.magnitude(
      Cesium.Cartesian3.subtract(
        cameraPosition,
        ellipsoidPosition,
        new Cesium.Cartesian3()
      )
    );
    let scale =
      distance >= 100000 && distance <= 500000
        ? 0.3
        : distance > 500000
        ? 0.05
        : 0.03;

    // const lat = 13.6563435;
    // const long = 80.3555555;

    // 3D Drone image
    // this.webSocketValue.nav_bearing
    var heading = Cesium.Math.toRadians(nav_bearing - 180);
    //  Cesium.Math.toRadians(this.webSocketValue.nav_bearing);
    var pitch = Cesium.Math.toRadians(nav_pitch);
    var roll = Cesium.Math.toRadians(nav_roll);
    // nav_pitch nav_roll
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(long, lat, alt),
      hpr
    );
    const positionProperty = new Cesium.SampledPositionProperty();
    positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
    const time = Cesium.JulianDate.now();
    const position = Cesium.Cartesian3.fromDegrees(long, lat, alt);
    positionProperty.addSample(time, position);
    this.removeEntities(viewer.entities, 'Drone Image');

    let droneEntity = viewer.entities.add({
      name: 'Drone Image',
      id: 'Drone Image',
      position: positionProperty,
      scale: scale,
      orientation: orientation,
      model: {
        uri: '../../../assets/common-layout/new_drone.glb',
        minimumPixelSize: 50,
        maximumScale: 500,
        scale: scale,
      },
    });
    viewer.scene.requestRender();
    return [droneEntity, positionProperty];
  }

  NewFixedWingdroneImages3D(
    viewer,
    lat,
    long,
    alt,
    nav_bearing,
    nav_pitch,
    nav_roll
  ) {
    var cameraPosition = viewer.scene.camera.positionWC;

    var ellipsoidPosition =
      viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
    var distance = Cesium.Cartesian3.magnitude(
      Cesium.Cartesian3.subtract(
        cameraPosition,
        ellipsoidPosition,
        new Cesium.Cartesian3()
      )
    );
    let scale =
      distance >= 100000 && distance <= 500000
        ? 2
        : distance > 500000
        ? 0.7
        : 1;
    // const lat = 13.6563435;
    // const long = 80.3555555;

    // 3D Drone image
    // this.webSocketValue.nav_bearing
    var heading = Cesium.Math.toRadians(nav_bearing - 180);
    //  Cesium.Math.toRadians(this.webSocketValue.nav_bearing);
    var pitch = Cesium.Math.toRadians(nav_pitch);
    var roll = Cesium.Math.toRadians(nav_roll);
    // nav_pitch nav_roll
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(long, lat, alt),
      hpr
    );
    const positionProperty = new Cesium.SampledPositionProperty();
    positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
    const time = Cesium.JulianDate.now();
    const position = Cesium.Cartesian3.fromDegrees(long, lat, alt);
    positionProperty.addSample(time, position);
    this.removeEntities(viewer.entities, 'Drone Image');

    let droneEntity;
    // let altitudeLabel = {
    //   text: `Alt: ${alt.toFixed(2)}m`,
    //   // showBackground: true,
    //   // backgroundColor: Cesium.Color.fromCssColorString('#1b1f27'),
    //   fillColor: Cesium.Color.BLACK,
    //   font: '16px sans-serif',
    //   scale: scale,
    //   distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
    //     0.0,
    //     200000.0
    //   ),
    //   horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    //   verticalOrigin: Cesium.VerticalOrigin.TOP,
    //   pixelOffset: new Cesium.Cartesian2(0, 15), // Adjust as needed
    // }
    if (alt > 121.92) {
      droneEntity = viewer.entities.add({
        name: 'Drone Image',
        id: 'Drone Image',
        position: positionProperty,
        billboard: {
          image: '../assets/icons/active-fixed-drone-altitude.svg',
          scale: scale,
          scaleByDistance: new Cesium.NearFarScalar(100000, 1.0, 500000, 0.5),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    } else {
      droneEntity = viewer.entities.add({
        name: 'Drone Image',
        id: 'Drone Image',
        position: positionProperty,
        billboard: {
          image: '../assets/icons/active-fixed-drone.svg',
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: scale,
          scaleByDistance: new Cesium.NearFarScalar(100000, 1.0, 500000, 0.5),
        },
      });
    }

    return [droneEntity, positionProperty];
  }

  // updateDroneImage3D(lat, long, alt, nav_bearing, nav_pitch, nav_roll, entity) {
  //   var heading = Cesium.Math.toRadians(nav_bearing - 90);
  //   //  Cesium.Math.toRadians(this.webSocketValue.nav_bearing);
  //   var pitch = Cesium.Math.toRadians(nav_pitch);
  //   var roll = Cesium.Math.toRadians(nav_roll);
  //   // nav_pitch nav_roll
  //   var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  //   const position = Cesium.Cartesian3.fromDegrees(long, lat, alt);

  //   var orientation = Cesium.Transforms.headingPitchRollQuaternion(
  //     Cesium.Cartesian3.fromDegrees(long, lat, alt),
  //     hpr
  //   );

  //   entity.orientation = orientation;
  //   entity.position = position;
  // }

  updateDroneImage3D(
    lat,
    long,
    alt,
    nav_bearing,
    nav_pitch,
    nav_roll,
    entity,
    viewer?,
    positionProperty?
  ) {
    var heading = Cesium.Math.toRadians(nav_bearing - 90);
    //  Cesium.Math.toRadians(this.webSocketValue.nav_bearing);
    var pitch = Cesium.Math.toRadians(nav_pitch);
    var roll = Cesium.Math.toRadians(nav_roll);
    // nav_pitch nav_roll
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const timeStepInSeconds = 0.6;
    const start = Cesium.JulianDate.now();
    const stop = Cesium.JulianDate.addSeconds(
      start,
      timeStepInSeconds * 1000,
      new Cesium.JulianDate()
    );
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.multiplier = 1.05;

    const time = Cesium.JulianDate.addSeconds(
      start,
      0.6,
      new Cesium.JulianDate()
    );
    const position = Cesium.Cartesian3.fromDegrees(long, lat, alt);
    positionProperty.addSample(time, position);

    var orientation = Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(long, lat, alt),
      hpr
    );

    entity.orientation = orientation;
  }
  FixedupdateDroneImage3D(
    lat,
    long,
    alt,
    nav_bearing,
    nav_pitch,
    nav_roll,
    entity,
    viewer?,
    positionProperty?
  ) {
    var heading = Cesium.Math.toRadians(nav_bearing - 180);
    //  Cesium.Math.toRadians(this.webSocketValue.nav_bearing);
    var pitch = Cesium.Math.toRadians(nav_pitch);
    var roll = Cesium.Math.toRadians(nav_roll);
    // nav_pitch nav_roll
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const timeStepInSeconds = 0.6;
    const start = Cesium.JulianDate.now();
    const stop = Cesium.JulianDate.addSeconds(
      start,
      timeStepInSeconds * 1000,
      new Cesium.JulianDate()
    );
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.multiplier = 1.05;

    const time = Cesium.JulianDate.addSeconds(
      start,
      0.6,
      new Cesium.JulianDate()
    );
    const position = Cesium.Cartesian3.fromDegrees(long, lat, alt);
    positionProperty.addSample(time, position);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(long, lat, alt),
      hpr
    );
    entity.orientation = orientation;
  }

  //Drone image without all data
  droneImageLatLong(viewer, lat, long, alt) {
    var cameraPosition = viewer.scene.camera.positionWC;
    var ellipsoidPosition =
      viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
    var distance = Cesium.Cartesian3.magnitude(
      Cesium.Cartesian3.subtract(
        cameraPosition,
        ellipsoidPosition,
        new Cesium.Cartesian3()
      )
    );

    let scale =
      distance >= 100000 && distance <= 500000
        ? 0.002
        : distance > 500000
        ? 0.0001
        : 0.2;

    // let scale =
    //   distance >= 100000 && distance <= 500000
    //     ? 0.2
    //     : distance > 500000
    //       ? 0.05
    //       : 0.4;

    this.removeEntities(viewer.entities, 'Drone Image');
    let droneEntity = viewer.entities.add({
      name: 'Drone Image',
      id: 'Drone Image',
      position: Cesium.Cartesian3.fromDegrees(long, lat, alt),
      scale: scale,
      model: {
        uri: '../../../assets/common-layout/CesiumDrone.glb',
        minimumPixelSize: 130,
        maximumScale: 400,
      },
    });
    return droneEntity;
  }
  updatedroneImageLatLong(lat, long, alt, entity) {
    entity.position = Cesium.Cartesian3.fromDegrees(long, lat, alt);
  }
  // Live drone buffer
  async droneBuffer3D(viewer, lat, long, alt) {
    // let point = turf.point([long, lat]);
    // let buffered: any = turf.buffer(point, Constants.droneBuffer);
    let payload = {
      Latitude: lat,
      Longitude: long,
      BufferType: 'Point',
    };
    const res: any = await this.operatorApi
      .getBuffer(payload)
      .then((res) => res);
    let buffered = res.data.MainData;
    this.removeEntities(viewer.entities, 'Drone Boundary');
    let droneBufferHierarchy = new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray(
        buffered.geometry.coordinates[0].flat()
      )
    );
    let droneEntity = viewer.entities.add({
      name: 'Drone Boundary',
      id: 'Drone Boundary',
      polygon: {
        hierarchy: new Cesium.CallbackProperty(
          () => droneBufferHierarchy,
          false
        ),

        height: alt,
        outline: true,
        outlineColor: Cesium.Color.fromRgba(0x668e8e8e),
        outlineWidth: 3,
        material: Cesium.Color.fromRgba(0x158e8e8e),
      },
    });
    return [droneEntity, droneBufferHierarchy];
  }

  async updatedroneBuffer3D(
    entity,
    lat,
    long,
    alt,
    warningDisplay,
    droneBufferHierarchy
  ) {
    let point = turf.point([long, lat]);
    let buffered: any = turf.buffer(point, Constants.droneBuffer);
    // let payload = {
    //   Latitude: lat,
    //   Longitude: long,
    //   BufferType: 'Point',
    // };
    // const res: any = await this.operatorApi
    //   .getBuffer(payload)
    //   .then((res) => res);
    // let buffered = res.data.MainData;
    droneBufferHierarchy.positions = Cesium.Cartesian3.fromDegreesArray(
      buffered.geometry.coordinates[0].flat()
    );
    if (warningDisplay) {
      entity.polygon.outlineColor = Cesium.Color.fromRgba(0x660000ff);
      entity.polygon.material = Cesium.Color.fromRgba(0x110000ff);
    } else {
      entity.polygon.outlineColor = Cesium.Color.fromRgba(0x668e8e8e);
      entity.polygon.material = Cesium.Color.fromRgba(0x158e8e8e);
    }
    entity.polygon.height = alt;
  }

  // custom label waypoints
  customLabelWaypoints(viewer, wayPointFileDetails, AltitudeArr?) {
    let wayPointVal = [
      {
        num: 20,
        label: 'Return to launch',
      },
      {
        num: 21,
        label: 'Land',
      },
      {
        num: 22,
        label: 'Takeoff',
      },
      {
        num: 93,
        label: 'Delay',
      },
    ];
    this.removeEntities(viewer.entities, 'CustomLabel');

    let firstIndex = false;
    let Altitude = 0;
    let lat, lng, alt;
    let prevLat, prevLng, prevAlt;
    wayPointFileDetails.forEach((arr, index) => {
      if (arr[8] && arr[9] && arr[10]) {
        let filteredval = wayPointVal.find((val) => {
          return val.num == Number(arr[3]);
        });
        if (filteredval) {
          if (firstIndex == false) {
            // Altitude from mean sea level
            // Altitude = Number(arr[10]);
            // Altitude from ground
            // Altitude = 0;
            firstIndex = true;
            lat = arr[8];
            lng = arr[9];
            alt = arr[10];
          }
          //  else {
          prevLat = wayPointFileDetails[index - 1][8];
          prevLng = wayPointFileDetails[index - 1][9];
          prevAlt = wayPointFileDetails[index - 1][10];
          // }

          let labelValue: any = {
            id: 'CustomLabel' + index,
            label: {
              id: 'CustomLabel' + index,
              text: filteredval.label,
              font: '20px sans-serif',
              // fillColor: new Cesium.Color(0.048, 0.086, 0.175, 1),
              fillColor: Cesium.Color.fromRgba(0xff8e8e8e),
              pixelOffset: new Cesium.Cartesian2(10, 20),
              // showBackground: true,
              // backgroundColor: new Cesium.Color(0.048, 0.086, 0.175, 0.8),
            },
            // position: AltitudeArr && Altitude ? Cesium.Cartesian3.fromDegrees(Number(arr[9]), Number(arr[8]), Altitude + Number(arr[10])) : Cesium.Cartesian3.fromDegrees(Number(arr[9]), Number(arr[8])),
            showBackground: true,
          };
          if (filteredval.num == 22) {
            labelValue = {
              ...labelValue,
              position: AltitudeArr
                ? Cesium.Cartesian3.fromDegrees(
                    Number(prevLng),
                    Number(prevLat),
                    Altitude + Number(arr[10])
                  )
                : Cesium.Cartesian3.fromDegrees(
                    Number(prevLng),
                    Number(prevLat)
                  ),
            };
          } else if (filteredval.num == 20) {
            labelValue = {
              ...labelValue,
              position: AltitudeArr
                ? Cesium.Cartesian3.fromDegrees(
                    Number(lng),
                    Number(lat),
                    Altitude + 0
                  )
                : Cesium.Cartesian3.fromDegrees(Number(lng), Number(lat)),
            };
          } else if (filteredval.num == 21) {
            labelValue = {
              ...labelValue,
              position: Altitude
                ? Cesium.Cartesian3.fromDegrees(
                    Number(arr[9]),
                    Number(arr[8]),
                    Altitude + 0
                  )
                : Cesium.Cartesian3.fromDegrees(Number(arr[9]), Number(arr[8])),
            };
          } else {
            labelValue = {
              ...labelValue,
              point: {
                pixelSize: 5,
                color: new Cesium.Color(0.048, 0.086, 0.175, 0.5),
                // new Cesium.Color(0.048, 0.086, 0.175, 1)
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
              },
              position: Altitude
                ? Cesium.Cartesian3.fromDegrees(
                    Number(arr[9]),
                    Number(arr[8]),
                    Altitude + Number(arr[10])
                  )
                : Cesium.Cartesian3.fromDegrees(Number(arr[9]), Number(arr[8])),
            };
          }
          viewer.entities.add(labelValue);
        }
      }
    });
  }
  //Drone Trailing
  droneTrailing(viewer, dronePathArr) {
    this.removeEntities(viewer.entities, 'Drone Path');
    let droneEntitiy = [];
    dronePathArr.forEach((val, index) => {
      droneEntitiy.push(
        viewer.entities.add({
          name: 'Drone Path',
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(val),
            width: 2,
            material: Cesium.Color.fromRgba(0xaa3dcbff),
          },

          // polyline: {
          //   positions: Cesium.Cartesian3.fromDegreesArray(dronePathArr),
          //   // Heights
          //   material: Cesium.Color.fromRgba(0x44333333),
          //   // outline: true,
          //   // outlineColor: Cesium.Color.fromRgba(0xFF333333),
          //   // fill: true,
          //   width: 5,
          // },
          id: 'Drone Path' + index,
        })
      );
    });
    return droneEntitiy;
  }
  updateDroneTrailing(dronePathArr, entities) {
    // let dronePath = [];
    // dronePathArr.forEach((val, index) => {
    //   dronePath.push(...val);
    // });
    entities.forEach((entity, index) => {
      entity.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights(
        dronePathArr[index]
      );
    });
  }
  droneTrailingParts(viewer, dronePathArr, entities?) {
    if (entities) {
      dronePathArr.forEach((val, index) => {
        if (entities[index]) {
          let entity = entities[index];

          entity.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights(
            dronePathArr[index]
          );
        } else {
          entities.push(
            viewer.entities.add({
              name: 'Drone Path',
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(val),
                width: 2,
                material: Cesium.Color.fromRgba(0xaa3dcbff),
              },
              id: 'Drone Path' + index,
            })
          );
        }
      });
    } else {
      this.removeEntities(viewer.entities, 'Drone Path');
      // let droneEntitiy = [];
      entities = [];
      dronePathArr.forEach((val, index) => {
        entities.push(
          viewer.entities.add({
            name: 'Drone Path',
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArrayHeights(val),
              width: 2,
              material: Cesium.Color.fromRgba(0xaa3dcbff),
            },
            id: 'Drone Path' + index,
          })
        );
      });
    }
    return entities;
  }
  droneTrailingBillboard(trailingData, viewer) {
    this.removeEntities(viewer.entities, 'Trailing Lost');
    trailingData.forEach((value, index) => {
      if (value?.ConnectionRegain || value?.ConnectionLost) {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            value.lng,
            value.lat,
            value.alt + 5
          ),
          billboard: {
            image: value?.ConnectionRegain
              ? '../../../../assets/common-layout/Link.svg'
              : '../../../../assets/common-layout/Link-Broken.svg',
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0.0,
              50000.0
            ),
            scaleByDistance: new Cesium.NearFarScalar(0, 1.4, 50000.0, 1.2),
          },
          id: 'Trailing Lost' + index,
        });
      }
    });
  }

  planeBillboard(planes, viewer) {
    this.removeEntities(viewer.entities, 'Plane Finder');
    this.removeEntities(viewer.entities, 'Plane Desc Pins');
    planes?.forEach((plane, index) => {
      let billboard;
      var heading = Cesium.Math.toRadians(plane?.heading - 180);

      if (plane.altitude > 1000) {
        billboard = {
          // image: '../../../../assets/common-layout/plane.png',
          // image: '../../../../assets/common-layout/plane-gray.svg',
          image: '../assets/icons/plane-finder-1.png',
          scale: 0.4,
          scaleByDistance: new Cesium.NearFarScalar(0, 1.4, 60000.0, 1.2),
          rotation: heading || 0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        };
      } else {
        billboard = {
          // image: '../../../../assets/common-layout/plane.png',
          // image: '../../../../assets/common-layout/plane-gray.svg',
          image: '../assets/icons/plane-finder-2.png',
          scale: 0.4,
          scaleByDistance: new Cesium.NearFarScalar(0, 1.4, 60000.0, 1.2),
          rotation: heading || 0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        };
      }
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          plane?.lon,
          plane?.lat,
          plane?.altitude
        ),
        billboard: billboard,
        id: 'Plane Finder' + index,
      });

      viewer.entities.add({
        id: 'Plane Desc Pins' + index,
        position: Cesium.Cartesian3.fromDegrees(
          plane?.lon,
          plane?.lat,
          plane?.altitude
        ),
        label: {
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          text: `Lon: ${plane?.lon}\nLat: ${plane?.lat} \nAlt: ${plane?.altitude}`,
          backgroundPadding: new Cesium.Cartesian2(5, 5), // Adjust padding as needed
          backgroundColor: Cesium.Color.fromCssColorString('#1b1f27'), // Background color of the label
          showBackground: true, // Set to true to show the background
          fillColor: Cesium.Color.WHITE,
          font: '24px sans-serif',
          scale: 0.5,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0.0,
            20000.0
          ),
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(-50, -25),
        },
      });
    });
    viewer.scene.requestRender();
  }
  // addBillboard(viewer, planes) {
  //   this.removeEntities(viewer.entities, 'Pods');
  //   this.removeEntities(viewer.entities, 'PodsLabel');
  //   this.removeEntities(viewer.entities, 'Poddata1');
  //   planes.forEach((data,index) => {
  //     if(data.Long >= 74 && data.Lat <= 30 && data.Lat.toString().includes('.') && data.Long.toString().includes('.'))
  //       {
  //         const svgLatLongInfo =
  //           '<svg width="355" height="140" viewBox="0 0 352 88" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  //           '<rect x="0.0" y="0.5" width="354" height="139" rx="5.5" fill="#1F2937"/>' +
  //             `<text x="10" y="30" font-family="Arial" font-size="26" fill="white">Lat: ${data.Lat?.toFixed(
  //               14
  //            )}</text>` +
  //            `<text x="10" y="65" font-family="Arial" font-size="26" fill="white">Long: ${data.Long?.toFixed(
  //               14
  //             )}</text>` +
  //             `<text x="10" y="100" font-family="Arial" font-size="26" fill="white">Name: ${data.Name}</text>` +
  //            '<rect x="0.5" y="0.5" width="354" height="139" rx="5.5" stroke="#7A8EAE"/>' +
  //            '<path d="M339.667 17.625H327.667C326.194 17.625 325 18.7816 325 20.2083V31.8333C325 33.2601 326.194 34.4167 327.667 34.4167H339.667C341.139 34.4167 342.333 33.2601 342.333 31.8333V20.2083C342.333 18.7816 341.139 17.625 339.667 17.625Z" stroke="white" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>' +
  //             '<path d="M319.667 25.3747H318.333C317.626 25.3747 316.948 25.1025 316.448 24.618C315.948 24.1336 315.667 23.4765 315.667 22.7913V11.1663C315.667 10.4812 315.948 9.82412 316.448 9.33965C316.948 8.85518 317.626 8.58301 318.333 8.58301H330.333C331.041 8.58301 331.719 8.85518 332.219 9.33965C332.719 9.82412 333 10.4812 333 11.1663V12.458" stroke="white" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>' +
  //           '</svg>';


  //       var svgLatLongInfoUri = 'data:image/svg+xml;base64,' + btoa(svgLatLongInfo);
  //       const billboard = {
  //         image: '../assets/icons/pods.svg',
  //         scale: 0.4,
  //         scaleByDistance: new Cesium.NearFarScalar(0, 1.4, 60000.0, 1.2),
  //         rotation: 0,
  //         disableDepthTestDistance: Number.POSITIVE_INFINITY,
  //         width: 100,
  //         height: 80,
  //         show: true,
  //       };
  //       viewer.entities.add({
  //         position: Cesium.Cartesian3.fromDegrees(
  //           data?.Long,
  //           data?.Lat,
  //           0
  //         ),
  //         billboard: billboard,
  //         id: 'Pods' + index,
  //       });
  //       var position = Cesium.Cartesian3.fromDegrees(data.Long, data.Lat);
  //       viewer.entities.add({
  //         id: 'Podsdata' + index,
  //         position: position,
  //         billboard: {
  //           image: svgLatLongInfoUri,
  //           pixelOffset: new Cesium.Cartesian2(60, -58),
  //           heightReference:
  //             viewer.scene.mode === Cesium.SceneMode.SCENE3D
  //               ? Cesium.HeightReference.CLAMP_TO_GROUND
  //               : Cesium.HeightReference.NONE,
  //           scale: 0.5,
  //           disableDepthTestDistance: Number.POSITIVE_INFINITY,
  //         },
  //       });
  //     }
  //   })
  //   viewer.scene.requestRender();
  // }
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  addBillboard(viewer, planes) {
    this.removeEntities(viewer.entities, 'Pods');
    this.removeEntities(viewer.entities, 'PodsLabel');
    this.removeEntities(viewer.entities, 'Poddata1');

    // Store references to hover timeouts and the currently visible entity
    const hoverTimeouts = {};
    let currentVisibleEntityId = null;

    planes.forEach((data, index) => {

        const svgLatLongInfo =
          '<svg width="355" height="140" viewBox="0 0 352 88" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="0.0" y="0.5" width="354" height="139" rx="5.5" fill="#1F2937"/>' +
          `<text x="10" y="30" font-family="Arial" font-size="26" fill="white">Lat: ${data.Lat?.toFixed(
            14
          )}</text>` +
          `<text x="10" y="65" font-family="Arial" font-size="26" fill="white">Long: ${data.Long?.toFixed(
            14
          )}</text>` +
          `<text x="10" y="100" font-family="Arial" font-size="26" fill="white">Name: ${data.Name}</text>` +
          '<rect x="0.5" y="0.5" width="354" height="139" rx="5.5" stroke="#7A8EAE"/>' +
          '<path d="M339.667 17.625H327.667C326.194 17.625 325 18.7816 325 20.2083V31.8333C325 33.2601 326.194 34.4167 327.667 34.4167H339.667C341.139 34.4167 342.333 33.2601 342.333 31.8333V20.2083C342.333 18.7816 341.139 17.625 339.667 17.625Z" stroke="white" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M319.667 25.3747H318.333C317.626 25.3747 316.948 25.1025 316.448 24.618C315.948 24.1336 315.667 23.4765 315.667 22.7913V11.1663C315.667 10.4812 315.948 9.82412 316.448 9.33965C316.948 8.85518 317.626 8.58301 318.333 8.58301H330.333C331.041 8.58301 331.719 8.85518 332.219 9.33965C332.719 9.82412 333 10.4812 333 11.1663V12.458" stroke="white" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>';

        const svgLatLongInfoUri =
          'data:image/svg+xml;base64,' + btoa(svgLatLongInfo);
        const billboard = {
          image: 'assets/icons/pod1.svg',
          scale: 0.4,
          scaleByDistance: new Cesium.NearFarScalar(0, 1.4, 60000.0, 1.2),
          rotation: 0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          show: true,
        };

        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(data?.Long, data?.Lat, 0),
          billboard: billboard,
          id: 'Pods' + index,
        });

        const position = Cesium.Cartesian3.fromDegrees(data.Long, data.Lat);

        viewer.entities.add({
          id: 'Podsdata' + index,
          position: position,
          billboard: {
            image: svgLatLongInfoUri,
            pixelOffset: new Cesium.Cartesian2(60, -58),
            heightReference:
              viewer.scene.mode === Cesium.SceneMode.SCENE3D
                ? Cesium.HeightReference.CLAMP_TO_GROUND
                : Cesium.HeightReference.NONE,
            scale: 0.5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            show: false, // Initially hidden
          },
        });
    });

    const billboardEventHandler = new Cesium.ScreenSpaceEventHandler(
      viewer.scene.canvas
    );

    // billboardEventHandler.setInputAction(
    //   this.debounce((movement) => {
    //     const pickedObject = viewer.scene.pick(movement.endPosition);
    //     if (
    //       pickedObject &&
    //       pickedObject.id &&
    //       typeof pickedObject.id.id === 'string' &&
    //       pickedObject.id.id.startsWith('Pods')
    //     ) {
    //       const index = pickedObject.id.id.replace('Pods', '');
    //       const podsdataId = 'Podsdata' + index;
    //       if (hoverTimeouts[podsdataId]) {
    //         clearTimeout(hoverTimeouts[podsdataId]);
    //       }
    //       if (currentVisibleEntityId && currentVisibleEntityId !== podsdataId) {
    //         const previousEntity = viewer.entities.getById(currentVisibleEntityId);
    //         if (previousEntity) {
    //           previousEntity.billboard.show = false;
    //           viewer.scene.requestRender();
    //         }
    //         currentVisibleEntityId = null;
    //       }
    //       hoverTimeouts[podsdataId] = setTimeout(() => {
    //         const entity = viewer.entities.getById(podsdataId);
    //         if (entity) {
    //           entity.billboard.show = true;
    //           currentVisibleEntityId = podsdataId;
    //           viewer.scene.requestRender();
    //         }
    //       },250);
    //     } else {
    //       viewer.entities.values.forEach((entity) => {
    //         if (entity.id.startsWith('Podsdata')) {
    //           clearTimeout(hoverTimeouts[entity.id]);
    //           entity.billboard.show = false;
    //           viewer.scene.requestRender();
    //         }
    //       });
    //       currentVisibleEntityId = null;
    //     }
    //   }, 250),
    //   Cesium.ScreenSpaceEventType.MOUSE_MOVE
    // );

    viewer.scene.requestRender();
  }
  removeAllBillboardEntities(viewer) {
    this.removeEntities(viewer.entities, 'Pods');
    this.removeEntities(viewer.entities, 'PodsLabel');
    this.removeEntities(viewer.entities, 'Poddata1');
  
    // Request a render to update the scene
    viewer.scene.requestRender();
  }
  

  // addBillboard(viewer, planes) {
  //   this.removeEntities(viewer.entities, 'Pods');
  //   this.removeEntities(viewer.entities, 'PodsLabel');
  //   this.removeEntities(viewer.entities, 'Poddata1');

  //   // Store references to hover timeouts
  //   const hoverTimeouts = {};

  //   planes.forEach((data, index) => {
  //     if (data.Long >= 74 && data.Lat <= 30 && data.Lat.toString().includes('.') && data.Long.toString().includes('.')) {
  //       const svgLatLongInfo =
  //         '<svg width="355" height="140" viewBox="0 0 352 88" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  //         '<rect x="0.0" y="0.5" width="354" height="139" rx="5.5" fill="#1F2937"/>' +
  //         `<text x="10" y="30" font-family="Arial" font-size="26" fill="white">Lat: ${data.Lat?.toFixed(
  //           14
  //         )}</text>` +
  //         `<text x="10" y="65" font-family="Arial" font-size="26" fill="white">Long: ${data.Long?.toFixed(
  //           14
  //         )}</text>` +
  //         `<text x="10" y="100" font-family="Arial" font-size="26" fill="white">Name: ${data.Name}</text>` +
  //         '<rect x="0.5" y="0.5" width="354" height="139" rx="5.5" stroke="#7A8EAE"/>' +
  //         '<path d="M339.667 17.625H327.667C326.194 17.625 325 18.7816 325 20.2083V31.8333C325 33.2601 326.194 34.4167 327.667 34.4167H339.667C341.139 34.4167 342.333 33.2601 342.333 31.8333V20.2083C342.333 18.7816 341.139 17.625 339.667 17.625Z" stroke="white" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>' +
  //         '<path d="M319.667 25.3747H318.333C317.626 25.3747 316.948 25.1025 316.448 24.618C315.948 24.1336 315.667 23.4765 315.667 22.7913V11.1663C315.667 10.4812 315.948 9.82412 316.448 9.33965C316.948 8.85518 317.626 8.58301 318.333 8.58301H330.333C331.041 8.58301 331.719 8.85518 332.219 9.33965C332.719 9.82412 333 10.4812 333 11.1663V12.458" stroke="white" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>' +
  //         '</svg>';

  //       const svgLatLongInfoUri = 'data:image/svg+xml;base64,' + btoa(svgLatLongInfo);
  //       const billboard = {
  //         image: '../assets/icons/pods.svg',
  //         scale: 0.4,
  //         scaleByDistance: new Cesium.NearFarScalar(0, 1.4, 60000.0, 1.2),
  //         rotation: 0,
  //         disableDepthTestDistance: Number.POSITIVE_INFINITY,
  //         width: 100,
  //         height: 80,
  //         show: true,
  //       };

  //       viewer.entities.add({
  //         position: Cesium.Cartesian3.fromDegrees(
  //           data?.Long,
  //           data?.Lat,
  //           0
  //         ),
  //         billboard: billboard,
  //         id: 'Pods' + index,
  //       });

  //       const position = Cesium.Cartesian3.fromDegrees(data.Long, data.Lat);

  //       viewer.entities.add({
  //         id: 'Podsdata' + index,
  //         position: position,
  //         billboard: {
  //           image: svgLatLongInfoUri,
  //           pixelOffset: new Cesium.Cartesian2(60, -58),
  //           heightReference: viewer.scene.mode === Cesium.SceneMode.SCENE3D
  //             ? Cesium.HeightReference.CLAMP_TO_GROUND
  //             : Cesium.HeightReference.NONE,
  //           scale: 0.5,
  //           disableDepthTestDistance: Number.POSITIVE_INFINITY,
  //           show: false, // Initially hidden
  //         },
  //       });
  //     }
  //   });

  //   const billboardEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  //   billboardEventHandler.setInputAction(this.debounce((movement) => {
  //     const pickedObject = viewer.scene.pick(movement.endPosition);

  //     if (pickedObject && pickedObject.id && typeof pickedObject.id.id === 'string' && pickedObject.id.id.startsWith('Pods')) {
  //       const index = pickedObject.id.id.replace('Pods', '');
  //       const podsdataId = 'Podsdata' + index;

  //       if (hoverTimeouts[podsdataId]) {
  //         clearTimeout(hoverTimeouts[podsdataId]);
  //       }

  //       hoverTimeouts[podsdataId] = setTimeout(() => {
  //         const entity = viewer.entities.getById(podsdataId);
  //         if (entity) {
  //           entity.billboard.show = true;
  //         }
  //       }, 500);
  //     } else {
  //       viewer.entities.values.forEach((entity) => {
  //         if (entity.id.startsWith('Podsdata')) {
  //           clearTimeout(hoverTimeouts[entity.id]);
  //           entity.billboard.show = false;
  //         }
  //       });
  //     }
  //   }, 250), Cesium.ScreenSpaceEventType.MOUSE_MOVE);


  //   viewer.scene.requestRender();
  // }




  // addBillboard(viewer, planes) {
  //   const zoomThreshold = 10000; // Adjust this value as needed

  //   this.removeEntities(viewer.entities, 'Pods');
  //   this.removeEntities(viewer.entities, 'PodsLabel');
  //   this.removeEntities(viewer.entities, 'Poddata1');

  //   const updateEntityVisibility = () => {
  //     const cameraHeight = viewer.camera.positionCartographic.height;
  //     viewer.entities.values.forEach((entity) => {
  //       if (entity.id.startsWith('Poddata1')) {
  //         entity.billboard.show = cameraHeight < zoomThreshold;
  //       }
  //     });
  //   };

  //   planes.forEach((data, index) => {
  //     if (data.Long >= 74 && data.Lat <= 30 && data.Lat.toString().includes('.') && data.Long.toString().includes('.')) {
  //       const svgLatLongInfo =
  //         '<svg width="355" height="140" viewBox="0 0 352 88" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  //         '<rect x="0.0" y="0.5" width="354" height="139" rx="5.5" fill="#1F2937"/>' +
  //         `<text x="10" y="30" font-family="Arial" font-size="26" fill="white">Lat: ${data.Lat?.toFixed(
  //           14
  //         )}</text>` +
  //         `<text x="10" y="65" font-family="Arial" font-size="26" fill="white">Long: ${data.Long?.toFixed(
  //           14
  //         )}</text>` +
  //         `<text x="10" y="100" font-family="Arial" font-size="26" fill="white">Name: ${data.Name}</text>` +
  //         '<rect x="0.5" y="0.5" width="354" height="139" rx="5.5" stroke="#7A8EAE"/>' +
  //         '<path d="M339.667 17.625H327.667C326.194 17.625 325 18.7816 325 20.2083V31.8333C325 33.2601 326.194 34.4167 327.667 34.4167H339.667C341.139 34.4167 342.333 33.2601 342.333 31.8333V20.2083C342.333 18.7816 341.139 17.625 339.667 17.625Z" stroke="white" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>' +
  //         '<path d="M319.667 25.3747H318.333C317.626 25.3747 316.948 25.1025 316.448 24.618C315.948 24.1336 315.667 23.4765 315.667 22.7913V11.1663C315.667 10.4812 315.948 9.82412 316.448 9.33965C316.948 8.85518 317.626 8.58301 318.333 8.58301H330.333C331.041 8.58301 331.719 8.85518 332.219 9.33965C332.719 9.82412 333 10.4812 333 11.1663V12.458" stroke="white" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>' +
  //         '</svg>';

  //       const svgLatLongInfoUri = 'data:image/svg+xml;base64,' + btoa(svgLatLongInfo);

  //       const billboard = {
  //         image: '../assets/icons/pods.svg',
  //         scale: 0.4,
  //         scaleByDistance: new Cesium.NearFarScalar(0, 1.4, 60000.0, 1.2),
  //         rotation: 0,
  //         disableDepthTestDistance: Number.POSITIVE_INFINITY,
  //         width: 100,
  //         height: 80,
  //         show: true,
  //       };

  //       viewer.entities.add({
  //         position: Cesium.Cartesian3.fromDegrees(data?.Long, data?.Lat, 0),
  //         billboard: billboard,
  //         id: 'Pods' + index,
  //       });

  //       const position = Cesium.Cartesian3.fromDegrees(data.Long, data.Lat);
  //       viewer.entities.add({
  //         id: 'Poddata1' + index,
  //         position: position,
  //         billboard: {
  //           image: svgLatLongInfoUri,
  //           pixelOffset: new Cesium.Cartesian2(60, -58),
  //           heightReference:
  //             viewer.scene.mode === Cesium.SceneMode.SCENE3D
  //               ? Cesium.HeightReference.CLAMP_TO_GROUND
  //               : Cesium.HeightReference.NONE,
  //           scale: 0.5,
  //           disableDepthTestDistance: Number.POSITIVE_INFINITY,
  //           show: false, // Initially hidden
  //         },
  //       });
  //     }
  //   });

  //   viewer.camera.changed.addEventListener(updateEntityVisibility);
  //   updateEntityVisibility();

  //   viewer.scene.requestRender();
  // }

  // Missions flyto
  missionFlyTo(viewer, LongitudeArr, LatitudeArr) {
    let totalLongitude = 0;
    let totalLatitude = 0;
    LongitudeArr.forEach((long) => {
      totalLongitude += Number(long);
    });
    LatitudeArr.forEach((long) => {
      totalLatitude += Number(long);
    });
    let maxLong = Math.abs(
      Math.max(...LongitudeArr) - Math.min(...LongitudeArr)
    );
    let maxLat = Math.abs(Math.max(...LatitudeArr) - Math.min(...LatitudeArr));
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        totalLongitude / LongitudeArr.length,
        totalLatitude / LongitudeArr.length,
        LatitudeArr.length <= 2 ? 10000 : Math.max(maxLong, maxLat) * 180000
      ),
    });
  }
  flyTo(viewer, lat, long) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(long, lat, 10000),
    });
  }
  flyToLocation(viewer, lng, lat, view?) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, view || 1800.0),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
        roll: Cesium.Math.toRadians(0.0),
      },
      duration: 3,
    });
  }

  highAltitudeFlyTo(viewer, LongitudeArr, LatitudeArr) {
    let totalLongitude = 0;
    let totalLatitude = 0;
    LongitudeArr.forEach((long) => {
      totalLongitude += Number(long);
    });
    LatitudeArr.forEach((long) => {
      totalLatitude += Number(long);
    });
    let maxLong = Math.abs(
      Math.max(...LongitudeArr) - Math.min(...LongitudeArr)
    );
    let maxLat = Math.abs(Math.max(...LatitudeArr) - Math.min(...LatitudeArr));
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        totalLongitude / LongitudeArr.length - 0.005,
        totalLatitude / LongitudeArr.length,
        LatitudeArr.length == 1 ? 21000 : Math.max(maxLong, maxLat) * 300000
      ),
    });
  }

  //Removing Entities
  removeEntities(entities, id) {
    let length = entities?.values.length;
    let count = entities?.values.length;
    let indexVal = 1;
    for (let i = 0; i < length; i++) {
      if (count != entities.values.length) {
        indexVal++;
      }
      let entity = entities.values[entities.values.length - indexVal];
      if (entity.id.includes(id)) {
        entities.removeById(entity.id);
        count = entities.values.length;
      } else {
        count++;
      }
    }
    // entities.values.forEach((entity, index) => {
    //   if (entity.id.includes(id)) {
    //     entities.removeById(entity.id);
    //   }
    // });
  }
  removeSpecifiedEnitites(entities, id) {
    let filteredArray = entities.values.filter((val, index) => {
      return val;
    });
  }
  getDeviceLocation(): Observable<any> {
    return this.http.get('http://ip-api.com/json');
  }

  getDeviceIP(): Observable<any> {
    return this.http.get('https://extreme-ip-lookup.com/json/');
  }
  getIPLocation(ip): Observable<any> {
    // 49.207.206.78
    return this.http.get('https://ipapi.co/' + ip + '/json/');
  }

  // DMSToDD
  ConvertDMSToDD(degrees, minutes, seconds, direction) {
    // if(degrees.startsWith('00')) {
    //   degrees = -Math.abs(Number(degrees));
    // }
    var dd =
      Number(degrees) + Number(minutes) / 60 + Number(seconds) / (60 * 60);

    if (direction == 'S' || direction == 'W') {
      dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
  }
  //ActiveDroneTrailing
  activeDroneTrailing(viewer, postion) {
    var canvasWidth = viewer.scene.canvas.clientWidth; // Get the width of the canvas (screen)
    var lineWidth = canvasWidth * 0.001;
    viewer.entities.add({
      name: 'Live Drone Path',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(postion),
        width: lineWidth,
        arcType: Cesium.ArcType.RHUMB,
        material: Cesium.Color.fromRgba(0xaa3dcbff),
      },
    });
  }

  dropLocationPin(viewer, long, lat) {
    this.removeEntities(viewer.entities, 'Location Pin');
    this.removeEntities(viewer.entities, 'Location Info');

    const svgLatLongInfo =
      '<svg width="352" height="81" viewBox="0 0 352 88" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="0.5" y="0.5" width="351" height="80" rx="5.5" fill="#1F2937"/>' +
      `<text x="10" y="30" font-family="Arial" font-size="26" fill="white">Lat: ${lat?.toFixed(
        14
      )}</text>` +
      `<text x="10" y="65" font-family="Arial" font-size="26" fill="white">Long: ${long?.toFixed(
        14
      )}</text>` +
      '<rect x="0.5" y="0.5" width="351" height="80" rx="5.5" stroke="#7A8EAE"/>' +
      '<path d="M339.667 17.625H327.667C326.194 17.625 325 18.7816 325 20.2083V31.8333C325 33.2601 326.194 34.4167 327.667 34.4167H339.667C341.139 34.4167 342.333 33.2601 342.333 31.8333V20.2083C342.333 18.7816 341.139 17.625 339.667 17.625Z" stroke="white" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M319.667 25.3747H318.333C317.626 25.3747 316.948 25.1025 316.448 24.618C315.948 24.1336 315.667 23.4765 315.667 22.7913V11.1663C315.667 10.4812 315.948 9.82412 316.448 9.33965C316.948 8.85518 317.626 8.58301 318.333 8.58301H330.333C331.041 8.58301 331.719 8.85518 332.219 9.33965C332.719 9.82412 333 10.4812 333 11.1663V12.458" stroke="white" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';

    var svgLatLongInfoUri = 'data:image/svg+xml;base64,' + btoa(svgLatLongInfo);
    var position = Cesium.Cartesian3.fromDegrees(long, lat);
    // pin
    this.latLongPinEntity = viewer.entities.add({
      name: 'Location Pin',
      id: 'Location Pin',
      position: position,
      billboard: {
        image: '../assets/icons/pointer-icon.svg',
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference:
          viewer.scene.mode === Cesium.SceneMode.SCENE3D
            ? Cesium.HeightReference.CLAMP_TO_GROUND
            : Cesium.HeightReference.NONE,
        scale: 0.7,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    // info
    this.latLongInfoEntity = viewer.entities.add({
      name: `Location Info`,
      id: 'Location Info',
      position: position,
      billboard: {
        image: svgLatLongInfoUri,
        pixelOffset: new Cesium.Cartesian2(60, -50),
        heightReference:
          viewer.scene.mode === Cesium.SceneMode.SCENE3D
            ? Cesium.HeightReference.CLAMP_TO_GROUND
            : Cesium.HeightReference.NONE,
        scale: 0.5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    viewer.scene.requestRender();
  }

  // getActiveAirBufferSpacesForZone(activeBuffers, activeAirspaceEntities, viewer? ) {
  //   this.removeEntities(activeAirspaceEntities, 'Mission');
  //   // activeAirspaceEntities.removeAll();
  //   // activeAirspaceEntities.values.forEach((value) => {
  //   //   if (value.id.includes("Mission")) {
  //   //     activeAirspaceEntities.removeById(value.id);
  //   //   }
  //   // })
  //   activeBuffers.forEach((val, index) => {
  //     let bufferPoints = [];
  //     let positions = [];
  //     let coOrdinates = [];
  //     let color 
  //     val.Waypoint.forEach((values) => {
  //       var cartographic = Cesium.Cartographic.fromCartesian(values);
  //       let lat = Cesium.Math.toDegrees(cartographic.latitude);
  //       let long = Cesium.Math.toDegrees(cartographic.longitude);
  //       color = values.Zone

  //       // bufferPoints.push(Cesium.Cartesian3.fromDegrees(long, lat));
  //       bufferPoints.push(long, lat);
  //       positions.push(cartographic);
  //       coOrdinates.push(long + ' ' + lat);
  //     });

  //     activeAirspaceEntities.add({
  //       polygon: {
  //         hierarchy: Cesium.Cartesian3.fromDegreesArray(bufferPoints),
  //         material: Cesium.Color.fromCssColorString('#CB8983'),
  //         outline: true,
  //         outlineColor: Cesium.Color.fromCssColorString('#CB8983'),
  //         outlineWidth: 10.0,
  //         height: 0,
  //         distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
  //           0,
  //           9750000.0
  //         ),
  //         // Cesium.Color.fromRgba(0xFFF09859),
  //         // fill: true,
  //       },
  //       id: val.MissionId,
  //       description:
  //         '<p>Operation Name : ' +
  //         val.OperationName +
  //         '</p>' +
  //         '<p>End Time : ' +
  //         this.dateAndTimeFormat.dateAndTimeFormatting(
  //           new Date(val.EndTime),
  //           'dateAndTime'
  //         ) +
  //         '</p>',
  //     });
  //   });
  // }

  getActiveAirBufferSpacesForZone(activeBuffers, activeAirspaceEntities, viewer?) {
    
    this.removeEntities(activeAirspaceEntities, 'Mission');
  
    // Define the mapping of zone names to hex colors
    const zoneColors = {
      green: '#89B289',
      red: '#CB8983',
      yellow: '#BAB682',
    };
  
  
    activeBuffers.forEach((val, index) => {
      let bufferPoints = [];
      let positions = [];
      let coOrdinates = [];
     ;
     let color = zoneColors[val.Zone] || '#888e8e'; 
     let Height = val.Height
      val.Waypoint.forEach((values) => {
        var cartographic = Cesium.Cartographic.fromCartesian(values);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let long = Cesium.Math.toDegrees(cartographic.longitude);
  
        // Assign the hex color based on the zone string
        // Default color if zone is not found
  
        bufferPoints.push(long, lat);
        positions.push(cartographic);
        coOrdinates.push(long + ' ' + lat);
      });
  
      // activeAirspaceEntities.add({
      //   polygon: {
      //     hierarchy: Cesium.Cartesian3.fromDegreesArray(bufferPoints),
      //     material: Cesium.Color.fromCssColorString(),
      //     outline: true,
      //     outlineColor: Cesium.Color.fromCssColorString(color),
      //     outlineWidth: 10.0,
      //     height: Height,
          
      //     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
      //       0,
      //       9850000.0
      //     ),
      //   },
      //   id: val.MissionId,
      //   description:
      //     '<p>Operation Name : ' +
      //     val.OperationName +
      //     '</p>' +
      //     '<p>End Time : ' +
      //     this.dateAndTimeFormat.dateAndTimeFormatting(
      //       new Date(val.EndTime),
      //       'dateAndTime'
      //     ) +
      //     '</p>',
      // });
      activeAirspaceEntities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(bufferPoints),
          width: 2.0, // Adjust this value for thicker lines
          material: Cesium.Color.fromCssColorString(color),
        },
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(bufferPoints),
          material: Cesium.Color.fromCssColorString(color),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(color),
          outlineWidth: 15.0,
          fill: false, // Ensures the polygon is not filled
          height: Height,
          // Optionally adjust or remove distanceDisplayCondition
        },
        id: val.WaypointName,
        description: `<p>Waypoint Name: ${val.WaypointName}</p>
                      <p>Created At: ${new Date(val.TS_Created).toLocaleString()}</p>`,
      });
      
    });
    viewer.scene.requestRender()
  }
  
}
