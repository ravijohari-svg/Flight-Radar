import { Injectable } from '@angular/core';
import { CesiumFunctionService } from './cesium-function.service';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, interval } from 'rxjs';
import { AuthorityapisService } from '../authority/authorityapis.service';
import { OperatorapisService } from '../operator/operatorapis.service';
import { HttpClient } from '@angular/common/http';
import { arcgisToGeoJSON } from '@esri/arcgis-to-geojson-utils';
import * as turf from '@turf/turf';
import circleToPolygon from 'circle-to-polygon';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MapLayersService {
  // [x: string]: any;
  viewModel: any;
  scene: any;
  osmTileset: any;
  key;
  stadiamapKey = environment.stadimapKey;
  stadiampURL = environment.stadiamapURL;
  maptilerUrl = environment.maptilerUrl;
  mapId: any = '';
  latLongInfoEntity;
  latLongPinEntity;

  private _iniitalViewer = new BehaviorSubject<boolean>(false);

  // ImageryProviderFunc = () => {
  //   const imageryProvider = new Cesium.UrlTemplateImageryProvider({
  //     url: this.url + this.stadiamapKey,
  //     //  url:
  //     //    'https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=' +
  //     //    this.maptilerkey,
  //   });

  //   const originalRequestImage = imageryProvider.requestImage;
  //   imageryProvider.requestImage = async (x, y, level, request) => {
  //     try {
  //       const response = await originalRequestImage.call(
  //         imageryProvider,
  //         x,
  //         y,
  //         level
  //       );
  //       return Promise.resolve(response);
  //     } catch (error) {
  //       return Promise.reject(error);
  //     }
  //   };

  //   return imageryProvider;
  // };
  elevation: string = '';
  distances = [];
  droneHeight = [];
  elevationData = [];
  providerViewModels = [
    new Cesium.ProviderViewModel({
      name: 'Streets',
      iconUrl: '../../../../assets/common-layout/darkMap.png',
      // tooltip: 'Stadiamap Imagery',
      tooltip: 'Imagery',
      creationFunction: () => {
        return new Cesium.UrlTemplateImageryProvider({
          url: this.stadiampURL + this.stadiamapKey,
        });
      },
    }),
    new Cesium.ProviderViewModel({
      // name: 'Cesium satellite',
      name: 'Satellite',
      iconUrl: Cesium.buildModuleUrl(
        'Widgets/Images/ImageryProviders/bingAerial.png'
      ),
      // tooltip: 'Cesium World Imagery',
      tooltip: 'World Imagery',
      creationFunction: () => {
        return Cesium.createWorldImagery();
      },
    }),
  ];
  providerViewModel = [
    new Cesium.ProviderViewModel({
      // name: 'Cesium World Terrain',
      name: 'World Terrain',
      iconUrl: '../../../../assets/common-layout/cesium.png',
      tooltip: 'Terrain',
      creationFunction: () => {
        return new Cesium.createWorldTerrain();
      },
    }),
  ];
  selectedImagery = this.providerViewModels[0];
  selectedTerrain = this.providerViewModel[0];

  //Data Source for GeoJSON
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
  geojsonDataSourceFICDubai = new Cesium.GeoJsonDataSource();
  geojsonDataSourceIndiaBoundary = new Cesium.GeoJsonDataSource();

  geojsonDataSourceFIRs = new Cesium.GeoJsonDataSource();

  // custom geoZone datasource
  RPTOgeoZoneDataSource = new Cesium.CustomDataSource('rptoGeoZone');

  //Getting Maps Layer from backend Based on Country initially
  entitiesOfRestrictedAreasIndia = [];
  entitiesOfRestrictedAreasIreland = [];
  entitiesOfRestrictedAreasDubai = [];

  //FIR Coordinates
  firCoords = [];

  moduleApi: any;
  user;
  //maptiler key
  maptilerkey = environment.maptilerkey;

  //PlaneFinder
  planesVisibility: boolean;
  planes = [];
  planeFinder$: any;

  private unSubscribe = new Subject<void>();

  mapLayersModule;
  mapLayers = [];
  geoFenceIndia: any;
  vfrDataIreland: any;
  airportDataIndia: any;
  airportDataIreland: any;
  warningZoneData: any;
  noFlyZoneIndia: any;
  noFlyZoneIndiaDubai: any;
  outerYellowZoneIndia: any;
  innerYellowZoneIndia: any;
  militaryZoneData: any;
  warningVisibility: boolean;
  cesiumViewer: any;
  limitExceed: boolean = true;
  urlType: any;
  url: string;

  constructor(
    private http: HttpClient,
    private cesiumFunction: CesiumFunctionService,
    private operatorApi: OperatorapisService,
    private authorityApi: AuthorityapisService,
    private router: Router
  ) {}

  getViewerDevOptions() {
    const providerViewModels = [
      new Cesium.ProviderViewModel({
        // name: 'Cesium satellite',
        name: 'Satellite',
        iconUrl: Cesium.buildModuleUrl(
          'Widgets/Images/ImageryProviders/bingAerial.png'
        ),
        // tooltip: 'Cesium World Imagery',
        tooltip: 'World Imagery',
        creationFunction: () => {
          return Cesium.createWorldImagery();
        },
      }),
    ];

    const providerViewModel = [
      new Cesium.ProviderViewModel({
        // name: 'Cesium World Terrain',
        name: 'World Terrain',
        iconUrl: '../../../../assets/common-layout/cesium.png',
        // tooltip: 'MapTiler Terrain',
        tooltip: 'Terrain',
        creationFunction: () => {
          return new Cesium.createWorldTerrain();
        },
      }),
    ];
    const selectedImagery = providerViewModels[0];
    const selectedTerrain = providerViewModel[0];

    const options = {
      imageryProviderViewModels: providerViewModels,
      selectedImageryProviderViewModel: selectedImagery,
      terrainProviderViewModels: providerViewModel,
      selectedTerrainProviderViewModel: selectedTerrain,
      geocoder: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      homeButton: false,
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: Cesium.IonResource.fromAssetId(1528886),
        //Mohith
        // url: Cesium.IonResource.fromAssetId(1406903),
      }),
      infoBox: false,
    };

    return options;
  }

  getViewerProdOption() {
    if (this.urlType == undefined && this.user != 'authority') {
      let decrypt = CryptoJS.AES.decrypt(
        localStorage.getItem('UrlData'),
        environment.operatorKey
      );
      let data = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
      this.urlType = data.urlType;
      this.mapId = data.mapId;
    }
    if (this.urlType == undefined && this.user == 'authority') {
      let decrypt = CryptoJS.AES.decrypt(
        localStorage.getItem('UrlsData'),
        environment.authorityKey
      );
      let data = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
      this.urlType = data.urlType;
      this.mapId = data.mapId;
    }
    const CustomImageryProviderFunc = () => {
      if (this.urlType == 'Stadia') {
        this.url = this.stadiampURL;
        this.key = this.stadiamapKey;
      } else if (this.urlType == 'Maptiler') {
        this.url = this.maptilerUrl;
        this.key = this.maptilerkey;
      }

      if (this.urlType != 'Cesium') {
        const imageryProvider = new Cesium.UrlTemplateImageryProvider({
          url: this.url + this.key,
        });
        const originalRequestImage = imageryProvider.requestImage;
        imageryProvider.requestImage = async (x, y, level, request) => {
          let payload = {
            MapAPIId: this.mapId,
          };
          if (this.urlType != 'Cesium') {
            this.moduleApi.getApiCount(payload).then((res) => {
              let limit = res['data'].MainData.LimitExceeded;
              if (limit == true) {
                this.moduleApi.getStadiaMapURl().then((response) => {
                  this.urlType = response['data'].MainData.MapAPIType;
                  this.mapId = response['data'].MainData.MapAPIId;
                  let urlData = {
                    urlType: this.urlType,
                    mapId: this.mapId,
                  };
                  let encryUrl = CryptoJS.AES.encrypt(
                    JSON.stringify(urlData),
                    environment.operatorKey
                  );
                  localStorage.setItem('UrlData', encryUrl);
                  if (this.limitExceed) {
                    location.reload();
                    this.limitExceed = false;
                    setTimeout(() => {
                      this.limitExceed = true;
                    }, 5000);
                  }
                });
              }
            });
          }

          const response = await originalRequestImage.call(
            imageryProvider,
            x,
            y,
            level
          );
          return Promise.resolve(response);
        };

        return imageryProvider;
      } else {
        const imageryProvider = Cesium.createWorldImagery();
        return imageryProvider;
      }
    };

    if (this.urlType != 'Cesium') {
      const providerViewModels = [
        new Cesium.ProviderViewModel({
          name: 'Streets',
          iconUrl: '../../../../assets/common-layout/darkMap.png',
          // tooltip: 'Stadiamap Imagery',
          tooltip: 'Imagery',
          creationFunction: CustomImageryProviderFunc,
        }),
        new Cesium.ProviderViewModel({
          // name: 'Cesium satellite',
          name: 'Satellite',
          iconUrl: Cesium.buildModuleUrl(
            'Widgets/Images/ImageryProviders/bingAerial.png'
          ),
          // tooltip: 'Cesium World Imagery',
          tooltip: 'World Imagery',
          creationFunction: () => {
            return Cesium.createWorldImagery();
          },
        }),
      ];

      const providerViewModel = [
        new Cesium.ProviderViewModel({
          // name: 'Cesium World Terrain',
          name: 'World Terrain',
          iconUrl: '../../../../assets/common-layout/cesium.png',
          // tooltip: 'MapTiler Terrain',
          tooltip: 'Terrain',
          creationFunction: () => {
            return new Cesium.createWorldTerrain();
          },
        }),
      ];

      const selectedImagery = providerViewModels[0];
      const selectedTerrain = providerViewModel[0];

      const options = {
        imageryProviderViewModels: providerViewModels,
        selectedImageryProviderViewModel: selectedImagery,
        terrainProviderViewModels: providerViewModel,
        selectedTerrainProviderViewModel: selectedTerrain,
        geocoder: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        homeButton: false,
        terrainProvider: new Cesium.CesiumTerrainProvider({
          url: Cesium.IonResource.fromAssetId(1528886),
          //Mohith
          // url: Cesium.IonResource.fromAssetId(1406903),
        }),
        infoBox: false,
      };

      return options;
    } else {
      const providerViewModels = [
        new Cesium.ProviderViewModel({
          // name: 'Cesium satellite',
          name: 'Satellite',
          iconUrl: Cesium.buildModuleUrl(
            'Widgets/Images/ImageryProviders/bingAerial.png'
          ),
          // tooltip: 'Cesium World Imagery',
          tooltip: 'World Imagery',
          creationFunction: () => {
            return Cesium.createWorldImagery();
          },
        }),
      ];

      const providerViewModel = [
        new Cesium.ProviderViewModel({
          // name: 'Cesium World Terrain',
          name: 'World Terrain',
          iconUrl: '../../../../assets/common-layout/cesium.png',
          // tooltip: 'MapTiler Terrain',
          tooltip: 'Terrain',
          creationFunction: () => {
            return new Cesium.createWorldTerrain();
          },
        }),
      ];
      const selectedImagery = providerViewModels[0];
      const selectedTerrain = providerViewModel[0];

      const options = {
        imageryProviderViewModels: providerViewModels,
        selectedImageryProviderViewModel: selectedImagery,
        terrainProviderViewModels: providerViewModel,
        selectedTerrainProviderViewModel: selectedTerrain,
        geocoder: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        homeButton: false,
        terrainProvider: new Cesium.CesiumTerrainProvider({
          url: Cesium.IonResource.fromAssetId(1528886),
          //Mohith
          // url: Cesium.IonResource.fromAssetId(1406903),
        }),
        infoBox: false,
      };

      return options;
    }
  }

  ViewerOptionDev = {
    geocoder: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    homeButton: false,
    terrainProvider: new Cesium.CesiumTerrainProvider({
      url: Cesium.IonResource.fromAssetId(1528886),
      //Mohith
      // url: Cesium.IonResource.fromAssetId(1406903),
    }),
    infoBox: false,
  };
  viewerOptionProd = {
    imageryProviderViewModels: this.providerViewModels,
    selectedImageryProviderViewModel: this.selectedImagery,
    terrainProviderViewModels: this.providerViewModel,
    selectedTerrainProviderViewModel: this.selectedTerrain,
    //disabling the toolbar
    geocoder: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    homeButton: false,
    resolutionScale: 12,
    terrainProvider: new Cesium.CesiumTerrainProvider({
      url: Cesium.IonResource.fromAssetId(1528886),
      //Mohith
      // url: Cesium.IonResource.fromAssetId( 1406903),
    }),
    infoBox: false,
  };

  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
    this.planeFinder$ = undefined;
  }
  access(user) {
    this.user = user;
    this.moduleApi = user == 'pilot' ? this.operatorApi : this.authorityApi;
  }
  getUrl(url) {
    this.url = url;
  }
  getUrlType(type) {
    this.urlType = type;
  }
  getMapId(id) {
    this.mapId = id;
  }

  getDeviceIP(): Observable<any> {
    return this.http.get('https://extreme-ip-lookup.com/json/');
  }
  getIPLocation(ip): Observable<any> {
    // 49.207.206.78
    return this.http.get('https://ipapi.co/' + ip + '/json/');
  }
  initialize(viewer, profileDetails): void {
    this.initialConfig(viewer, profileDetails);
    setTimeout(() => {
      this.getCameraCoordinates(viewer);
      this.setView(viewer);
    }, 500);
  }
  initialConfig(viewer, profileDetails, req?): void {
    if (!req) {
      // this.set3DTunnelView(viewer);
      this.removeTimelineAndClock(viewer);
    }
    this.getMapLayersCountry(viewer, profileDetails);
  }
  getCameraCoordinates(viewer) {
    let [IndialatMax, IndialngMax, IndialatMin, IndialngMin] = [
      42.17477643444698, 98.39193134978791, 8.465020978452927,
      69.46937307226474,
    ];
    let [IrelandlatMax, IrelandlngMax, IrelandlatMin, IrelandlngMin] = [
      55.58117283181593, -5.301994459203987, 51.29143611559805,
      -10.561891103258741,
    ];
    viewer.camera.moveEnd.addEventListener(() => {
      // UR - Max
      var UR = new Cesium.Cartesian2(viewer.container.clientWidth, 0);
      // LL - min
      var LL = new Cesium.Cartesian2(0, viewer.container.clientHeight);

      var pickRayUR = viewer.scene.camera.getPickRay(UR);
      var pickRayLL = viewer.scene.camera.getPickRay(LL);

      var pickPositionUR = viewer.scene.globe.pick(pickRayUR, viewer.scene);
      var pickPositionLL = viewer.scene.globe.pick(pickRayLL, viewer.scene);
      let height = viewer.scene.camera.positionCartographic.height;

      if (pickPositionUR && pickPositionLL) {
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
        if (distance <= 60000 && distance >= 1000) {
          this.planesVisibility = true;
          var pickPositionCartographicUR =
            viewer.scene.globe.ellipsoid.cartesianToCartographic(
              pickPositionUR
            );
          var pickPositionCartographicLL =
            viewer.scene.globe.ellipsoid.cartesianToCartographic(
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
          if (country) {
            this.getPlaneFinderData(
              country,
              latmin,
              lngmin,
              latmax,
              lngmax,
              viewer
            );
          }
        } else {
          this.planesVisibility = false;
        }
        if (height >= 1500000) {
          this.warningVisibility = false;
          this.geojsonDataSourceWarningZone.show = false;
        } else {
          this.warningVisibility = true;
          this.geojsonDataSourceWarningZone.show = true;
        }
      }
    });
    return [
      this.warningVisibility,
      this.planesVisibility,
      this.geojsonDataSourceWarningZone.show,
    ];
  }
  entityDescription;
  getEntityType(id) {
    //  console.log(id,id.replace(/[0-9]/g, ''));
    return id?.replace(/[0-9]/g, '');
  }

  async onclickmapui(input, viewer) {
    const pickedObjectArray = viewer.scene.drillPick(input.position);

  //   if (pickedObjectArray.length > 0) {
  //     pickedObjectArray.forEach((pickedObject) => {
  //         if (Cesium.defined(pickedObject.id)) {
  //             let entity = pickedObject.id;

  //             // Check if the picked entity is a polygon
  //             if (entity.polygon) {
  //                 const polygonHierarchy = entity.polygon.hierarchy.getValue();
  //                 const positions = polygonHierarchy.positions;

  //                 // Convert the Cesium Cartesian positions to GeoJSON coordinates
  //                 const geoJsonCoords = positions.map(position => {
  //                     const cartographic = Cesium.Cartographic.fromCartesian(position);
  //                     return [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)];
  //                 });

  //                 // Get the click position in Cartesian coordinates
  //                 const clickPosition = viewer.camera.pickEllipsoid(input.position, viewer.scene.globe.ellipsoid);

  //                 if (clickPosition) {
  //                     // Convert the click position to Cartographic
  //                     const cartographic = Cesium.Cartographic.fromCartesian(clickPosition);
  //                     const lat = Cesium.Math.toDegrees(cartographic.latitude);
  //                     const lon = Cesium.Math.toDegrees(cartographic.longitude);

  //                     // Create GeoJSON point
  //                     const point = turf.point([lon, lat]);

  //                     // Create GeoJSON polygon
  //                     const polygon = turf.polygon([geoJsonCoords]);

  //                     // Check if the point is inside the polygon using Turf.js
  //                     const inside = turf.booleanPointInPolygon(point, polygon);

  //                     if (inside) {
  //                         console.log(`Clicked inside the polygon: ${entity.id}`);
  //                         console.log(`Polygon name: ${entity.description}`);
  //                     } else {
  //                         console.log('Clicked outside the polygon.');
  //                     }
  //                 }
  //             }
  //         }
  //     });
  // } else {
  //     console.log('No polygon was clicked.');
  // }
    // const pickedObject = viewer.scene.pick(input.position);
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cartesian = viewer.camera.pickEllipsoid(input.position, ellipsoid);
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    var longitude = Cesium.Math.toDegrees(cartographic.longitude);
    var latitude = Cesium.Math.toDegrees(cartographic.latitude);
    this.entityDescription = {};

    const LocationPin = pickedObjectArray.filter(
      (entity) =>
        entity?.id?.id == 'Location Info' || entity?.id?.id === 'Location Pin'
    )[0];

    if (
      Cesium.defined(LocationPin) &&
      (LocationPin.id === this.cesiumFunction.latLongPinEntity ||
        LocationPin.id === this.cesiumFunction.latLongInfoEntity)
    ) {
      const position =
        LocationPin.id === this.cesiumFunction.latLongPinEntity
          ? this.cesiumFunction.latLongPinEntity.position.getValue(
              this.cesiumViewer.clock.currentTime
            )
          : this.cesiumFunction.latLongInfoEntity.position.getValue(
              this.cesiumViewer.clock.currentTime
            );
      const cartographicPosition = Cesium.Cartographic.fromCartesian(position);
      const latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
      const longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
      navigator.clipboard
        .writeText(`${latitude},${longitude}`)
        .then(function () {
          console.log(
            `Coordinates copied to clipboard:\n${latitude},${longitude}`
          );
        });
      return;
    }
    // pickedObjectArray.forEach(
    //   (entity) =>{
    //     if(entity?.id?._id.includes('Poddata1')){
    //         const position = entity.id._position._value;
    //         const cartographicPosition = Cesium.Cartographic.fromCartesian(position);
    //         const latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
    //         const longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
    //         navigator.clipboard
    //           .writeText(`${latitude},${longitude}`)
    //           .then(function () {
    //             console.log(
    //               `Coordinates copied to clipboard:\n${latitude},${longitude}`
    //             );
    //           });
    //         return;
    //       }

    //   }
    // );

    // draw billboard pointer on the map lat, lang
    this.cesiumFunction.dropLocationPin(viewer, longitude, latitude);

    if (
      Cesium.defined(pickedObjectArray[0]) &&
      viewer.scene.pickPositionSupported
    ) {
      let entity = pickedObjectArray[0]?.id;
      let properties = entity.properties;
      let getIdDetails = this.getEntityType(properties?.ID?._value);
      if (getIdDetails) {
        if (
          getIdDetails !== 'FIC' ||
          getIdDetails === 'VABF' ||
          getIdDetails === 'VOMF' ||
          getIdDetails === 'VECF'
        ) {
          if (
            getIdDetails === 'VIDF' ||
            getIdDetails === 'VABF' ||
            getIdDetails === 'VOMF' ||
            getIdDetails === 'VECF'
          ) {
            this.entityDescription = {
              title: getIdDetails,
              airspaceInfo: {
                FIRCodes: properties._ID?._value, //array
                Type: getIdDetails,
                FIC: properties.FIC?._value,
              },
              groundInfo: {
                Country: '', //need to be replaced with API call
                States: '', // array
              },
            };
          } else {
            this.entityDescription = {
              title: getIdDetails,
              airspaceInfo: {
                FIRCodes: properties.FIR?._value, //array
                Type: getIdDetails,
                FIC: properties.FIC?._value,
              },
              groundInfo: {
                Country: '', //need to be replaced with API call
                States: properties.state?._value, // array
              },
            };
          }
        } else {
          this.entityDescription = {
            title: 'GreenZone',
            airspaceInfo: {
              FIRCodes: properties.FIR?._value, //array
              Type: 'GreenZone',
              FIC: properties.FICTypeName?._value,
            },
            groundInfo: {
              Country: '', //need to be replaced with API call
              States: properties.state?._value, // array
            },
          };
        }
      }
    } else {
      let point1 = turf.point([longitude, latitude]);
      let FIR = [...new Set(await this.getFIRValue(point1))]; // console.log(FIR+ "fir");
      this.entityDescription = {
        title: 'GreenZone',
        airspaceInfo: {
          FIRCodes: FIR,
          Type: 'GreenZone',
        },
        groundInfo: {
          Country: '', //need to be replaced with API call // States: properties.state?._value, // array
          States: '',
        },
      };
    }

    if (this.entityDescription.groundInfo?.States === '') {
      this.moduleApi.getStateName(latitude, longitude).then((response: any) => {
        if (response.length > 0) {
          this.entityDescription.groundInfo.States = response[0].state;
        }
      });
    }
    if (this.entityDescription.groundInfo?.Country === '') {
      this.moduleApi
        .getCountryCode(latitude, longitude)
        .then((response: any) => {
          if (response.length > 0) {
            this.entityDescription.groundInfo.Country = response[0].country;
          }
        });
    }

    let coordinates = [];
    const coordinate = {
      latitude: latitude,
      longitude: longitude,
    };
    coordinates.push(coordinate);

    await this.moduleApi.getElevation(coordinates).then(
      (response: any) => {
        this.elevation = response.data.MainData;
        this.entityDescription.groundInfo.elevation = this.elevation;
      },
      (err: any) => {
        console.log(err);
      }
    );
    return this.entityDescription;
  }


  getPlaneFinderData(country, latMin, lngMin, latMax, lngMax, viewer) {
    let payload = {
      CountryCode: country, // IRELAND/INDIA,
      x1: latMin,
      y1: lngMin,
      x2: latMax,
      y2: lngMax,
    };
    // this.planeFinder$ = undefined;
    this.moduleApi.getLatestPlaneFinderData(payload).then(
      (res) => {
        // if (this.planeFinder$) {
        //   this.planeFinder$ = undefined;
        // }

        this.planes = res['data']?.MainData.planes;
        this.cesiumFunction.planeBillboard(this.planes, viewer);
      },
      (err) => {}
    );
  }
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
              //  +
              // '<p>FlightNo</p>' + val.callsign
            });
          });
          // return staticEntities;
          return staticEntities.map((entity) => {
            return entity;
          });
        }),
        mergeMap(async (entity) => entity)
      );
    // }
  }

  // Getting Maps from backend based on Country only once
  // Code to be removed in future when data is received with resp to viewport
  getMapLayers(viewer) {
    // this.getvfrs('INDIA', 8.465020978452927, 69.46937307226474, 42.17477643444698, 98.39193134978791);
    this.getWarning(viewer);
    this.getvfrs(
      'IRELAND',
      51.29143611559805,
      -10.561891103258741,
      55.58117283181593,
      -5.301994459203987,
      viewer
    );
    this.getAirports(
      'IRELAND',
      51.29143611559805,
      -10.561891103258741,
      55.58117283181593,
      -5.301994459203987,
      viewer
    );
    this.getMilitaryNoFlyZone(viewer);

    this.getAirports(
      'INDIA',
      8.465020978452927,
      69.46937307226474,
      42.17477643444698,
      98.39193134978791,
      viewer
    );
    this.getNoFlyZone(viewer);
    this.getInnerYellowZone(viewer);
    this.getYellowZone(viewer);
    this.getGeoFence(viewer);
    // this.getDubaiNoFlyZone(viewer);
  }
  getGeoFence(viewer) {
    this.apigetGeoFence().then((geoZoneData) => {
      [
        this.geojsonDataSourceGeoFenceIndia,
        this.entitiesOfRestrictedAreasIndia,
      ] = this.CesiumgetGeoFence(
        viewer,
        geoZoneData,
        this.geojsonDataSourceGeoFenceIndia,
        this.entitiesOfRestrictedAreasIndia
      );
    });
  }
  getvfrs(country, latmin, lngmin, latmax, lngmax, viewer) {
    this.apigetvfrs(country, latmin, lngmin, latmax, lngmax).then((vfrData) => {
      [this.geojsonDataSourceIreland, this.entitiesOfRestrictedAreasIreland] =
        this.Cesiumgetvfrs(
          viewer,
          vfrData,
          this.geojsonDataSourceIreland,
          this.entitiesOfRestrictedAreasIreland
        );
    });
  }
  getAirports(country, latmin, lngmin, latmax, lngmax, viewer) {
    this.apigetAirports(country, latmin, lngmin, latmax, lngmax).then(
      (airportData) => {
        let entitiesOfRestrictedAreas =
          country == 'INDIA'
            ? this.entitiesOfRestrictedAreasIndia
            : this.entitiesOfRestrictedAreasIreland;
        let geojsonAirport =
          country == 'INDIA'
            ? this.geojsonDataSourceAirportIndia
            : this.geojsonDataSourceAirportIreland;
        [geojsonAirport, entitiesOfRestrictedAreas] = this.CesiumgetAirports(
          viewer,
          airportData,
          geojsonAirport,
          entitiesOfRestrictedAreas
        );
      }
    );
  }
  getWarning(viewer) {
    this.apigetWarning().then((geoZoneData) => {
      this.geojsonDataSourceWarningZone = this.CesiumgetWarningZones(
        viewer,
        geoZoneData,
        this.geojsonDataSourceWarningZone
      );
    });
  }
  getNoFlyZone(viewer) {
    this.apigetNoFlyZone().then((geoZoneData) => {
      [this.geojsonDataSourceNoFlyZone, this.entitiesOfRestrictedAreasIndia] =
        this.CesiumgetNoFlyZone(
          viewer,
          geoZoneData,
          this.geojsonDataSourceNoFlyZone,
          this.entitiesOfRestrictedAreasIndia
        );
    });
  }
  getInnerYellowZone(viewer) {
    this.apigetInnerYellowZone().then((geoZoneData) => {
      [
        this.geojsonDataSourceInnerYellowZone,
        this.entitiesOfRestrictedAreasIndia,
      ] = this.CesiumgetInnerYellowZone(
        viewer,
        geoZoneData,
        this.geojsonDataSourceInnerYellowZone,
        this.entitiesOfRestrictedAreasIndia
      );
    });
  }
  getYellowZone(viewer) {
    this.apigetYellowZone().then((geoZoneData) => {
      [this.geojsonDataSourceYellowZone, this.entitiesOfRestrictedAreasIndia] =
        this.CesiumgetInnerYellowZone(
          viewer,
          geoZoneData,
          this.geojsonDataSourceYellowZone,
          this.entitiesOfRestrictedAreasIndia
        );
    });
  }
  getDubaiNoFlyZone(viewer) {
    this.apigetNoFlyZoneDubai().then((geoZoneData) => {
      [
        this.geojsonDataSourceNoFlyZoneDubai,
        this.entitiesOfRestrictedAreasDubai,
      ] = this.CesiumgetNoFlyZoneDubai(
        viewer,
        geoZoneData,
        this.geojsonDataSourceNoFlyZoneDubai,
        this.entitiesOfRestrictedAreasDubai
      );
      // this.CesiumgetFIC(
      //   viewer,
      //   geoZoneData,
      //   this.geojsonDataSourceNoFlyZoneDubai,
      //   this.entitiesOfRestrictedAreasDubai
      // )
    });
  }

  getDubaiFIC(viewer) {
    this.apigetFICZoneDubai().then((geoZoneData) => {
      [this.geojsonDataSourceFICDubai, this.entitiesOfRestrictedAreasDubai] =
        this.CesiumgetFIC(
          viewer,
          geoZoneData,
          this.geojsonDataSourceFICDubai,
          this.entitiesOfRestrictedAreasDubai
        );
    });
  }

  getMilitaryNoFlyZone(viewer) {
    this.apigetMilitaryNoFlyZone().then((geoZoneData) => {
      [
        this.geojsonDataSourceMilitaryZone,
        this.entitiesOfRestrictedAreasIreland,
      ] = this.CesiumgetMilitaryNoFlyZone(
        viewer,
        geoZoneData,
        this.geojsonDataSourceMilitaryZone,
        this.entitiesOfRestrictedAreasIreland
      );
    });
  }

  getMapLayersCountry(viewer, profileDetails) {
    
    this.mapLayersModule = profileDetails.MapLayers;
    this.operatorApi
      .getMapHashValue()
      .then((res) => {
        if (this.mapLayersModule?.length != 0) {
          this.getSingleMapLayers(profileDetails, viewer);
          this.getGeoFence(viewer);
        }
        this.getIndiaBoundry(viewer);

        this.getFIRs(viewer, profileDetails);
        // this.getDubaiNoFlyZone(viewer);
        // this.getDubaiFIC(viewer);
      })
      .catch(() => {
        console.log('Error in fetching the hash value');
      });
  }
  getIndiaBoundry(viewer) {
    this.moduleApi.getindiaBoudnary().then((res) => {
      let geoZoneData = res.data.MainData.data;
      this.CesiumgetIndiaBoundary(
        viewer,
        geoZoneData,
        this.geojsonDataSourceIndiaBoundary
      );
    });
  }
  getFIRs(viewer, profileDetails) {
    let countryCode =
      this.user == 'pilot'
        ? profileDetails.CountryCode
        : profileDetails.Country;
    let payload = {
      CountryCode: countryCode,
    };
    this.moduleApi.getFIRs(payload).then((res) => {
      let geoZoneData = res.data.MainData.data;
      this.CesiumgetFIRs(viewer, geoZoneData);
    });
  }
  // getSingleMapLayers(module, index, profileDetails, viewer) {
  //   this.apigetMapLayers(module, profileDetails).then((res: any) => {
  //     this.mapLayers.push(res);
  //     let countryCode =
  //       this.user == 'pilot'
  //         ? profileDetails.CountryCode
  //         : profileDetails.Country;
  //     this.loadMapLayers(res, countryCode, viewer);
  //     if (index != this.mapLayersModule.length - 1) {
  //       index++;
  //       this.getSingleMapLayers(
  //         this.mapLayersModule[index],
  //         index,
  //         profileDetails,
  //         viewer
  //       );
  //     } else {
  //     }
  //   });
  // }

  getSingleMapLayers(profileDetails, viewer) {
    const promises = [];

    // Iterate through mapLayersModule and create promises for each module
    this.mapLayersModule.forEach((module) => {
      const promise = this.apigetMapLayers(module, profileDetails).then(
        (res: any) => {
          this.mapLayers.push(res);
          let countryCode =
            this.user == 'pilot'
              ? profileDetails.CountryCode
              : profileDetails.Country;
          this.loadMapLayers(res, countryCode, viewer);
        }
      );

      promises.push(promise); // Add the promise to the array
    });

    // Use Promise.all() to wait for all promises to resolve
    Promise.all(promises)
      .then(() => {
        console.log('All map layers have been loaded.');
        viewer.scene.requestRender();
      })
      .catch((error) => {
        console.error('An error occurred while loading map layers:', error);
      });
    // this.apigetMapLayers(module, profileDetails).then((res: any) => {
    //   this.mapLayers.push(res);
    //   let countryCode =
    //     this.user == 'pilot'
    //       ? profileDetails.CountryCode
    //       : profileDetails.Country;
    //   this.loadMapLayers(res, countryCode, viewer);
    //   if (index != this.mapLayersModule.length - 1) {
    //     index++;
    //     this.getSingleMapLayers(
    //       this.mapLayersModule[index],
    //       index,
    //       profileDetails,
    //       viewer
    //     );
    //   } else {
    //   }
    // });
  }
  loadMapLayers(mapLayer, country, viewer) {
    if (country == 'IN') {
      switch (mapLayer.MapLayer) {
        case 'InnerYellowZone': {
          this.CesiumgetInnerYellowZone(
            viewer,
            mapLayer.data,
            this.geojsonDataSourceInnerYellowZone,
            this.entitiesOfRestrictedAreasIndia
          );
          break;
        }
        case 'OuterYellowZone': {
          this.CesiumgetYellowZone(
            viewer,
            mapLayer.data,
            this.geojsonDataSourceYellowZone,
            this.entitiesOfRestrictedAreasIndia
          );
          break;
        }
        case 'NoFlyZone': {
          this.CesiumgetNoFlyZone(
            viewer,
            mapLayer.data,
            this.geojsonDataSourceNoFlyZone,
            this.entitiesOfRestrictedAreasIndia
          );
          break;
        }
        // case 'GeoZone': {
        //   this.CesiumgetGeoFence(
        //     viewer,
        //     mapLayer.data,
        //     this.geojsonDataSourceGeoFenceIndia,
        //     this.entitiesOfRestrictedAreasIndia
        //   );
        //   break;
        // }

        case 'FIC': {
          this.CesiumgetFIC(
            viewer,
            mapLayer.data,
            this.geojsonDataSourceFICIndia,
            this.entitiesOfRestrictedAreasIndia
          );
          break;
        }
        // case 'VFR_IE2': {
        //   this.CesiumgetMilitaryNoFlyZone(
        //     viewer,
        //     mapLayer.data,
        //     this.geojsonDataSourceMilitaryZone,
        //     this.entitiesOfRestrictedAreasIreland
        //   );
        //   break;
        // }
        // case 'AIRPORT_IE': {
        //   this.CesiumgetAirports(
        //     viewer,
        //     mapLayer.data,
        //     this.geojsonDataSourceAirportIreland,
        //     this.entitiesOfRestrictedAreasIreland
        //   );
        //   break;
        // }
        // case 'VFR_IE': {
        //   this.Cesiumgetvfrs(
        //     viewer,
        //     mapLayer.data,
        //     this.geojsonDataSourceIreland,
        //     this.entitiesOfRestrictedAreasIreland
        //   );
        //   break;
        // }
        // case 'DUBAI_NOFLYZONE': {
        //   this.CesiumgetNoFlyZoneDubai(
        //     viewer,
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
  }

  //Based on Country Show and Hide Maps
  removeNoFlyZone(e) {
    if (!e.target.checked) {
      this.geojsonDataSourceIndia.show = false;
      this.geojsonDataSourceIreland.show = false;
    } else {
      this.geojsonDataSourceIndia.show = true;
      this.geojsonDataSourceIreland.show = true;
    }
  }
  removeAirportZone(e) {
    if (!e.target.checked) {
      this.geojsonDataSourceAirportIndia.show = false;
      this.geojsonDataSourceAirportIreland.show = false;
    } else {
      this.geojsonDataSourceAirportIndia.show = true;
      this.geojsonDataSourceAirportIreland.show = true;
    }
  }
  removeGreenZone(e) {
    if (!e.target.checked) {
      this.geojsonDataSourceGreenZoneIndia.show = false;
    } else {
      this.geojsonDataSourceGreenZoneIndia.show = true;
    }
  }
  removeWarningZone(e) {
    if (!e.target.checked) {
      this.geojsonDataSourceWarningZone.show = false;
    } else {
      this.geojsonDataSourceWarningZone.show = true;
    }
  }
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
  removeTimelineAndClock(viewer) {
    viewer.animation.container.style.visibility = 'hidden';
    viewer.timeline.container.style.visibility = 'hidden';
    viewer.scene.fxaa = false;
    // viewer.scene.globe.maximumScreenSpaceError = 1.33;
    // viewer.resolutionScale = 2;
  }
  setDefaultView(viewer, lng?, lat?) {
    if (lat.length !== 0 && lng.length !== 0) {
      var west = Math.min(...lng);
      var south = Math.min(...lat);
      var east = Math.max(...lng);
      var north = Math.max(...lat);
    } else {
      var west = 68.0;
      var south = 7.0;
      var east = 89.0;
      var north = 35.0;
    }
    var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);
    viewer.camera.setView({
      destination: rectangle,
    });
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
        this.getDeviceIP().subscribe({
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
                var cartesian = Cesium.Cartesian3.fromDegrees(78.8718, 21.7679);
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

        // this.getDeviceIP().subscribe(
        //   (res) => {
        //     if (res.query) {
        //       this.getIPLocation(res.query).subscribe(
        //         (result) => {
        //           if (result.latitude && result.longitude) {
        //             lat = result.latitude;
        //             lon = result.longitude;
        //             if (
        //               lat < IndialatMax &&
        //               lat > IndialatMin &&
        //               lon < IndialngMax &&
        //               lon > IndialngMin
        //             ) {
        //               country = 'INDIA';
        //               var west = 68.0;
        //               var south = 7.0;
        //               var east = 89.0;
        //               var north = 35.0;
        //             } else if (
        //               lat < IrelandlatMax &&
        //               lat > IrelandlatMin &&
        //               lon < IrelandlngMax &&
        //               lon > IrelandlngMin
        //             ) {
        //               country = 'IRELAND';
        //               var west = -10;
        //               var south = 51.0;
        //               var east = -5.0;
        //               var north = 56.0;
        //             }
        //             if (west && south && east && north) {
        //               var rectangle = Cesium.Rectangle.fromDegrees(
        //                 west,
        //                 south,
        //                 east,
        //                 north
        //               );
        //               var cartesian = Cesium.Cartesian3.fromDegrees(
        //                 78.8718,
        //                 21.7679
        //               );
        //               viewer.camera.setView({
        //                 destination: rectangle,
        //               });
        //             }
        //           }
        //         },
        //         (err) => {
        //           this.setDefaultView(viewer);
        //         }
        //       );
        //     }
        //   },
        //   (err) => {
        //     this.setDefaultView(viewer);
        //   }
        // );
      }
    );
  }
  //Getting Map Layers from backend server
  Cesiumgetvfrs(
    viewer,
    jsonData,
    geojsonDataSource,
    entitiesOfRestrictedAreas
  ) {
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
  CesiumgetAirports(
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
  CesiumgetWarningZones(viewer, dataSource, geojsonDataSourceWarningZone) {
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
  CesiumgetGeoFence(
    viewer,
    dataSource,
    geojsonDataSourceGeoZoneIndia,
    entitiesOfRestrictedAreas
  ) {
    var entities;
    viewer.dataSources.remove(geojsonDataSourceGeoZoneIndia);

    var promise = geojsonDataSourceGeoZoneIndia.load(dataSource, {
      clampToGround: true,
    });
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];

        // ff6344
        // let color = Cesium.Color.fromRgba(0xff4463ff);
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
        // entity.id = entity.properties.ID._value;
        // = entity.properties.ID;
      }
    });
    return [geojsonDataSourceGeoZoneIndia, entitiesOfRestrictedAreas];
  }
  CesiumgetFIC(
    viewer,
    dataSource,
    geojsonDataSourceFICIndia,
    entitiesOfRestrictedAreas
  ) {
    var entities;
    viewer.dataSources.remove(geojsonDataSourceFICIndia);

    var promise = geojsonDataSourceFICIndia.load(dataSource, {
      clampToGround: true,
    });
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let type = entity.properties.TYPE;
        // ff6344
        let color =
          type == 'M'
            ? Cesium.Color.fromRgba(0x154380e4)
            : type == 'D' || type == 'A'
            ? Cesium.Color.fromRgba(0x158f9ca1)
            : type == 'P' || type == 'R'
            ? Cesium.Color.fromRgba(0x159c5108)
            : type == 'T' || type == 'W'
            ? Cesium.Color.fromRgba(0x15ccfcff)
            : '';
        // 404463ff
        // let OutlineColor = Cesium.Color.fromRgba(0x660a0aff);
        // let Color = Cesium.Color.fromRgba(0x400a0aff);

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
    viewer.scene.requestRender();
    return [geojsonDataSourceFICIndia, entitiesOfRestrictedAreas];
  }
  CesiumgetNoFlyZone(
    viewer,
    dataSource,
    geojsonDataSourceNoFlyZone,
    entitiesOfRestrictedAreas
  ) {
    var entities;
    viewer.dataSources.remove(geojsonDataSourceNoFlyZone);
    var promise = geojsonDataSourceNoFlyZone.load(dataSource, {
      clampToGround: true,
    });
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
    viewer.scene.requestRender();
    return [geojsonDataSourceNoFlyZone, entitiesOfRestrictedAreas];
  }
  CesiumgetInnerYellowZone(
    viewer,
    dataSource,
    geojsonDataSourceInnerYellowZone,
    entitiesOfRestrictedAreas
  ) {
    var entities;
    viewer.dataSources.remove(geojsonDataSourceInnerYellowZone);
    var promise = geojsonDataSourceInnerYellowZone.load(dataSource, {
      clampToGround: true,
    });
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
    viewer.scene.requestRender();
    return [geojsonDataSourceInnerYellowZone, entitiesOfRestrictedAreas];
  }
  CesiumgetYellowZone(
    viewer,
    dataSource,
    geojsonDataSourceYellowZone,
    entitiesOfRestrictedAreas
  ) {
    var entities;

    var promise = geojsonDataSourceYellowZone.load(dataSource, {
      clampToGround: true,
    });
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
    viewer.scene.requestRender();
    return [geojsonDataSourceYellowZone, entitiesOfRestrictedAreas];
  }
  CesiumgetNoFlyZoneDubai(
    viewer,
    geoZoneData,
    geojsonDataSourceNoFlyDubaiZone,
    entitiesOfRestrictedAreas
  ) {
    const promise = geojsonDataSourceNoFlyDubaiZone.load(geoZoneData, {
      clampToGround: true,
    });
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
          // entity.polygon.material.color._value.alpha = 0.2;
          entity.polygon.hierarchy._value.positions =
            Cesium.Cartesian3.fromDegreesArrayHeights(altCoordinate);

          entity.polygon.fill = true;
          // entity.polygon.material.color._value.alpha = 0.8;
          entity.polygon.outlineColor = entity.polygon.material.color._value;
          entity.polygon.material.color._value =
            Cesium.Color.fromRgba(0x224463ff);
          entity.polygon.outline = true;

          entity.polygon.height = 0;
          // entity.polygon.outline = false;
          // entity.polygon.extrudedHeight = 0;
          // entity.polygon.extrudedHeightReference =
          //   Cesium.HeightReference.CLAMP_TO_GROUND;
          // entity.polygon.perPositionHeight = true;
        } else {
          entity.polygon.show = false;
        }
      }
    });
    return [geojsonDataSourceNoFlyDubaiZone, entitiesOfRestrictedAreas];
  }
  CesiumgetMilitaryNoFlyZone(
    viewer,
    geoJSONdataSource,
    geojsonDataSourceMilitaryZone,
    entitiesOfRestrictedAreas
  ) {
    viewer.dataSources.remove(geojsonDataSourceMilitaryZone);

    var entities;

    var promise = geojsonDataSourceMilitaryZone.load(geoJSONdataSource, {
      clampToGround: true,
    });
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

  CesiumgetIndiaBoundary(viewer, dataSource, geojsonDataSourceIndiaBoundary) {
    var promise = geojsonDataSourceIndiaBoundary.load(dataSource);
    promise.then((res) => {
      viewer.dataSources.add(res);
      var entities;
      entities = res.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.polyline.outline = true;
        entity.polyline.width = 6;
        // FFFC1C  D37770
        // entity.polyline.material = Cesium.Color.fromRgba(0xaa1cfcff);  //initial
        entity.polyline.material = Cesium.Color.fromRgba(0x807077d3); //red
        // entity.polyline.material = Cesium.Color.fromRgba(0x5044fcff);
        // width: 3,
        // ffb731 8e8e8e
        // material: Cesium.Color.fromRgba(0x888e8e8e),
        // entity.polyline.arcType = Cesium.ArcType.RHUMB
        // GEODESIC RHUMB NONE
      }
    });
  }
  CesiumgetFIRs(viewer, dataSource) {
    var promise = this.geojsonDataSourceFIRs.load(dataSource);
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
    });
  }

  // Corelation of FIRs
  async getFIRValue(poly1) {
    let FIRS = [];
    // this.firCoords.forEach((fir) => {
    //   let poly2 = turf.polygon([fir.coOrdinates]);
    //   let intersection: any = booleanIntersects(poly2, poly1); // let intersection: any = turf.pointsWithinPolygon(poly1, poly2);
    //   if (intersection) {
    //     console.log(fir.FIR)
    //     FIRS.push(fir.FIR);
    //   }
    // });
    let payload = {
      FIRCords: this.firCoords,
      Poly1: poly1,
    };
    const res: any = await this.operatorApi
      .getFirIntersection(payload)
      .then((res) => res);
    for (let i = 0; i < res.data.MainData.length; i++) {
      FIRS.push(res.data.MainData[i]);
    }
    return FIRS;
  }
  apigetGeoFence() {
    if (!this.geoFenceIndia) {
      return new Promise((resolve) => {
        this.moduleApi.getGeoFence().subscribe((res) => {
          this.geoFenceIndia = res.data.MainData;
          // .data.MainData.data;

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
        this.moduleApi.getvfrs(payload).subscribe((res) => {
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
        this.moduleApi.getAirports(payload).subscribe((res) => {
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
        this.moduleApi.getWarning().subscribe((res) => {
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
        this.moduleApi.getNoFlyZone().subscribe((res) => {
          this.noFlyZoneIndia = res.data.MainData.data;
          resolve(this.noFlyZoneIndia);
        });
      });
    } else {
      return new Promise((resolve) => resolve(this.noFlyZoneIndia));
    }
  }
  apigetNoFlyZoneDubai() {
    if (!this.noFlyZoneIndiaDubai) {
      return new Promise((resolve) => {
        this.moduleApi.getNoFlyZoneDubai().then((res) => {
          this.noFlyZoneIndiaDubai = res;
          resolve(this.noFlyZoneIndiaDubai);
        });
      });
    } else {
      return new Promise((resolve) => resolve(this.noFlyZoneIndiaDubai));
    }
  }
  apigetFICZoneDubai() {
    if (!this.noFlyZoneIndiaDubai) {
      return new Promise((resolve) => {
        this.moduleApi.getFICDubai().then((res) => {
          this.noFlyZoneIndiaDubai = res;
          resolve(this.noFlyZoneIndiaDubai);
        });
      });
    } else {
      return new Promise((resolve) => resolve(this.noFlyZoneIndiaDubai));
    }
  }

  apigetInnerYellowZone() {
    if (!this.innerYellowZoneIndia) {
      return new Promise((resolve) => {
        this.moduleApi.getInnerYellowZone().subscribe((res) => {
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
        this.moduleApi.getYellowZone().subscribe((res) => {
          this.outerYellowZoneIndia = res.data.MainData.data;
          resolve(this.outerYellowZoneIndia);
        });
      });
    } else {
      return new Promise((resolve) => resolve(this.outerYellowZoneIndia));
    }
  }
  apigetMilitaryNoFlyZone() {
    if (!this.militaryZoneData) {
      return new Promise((resolve) => {
        this.moduleApi.getMilitaryNoFlyZone().subscribe((res) => {
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
          // console.log(res);
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
  osmBuildings(viewer, osmBuilding, osmTileset) {
    if (!osmBuilding) {
      osmTileset.show = true;
      viewer.terrainProvider = Cesium.createWorldTerrain();
      // viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
      //   url:
      //     'https://api.maptiler.com/tiles/terrain-quantized-mesh-v2?key=' +
      //     this.maptilerkey,
      // });
    } else {
      osmTileset.show = false;
      viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }
    return osmBuilding;
  }
  getElevationBlackBox(logs, setVariable) {
    if (setVariable == true) {
      this.droneHeight = [];
      this.distances = [];
      this.elevationData = [];
    }

    // if (logs.length <= 2) return;
    if (logs[0].altituteType) {
      for (let i = 0; i < logs.length; i++) {
        if (logs[i].altituteType == 0) {
          let height = logs[i].elevation;
          this.droneHeight.push(height);
        } else if (logs[i].altituteType == 3) {
          let height = logs[0].elevation + logs[i].alt;
          this.droneHeight.push(height);
        } else if (logs[i].altituteType == 10) {
          let height = logs[i].elevation + logs[i].alt;
          this.droneHeight.push(height);
        }
        this.distances.push(logs[i].distTraveled);
        this.elevationData.push(logs[i].elevation);
      }
    } else {
      for (let i = 0; i < logs.length; i++) {
        if (i == 0 && logs[i].alt < 10) {
          let height = logs[i].elevation;
          this.droneHeight.push(height);
        }
        let height = logs[i].alt + logs[i].elevation;
        this.droneHeight.push(height);
        this.distances.push(logs[i].distTraveled);
        this.elevationData.push(logs[i].elevation);
      }
    }
    this.distances[0] = 0;

    return [this.distances, this.droneHeight, this.elevationData];
  }
  get initialized() {
    return this._iniitalViewer.asObservable();
  }

  addRPTOGeoZone(viewer, positions, alt = 200, zoom: boolean) {
    viewer.dataSources.remove(this.RPTOgeoZoneDataSource);
    const geozone = this.RPTOgeoZoneDataSource.entities.add({
      name: 'GeoFence',
      corridor: {
        classificationType: Cesium.ClassificationType.TERRAIN,
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
        extrudedHeight: alt || 200,
        width: 10.0,
        material: Cesium.Color.ORANGE.withAlpha(0.5),
        // height: 100,
        heightReference: Cesium.HeightReference.CLAMP_TO_TERRAIN,
      },
    });
    viewer.dataSources.add(this.RPTOgeoZoneDataSource);
    if (zoom) {
      viewer.zoomTo(geozone, {
        heading: 0,
        pitch: 0,
        range: 5000,
      });
    }
  }

  removeRPTOGeoZone(viewer) {
    viewer.dataSources.remove(this.RPTOgeoZoneDataSource);
  }

  setViewer(viewer) {
    // console.log(viewer);

    this.cesiumViewer = viewer;
    this._iniitalViewer.next(viewer);
    this.scene = this.cesiumViewer.scene;
    this.viewModel = {
      requestRenderMode: true,
      showTimeOptions: false,
      timeChangeEnabled: false,
      maximumRenderTimeChange: 0.0,
      lastRenderTime: '',
      requestRender: function () {
        this.scene.requestRender();
      },
    };
    this.cesiumViewer.scene.morphComplete.addEventListener(() => {
      if (
        this.cesiumFunction.latLongPinEntity &&
        this.cesiumFunction.latLongInfoEntity
      ) {
        const position = this.cesiumFunction.latLongPinEntity.position.getValue(
          this.cesiumViewer.clock.currentTime
        );
        const cartographicPosition =
          Cesium.Cartographic.fromCartesian(position);
        const latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
        const longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);

        this.cesiumFunction.dropLocationPin(
          this.cesiumViewer,
          longitude,
          latitude
        );
      }
    });
  }
  getViewer() {
    return this.cesiumViewer;
  }
  resetMap(navigate?) {
    this.cesiumViewer.scene.mode = Cesium.SceneMode.SCENE2D;
    this.cesiumViewer.entities.removeAll();
    this.cesiumFunction.latLongInfoEntity = undefined;
    this.cesiumFunction.latLongInfoEntity = undefined;
    // this.cesiumFunction.setDefaultView(this.cesiumViewer);
    // this.removeDroneTrailPath(this.cesiumViewer);
    // this.cesiumFunction.removeEntities(this.cesiumViewer.entities, 'Label');
    // this.cesiumFunction.removeEntities(this.cesiumViewer.entities, 'WayPoint');
    // this.cesiumFunction.removeEntities(
    //   this.cesiumViewer.entities,
    //   'CustomLabel'
    // );
    // this.cesiumFunction.removeEntities(
    //   this.cesiumViewer.entities,
    //   'BufferRegion'
    // );
    // this.cesiumFunction.removeEntities(this.cesiumViewer.entities, 'Mission');
    // this.cesiumFunction.removeEntities(
    //   this.cesiumViewer.entities,
    //   'Drone Image'
    // );
    // this.cesiumFunction.removeEntities(
    //   this.cesiumViewer.entities,
    //   'Drone Boundary'
    // );
    // this.cesiumFunction.removeEntities(
    //   this.cesiumViewer.entities,
    //   'BufferRegion2D'
    // );
  }
  removeDroneTrailPath(viewer) {
    const ente = viewer;
    const removeEntries = ente.entities[`_entities`]['_array'].filter(
      (entity) => entity.name == 'Live Drone Path'
    );
    removeEntries.forEach((entity) => {
      this.cesiumFunction.removeEntities(ente.entities, entity.id);
    });
  }
}
