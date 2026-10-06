/**
 * @description
 * This component is responsible for displaying the map on the diffrent page.
 * It takes the map layers as input and displays the map layers.
 * It also takes the map reset flag as input and resets the map.
 * It also takes the toggle flag as input and toggles the map layers.
 * The getMapLayers function is responsible for getting the map layers from the backend.
 * @author
 * Saroj Kumar Pahi
 */
import { Component, NgZone, OnInit } from '@angular/core';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { CognitoAccessToken } from 'amazon-cognito-identity-js';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  // OSM buildings
  osmBuilding = false;
  osmTileset;

  // Mapbox
  mapBoxKey = environment.mapBoxKey;
  maptilerkey = environment.maptilerkey;


  mapLayersModule;
  mapLayers = [];

  show = true;
  viewer: any;
  activeAirspaceEntities: any;
  profileDetails: any;
  editingPolyline$: any;
  editingPolygon$: any;
  currentWeatherDetails: any;
  cityName: any;
  responseCityName: any;
  mapResetFlag: boolean;
  toggleFlag: boolean;
  toggleflagText: string;
  mapId;

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
  geojsonDataSourceNoFlyZoneDubai = new Cesium.GeoJsonDataSource();

  geojsonDataSourceIndiaBoundary = new Cesium.GeoJsonDataSource();

  //Getting Maps Layer from backend Based on Country initially
  entitiesOfRestrictedAreasIndia = [];
  entitiesOfRestrictedAreasIreland = [];
  entitiesOfRestrictedAreasDubai = [];

  mapIdObj = {
    mapId: 'cesium-container',
    containerId: 'cesium-container',
  };
  constructor(
    private operatorApi: OperatorapisService,
    private cesiumFunction: CesiumFunctionService,
    private mapLayerService: MapLayersService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // validating AccessToken for Guest User
    const AccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('userAccessToken'),
    });
    const adminAccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('adminAccessToken'),
    });

    if (
      (!AccessToken['jwtToken'] || !AccessToken['payload']) &&
      (!adminAccessToken['jwtToken'] || !adminAccessToken['payload'])
    ) {
      this.operatorApi
        .getGuestProfileFile()
        .then((data) => {
          this.profileDetails = data;
          let encryData = CryptoJS.AES.encrypt(
            JSON.stringify(this.profileDetails),
            environment.operatorKey
          );
          localStorage.setItem('UserDetails', encryData);

          let decrypt;
          try {

            this.operatorApi.getStadiaMapURl().then((res: any) => {

              let url = res.data.MainData.MapAPIUrl;
              let urlType = res.data.MainData.MapAPIType;
              this.mapId = res.data.MainData.MapAPIId;
              this.mapLayerService.getMapId(this.mapId);
              // this.maplayerService.getUrl(url);
              this.mapLayerService.getUrlType(urlType);
              if (environment.production == false) {
                this.ngZone.runOutsideAngular(() => {
                  const viewerOptions: any =
                    this.mapLayerService.getViewerDevOptions();
                  this.viewer = new Cesium.Viewer('cesium-container', {
                    ...viewerOptions,
                    requestRenderMode: true,
                    maximumRenderTimeChange: Infinity,
                  });
                });
              }
              if (environment.production == true) {
                this.ngZone.runOutsideAngular(() => {
                  const viewerOptions: any =
                    this.mapLayerService.getViewerProdOption();
                  this.viewer = new Cesium.Viewer('cesium-container', {
                    ...viewerOptions,
                    requestRenderMode: true,
                    maximumRenderTimeChange: Infinity,
                  });
                });
              }
              this.initialFunction();
            });
          } catch (error) {
            // console.log(error);

            decrypt = CryptoJS.AES.decrypt(
              localStorage.getItem('AdminDetails')?.toString(),
              environment.authorityKey
            );
            this.profileDetails = JSON.parse(
              decrypt.toString(CryptoJS.enc.Utf8)
            );
          }
        })
        .catch((error) => {
          // console.error('Error fetching guest profile:', error);
        });
    }
    //normal flow
    else {
      let decrypt;
      try {
        decrypt = CryptoJS.AES.decrypt(
          localStorage.getItem('UserDetails')?.toString(),
          environment.operatorKey
        );
      } catch {
        decrypt = CryptoJS.AES.decrypt(
          localStorage.getItem('AdminDetails')?.toString(),
          environment.authorityKey
        );
      }
      this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
      if (environment.production == false) {
        this.ngZone.runOutsideAngular(() => {
          const viewerOptions: any =
            this.mapLayerService.getViewerDevOptions.call(this);
          this.viewer = new Cesium.Viewer('cesium-container', {
            ...viewerOptions,
            requestRenderMode: true,
            maximumRenderTimeChange: Infinity,
          });
        });
      }
      if (environment.production == true) {
        this.ngZone.runOutsideAngular(() => {
          const viewerOptions: any = this.mapLayerService.getViewerProdOption();
          this.viewer = new Cesium.Viewer('cesium-container', {
            ...viewerOptions,
            requestRenderMode: true,
            maximumRenderTimeChange: Infinity,
          });
        });
      }
      this.initialFunction();
      // this.getPodsData();
    }
  }
  getPodsData(){
    this.operatorApi.getPodsData().then((res) => {
      const data  = res.body.data;
      this.cesiumFunction.addBillboard(this.viewer, data)
    }).catch((err) => {
      console.log(err);
    })
  }

  getMapId(id) {
    this.mapId = id;
  }
  initialFunction() {
    // console.log('HELLO FROM initialFunciton', this.viewer);
    this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    this.mapLayerService.setViewer(this.viewer);
    this.viewer.selectionIndicator.destroy();
    // for debug
    // console.log(this.viewer.selectionIndicator.isDestroyed());
    this.cesiumFunction.set3DTunnelView(this.viewer);
    this.viewer.animation.container.style.visibility = 'hidden';
    this.viewer.timeline.container.style.visibility = 'hidden';
    this.activeAirspaceEntities = this.viewer.entities;
    //guest user
    const AccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('userAccessToken'),
    });
    const adminAccessToken = new CognitoAccessToken({
      AccessToken: localStorage.getItem('adminAccessToken'),
    });
    if (
      (!AccessToken['jwtToken'] || !AccessToken['payload']) &&
      (!adminAccessToken['jwtToken'] || !adminAccessToken['payload'])
    ) {
      // setTimeout(() => {
      this.mapLayerService.getMapLayersCountry(
        this.viewer,
        this.profileDetails
      );
      // }, 2000);
    }
    // normal flow
    else {
      this.mapLayerService.getMapLayersCountry(
        this.viewer,
        this.profileDetails
      );
    }
  }
}
