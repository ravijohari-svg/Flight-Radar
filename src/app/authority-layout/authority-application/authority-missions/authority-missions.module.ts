import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorityMissionsRoutingModule } from './authority-missions-routing.module';
import { AuthorityMissionsComponent } from './authority-missions.component';
import { MissionApprovalsComponent } from './mission-approvals/mission-approvals.component';
import { MissionDetailsComponent } from './mission-details/mission-details.component';


@NgModule({
  declarations: [AuthorityMissionsComponent, MissionApprovalsComponent, MissionDetailsComponent],
  imports: [
    CommonModule,
    AuthorityMissionsRoutingModule
  ]
})
export class AuthorityMissionsModule { }
