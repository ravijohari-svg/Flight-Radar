import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorityFlightRadarRoutingModule } from './authority-flight-radar-routing.module';
import { AuthorityFlightRadarComponent } from './authority-flight-radar.component';
import { FlightRadarDashboardComponent } from './flight-radar-dashboard/flight-radar-dashboard.component';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';
import { MapLayoutModule } from 'src/app/map-layout/map-layout.module';

@NgModule({
  declarations: [
    AuthorityFlightRadarComponent,
    FlightRadarDashboardComponent
  ],
  imports: [
    CommonModule,
    AuthorityFlightRadarRoutingModule,
    CommonComponentsModule,
    MapLayoutModule
  ]
})
export class AuthorityFlightRadarModule { }
