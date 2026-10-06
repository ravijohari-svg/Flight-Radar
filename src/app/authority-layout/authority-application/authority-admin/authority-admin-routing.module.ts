import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityPilotsComponent } from '../authority-pilots/authority-pilots.component';
import { AdminListComponent } from './admin-list/admin-list.component';
import {AuthorityAdminComponent} from './authority-admin.component'
import { AuthorityRoutesGuard } from 'src/app/custom-guard/authority/authority-routes.guard';
import { PilotsListComponent } from './pilots-list/pilots-list.component';

const routes: Routes = [
  {
    path: '',
    component: AuthorityAdminComponent,
    children: [
      { path: 'pilots', component: PilotsListComponent },
      // , canActivate: [AuthorityRoutesGuard]
      { path: 'regulators', component: AdminListComponent },
      {path: '', redirectTo: 'pilots', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityAdminRoutingModule { }
