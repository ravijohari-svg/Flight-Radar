import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';

import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
import { Constants } from 'src/app/constants/constants';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { AuthorityApplicationComponent } from '../authority-application.component';
@Component({
  selector: 'app-authority-dashboard',
  templateUrl: './authority-dashboard.component.html',
  styleUrls: ['./authority-dashboard.component.scss'],
})
export class AuthorityDashboardComponent implements OnInit, OnDestroy {
  tabIndex = 0;
  missionSelected = false;
  upcomingSelectedMissionId;
  upcomingMissionCount;
  ongoingMissionCount;
  subscription: any;

  // Metrices
  metricDaysValue = new FormControl(7, Validators.required);
  metricDays = [7, 15, 30];
  metricTypes: any = [
    {
      Name: 'Missions Approved',
      Parameter: 'ApprovedMissions',
      Route: 'authority/authority-app/blackbox/',
      img: '../../../../assets/common-layout/check.svg',
    },
    {
      Name: 'Missions Declined',
      Parameter: 'DeclinedMissions',
      Route: 'authority/authority-app/blackbox/',
      img: '../../../../assets/common-layout/x-close.svg',
    },
    {
      Name: 'Successful Operation',
      Parameter: 'SuccessfulMissions',
      Route: 'authority/authority-app/blackbox/',
      img: '../../../../assets/common-layout/thumbs-up.svg',
    },
    {
      Name: 'Reported Operations',
      Parameter: 'ReportedMissions',
      Route: 'authority/authority-app/blackbox/',
      img: '../../../../assets/common-layout/alert-circle.svg',
    },
    {
      Name: 'Pending Approvals',
      Parameter: 'PendingMissions',
      Route: false,
      Action: 'Upcoming',
      img: '../../../../assets/common-layout/annotation-dots.svg',
    },
    {
      Name: 'Pilots Registered',
      Parameter: 'PilotsCount',
      Route: 'authority/authority-app/pilots/pilots-list/',
      img: '../../../../assets/common-layout/users-icon.svg',
    },
  ];

  //Loader
  loader;
  //Timer
  metricInterval;
  viewer;

  //TabIndexCheck
  previousTabIndex = 0;
  tabIndexCounter = 0;
  osmTileset: any;
  ScreenSpaceEventHandler: any;
  entityDescription: any;
  isView: boolean;
  imageryLayer: any;
  imgLayer: any;
  toggleFlag: any;
  osmBuilding: boolean;
  toggleflagText: string;
  createZoneState: boolean = false;
  profileDetails: any;

  constructor(
    private authorityApi: AuthorityapisService,
    private router: Router,
    private dateAndTimeFormat: DateTimeFormatService,
    private webSocketService: WebSocketService,
    private maplayerService: MapLayersService,
    private authorityApplicationComponent: AuthorityApplicationComponent

  ) {}

  ngOnInit(): void {
    this.initialFunction();
    this.checkLiveStream();

    this.authorityApi.zoneData.subscribe((res: any)=> {
      this.createZoneState =  res;
    });
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.imageryLayer) {
      this.viewer.imageryLayers.remove(this.imageryLayer);
    }
    if (this.imgLayer) {
      this.viewer.imageryLayers.remove(this.imgLayer);
    }
    if (this.viewer) {
      this.viewer.camera.moveStart.removeEventListener();
      this.viewer.scene.primitives.remove(this.osmTileset);
    }
    if (this.ScreenSpaceEventHandler) {
      this.ScreenSpaceEventHandler.destroy();
    }
    clearInterval(this.metricInterval);
  }
  initialFunction() {
    this.profileDetails = this.authorityApplicationComponent.getDecryptData();
    this.getDashboardMetrices();
    this.viewer = this.maplayerService.getViewer();
    if (this?.viewer?.entities) {
      this.viewer.entities.removeAll();
      this.viewer.scene.requestRender();
    }
    // this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    // this.osmTileset = Cesium.createOsmBuildings();
    // this.viewer.scene.primitives.add(this.osmTileset);
  }

  checkLiveStream() {
    this.subscription = this.webSocketService
      .getMessages()
      .subscribe((message) => {
        if (message.action === Constants.checkLiveStream) {
          if (message.dataChange) {
            this.getDashboardMetrices();
          }
        }
      });
  }

  clearAndResetInterval() {
    clearInterval(this.metricInterval);

    this.getDashboardMetrices();
  }
  getDashboardMetrices() {
    this.loader = true;
    let payload = {
      Days: Number(this.metricDaysValue.value),
      Time: this.dateAndTimeFormat.dateAndTimeFormatting(
        new Date(),
        'dateAndTime'
      ),
      UserId: this.profileDetails.UserId,
    };
    this.authorityApi.getDashboardMetrices(payload).subscribe(
      (res) => {
        let metricValues = res.data.MainData;
        this.metricTypes.forEach((metric, index) => {
          metric.Value = metricValues?.[metric.Parameter];
          // metric
        });
        this.loader = false;
      },
      (err) => {
        this.loader = false;
      }
    );
  }
  //Metric redirection
  onMetricReDirect(metric: any) {
    if (metric.Route) {
      metric.Days = Number(this.metricDaysValue.value);
      let encryData = encodeURIComponent(btoa(JSON.stringify(metric)));
      this.router.navigateByUrl(metric.Route + encryData);
    } else if (metric?.Action == 'Upcoming') {
      this.tabIndex = 1;
    }
  }

  // createZoneStateData(event){
  //   console.log(event);
  //   this.createZoneState = event
  // }
}
