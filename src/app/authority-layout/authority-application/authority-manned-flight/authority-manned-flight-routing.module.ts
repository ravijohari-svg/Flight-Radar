import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityMannedFlightComponent } from './authority-manned-flight.component';

const routes: Routes = [
  {
    path: '',
    component: AuthorityMannedFlightComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthorityMannedFlightRoutingModule {}
