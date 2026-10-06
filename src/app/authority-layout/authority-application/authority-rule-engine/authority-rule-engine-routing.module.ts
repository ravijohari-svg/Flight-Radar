import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityRoutesGuard } from 'src/app/custom-guard/authority/authority-routes.guard';
import { AuthorityDroneParametersComponent } from './authority-drone-parameters/authority-drone-parameters.component';
import { AuthorityMissionParametersComponent } from './authority-mission-parameters/authority-mission-parameters.component';
import { AuthorityRuleEngineComponent } from './authority-rule-engine.component';

const routes: Routes = [{
  path:'',
  component: AuthorityRuleEngineComponent,
  children: [
    { path: 'drone-parameters', component: AuthorityDroneParametersComponent, canActivate: [AuthorityRoutesGuard] },
    { path: 'mission-parameters', component: AuthorityMissionParametersComponent, canActivate: [AuthorityRoutesGuard] },
    {path: '', redirectTo: 'drone-parameters', pathMatch: 'full' }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityRuleEngineRoutingModule { }
