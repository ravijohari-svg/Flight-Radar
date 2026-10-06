import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorityDashboardRoutingModule } from './authority-dashboard-routing.module';
import { AuthorityDashboardComponent } from './authority-dashboard.component';
import { UpcomingMissionListComponent } from './upcoming-mission-list/upcoming-mission-list.component';
import { MissionDetailsComponent } from './mission-details/mission-details.component';
import { OngoingMissionsComponent } from './ongoing-missions/ongoing-missions.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

//Ngx Bootstrap
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';
import { MissionCardComponent } from './ongoing-missions/mission-card/mission-card.component';
import { MapLayoutModule } from 'src/app/map-layout/map-layout.module';
import { CreateZonesComponent } from './create-zones/create-zones.component';
@NgModule({
  declarations: [
    AuthorityDashboardComponent,
    UpcomingMissionListComponent,
    MissionDetailsComponent,
    OngoingMissionsComponent,
    MissionCardComponent,
    CreateZonesComponent,
  ],
  imports: [
    CommonModule,
    AuthorityDashboardRoutingModule,
    CommonComponentsModule,
    MapLayoutModule,

    //slidetoogle
    MatSlideToggleModule,

    //Ngx Bootstrap
    AccordionModule.forRoot(),

    //Forms
    // FormsModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [],
})
export class AuthorityDashboardModule {}
