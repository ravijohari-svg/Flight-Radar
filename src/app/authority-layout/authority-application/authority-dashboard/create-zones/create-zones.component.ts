import { Component, Input, Output } from '@angular/core';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { AuthorityApplicationComponent } from '../../authority-application.component';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import * as turf from '@turf/turf';
import { Constants } from 'src/app/constants/constants';
import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { Router } from '@angular/router';
import * as echarts from 'echarts';
import { EventEmitter } from 'stream';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';

//For elevation graph to store the coordinates
interface Coordinate {
  latitude: number;
  longitude: number;
}

import Swal from 'sweetalert2';
import { log } from 'console';
@Component({
  selector: 'app-create-zones',
  templateUrl: './create-zones.component.html',
  styleUrls: ['./create-zones.component.scss']
})
export class CreateZonesComponent {
  missionDetail;
//2D3D
toggleFlag = true;
onTickHandler: () => void;
viewer;
handler;
isNext 
tabIndex = 0
wayPointsForm: FormGroup;
missionDetails: FormGroup;
isFilled: number = 1;
//Loader
loader;
wayPointsArr = [];
latitudeArr = [];
longitudeArr = [];

bufferPolygon = [];
typeIntersect;
operatorDocArr = [];
missionDocArr = [];
altitudeRef = [];
droneDocArr = [];
isClicked = false;
pointData: any = [];
polyData: any = [];
completePathFlag = false;
completeWaypoint: boolean = false;

waypoint;
finalwaypointVal = [];
LatitudeArr: any = [];
LongitudeArr: any = [];
AltitudeArr: any = [];
WayPointNum: any = [];
clickEnabled = false;
isVisible: boolean = false;
startDraw: boolean = false;
editPoint: boolean = false;
onWayChange: boolean = false;
profileDetails;
ScreenSpaceEventHandler: any;
entityDescription;
isDisable: boolean = false;
distanceData = [];
isDraw = true;
zonestartTime = "";
zoneEndTime = "";
swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn primary-btn mb-3 px-4',
    cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
    title: 'alert-title',
    //  text : 'alert-text'
    // cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false,
});
 //Template card
 isView = false;
 droneFollow: any = false;
 createZoneState: boolean = false;
  fileName: string;
  entity: any;
  bufferPointsArr: any[];
  lengthSplit: number;
  
  mapScreenshotURL;
 chartOption: echarts.EChartsOption;
 showCorrelation: boolean = false;
 correlationData;

 interesectionArr = {
  vfr: [],
  airport: [],
  greenzone: [],
  geozone: [],
  FIC: [],
  reservedAirspace: [],
  TerrainAdvisory: [],
};
interesectedEntities = [];
greenZoneIntersection = [];
lessData: boolean = false;
  wayBackened: [];
  uploaded: boolean;
// @Output() createZoneState = new EventEmitter();
zoneName = "";
  color: any;
  activeAirspaceEntities: any;
  submitted: boolean;
 constructor(
  private mapLayersService: MapLayersService,
    private cesiumFunction: CesiumFunctionService,
    private authorityApplicationComponent: AuthorityApplicationComponent,
    private fb: FormBuilder,
    private dateAndTimeFormat: DateTimeFormatService,
    private operatorService: OperatorService,
    private operatorApi: OperatorapisService,
    private router: Router,
    private authorityApi: AuthorityapisService,
  ) {}

ngOnInit(): void {
  // this.loader = true;
  this.completePathFlag = false;
  this.wayPointsForm = this.fb.group({
    wayPoints: this.fb.array([]),
  });
  this.profileDetails = this.authorityApplicationComponent.getDecryptData();
  

  this.missionDetails = this.fb.group(
    {
      OperationName: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator,
          Validators.minLength(3),
        ],
      ],
      // StartDate: ['',Validators.required],
      StartTime: ['', [Validators.required, this.startTime]],
      // EndDate: ['',Validators.required],
      EndTime: ['', Validators.required],
      ActivityType: [
        {
          value: '',
          disabled:
            this.profileDetails?.RPTO &&
            this.profileDetails?.GeoFence &&
            this.profileDetails?.GeoFence?.FileURL,
        },
        Validators.required,
      ],
      FlightPurpose: [
        {
          value: '',
          disabled:
            this.profileDetails?.RPTO &&
            this.profileDetails?.GeoFence &&
            this.profileDetails?.GeoFence?.FileURL,
        },
        Validators.required,
      ],
      MaximumAltitude: [
        120,
        [
          Validators.required,
          Validators.max(120),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      MaximumAltitudeUnits: ['m', Validators.required],
      // MissionStatus: ['', Validators.required],
      DroneId: ['', Validators.required],
      Pilot: ['', Validators.required],
      PilotContact: ['', Validators.required],
      // }),
    },
    {
      validators: [this.startEndTime.bind(this)],
    }
  );
  
  setTimeout(() => {
    this.clickEnabled = false;
    this.pointData = [];
    this.polyData = [];
    this.viewer = this.mapLayersService.getViewer();
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender()
    // this.missionDetails.patchValue({
    //   Pilot: this.profileDetails.FirstName,
    //   PilotContact: this.profileDetails.PhoneNumber,
    //   StartTime: this.dateAndTimeFormat.dateAndTimeFormatting(
    //     new Date(this.addMinutesToDate(new Date(), 3)),
    //     'dateAndTime'
    //   ),
    //   // this.timeFormatting(new Date(this.addMinutesToDate(new Date(), 3))),
    //   EndTime: this.dateAndTimeFormat.dateAndTimeFormatting(
    //     new Date(this.addMinutesToDate(new Date(), 13)),
    //     'dateAndTime'
    //   ),
    // });
    // this.osmTileset = Cesium.createOsmBuildings();
    // this.viewer.scene.primitives.add(this.osmTileset);
    // this.osmTileset.show = false;
    this.getZoneData();
    this.onClickonMaps();
    this.makePolyLine();
  }, 1000);
}
addMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
startEndTime(formgroup: FormGroup) {
  const { value: startTime } = formgroup.get('StartTime');
  const { value: endTime } = formgroup.get('EndTime');
  return new Date(endTime) > new Date(startTime)
    ? null
    : { startEndTime: true };
}
startTime(formControl: FormControl) {
  const { value: startTime } = formControl;
  return new Date() <= new Date(startTime) ? null : { startTime: true };
}
isDrawPoint(color) {
  this.color = color
  this.isNext = 2;
}
noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value && control.value.trim().length === 0) {
    return { whitespace: true };
  }
  return null;
}
nextOperation() {
  // console.log(this.missionDetails.value);
  this.submitted = true;
  if (this.isNext == 2 && !this.missionDetails?.errors?.startEndTime) {
    this.tabIndex = 2;
    this.onSelectOption('draw');
  }
}

// combineDateAndTime(time: string): string {
//   const currentDate = this.getCurrentDate();
//   return `${currentDate} ${time}`;
// }
// getCurrentDate(): string {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const day = String(now.getDate()).padStart(2, '0');

//   return `${year}-${month}-${day}`;
// }

onSelectOption(select) {
  let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
  formArray.clear();
  this.wayPointsArr = [];
  // destroying the clickOnMap handler before drawing polyline or uploading
  if (this.ScreenSpaceEventHandler) {
    this.ScreenSpaceEventHandler.destroy();
  }
  // removing the pin and info
  this.cesiumFunction.removeEntities(this.viewer.entities, 'Location Pin');
  this.cesiumFunction.removeEntities(this.viewer.entities, 'Location Info');
  this.cesiumFunction.latLongPinEntity = undefined;
  this.cesiumFunction.latLongInfoEntity = undefined;

  if (select == 'draw') {
    this.clickEnabled = true;
    this.isDraw = false;
    // if (this.editingPolyline$) {
    //   this.editingPolyline$.dispose();
    //   this.editingPolyline$ = undefined;
    // }
    this.tabIndex = 2;
    this.startDrawPolyline(null);
  } else {
    this.isDraw = true;
    this.tabIndex = 3;
    // if (this.editingPolyline$) {
    //   this.editingPolyline$.dispose();
    //   this.editingPolyline$ = undefined;
    // }
    this.fileName = '';
  }
}


startDrawPolyline(btn) {
  this.isDisable = false;
  this.distanceData = [];
  if (btn == 'reset') {
    this.showCorrelation = false;
    this.pointData = [];
    this.polyData = [];
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
    this.altitudeRef = [];
    this.isDisable = false;
    this.isVisible = false;
    if (this.completeWaypoint) {
      this.clickEnabled = true;
    }
    this.completeWaypoint = false;
    this.isFilled = 2;
    this.isClicked = false;
    this.correlationData = {
      inneryellow: 0,
      outeryellow: 0,
      red: 0,
      geozone: 0,
      zoneCount: [0, 0, 0],
    };

    this.latitudeArr = [];
    this.longitudeArr = [];
    this.completePathFlag = false;
    let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
    formArray.clear();
    this.wayPointsArr = [];
  }
  // if (this.editingPolyline$) {
  //   this.editingPolyline$.dispose();
  //   this.editingPolyline$ = undefined;
  // }

  let entities = this.viewer.entities;
  entities.values.forEach((value) => {
    if (value.id.includes('CoRelation')) {
      entities.removeById(value.id);
    }
  });
  // this.editingPolyline$ = this.polylineEditor.create(
  //   this.editPolylineOptions
  // );
  // this.editingPolyline$.subscribe((wayPoints) => {
  // });
}

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

  toggle2D3D(val: any) {
    this.toggleFlag = val;
    this.toggleFlag = !this.toggleFlag;
    if (this.onTickHandler) {
      this.viewer.clock.onTick.removeEventListener(this.onTickHandler);
      this.onTickHandler = undefined;
    }

    this.viewer.trackedEntity = undefined;
    this.droneFollow = false;
    if (this.toggleFlag) {
      //first off the osmBuildings
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
      if (this.missionDetail?.Longitude) {
        this.cesiumFunction?.loadWayPoints2D?.(
          this.viewer,
          this.missionDetail.Longitude,
          this.missionDetail.Latitude,
          this.missionDetail?.Altitude
        );
      }
    } else {
      // this.toggleflagText = '3D';
      this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
      if (this.missionDetail?.Longitude) {
        this.cesiumFunction?.loadWayPoints?.(
          this.viewer,
          this.missionDetail.Longitude,
          this.missionDetail.Latitude,
          this.missionDetail?.Altitude
        );
      }
      this.viewer.camera.lookUp(Cesium.Math.toRadians(10.0));
    }
  }
  makePolyLine() {
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.handler.setInputAction((input: any) => {
      if (this.clickEnabled == true) {
        
        var pickRay = this.viewer.scene.camera.getPickRay(input.position);
        var cartesian = this.viewer.scene.globe.pick(
          pickRay,
          this.viewer.scene
        );
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        this.pointData.push(cartesian);
        this.polyData.push(longitude, latitude);
        this.calDistance(longitude, latitude);

        if (this.pointData.length > 0) {
          const polylineProps = {
            positions: Cesium.Cartesian3.fromDegreesArray(this.polyData),
            width: 3,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString(this.color || '#888e8e'),
              dashLength: 14,
            }),
          };
          var position = Cesium.Cartesian3.fromDegrees(
            this.polyData[this.polyData.length - 2],
            this.polyData[this.polyData.length - 1]
          );
          this.viewer.entities.add({
            position: position,
            point: {
              color: Cesium.Color.fromCssColorString(this.color || '#888e8e'),
              pixelSize: 9,
              outlineColor: Cesium.Color.TRANSPARENT,
            },
          });
          this.viewer.entities.add({
            polyline: polylineProps,
          });
        }
        if (this.pointData) {
          this.LatitudeArr = [];
          this.LongitudeArr = [];
          this.AltitudeArr = [];
          this.WayPointNum = [];
          this.wayPointsArr = this.pointData;
          this.pointData.forEach((values, index) => {
            var cartographic = Cesium.Cartographic.fromCartesian(values);
            this.LatitudeArr.push(Cesium.Math.toDegrees(cartographic.latitude));
            this.LongitudeArr.push(
              Cesium.Math.toDegrees(cartographic.longitude)
            );
            this.AltitudeArr.push(this.missionDetails.value.MaximumAltitude);
            this.WayPointNum.push(String(index));
          });

          if (this.pointData.length >= 2) {
            this.isFilled = 4;
            let initialPos = [];
            let reversePos = [];
            let turfPos = [];
            this.pointData.forEach((values, index) => {
              var cartographic = Cesium.Cartographic.fromCartesian(values);
              turfPos.push([
                Cesium.Math.toDegrees(cartographic.longitude),
                Cesium.Math.toDegrees(cartographic.latitude),
              ]);
            });
            // turfPos.forEach((val,index) => {
            //   eval("var_"+ index +" = "+index);
            // })
            let initialArr = [];
            let latLongArr = [];
            let unionArr = [];
            let maxAltitude =
              Number(this.missionDetails.value.MaximumAltitude) + 50;
            let arr1d = [].concat(...turfPos);
            // let obj = Object.assign({}, ...turfPos );
            // var point = turf.multiPoint(turfPos);

            var line = turf.lineString(turfPos);
            let line1 = turf.lineString(turfPos, { stroke: '#F00' });
            var kinks = turf.kinks(line);
            let multiLineSplit = [];
            kinks.features.forEach((val, index) => {
              multiLineSplit.push(val.geometry.coordinates);
            });
            let lineSplit = turf.lineSplit(
              line,
              turf.multiPoint(multiLineSplit)
            );
            var buffered = turf.buffer(line, Constants.missionBuffer, {
              units: 'kilometers',
              steps: 2,
            });
            if (lineSplit.features.length != 0) {
              this.lengthSplit = lineSplit.features.length;
              lineSplit.features.forEach((outer, i) => {
                let sepline;
                sepline = turf.lineString(outer.geometry.coordinates);
                let sepbuffer = turf.buffer(sepline, Constants.missionBuffer, {
                  units: 'kilometers',
                  steps: 2,
                });
                sepbuffer.geometry.coordinates.forEach((mid, j) => {
                  unionArr.push(mid);
                  mid.forEach((inner, k) => {
                    latLongArr.push([inner[0], inner[1]]);
                    // if (k != 0) {
                    initialArr.push(
                      Cesium.Cartesian3.fromDegrees(inner[0], inner[1])
                    );
                    // }
                  });
                });
              });
              let unionInitialArr = [];
              let union: any = turf.polygon([unionArr[0]], { fill: '#0f0' });
              unionArr.forEach((val, index) => {
                let value = turf.polygon([val], { fill: '#0f0' });
                union = turf.union(union, value);
              });
              this.bufferPolygon = [];
              union.geometry.coordinates[0].forEach((value) => {
                unionInitialArr.push(
                  Cesium.Cartesian3.fromDegrees(value[0], value[1], maxAltitude)
                );
                this.bufferPolygon.push([value[0], value[1], maxAltitude]);

                // this.bufferPolygon.push(value[0] + ' ' + value[1]);
              });
              this.bufferPointsArr = unionInitialArr;
              this.cesiumFunction.bufferRegion2D(
                this.viewer,
                union.geometry.coordinates[0]
              );
              this.entity = this.cesiumFunction.bufferRegion2Ds(
                this.viewer,
                union.geometry.coordinates[0]
              );

              latLongArr.push(latLongArr[0]);
            } else {
              this.bufferPolygon = [];
              buffered.geometry.coordinates[0].forEach((val, index) => {
                initialArr.push(
                  Cesium.Cartesian3.fromDegrees(val[0], val[1], maxAltitude)
                );
                this.bufferPolygon.push([val[0], val[1], maxAltitude]);
                // this.bufferPolygon.push(val[0] + ' ' + val[1]);
              });
              this.bufferPointsArr = initialArr;
              this.cesiumFunction.bufferRegion2D(
                this.viewer,
                buffered.geometry.coordinates[0]
              );
              this.entity = this.cesiumFunction.bufferRegion2Ds(
                this.viewer,
                buffered.geometry.coordinates[0]
              );
            }
          }

          let diffLength;
          let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
          if (this.LatitudeArr.length > formArray.length) {
            diffLength = this.LatitudeArr.length - formArray.length;
            for (let i = 0; i < diffLength; i++) {
              this.wayPointsVal().push(this.newWayPoint());
            }
          } else if (this.LatitudeArr.length < formArray.length) {
            diffLength = formArray.length - this.LatitudeArr.length;
            for (let i = 0; i < diffLength; i++) {
              formArray.removeAt(formArray.length - 1);
            }
          }
          this.startDraw = true;
          this.checkCorrelationAltitude(
            this.missionDetails.value.MaximumAltitude,
            this.LatitudeArr,
            this.LongitudeArr
          );
          this.LatitudeArr.forEach((val, index) => {
            formArray.at(index).patchValue({
              Latitude: val,
              Longitude: this.LongitudeArr[index],
              // Altitude: this.missionDetails.value.MaximumAltitude,
            });
          });
          // if (this.bufferPolygon.length > 0) {
          //   clearTimeout(this.debounceTimer);
          //   this.debounceTimer = setTimeout(() => {
          //     this.checkCorrelation(this.LatitudeArr, this.LongitudeArr);
          //   }, 500);
          // }
        }
        this.viewer.scene.requestRender();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  wayPointsVal(): FormArray {
    return this.wayPointsForm.get('wayPoints') as FormArray;
  }
  newWayPoint(): FormGroup {
    return this.fb.group({
      Latitude: [],
      Longitude: [],
      Altitude: [],
    });
  }
  calDistance(longitude, latitude) {
    this.distanceData.push({ longitude, latitude });
    if (this.distanceData.length === 2) {
      const coord1 = {
        latitude: this.distanceData[0].latitude,
        longitude: this.distanceData[0].longitude,
      };
      const coord2 = {
        latitude: this.distanceData[1].latitude,
        longitude: this.distanceData[1].longitude,
      };
      const cartographic1 = Cesium.Cartographic.fromDegrees(
        coord1.longitude,
        coord1.latitude
      );
      const cartographic2 = Cesium.Cartographic.fromDegrees(
        coord2.longitude,
        coord2.latitude
      );
      const cartesian1 = Cesium.Cartesian3.fromRadians(
        cartographic1.longitude,
        cartographic1.latitude
      );
      const cartesian2 = Cesium.Cartesian3.fromRadians(
        cartographic2.longitude,
        cartographic2.latitude
      );
      const distance = Cesium.Cartesian3.distance(cartesian1, cartesian2);
      this.distanceShow(cartesian1, cartesian2, distance);
      this.distanceData.shift();
    }
  }
  distanceShow(cartesian1, cartesian2, distance) {
    const midpoint = Cesium.Cartesian3.midpoint(
      cartesian1,
      cartesian2,
      new Cesium.Cartesian3()
    );
    if (distance > 40000) {
      distance = distance / 1000;
      this.viewer.entities.add({
        position: midpoint,
        label: {
          text: `${distance.toFixed(2)} km`,
          font: '20px sans-serif',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0, -10),
        },
      });
    } else {
      this.viewer.entities.add({
        position: midpoint,
        label: {
          text: `${distance.toFixed(2)} m`,
          font: '20px sans-serif',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0, -10),
        },
      });
    }
  }
  async checkCorrelationAltitude(Altitude, Latitude, Longitude) {
    if (this.startDraw == true || this.onWayChange == true) {
      for (let i = 0; i < Longitude.length; i++) {
        this.altitudeRef[i] = 10;
      }
    }
    let newAlt = [];
    let coordinate = [];
    if (!this.startDraw && !this.onWayChange) {
      let payload = {
        latitude: Latitude[0],
        longitude: Longitude[0],
      };
      coordinate.push(payload);
      const result = await this.operatorApi.getElevation(coordinate);
      let AltRef = 0;
      AltRef = result['data']?.MainData;
      for (let i = 0; i < Longitude.length; i++) {
        if (this.altitudeRef[i] == 0 && i != 0) {
          let coor = [];
          let payload = {
            latitude: Latitude[i],
            longitude: Longitude[i],
          };
          coor.push(payload);
          const res = await this.operatorApi.getElevation(coor);
          const elevation = res['data']?.MainData;
          newAlt[i] = Altitude[i] - elevation;
        } else if (this.altitudeRef[i] == 0 && i == 0) {
          newAlt[i] = Altitude[i];
        } else if (this.altitudeRef[i] == 10) {
          let coord = [];
          let payload = {
            latitude: Latitude[i],
            longitude: Longitude[i],
          };
          coord.push(payload);
          const res = await this.operatorApi.getElevation(coord);
          let elevation = res['data']?.MainData;
          elevation = Number(elevation);
          newAlt[i] = Altitude[i] + elevation - AltRef;
        } else {
          newAlt[i] = Altitude[i];
        }
      }
    }
    if (this.startDraw == true) {
      for (let i = 0; i < Latitude.length; i++) {
        newAlt[i] = Altitude;
      }
    }
    this.startDraw = false;
    if (this.onWayChange == true) {
      for (let i = 0; i < Latitude.length; i++) {
        newAlt[i] = Altitude[i];
      }
    }
    this.onWayChange = false;
    this.startDraw = false;
    let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
    newAlt.forEach((val, index) => {
      formArray.at(index).patchValue({
        Altitude: val,
      });
    });
    this.isVisible = true;
  }

 

  close(val) {
    this.isView = false;
  }

  onCompletePath() {
        if (this.wayPointsArr.length <= 1) {
      this.showSwal('at-least-two-position', 2);
      return;
    } else {
      this.clickEnabled = false;
      this.completePathFlag = true;
      this.completeWaypoint = true;
      this.updateWayPoints(this.wayPointsArr);
    }
  }

  showSwal(type, option?) {
    if (type == 'error-message') {
    } else if (type == 'mission-outside-country') {
      this.swalWithBootstrapButtons.fire({
        background: '#1b1f27',
        title: `Your mission is outside ${option}`,
        text: `Please create missions within your country`,
        focusConfirm: false,
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
      });
    } else if (type == 'at-least-two-position') {
      this.swalWithBootstrapButtons.fire({
        background: '#1b1f27',
        title: `At least ${option} waypoints required`,
        text: `Click on a location to add path`,
        focusConfirm: false,
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
      });
    } else if (type == 'Documents stored successfully') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          text: 'Documents uploaded successfully',
          icon: 'success',
          focusConfirm: false,
          showCancelButton: false,
          showConfirmButton: true,
          allowOutsideClick: false,
          // timer: 1000,
          confirmButtonText: 'Okay',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['operator/operator-app/dashboard']);
          }
        });
    }
  }



  updateWayPoints(initialPos, LongArr?, LatArr?, AltArr?) {
      // if (this.editingPolyline$) {
      //   this.editingPolyline$.dispose();
      //   this.editingPolyline$ = undefined;
      // }
      // this.editingPolyline$ = this.polylineEditor.edit(
      //   initialPos,
      //   this.editPolylineOptions
      // );
      this.clickEnabled = false;
      this.polyData = [];
      for (let i = 0; i < initialPos.length; i++) {
        var cartographic = Cesium.Cartographic.fromCartesian(initialPos[i]);
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        this.calDistance(longitude, latitude);
        this.polyData.push(longitude, latitude);
        var position = Cesium.Cartesian3.fromDegrees(
          this.polyData[this.polyData.length - 2],
          this.polyData[this.polyData.length - 1]
        );
        this.viewer.entities.add({
          position: position,
          point: {
            color: Cesium.Color.fromRgba(0xaa8e8e8e),
            pixelSize: 9,
            outlineColor: Cesium.Color.TRANSPARENT,
          },
        });
      }
      if (this.polyData.length > 0) {
        const polylineProps = {
          positions: Cesium.Cartesian3.fromDegreesArray(this.polyData),
          width: 3,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromRgba(0x888e8e8e),
            dashLength: 14,
          }),
        };
        this.viewer.entities.add({
          polyline: polylineProps,
        });
      }
      // this.editingPolyline$.subscribe((wayPoint) => {
      if (initialPos) {
        this.LatitudeArr = [];
        this.LongitudeArr = [];
        this.wayPointsArr = initialPos;
        initialPos.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          this.LatitudeArr.push(Cesium.Math.toDegrees(cartographic.latitude));
          this.LongitudeArr.push(Cesium.Math.toDegrees(cartographic.longitude));
        });
        let diffLength;
        let formArray = this.wayPointsForm.get('wayPoints') as FormArray;
        if (this.LatitudeArr.length > formArray.length) {
          diffLength = this.LatitudeArr.length - formArray.length;
          for (let i = 0; i < diffLength; i++) {
            this.wayPointsVal().push(this.newWayPoint());
            this.AltitudeArr.push(this.AltitudeArr[length - 1]);
          }
        } else if (this.LatitudeArr.length < formArray.length) {
          diffLength = formArray.length - this.LatitudeArr.length;
          for (let i = 0; i < diffLength; i++) {
            formArray.removeAt(formArray.length - 1);
            this.AltitudeArr.pop();
          }
        }
        this.LatitudeArr.forEach((val, index) => {
          formArray.at(index).patchValue({
            Latitude: val,
            Longitude: this.LongitudeArr[index],
            // Altitude: this.AltitudeArr[index],
          });
        });
        if (this.editPoint || this.onWayChange) {
          this.checkCorrelationAltitude(
            this.AltitudeArr,
            this.LatitudeArr,
            this.LongitudeArr
          );
          this.editPoint = false;
        }
      }
      if (initialPos.length >= 2) {
        let turfPos = [];
        initialPos.forEach((values, index) => {
          var cartographic = Cesium.Cartographic.fromCartesian(values);
          turfPos.push([
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ]);
        });
        var buffered;
        let payload = {
          TurfPosition: turfPos,
          BufferType: 'Linestring',
        };
        // var point = turf.lineString(turfPos);
        // var buffered = turf.buffer(point, Constants.missionBuffer, {
        //   units: 'kilometers',
        //   steps: 2,
        // });
        this.operatorApi.getBuffer(payload).then((res: any) => {
          buffered = res.data.MainData;
          this.cesiumFunction.bufferRegion2D(
            this.viewer,
            buffered.geometry.coordinates[0]
          );
          this.entity = this.cesiumFunction.bufferRegion2Ds(
            this.viewer,
            buffered.geometry.coordinates[0]
          );
  
          let initialArr = [];
          this.bufferPolygon = [];
          let avgAltitude = Math.max(...this.AltitudeArr) + 50;
          buffered.geometry.coordinates[0].forEach((val, index) => {
            // 3D Maps
            initialArr.push(
              Cesium.Cartesian3.fromDegrees(val[0], val[1], avgAltitude)
            );
            this.bufferPolygon.push([val[0], val[1], avgAltitude]);
            // this.bufferPolygon.push(val[0] + ' ' + val[1]);
  
            // 2D Maps
            // initialArr.push(Cesium.Cartesian3.fromDegrees(val[0], val[1]));
          });
          this.bufferPointsArr = initialArr;
          // this.editingPolyline$.disable();
          this.isDisable = true;
          this.flyTo(
            this.LongitudeArr,
            this.LatitudeArr,
            this.AltitudeArr,
            initialPos
          );
          if (
            this.bufferPolygon.length > 0 &&
            LatArr != undefined &&
            LongArr != undefined
          ) {
            this.checkCorrelation(LatArr, LongArr);
          }
        });
      }
      // });
      this.isClicked = !this.isClicked;
      this.getElevationData(
        this.LatitudeArr,
        this.LongitudeArr,
        this.AltitudeArr
      );
    }

    flyTo(
      LongitudeArr,
      LatitudeArr,
      AltitudeArr,
      wayPoints,
      formSubmit?,
      createMission?
    ) {
      // this.loader = true;
      let totalLongitude = 0;
      let totalLatitude = 0;
      LongitudeArr.map((long) => {
        totalLongitude += Number(long);
        return Number(long);
      });
      LatitudeArr.map((lat) => {
        totalLatitude += Number(lat);
        return Number(lat);
      });
  
      let maxLong = Math.abs(
        Math.max(...LongitudeArr) - Math.min(...LongitudeArr)
      );
      let maxLat = Math.abs(Math.max(...LatitudeArr) - Math.min(...LatitudeArr));
  
      let maxAlt = Math.max(...AltitudeArr.map((val) => Number(val)));
      let j = 0;
      let finalVal: any = [];
      let mappedVal = wayPoints.map((val) => val.x);
      let sortedWayPoint = mappedVal.sort();
      for (var i = 0; i < sortedWayPoint.length; i++) {
        let diff = sortedWayPoint[i] - j;
        finalVal.push(diff);
        j = sortedWayPoint[i];
      }
      finalVal = finalVal.filter((val, index) => index != 0);
      let diffVal = finalVal.reduce((a, b) => a + b, 0) / finalVal.length;
      diffVal = Math.abs(diffVal);
      let complete = false;
      let self = this;
  
      // let flyToVar: any = {
      //   destination: Cesium.Cartesian3.fromDegrees(
      //     totalLongitude / LongitudeArr.length,
      //     totalLatitude / LongitudeArr.length,
      //     LatitudeArr.length == 1 ? 10000 : Math.max(maxLong, maxLat) * 180000
      //   ),
      // };
      // if (formSubmit) {
      //   flyToVar = {
      //     ...flyToVar,
      //     complete: () => {
      //       setTimeout(() => {
      //         complete = true;
      //       }, 100);
      //     },
      //   };
      // }
      let screenshotInterval = setInterval(() => {
        this.viewer.render();
        this.mapScreenshotURL = this.viewer.canvas.toDataURL();
        clearInterval(screenshotInterval);
        if (formSubmit) {
          setTimeout(() => {
            this.onFormSubmit(createMission);
          }, 500);
        }
      }, 100);
      this.zoomToEntity();
      // this.viewer.camera.flyTo(flyToVar);
    }

    async checkCorrelation(latitudeArr, longitudeArr) {
      this.latitudeArr = [];
      this.latitudeArr = latitudeArr;
      this.lessData = true;
      let payload = {
        BufferPolygon: this.bufferPolygon,
        LessData: this.lessData,
      };
      const res: any = await this.operatorApi
        .getIntersectedEntity(payload)
        .then((res) => res);
      let interesectDetail = res.data.MainData;
      for (
        let i = 0;
        i < interesectDetail.RestrictedEntitiesValueArray.length;
        i++
      ) {
        this.typeIntersect =
          interesectDetail.RestrictedEntitiesValueArray[i].type;
        this.interesectedEntities.push(
          interesectDetail.RestrictedEntitiesValueArray[i]
        );
      }
  
      this.interesectionArr = {
        vfr: [],
        airport: [],
        greenzone: [],
        geozone: [],
        FIC: [],
        reservedAirspace: [],
        TerrainAdvisory: [],
      };
  
      this.interesectionArr.greenzone = this.greenZoneIntersection;
      this.interesectedEntities.forEach((value) => {
        if (
          value.zone === 'vfr' ||
          value.zone === 'airport' ||
          value.zone === 'FIC' ||
          value.zone === 'geozone'
        ) {
          value.coRelationType = `${value.zone}-${value.type.toLowerCase()}`;
          if (this.interesectionArr[value.zone])
            this.interesectionArr[value.zone].push(value);
          else this.interesectionArr[value.zone] = [value];
        }
      });
      //add value to the zones
  
      let inneryellow = [],
        outeryellow = [],
        red = [],
        geozone = [];
      latitudeArr.forEach((lat, i) => {
        if (this.interesectionArr.airport.length !== 0) {
          this.interesectionArr.airport.forEach((zone) => {
            if (zone.type === 'Inner-Yellow') {
              if (inneryellow[i] != true) {
                inneryellow[i] = this.findCorelations(
                  zone.coOrdinates,
                  lat,
                  longitudeArr[i]
                );
              }
            }
            if (zone.type === 'Outer-Yellow') {
              if (outeryellow[i] != true) {
                outeryellow[i] = this.findCorelations(
                  zone.coOrdinates,
                  lat,
                  longitudeArr[i]
                );
              }
            }
            if (zone.type === 'Red-Zone') {
              if (red[i] != true) {
                red[i] = this.findCorelations(
                  zone.coOrdinates,
                  lat,
                  longitudeArr[i]
                );
              }
            }
          });
        }
        if (this.interesectionArr.geozone.length !== 0) {
          this.interesectionArr.geozone.forEach((zone) => {
            if (geozone[i] != true) {
              geozone[i] = this.findCorelations(
                zone.coOrdinates,
                lat,
                longitudeArr[i]
              );
            }
          });
        }
      });
  
      let yellowzones = 0;
      let redzones = 0;
      let greenzones = 0;
      for (let i = 0; i < latitudeArr.length; i++) {
        if (inneryellow[i] || outeryellow[i]) yellowzones++;
        if (red[i] || geozone[i]) redzones++;
        if (!(inneryellow[i] || outeryellow[i] || red[i] || geozone[i]))
          greenzones++;
      }
      if (yellowzones === 0 && redzones === 0) greenzones = latitudeArr.length;
      this.showCorrelation = true;
      this.correlationData = {
        inneryellow,
        outeryellow,
        red,
        geozone,
        zoneCount: [greenzones, yellowzones, redzones],
      };
    }
    async getElevationData(latGraph, longGraph, altGraph) {
        let elevationData = [];
        let distances = [];
        let droneHeight = [];
        const coordinates: Coordinate[] = [];
        let dist: any = 0;
    
        for (let i = 0; i < latGraph.length; i++) {
          const coordinate: Coordinate = {
            latitude: latGraph[i],
            longitude: longGraph[i],
          };
          coordinates.push(coordinate);
        }
    
        try {
          if (coordinates.length !== 0) {
            const response = await this.operatorApi.getElevation(coordinates);
            const elevations = response['data']?.MainData;
            elevationData.push(...elevations);
          }
    
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
          if (this.altitudeRef.length > 0) {
            for (let i = 0; i < altGraph.length; i++) {
              if (this.altitudeRef[i] == 0) {
                droneHeight[i] = elevationData[i];
              } else if (this.altitudeRef[i] == 3) {
                droneHeight[i] = altGraph[0] + altGraph[i] + elevationData[0];
              } else if (this.altitudeRef[i] == 10) {
                droneHeight[i] = elevationData[i] + altGraph[i];
              }
            }
          } else if (this.altitudeRef.length == 0) {
            for (let i = 0; i < altGraph.length; i++) {
              droneHeight[i] = altGraph[i] + elevationData[i];
            }
          }
          this.initBasicAreaEcharts(elevationData, droneHeight, distances);
        } catch (error) {}
      }

     findCorelations(coordinates, lat, lng) {
        const point = turf.point([lng, lat]);
        const polygon = turf.polygon([coordinates]);
        const isInsideZone = turf.booleanPointInPolygon(point, polygon);
        return isInsideZone;
      }

       initBasicAreaEcharts(elevationData, droneHeight, distances) {
          this.chartOption = {
            title: {
              top: '10%',
              left: 'center',
            },
            tooltip: {
              trigger: 'axis',
              order: 'seriesDesc',
              confine: true,
            },
            grid: {
              top: '10%',
              left: '10%',
              right: '10%',
              bottom: '16%',
              containLabel: true,
            },
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
            toolbox: {
              feature: {
                saveAsImage: {},
              },
            },
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
                name: 'Mean sea leve(m)',
                type: 'line',
                // stack:'Total',
                data: elevationData,
                itemStyle: {
                  color: '#0770FF',
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: 'rgba(58,77,233,1)', // Solid blue at the top
                    },
                    {
                      offset: 1,
                      color: 'rgba(58,77,233,0)', // Fully transparent at the bottom
                    },
                  ]),
                },
              },
              {
                name: 'Planned Drone Altitude(m)',
                type: 'line',
                // stack:'Total',
                itemStyle: {
                  color: '#F2597F',
                },
                data: droneHeight,
              },
            ],
          };
        }
    
  onFormSubmit(createMission) {
  }

  zoomToEntity() {
    let waypointpath = [];
    for (let i = 0; i < this.LatitudeArr.length; i++) {
      waypointpath.push(
        Cesium.Cartesian3.fromDegrees(
          this.LongitudeArr[i],
          this.LatitudeArr[i],
          this.AltitudeArr[i]
        )
      );
    }
    this.cesiumFunction.zoomEntity1(this.viewer, this.entity, waypointpath);
  }

  updateZoneVal(){
    this.authorityApi.getZoneData(false);
  }

  onReset() {
    this.pointData = [];
    this.polyData = [];
    this.LatitudeArr = [];
    this.LongitudeArr = [];
    this.AltitudeArr = [];
    this.WayPointNum = [];
    this.wayPointsArr = [];
    this.bufferPolygon = [];
    this.bufferPointsArr = [];
    this.distanceData = [];
    this.viewer.entities.removeAll();
    this.viewer.scene.requestRender();
    this.isClicked = false;
    this.uploaded = false;
    this.wayBackened = [];
    this.clearFormValues();
    this.getZoneData();
  }

  clearFormValues() {
    const wayPointsArray = this.wayPointsForm.get('wayPoints') as FormArray;
    while (wayPointsArray.length) {
      wayPointsArray.removeAt(0);
    }
  }

  onZoneSubmit() {
    this.loader = true;
    const cartesian3Array = this.wayPointsArr.map(item => {
      return {
        x: item.x,
        y: item.y,
        z: item.z
      };
    });
    let coordinatesArray = [];
    for (let i = 0; i < this.LatitudeArr.length; i++) {
        coordinatesArray.push([this.LongitudeArr[i],this.LatitudeArr[i]]);
    }
    let cStart = coordinatesArray[0];
    coordinatesArray.push(cStart);
    let payload = {
      waypoint: [...cartesian3Array],
      waypointName : this.zoneName,
      zone: this.color,
      coordinate: coordinatesArray,
      StartTime:this.missionDetails.value.StartTime,
      EndTime:this.missionDetails.value.EndTime,
      height: this.missionDetails.get('MaximumAltitude') ? this.missionDetails.get('MaximumAltitude').value : 0
    }
    this.authorityApi.sendZoneData(payload).then((res: any) => {
      this.loader = false;
      this.onReset();
      this.updateZoneVal();
      this.swalWithBootstrapButtons
      .fire({
        background: '#1b1f27',
        text: 'Zone created successfully',
        icon: 'success',
        focusConfirm: false,
        showCancelButton: false,
        showConfirmButton: true,
        allowOutsideClick: false,
        // timer: 1000,
        confirmButtonText: 'Okay',
        // onOpen: () => Swal.getCancelButton().focus()
      })
      //  this.profileDetails = res.Main
    });
    
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
