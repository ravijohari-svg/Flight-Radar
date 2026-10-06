import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralComponent } from './general/general.component';
import { OperatorSettingComponent } from './operator-setting.component';
import { OperatorRoutesGuard } from 'src/app/custom-guard/operator/operator-routes.guard';
import { PilotProfileComponent } from './pilot-profile/pilot-profile.component';
import { DocumentsComponent } from './documents/documents.component';
import { RptoFormComponent } from './rpto-form/rpto-form.component';
import { RptoGuard } from 'src/app/custom-guard/operator/rpto.guard';

const routes: Routes = [
  {
    path: '',
    component: OperatorSettingComponent,
    children: [
      {
        path: 'pilots-profile',
        component: PilotProfileComponent,
        canActivate: [OperatorRoutesGuard],
      },
      { path: 'pilots-document', component: DocumentsComponent },
      {
        path: 'rpto-form',
        component: RptoFormComponent,
        canActivate: [OperatorRoutesGuard, RptoGuard],
      },
      {
        path: 'general',
        component: GeneralComponent,
        canActivate: [OperatorRoutesGuard],
      },
      { path: '', redirectTo: 'pilots-profile', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperatorSettingRoutingModule {}
