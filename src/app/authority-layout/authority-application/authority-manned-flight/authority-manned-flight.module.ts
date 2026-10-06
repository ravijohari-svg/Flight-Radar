import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapLayoutModule } from 'src/app/map-layout/map-layout.module';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';
import { AuthorityMannedFlightRoutingModule } from './authority-manned-flight-routing.module';
import { AuthorityMannedFlightComponent } from './authority-manned-flight.component';

@NgModule({
  declarations: [AuthorityMannedFlightComponent],
  imports: [
    CommonModule,
    FormsModule,
    MapLayoutModule,
    CommonComponentsModule,
    AuthorityMannedFlightRoutingModule,
  ],
})
export class AuthorityMannedFlightModule {}
