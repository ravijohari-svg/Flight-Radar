import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperatorBlackboxComponent } from './operator-blackbox.component';
import { BlackboxListComponent } from './blackbox-list/blackbox-list.component';
import { OperatorRoutesGuard } from 'src/app/custom-guard/operator/operator-routes.guard';
import { BlackboxDetailComponent } from './blackbox-detail/blackbox-detail.component';

const routes: Routes = [
  {
    path: '',
    component: OperatorBlackboxComponent,
    children: [
      {
        path: 'missionlist',
        component: BlackboxListComponent,
        canActivate: [OperatorRoutesGuard],
      },
      {
        path: 'missionlist/:missionId',
        component: BlackboxDetailComponent,
        canActivate: [OperatorRoutesGuard],
      },
      { path: '', redirectTo: 'missionlist', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperatorBlackboxRoutingModule {}
