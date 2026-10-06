import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
import { environment } from 'src/environments/environment';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';

@Component({
  selector: 'app-authority-remoteid',
  templateUrl: './authority-remoteid.component.html',
  styleUrls: ['./authority-remoteid.component.scss'],
  providers: [],
})
export class AuthorityRemoteidComponent implements OnInit, OnDestroy {
  mapIdObj = {
    mapId: 'authority-remote-id',
    containerId: 'authority-remote-id-container',
  };
  // Mapbox
  mapBoxKey = environment.mapBoxKey;
  maptilerkey = environment.maptilerkey;

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

  liveDetails;
  remoteiditerval;
  initialInterval;
  droneEntity;

  viewer;

  constructor(
    private authorityApi: AuthorityapisService,
    private cesiumFunction: CesiumFunctionService,
    private mapLayersService: MapLayersService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.viewer = this.mapLayersService.getViewer();
      // this.viewer = this.mapsManagerService
      //   .getMap(this.mapIdObj.mapId)
      //   .getCesiumViewer();
      this.initialInterval = setInterval(() => {
        this.getTrackInitially();
      }, 3000);
    }, 500);
  }

  ngOnDestroy(): void {
    clearInterval(this.initialInterval);
    clearInterval(this.remoteiditerval);
  }

  getTrackInitially() {
    // this.authorityApi.getRemoteIdInitially({})
    this.authorityApi
      .getOneLapLiveData()
      .then((res: any) => {
        //Commented for onelap
        // let data = res.data.MainData;
        // if (Object.keys(data).length != 0 && data.coordinates) {
        //   data.coordinates.latitude = 19.3001268;
        //   data.coordinates.longitude = 73.9252853;
        //   if (data.coordinates.latitude !== 0 && data.coordinates.longitude !== 0) {
        //     this.liveDetails = res.data.MainData;
        //     clearInterval(this.initialInterval);
        //     this.cesiumFunction.flyTo(this.viewer, this.liveDetails.coordinates.latitude, this.liveDetails.coordinates.longitude);
        //     this.droneEntity = this.cesiumFunction.droneImageLatLong(this.viewer, this.liveDetails.coordinates.latitude, this.liveDetails.coordinates.longitude, this.liveDetails.altitude)
        //     this.remoteiditerval = setInterval(() => {
        //       this.getTrackContinuously();
        //     }, 3000);
        //   }
        // }

        // Added for onelap
        let data = res;
        if (Object.keys(data).length != 0) {
          if (data.latitude !== 0 && data.longitude !== 0) {
            this.liveDetails = res;
            clearInterval(this.initialInterval);
            this.cesiumFunction.flyTo(
              this.viewer,
              this.liveDetails.latitude,
              this.liveDetails.longitude
            );
            this.droneEntity = this.cesiumFunction.droneImageLatLong(
              this.viewer,
              this.liveDetails.latitude,
              this.liveDetails.longitude,
              this.liveDetails.altitude
            );
            this.viewer.scene.requestRender();
            this.remoteiditerval = setInterval(() => {
              this.getOneLapContinuously();
            }, 3000);
          }
        }
      })
      .catch((err) => {});
  }
  getTrackContinuously() {
    if (
      Object.keys(this.liveDetails).length != 0 &&
      this.liveDetails.coordinates
    ) {
      let payload = {
        LastLogTime: this.liveDetails.TS_Created,
      };
      this.authorityApi
        .getRemoteIdContiuous(payload)
        .then((res: any) => {
          let data = res.data.MainData;
          //Dev
          // data = this.liveDetails;
          // data.coordinates.latitude = this.liveDetails.coordinates.latitude + 0.05;
          // data.coordinates.longitude = this.liveDetails.coordinates.longitude + 0.05;
          if (Object.keys(data).length != 0 && data.coordinates) {
            if (
              data.coordinates.latitude !== 0 &&
              data.coordinates.longitude !== 0
            ) {
              this.liveDetails = data;
              this.cesiumFunction.updatedroneImageLatLong(
                this.liveDetails.coordinates.latitude,
                this.liveDetails.coordinates.longitude,
                this.liveDetails.altitude,
                this.droneEntity
              );
            }
          }
        })
        .catch((err) => {});
    }
  }
  getOneLapContinuously() {
    if (Object.keys(this.liveDetails).length != 0) {
      this.authorityApi
        .getOneLapLiveData()
        .then((res: any) => {
          let data = res;
          //Dev
          // data = this.liveDetails;
          // data.latitude = this.liveDetails.latitude + 0.01;
          // data.longitude = this.liveDetails.longitude + 0.01;
          if (Object.keys(data).length != 0 && data) {
            if (data.latitude !== 0 && data.longitude !== 0) {
              this.liveDetails = data;
              this.cesiumFunction.updatedroneImageLatLong(
                this.liveDetails.latitude,
                this.liveDetails.longitude,
                this.liveDetails.altitude,
                this.droneEntity
              );
              this.viewer.scene.requestRender();
            }
          }
        })
        .catch((err) => {});
    }
  }
}
