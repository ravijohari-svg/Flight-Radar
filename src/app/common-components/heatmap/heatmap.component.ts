import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ViewChild, ElementRef
} from '@angular/core';
import { CognitoAccessToken, CognitoIdToken } from 'amazon-cognito-identity-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss'],
})
export class HeatmapComponent implements OnInit, OnDestroy {
  @ViewChild('myToggle', { static: false }) myToggle!: MatSlideToggle;
  @ViewChild('telecom', { static: false }) tel!: MatSlideToggle;
  @ViewChild('population', { static: false }) population!: MatSlideToggle;
  @ViewChild('pods', { static: false }) pods!: MatSlideToggle;
  @Input() telecom: boolean = false;
  @Input() heatmap: boolean = false;
  @Input() toggle: boolean = false;
  @Input() terrain: boolean = false;
  @Input() show3DMapToggle: boolean = true;
  @Input() heatmapData:boolean = false;
  @Input() podData:boolean = false;
  @Output() toggSwitch = new EventEmitter<boolean>();
  @Output() toggSwitchData = new EventEmitter<boolean>();
  @Output() toggSwitchTel = new EventEmitter<boolean>();
  @Output() toggSwitchPop = new EventEmitter<boolean>();
  @Output() toggSwitchPods = new EventEmitter<boolean>();
  private viewer;
  private unSubscribe = new Subject<void>();
  isMatChecked: boolean = false;
  imageryLayer: any;
  imgLayer: any;
  osmBuildingBoolean: boolean = false;
  osmTileset: any;
  osmBuilding: any;

  // for disabling component until the we get viewer
  disabled: boolean = true;
  constructor(private mapLayersService: MapLayersService,
    private operatorApi :OperatorapisService,
    private cesiumFunction : CesiumFunctionService,
  ) {}

  ngOnInit(): void {
    this.mapLayersService.initialized
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((viewer) => {
        if (viewer) {
          this.viewer = viewer;
          this.osmTileset = Cesium.createOsmBuildings();
          this.viewer.scene.primitives.add(this.osmTileset);
          this.osmTileset.show = false;
          this.disabled = false;
          const AccessToken = new CognitoAccessToken({
            AccessToken: localStorage.getItem('userAccessToken'),
          });
          // for authority login there should not be 3D map initialized
          // only for the guest operator file
          let AdminPresent = localStorage.getItem('AdminDetails');
          let adminAccessToken = localStorage.getItem('adminAccessToken');
          let adminIDToken = localStorage.getItem('adminIDToken');

          if (
            (!AccessToken ||
              !AccessToken['jwtToken'] ||
              !AccessToken['payload']) &&
            !AdminPresent &&
            !adminAccessToken &&
            !adminIDToken
          ) {
            // this.toggle = true;
            // this.isMatChecked = true;
          }
        }
      });
  }
  ngOnDestroy(): void {
    this.telecom = false;
    this.heatmap = false;
    this.terrain = false;
    this.toggle = false;
    if (this.imgLayer) {
      this.viewer.imageryLayers.remove(this.imgLayer);
    }
    if (this.imageryLayer) {
      this.viewer.imageryLayers.remove(this.imageryLayer);
    }
    if (this.viewer) {
      this.viewer.scene.primitives.remove(this.osmTileset);
    }
    if (this.unSubscribe) {
      this.unSubscribe.next();
      this.unSubscribe.complete();
    }
    this.heatmap = false;
    this.telecom = false;
    this.osmBuilding = undefined;
  }
  // toggle2D3D() {
  //   this.isMatChecked = !this.isMatChecked;
  //   this.toggle = !this.toggle;
  //   if (this.terrain == true && this.toggle == false) {
  //     this.terrain = false;
  //     this.terrSwitch.emit(this.terrain);
  //   }
  //   this.toggSwitch.emit(this.toggle);
  // }
 
  toggle2D3D() {
    if(this.heatmapData == true){
      this.toggSwitchData.emit();
      this.toggSwitchTel.emit();
      this.toggSwitchPop.emit();
      this.myToggle.toggle();
    }
    else{
      this.isMatChecked = !this.isMatChecked;
    this.toggle = !this.toggle;
    if (this.terrain == true && this.toggle == false) {
      this.terrain = false;
      this.osmBuildings(this.terrain);
    }
    this.toggSwitch.emit(this.toggle);
    }
  }

  terrain3D() {
    this.terrain = !this.terrain;
    this.osmBuildings(this.terrain);
  }

  // OSM buildings
  osmBuildings(val: any) {
    this.osmBuilding = this.mapLayersService.osmBuildings(
      this.viewer,
      !val,
      this.osmTileset
    );
  }
  // telecomApi() {
  //   this.telecom = !this.telecom;
  // this.teleSwitch.emit(this.telecom);
  // }
  // popHeatmap() {
  //   this.heatmap = !this.heatmap;
  //   this.popSwitch.emit(this.heatmap);
  // }
  getPodsData(){
    this.podData = !this.podData;
    if(this.podData == false){
      this.cesiumFunction.removeAllBillboardEntities(this.viewer);
    }else{
      this.podsData();
    }
  }
  
  podsData() {
      // if (!this.hasPodEntities(this.viewer)) {
        this.operatorApi
          .getPodsData()
          .then((res) => {
            const data = res.body.data;
            this.cesiumFunction.addBillboard(this.viewer, data);
          })
          .catch((err) => {
            console.log(err);
          });
      // }
  }
  // hasPodEntities(viewer) {
  //   return viewer.entities.values.some((entity) => entity.id.includes('Pods'));
  // }
  
  popHeatmap() {
    if(this.heatmapData == true){
      this.toggSwitchPop.emit();
      this.population.toggle();
    }
    else{
      this.heatmap = !this.heatmap;
      if (this.heatmap) {
        this.imgLayer = this.viewer.imageryLayers.addImageryProvider(
          new Cesium.IonImageryProvider({ assetId: 2360681 })
        );
        this.viewer.zoomTo(this.imgLayer);
      } else {
        this.viewer.imageryLayers.remove(this.imgLayer);
      }
    }
  }
  telecomApi() {
    if(this.heatmapData == true){
      this.toggSwitchTel.emit();
      this.tel.toggle();
    }
    else{
      this.telecom = !this.telecom;
    if (this.telecom) {
      this.imageryLayer = this.viewer.imageryLayers.addImageryProvider(
        new Cesium.IonImageryProvider({ assetId: 2360108 })
      );
      this.viewer.zoomTo(this.imageryLayer);
    } else {
      this.viewer.imageryLayers.remove(this.imageryLayer);
    }
    }
  }
}
