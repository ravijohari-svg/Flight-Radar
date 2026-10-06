import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperatorCreateMissionComponent } from './operator-create-mission/operator-create-mission.component';
import { OperatorMissionListComponent } from './operator-mission-list/operator-mission-list.component';
import { OperatorMissionComponent } from './operator-mission.component';

const routes: Routes = [
  {
    path: '',
    component : OperatorMissionComponent,
    children: [
      { path: 'mission-list', component: OperatorMissionListComponent,  },
      { path: 'create-mission', component: OperatorCreateMissionComponent,},
      {
        path : 'blackbox',
        loadChildren: () => import('./operator-blackbox/operator-blackbox.module').then(m => m.OperatorBlackboxModule)
      },
      { path: '', redirectTo: 'blackbox', pathMatch:'full',}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),RouterModule],
  exports: [RouterModule]
})
export class OperatorMissionRoutingModule { }
