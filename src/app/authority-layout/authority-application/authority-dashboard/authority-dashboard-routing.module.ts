import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityDashboardComponent } from './authority-dashboard.component';

const routes: Routes = [{
  path: '',
  component: AuthorityDashboardComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityDashboardRoutingModule { }
