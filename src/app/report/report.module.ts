import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportComponent } from './report.component';
import { ReportRoutingModule } from './report-routing.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { CustomPipesModule } from 'src/app/cutom-pipes/custom-pipes.module';

@NgModule({
  declarations: [ReportComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: loadEcharts,
    }),
    CustomPipesModule
  ],
})
export class ReportModule {}
export function loadEcharts() {
  return import('echarts');
}
