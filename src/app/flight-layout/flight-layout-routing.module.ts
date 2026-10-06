import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightComponent } from './flight/flight.component';

const routes: Routes = [{
  path:'takeoff-form',
component:FlightComponent
},
{
  path: '', redirectTo: 'takeoff-form',  pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlightLayoutRoutingModule { }
