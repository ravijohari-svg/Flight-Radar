import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';

import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
import { Constants } from 'src/app/constants/constants';
import { NotificationService } from 'src/app/custom-services/notification-service/notification.service';
import { NotificationType } from 'src/app/custom-services/notification-service/notification';
import { IndexedDBFunctionsService } from 'src/app/custom-services/common/indexed-db-functions.service';
@Component({
  selector: 'app-authority-application',
  templateUrl: './authority-application.component.html',
  styleUrls: ['./authority-application.component.scss'],
  providers: [],
})
export class AuthorityApplicationComponent implements OnInit, OnDestroy {
  private _mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;

  //Profile Details
  profileDetails;
  decryptData;
  encryptData;

  //Cognito Interval
  refreshTokenInterval;

  //Upcoming Missions
  upcomingMissionListArr;
  //Preflight doc
  base64Report;
  reportGenerated;
  preflightMissionListArr;
  preflightDocIndex;
  mapScreenshotURL;
  preFlightmissionDetailsVal;
  reportValues;

  //Active airspace - Buffer region
  activeBufferVisibility = true;
  activeBufferRegion;
  activeBuffers = [];

  // = new Cesium.EntityCollection
  activeAirspaceEntities;

  //Polyline
  show = true;

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

  //Getting Maps Layer from backend Based on Country initially
  entitiesOfRestrictedAreasIndia = [];
  entitiesOfRestrictedAreasIreland = [];

  //Live data exchange
  dataExchangeValue;

  // Router URL
  activeURLArr = Constants.activeURLArr_Authority;
  toggleSideNav = true;
  shouldShowSidebar: boolean;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private authorityApi: AuthorityapisService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private cesiumFunction: CesiumFunctionService,
    private mapLayerService: MapLayersService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private indexedDBFunctionsService: IndexedDBFunctionsService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ngOnInit(): void {
    this.cesiumFunction.access(Constants.authorityAcess);
    this.mapLayerService.access(Constants.authorityAcess);
    this.initialFunction();
    this.shouldShowSidebar =
      this.router.url.includes('postflightreport') ||
      this.router.url.includes('preflightreport');

    // offline notification
    window.addEventListener('offline', this.OfflineEventFunction);
    window.addEventListener('online', this.OnlineEventFunction);

    window.addEventListener('beforeunload', this.closeWebsocketEventListener);
  }

  initialFunction() {
    let decrypt = CryptoJS.AES.decrypt(
      localStorage.getItem('AdminDetails').toString(),
      environment.authorityKey
    );
    this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.decryptData = this.profileDetails;
    this.webSocketService.connectWebSocket(
      environment.websocketKey + 'authorityId=',
      this.profileDetails
    );
    // initilize indexedDB
    this.indexedDBFunctionsService.openIndexedDBConnection();

    this.refreshTokenInterval = setInterval(() => {
      this.authorityApi.checkForAccessToken();
    }, 600000);

  }


  closeWebsocketEventListener() {
    if (this.webSocketService) {
      this.webSocketService.closeConnection();
    }
  }

  getDecryptData() {
    return this.decryptData;
  }
  OnlineEventFunction = (event) => {
    this.notificationService.notify({
      title: 'Connected',
      message: 'Back Online!',
      type: NotificationType.success,
      duration: '',
      removeClose: '',
    });
  };

  OfflineEventFunction = (event) => {
    this.notificationService.notify({
      title: 'No Internet',
      type: NotificationType.warning,
      message: 'Please check your internet connection...',
      duration: 'never',
      removeClose: '',
    });
  };
  ngOnDestroy(): void {
    window.removeEventListener(
      'beforeunload',
      this.closeWebsocketEventListener
    );
    this.mobileQuery.removeListener(this._mobileQueryListener);
    clearInterval(this.refreshTokenInterval);
    this.notificationService.clearNotifications();
    window.removeEventListener('online', this.OnlineEventFunction);
    window.removeEventListener('offline', this.OfflineEventFunction);
  }
  onLogout() {
    // this.operatorApi.logOut();
    this.router.navigateByUrl('authority/authority-login');
  }
  onDashboard() {
    window.location.href = 'authority/authority-app/dashboard';
  }

  navigateToPath(path: any): void {
    this.router.navigateByUrl(`authority/authority-app/${path.url}`);
  }

  isActiveMenuItem(path: any): boolean {
    return this.router.url.includes(`/authority/authority-app/${path.url}`);
  }
}
