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
import { environment } from 'src/environments/environment';

import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { AuthorityApplicationComponent } from '../../authority-application.component';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mission-details',
  templateUrl: './mission-details.component.html',
  styleUrls: ['./mission-details.component.scss'],
  providers: [],
})
export class MissionDetailsComponent implements OnInit, OnDestroy {
  @Input() missionSelected;
  @Output() missionSelectedChange = new EventEmitter<string>();

  @Input() upcomingSelectedMissionId;
  // @Input() mapsManagerService;

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
      // text : 'alert-text'
      // cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false,
  });

  //Mission Status Terms
  approved = 'Approved';
  reject = 'Rejected';

  //Mission Details
  missionDetails;

  profileDetails;
  complaince;
  // Cesium Viewer
  viewer;
  mapIdObj = {
    mapId: 'authority-upcomingMission',
    containerId: 'authority-upcomingMission-container',
  };
  show = true;

  //Loader
  loader = false;

  //Template card
  isView = false;

  entityDescription;

  //Active airspace - Buffer region
  activeBufferVisibility = true;
  activeBufferRegion;
  activeBuffers = [];
  // = new Cesium.EntityCollection
  activeAirspaceEntities;

  //Missions permission list
  missionPermissionsList;
  // OSM buildings
  // osmBuilding = false;
  // osmTileset;
  // imageryLayer;
  // imgLayer;

  //2D3D
  toggleFlag = true;
  // toggleflagText = '2D';

  mapBoxKey = environment.mapBoxKey;
  maptilerkey = environment.maptilerkey;
  ScreenSpaceEventHandler: any;
  downloadSubscription: any;

  constructor(
    private authorityApi: AuthorityapisService,
    private cesiumFunction: CesiumFunctionService,
    private mapLayersService: MapLayersService,
    private authorityApplicationComponent: AuthorityApplicationComponent,
    private http: HttpClient
  ) {}
  // private mapsManagerService: MapsManagerService,
  ngOnInit(): void {
    this.initialFunction();
  }

  ngOnDestroy(): void {
    // if (this.imageryLayer) {
    //   this.viewer.imageryLayers.remove(this.imageryLayer);
    // }
    // if (this.imgLayer) {
    //   this.viewer.imageryLayers.remove(this.imgLayer);
    // }
    if (this.ScreenSpaceEventHandler) {
      this.ScreenSpaceEventHandler.destroy();
    }
    this.viewer.camera.moveEnd.removeEventListener();
    if (this.downloadSubscription) {
      this.downloadSubscription.unsubscribe();
    }
  }
  initialFunction() {
    // let decrypt = CryptoJS.AES.decrypt(
    //   localStorage.getItem('AdminDetails').toString(),
    //   environment.authorityKey
    // );
    // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.profileDetails = this.authorityApplicationComponent.getDecryptData();
    this.loader = true;

    setTimeout(() => {
      // this.viewer = this.mapsManagerService
      //   .getMap('authority-upcomingMission')
      //   .getCesiumViewer();
      this.viewer = this.mapLayersService.getViewer();
      //instead of default2D view
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
      this.mapLayersService.initialConfig(this.viewer, this.profileDetails);
      this.onClickonMaps();
      this.getMissionDetails();
      // this.osmTileset = Cesium.createOsmBuildings();
      // this.viewer.scene.primitives.add(this.osmTileset);
      // this.osmTileset.show = false;
    }, 500);

    // this.getMissionDetails();
  }

  //Call to actions - Accept or Reject
  onReject(missionId) {
    if (
      this.profileDetails.Level == 'L1' ||
      this.profileDetails.Level == 'L2'
    ) {
      this.missionSelected = false;
      this.missionSelectedChange.emit(this.missionSelected);
      this.showSwal('mission-reject', missionId);
    }
  }
  onApprove(missionId) {
    if (
      this.profileDetails.Level == 'L1' ||
      this.profileDetails.Level == 'L2'
    ) {
      this.missionSelected = false;
      this.showSwal('mission-approve', missionId);
    }
  }

  //Swal
  showSwal(type, option1?) {
    if (type == 'mission-approve') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          text: 'Please confirm once to approve the mission',
          focusConfirm: false,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'Confirm',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.statusUpdateApi(this.approved, option1);
          }
        });
    } else if (type == 'mission-reject') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          text: "Are you sure? You won't be able to revert back?",
          focusConfirm: false,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'Reject',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.statusUpdateApi(this.reject, option1);
          }
        });
    }
  }
  // @SL - Updating the approve/reject manual status
  statusUpdateApi(MissionStatus, MissionId) {
    let payload = {
      MissionId: MissionId,
      MissionStatus: MissionStatus,
    };
    this.authorityApi
      .updateMissionStatus(payload)
      .then((res) => {
        this.missionDetails.MissionStatus = MissionStatus;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //Detailed mission view
  getMissionDetails() {
    this.loader = true;
    let payload = {
      MissionId: this.upcomingSelectedMissionId,
    };
    this.authorityApi.getComplianceData(payload).then((res: any) => {
      this.complaince = res?.data?.MainData;
    });
    this.authorityApi.getMissionInfo(payload).then(
      (res: any) => {
        this.loader = false;
        this.missionDetails = res.data.MainData;
        let latLongArr = [];
        this.missionDetails.Latitude.forEach((lat, i) => {
          let latLong = {
            Latitude: lat,
            Longitude: this.missionDetails.Longitude[i],
          };
          latLongArr.push(latLong);
          return latLong;
        });
        if (this.missionDetails.GeoFence) {
          const positions = [];
          for (let i = 0; i < this.missionDetails.Longitude.length; i++) {
            positions.push(
              this.missionDetails.Longitude[i],
              this.missionDetails.Latitude[i],
              this.missionDetails.Altitude[i]
            );
          }
          this.mapLayersService.addRPTOGeoZone(
            this.viewer,
            positions,
            this.profileDetails?.GeoFence?.MaxAlt,
            true
          );
        } else {
          // this.cesiumFunction.missionFlyTo(
          //   this.viewer,
          //   this.missionDetails.Longitude,
          //   this.missionDetails.Latitude
          // );
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
              this.missionDetails?.wayPointFileDetails.length !== 0 &&
              this.missionDetails?.wayPointFileDetails &&
              this.missionDetails?.length != 0
            ) {
              this.cesiumFunction.customLabelWaypoints(
                this.viewer,
                this.missionDetails?.wayPointFileDetails,
                this.missionDetails?.Altitude
              );
            }
          }
          this.missionPermissionsList =
            this.missionDetails?.missionPermissionsList;

          let entity = this.cesiumFunction.polylineVolume(
            this.viewer,
            this.missionDetails.Longitude,
            this.missionDetails.Latitude,
            this.missionDetails?.Altitude
          );
          this.cesiumFunction.zoomEntity1(
            this.viewer,
            entity,
            this.missionDetails?.BufferRegion
          );
        }
        this.viewer.scene.requestRender();
        this.getActiveAirBufferSpaces();
        this.missionDetails.LatLong = latLongArr;
      },
      (err) => {
        this.loader = false;
      }
    );
  }
  //Back to list view
  onBack() {
    this.missionSelected = false;
    this.missionSelectedChange.emit(this.missionSelected);
  }
  //Angular-Cesium
  getBackgroundColor(plane) {
    return new Cesium.Color(0.048, 0.086, 0.175, 0.8);
  }
  downloadFiles(url: string): void {
    this.downloadSubscription = this.http
      .get(url, { responseType: 'blob' })
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = this.getFileNameFromUrl(url);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
  }

  getFileNameFromUrl(fileUrl: string): string {
    const matches = fileUrl.match(/\/([^\/?#]+)[^\/]*$/);
    return matches ? matches[1] : 'downloaded-file';
  }
  downloadFile(fileUrl) {
    window.open(fileUrl, '_self');
  }
  openFileInNewTab(fileUrl: string) {
    const fileType = this.getFileTypeFromUrl(fileUrl);
    if (fileType.toLowerCase() === 'pdf') {
      window.open(
        `https://docs.google.com/viewer?url=${encodeURIComponent(
          fileUrl
        )}&embedded=true`,
        '_blank'
      );
    } else {
      window.open(fileUrl, '_blank');
    }
  }
  getFileTypeFromUrl(url: string): string | null {
    const matches = url.match(/\.([a-zA-Z0-9]+)$/);
    if (matches && matches.length > 1) {
      return matches[1].toLowerCase();
    }
    return null;
  }

  //Active Air Spaces
  getActiveAirBufferSpaces() {
    let payload = {
      StartTime: this.missionDetails.StartTime,
      EndTime: this.missionDetails.EndTime,
    };
    this.activeAirspaceEntities = this.viewer.entities;
    this.authorityApi
      .getActiveBufferRegions(payload)
      .then((res: any) => {
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
      })
      .catch((err) => {});
  }

  // Getting Maps from backend based on Country only once
  // Code to be removed in future when data is received with resp to viewport
  toggle2D3D(val: any) {
    this.toggleFlag = val;
    this.toggleFlag = !this.toggleFlag;
    if (this.toggleFlag) {
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
      if (this.missionDetails?.Longitude) {
        this.cesiumFunction?.loadWayPoints2D?.(
          this.viewer,
          this.missionDetails.Longitude,
          this.missionDetails.Latitude,
          this.missionDetails?.Altitude
        );
      }
      // this.viewer.camera.flyTo({
      //   destination : Cesium.Cartesian3.fromDegrees(78.9629, 25.5937, 6000000.0),
      //   orientation : {
      //     heading : Cesium.Math.toRadians(0.0),
      //     pitch : Cesium.Math.toRadians(-90.0),
      //     roll : Cesium.Math.toRadians(0.0)
      //   },
      //   duration : 3
      // });
    } else {
      // this.toggleflagText = '3D';
      this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
      if (this.missionDetails?.Longitude) {
        this.cesiumFunction?.loadWayPoints?.(
          this.viewer,
          this.missionDetails.Longitude,
          this.missionDetails.Latitude,
          this.missionDetails?.Altitude
        );
      }
      // this.viewer.camera.lookUp(Cesium.Math.toRadians(50.0));
      // this.viewer.camera.flyTo({
      //   // for india
      //   // destination : Cesium.Cartesian3.fromDegrees(78.9629, 20.5937, 20000000.0),
      //   //customized view
      //   destination : Cesium.Cartesian3.fromDegrees(78.9629, 6.6937, 3000000.0),
      //   orientation : {
      //     heading : Cesium.Math.toRadians(0.0),
      //     pitch : Cesium.Math.toRadians(-65.0),
      //     roll : Cesium.Math.toRadians(0.0)
      //   },
      //   duration : 3
      // });
      this.viewer.camera.lookUp(Cesium.Math.toRadians(10.0));
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
}
