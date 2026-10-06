import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorityBlackboxRoutingModule } from './authority-blackbox-routing.module';
import { AuthorityBlackboxComponent } from './authority-blackbox.component';
import { BlackboxListComponent } from './blackbox-list/blackbox-list.component';
import { BlackboxDetailComponent } from './blackbox-detail/blackbox-detail.component';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { NgxEchartsModule } from 'ngx-echarts';
import { MapLayoutModule } from 'src/app/map-layout/map-layout.module';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

@NgModule({
  declarations: [
    AuthorityBlackboxComponent,
    BlackboxListComponent,
    BlackboxDetailComponent,
  ],
  imports: [
    CommonModule,
    AuthorityBlackboxRoutingModule,
    MapLayoutModule,
    //Angular Core
    FormsModule,
    MatSlideToggleModule,
    CommonComponentsModule,
    //ngx Bootstrap
    TypeaheadModule.forRoot(),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  // providers: [
  //   MapsManagerService,
  //   CesiumService
  // ]
})
export class AuthorityBlackboxModule {}
