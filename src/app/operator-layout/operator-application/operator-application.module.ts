import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperatorApplicationRoutingModule } from './operator-application-routing.module';
import { OperatorDashboardComponent } from './operator-dashboard/operator-dashboard.component';
import { OperatorApplicationComponent } from './operator-application.component';
//Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
import { CustomPipesModule } from 'src/app/cutom-pipes/custom-pipes.module';
import { OperatorPreflightReportComponent } from './operator-preflight-report/operator-preflight-report.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { TestComponent } from './test/test.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { OperatorPaymentPageComponent } from './operator-payment-page/operator-payment-page.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { PaymentResponseComponent } from './payment-response/payment-response.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';
import { MapLayoutModule } from 'src/app/map-layout/map-layout.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MissionPlannerViewComponent } from './mission-planner-view/mission-planner-view.component';
import { MatExpansionModule } from '@angular/material/expansion';
@NgModule({
  declarations: [
    OperatorApplicationComponent,
    OperatorDashboardComponent,
    OperatorPreflightReportComponent,
    TestComponent,
    OperatorPaymentPageComponent,
    PaymentResponseComponent,
    ErrorPageComponent,
    MissionPlannerViewComponent,
  ],
  imports: [
    CommonModule,
    CommonComponentsModule,
    OperatorApplicationRoutingModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MapLayoutModule,
    //Angular material
    MatSidenavModule,
    // //FormsModule
    FormsModule,
    // ReactiveFormsModule
    //Custom Pipes
    CustomPipesModule,
    MatExpansionModule,
    NgxEchartsModule.forRoot({
      echarts: loadEcharts,
    }),
    //Ngx Bootstrap
    ModalModule.forRoot(),
  ],
  // exports: [
  //   AngularCesiumModule,
  //   AngularCesiumWidgetsModule,
  // ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class OperatorApplicationModule {}
export function loadEcharts() {
  return import('echarts');
}
