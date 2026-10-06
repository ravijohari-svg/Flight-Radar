import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityFlightRadarComponent } from './authority-flight-radar.component';
import { FlightRadarDashboardComponent } from './flight-radar-dashboard/flight-radar-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: AuthorityFlightRadarComponent,
    children: [
      {
        path: '',
        component: FlightRadarDashboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityFlightRadarRoutingModule { }
