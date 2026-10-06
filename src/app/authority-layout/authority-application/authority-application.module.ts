import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorityApplicationComponent } from './authority-application.component';
import { AuthorityApplicationRoutingModule } from './authority-application-routing.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
import { CustomPipesModule } from 'src/app/cutom-pipes/custom-pipes.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { AuthorityRemoteidComponent } from './authority-remoteid/authority-remoteid.component';
import { AuthorityPreflightReportComponent } from './authority-preflight-report/authority-preflight-report.component';
import { AuthorityPostflightReportComponent } from './authority-postflight-report/authority-postflight-report.component';
import { MapLayoutModule } from 'src/app/map-layout/map-layout.module';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

@NgModule({
  declarations: [
    AuthorityApplicationComponent,
    AuthorityPreflightReportComponent,
    AuthorityPostflightReportComponent,
  ],
  imports: [
    CommonModule,
    AuthorityApplicationRoutingModule,
    CommonComponentsModule,
    //Angular material
    MatSidenavModule,
    //FormsModule
    FormsModule,
    //Angular Cesium
    MapLayoutModule,
    //Custom maps
    CustomPipesModule,
    NgxEchartsModule.forRoot({
      echarts: loadEcharts,
    }),
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AuthorityApplicationModule {}
export function loadEcharts() {
  return import('echarts');
}
