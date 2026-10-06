import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlightLayoutRoutingModule } from './flight-layout-routing.module';
import { FlightComponent } from './flight/flight.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [FlightComponent],
  imports: [
    CommonModule,
    FlightLayoutRoutingModule,
    ReactiveFormsModule
  ]
})
export class FlightLayoutModule { }
