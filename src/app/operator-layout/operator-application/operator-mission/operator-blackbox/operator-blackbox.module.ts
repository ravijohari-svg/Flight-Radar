import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperatorBlackboxRoutingModule } from './operator-blackbox-routing.module';
import { OperatorBlackboxComponent } from './operator-blackbox.component';
import { BlackboxListComponent } from './blackbox-list/blackbox-list.component';
import { BlackboxDetailComponent } from './blackbox-detail/blackbox-detail.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxEchartsModule } from 'ngx-echarts';
import { MapLayoutModule } from 'src/app/map-layout/map-layout.module';

@NgModule({
  declarations: [
    OperatorBlackboxComponent,
    BlackboxListComponent,
    BlackboxDetailComponent,
  ],
  imports: [
    CommonModule,
    OperatorBlackboxRoutingModule,
    MapLayoutModule,
    //Angular Core
    FormsModule,
    MatSlideToggleModule,
    //NGX-charts
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    //ngx Bootstrap
    TypeaheadModule.forRoot(),
  ],
})
export class OperatorBlackboxModule {}
