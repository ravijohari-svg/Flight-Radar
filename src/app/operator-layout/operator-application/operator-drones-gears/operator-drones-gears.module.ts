import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';
import { OperatorDronesGearsRoutingModule } from './operator-drones-gears-routing.module';
import { OperatorDronesGearsComponent } from './operator-drones-gears.component';
import { DronesGearsListComponent } from './drones-gears-list/drones-gears-list.component';
import { DroneGearsRegistrationComponent } from './drone-gears-registration/drone-gears-registration.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatSelectModule } from '@angular/material/select';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MapLayoutModule } from 'src/app/map-layout/map-layout.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    OperatorDronesGearsComponent,
    DronesGearsListComponent,
    DroneGearsRegistrationComponent,
  ],
  imports: [
    CommonModule,
    CommonComponentsModule,
    MatSelectModule,
    OperatorDronesGearsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MapLayoutModule,
    //Material
    MatSidenavModule,
    DragDropModule,
  ],
})
export class OperatorDronesGearsModule {}
