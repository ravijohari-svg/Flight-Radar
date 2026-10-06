import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperatorRoutesGuard } from 'src/app/custom-guard/operator/operator-routes.guard';
import { DroneGearsRegistrationComponent } from './drone-gears-registration/drone-gears-registration.component';
import { DronesGearsListComponent } from './drones-gears-list/drones-gears-list.component';
import { OperatorDronesGearsComponent } from './operator-drones-gears.component';

const routes: Routes = [{
  path: '',
  component: OperatorDronesGearsComponent,
  children: [{ path: 'list', component: DronesGearsListComponent, canActivate: [OperatorRoutesGuard] },
  { path: 'registration/:droneId', component: DroneGearsRegistrationComponent, canActivate: [OperatorRoutesGuard] },
  { path: 'registration', component: DroneGearsRegistrationComponent, canActivate: [OperatorRoutesGuard] },
  { path: '', redirectTo: 'list', pathMatch: 'full' }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperatorDronesGearsRoutingModule { }
