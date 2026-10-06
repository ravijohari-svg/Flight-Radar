import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityMissionsComponent } from './authority-missions.component';
import { MissionApprovalsComponent } from './mission-approvals/mission-approvals.component';
import { MissionDetailsComponent } from './mission-details/mission-details.component';

const routes: Routes = [
  {
    path: '',
    component : AuthorityMissionsComponent,
    children: [
      { path: 'mission-approval', component: MissionApprovalsComponent, },
      { path: 'mission-details', component: MissionDetailsComponent,  },
      { path: '', redirectTo: 'mission-approval', pathMatch:'full', }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityMissionsRoutingModule { }
