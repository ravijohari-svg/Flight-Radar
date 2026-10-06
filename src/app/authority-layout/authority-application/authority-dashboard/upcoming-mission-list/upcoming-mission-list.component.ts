import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
import Swal from 'sweetalert2';

import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import { AuthorityApplicationComponent } from '../../authority-application.component';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { Constants } from 'src/app/constants/constants';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
@Component({
  selector: 'app-upcoming-mission-list',
  templateUrl: './upcoming-mission-list.component.html',
  styleUrls: ['./upcoming-mission-list.component.scss'],
})
export class UpcomingMissionListComponent implements OnInit, OnDestroy {
  @Input() missionSelected;
  @Output() missionSelectedChange = new EventEmitter<string>();
  @Input() upcomingSelectedMissionId;
  @Output() upcomingSelectedMissionIdChange = new EventEmitter<string>();

  @Input() upcomingMissionCount;
  @Output() upcomingMissionCountChange = new EventEmitter<string>();

  @Input() ongoingMissionCount;
  @Output() ongoingMissionCountChange = new EventEmitter<string>();

  profileDetails;

  //Mission Status Terms
  approved = 'Approved';
  reject = 'Rejected';
  //Swal
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

  //Upcoming Mission List
  upcomingMissionListArr;

  //Loader
  loader = false;

  show = true;

  subscription: any;
  viewer: any;
  isView: boolean;
  ScreenSpaceEventHandler: any;
  entityDescription: any;
  // imageryLayer: any;
  toggleFlag: any;
  activeAirspaceEntities: any;
  // osmBuilding: boolean;
  // imgLayer: any;
  // osmTileset: any;
  constructor(
    private authorityApi: AuthorityapisService,
    private dateAndTimeFormat: DateTimeFormatService,
    private authorityApplicationComponent: AuthorityApplicationComponent,
    private webSocketService: WebSocketService,
    private maplayerService: MapLayersService,
    private cesiumFunction: CesiumFunctionService,
  ) {}

  ngOnInit(): void {
    this.initialFunction();
    this.onClickonMaps();
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // if (this.imageryLayer) {
    //   this.viewer.imageryLayers.remove(this.imageryLayer);
    // }
    // if (this.imgLayer) {
    //   this.viewer.imageryLayers.remove(this.imgLayer);
    // }
    // if (this.viewer) {
    //   this.viewer.scene.primitives.remove(this.osmTileset);
    // }
    if (this.ScreenSpaceEventHandler) {
      this.ScreenSpaceEventHandler.destroy();
    }
  }
  initialFunction() {
    // let decrypt = CryptoJS.AES.decrypt(
    //   localStorage.getItem('AdminDetails').toString(),
    //   environment.authorityKey
    // );
    // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.viewer = this.maplayerService.getViewer();
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
    this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    // this.osmTileset = Cesium.createOsmBuildings();
    // this.viewer.scene.primitives.add(this.osmTileset);
    // this.osmTileset.show = false;
    this.profileDetails = this.authorityApplicationComponent.getDecryptData();
    this.loader = true;
    this.getZoneData();
    this.checkWebSocketService();
    this.upcomingMissionList();
  }

  checkWebSocketService() {
    this.subscription = this.webSocketService
      .getMessages()
      .subscribe((message) => {
        // console.log('message from backend', message);

        if (message.action === Constants.checkLiveStream) {
          if (message.dataChange) {
            this.upcomingMissionList();
          }
        }
      });
  }

  async upcomingMissionList() {
    // this.loader = true;
    let payload = {
      Time: this.dateAndTimeFormat.dateAndTimeFormatting(
        new Date(),
        'dateAndTime'
      ),
      CountryCode: this.profileDetails.Country,
      Role: this.profileDetails.Role,
      UserId: this.profileDetails.UserId,
    };

    let ongoingPayload = {
      Time: this.dateAndTimeFormat.dateAndTimeFormatting(
        new Date(),
        'dateAndTime'
      ),
      Role: this.profileDetails.Role,
      CountryCode: this.profileDetails.Country,
      UserId: this.profileDetails.UserId,
      count: true,
    };

    const onGoingMissionPromise =
      this.authorityApi.getOnGoingMissionList(ongoingPayload);
    const upcomingMissionPromise =
      this.authorityApi.getUpcomingMissionList(payload);
    
    Promise.all([upcomingMissionPromise, onGoingMissionPromise])
      .then(async ([upcomingrResponse, OngoingResponse]: any[]) => {
        this.liveUpcomingMissions(upcomingrResponse, OngoingResponse);
      })
      .catch((err) => {
        this.loader = false;
      });
  }

  // @SL - Updating the missions count in parent component and Getting the upcomingMissionArr
  liveUpcomingMissions(res, res2?) {
    this.loader = false;
    this.upcomingMissionListArr = res.data.MainData.UpcomingMissionList;

    this.upcomingMissionCount = res.data.MainData.UpcomingCount;
    this.upcomingMissionCountChange.emit(this.upcomingMissionCount);
    this.ongoingMissionCount = res2.data.MainData.OnGoingCount;
    this.ongoingMissionCountChange.emit(this.ongoingMissionCount);

    // @ SL - 17/04/23 - Removed to avoid unncessary computation of LatLong
    // this.upcomingMissionListArr.forEach((arr, index) => {
    //   let latLongArr = [];
    //   arr.Latitude.forEach((lat, i) => {
    //     let latLong = { Latitude: lat, Longitude: arr.Longitude[i] }
    //     latLongArr.push(latLong);
    //     return latLong;
    //   });
    //   arr.LatLong = latLongArr;
    // });
  }

  //View single mission details - Trigger new screen view
  missionDetails(missionId) {
    this.upcomingSelectedMissionId = missionId;
    this.upcomingSelectedMissionIdChange.emit(this.upcomingSelectedMissionId);
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
  // @SL - Updating the approve/reject manual status
  statusUpdateApi(MissionStatus, MissionId) {
    let payload = {
      MissionId: MissionId,
      MissionStatus: MissionStatus,
    };
    this.authorityApi
      .updateMissionStatus(payload)
      .then((res) => {
        this.upcomingMissionList();
      })
      .catch((err) => {
        console.log(err);
      });
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
      this.maplayerService.onclickmapui(input, this.viewer).then((res: any) => {
        if (res) {
          this.entityDescription = res;
          this.isView = true;
        }
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  toggle2D3D(val: any) {
    this.toggleFlag = val;
    this.toggleFlag = !this.toggleFlag;
    if (this.toggleFlag) {
      //first off the osmBuildings
      // this.osmBuilding = true;
      // this.osmBuildings(val);
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    } else {
      this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
      this.viewer.camera.lookUp(Cesium.Math.toRadians(10.0));
    }
  }

  // @SL - 17/04/23 - For ngFor Trackby
  missionsListTrack(index, mission) {
    return mission.MissionId;
  }

  //Angular Cesium
  getBackgroundColor(plane) {
    return new Cesium.Color(0.048, 0.086, 0.175, 0.8);
    // return Cesium.Color.ROYALBLUE;
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
