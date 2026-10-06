import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperatorMissionRoutingModule } from './operator-mission-routing.module';
import { OperatorMissionListComponent } from './operator-mission-list/operator-mission-list.component';
import { OperatorCreateMissionComponent } from './operator-create-mission/operator-create-mission.component';
import { OperatorMissionComponent } from './operator-mission.component';

//Cesium
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CustomPipesModule } from 'src/app/cutom-pipes/custom-pipes.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { OperatorPaymentPageComponent } from '../operator-payment-page/operator-payment-page.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
//accordion
import { MatExpansionModule } from '@angular/material/expansion';
import { MapLayoutModule } from 'src/app/map-layout/map-layout.module';
import { WaypointFormCardComponent } from 'src/app/common-components/waypoint-form-card/waypoint-form-card.component';
import { CorrelationCardComponent } from 'src/app/common-components/correlation-card/correlation-card.component';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';


@NgModule({
  declarations: [
    OperatorMissionComponent,
    OperatorMissionListComponent,
    OperatorCreateMissionComponent,
    // WaypointFormCardComponent,
    // CorrelationCardComponent
    // OperatorPaymentPageComponent
  ],
  imports: [
    CommonModule,
    OperatorMissionRoutingModule,
    MapLayoutModule,
    CommonComponentsModule,
    //Angular Cesium
    MatSlideToggleModule,

    //FormsModule
    FormsModule,
    ReactiveFormsModule,

    //Ngx Bootstrap
    ModalModule.forRoot(),
    //Custom Pipes
    CustomPipesModule,

    MatExpansionModule,

    NgxEchartsModule.forRoot({
      echarts: loadEcharts,
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
})
export class OperatorMissionModule {}
export function loadEcharts() {
  return import('echarts');
}
