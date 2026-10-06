import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityBlackboxComponent } from './authority-blackbox.component';
import { BlackboxListComponent } from './blackbox-list/blackbox-list.component';
import { AuthorityRoutesGuard } from 'src/app/custom-guard/authority/authority-routes.guard';
import { BlackboxDetailComponent } from './blackbox-detail/blackbox-detail.component';

// const routes: Routes = [{
//   path: '',
//   component: AuthorityBlackboxComponent
// }];
const routes: Routes = [{
  path: '',
  component: AuthorityBlackboxComponent,
  children: [
    {
      path: 'missionlist',
      component: BlackboxListComponent,
      canActivate: [AuthorityRoutesGuard],
    },
    {
      path: 'missionlist/:missionId',
      component: BlackboxDetailComponent,
      canActivate: [AuthorityRoutesGuard],
    },
    { path: '', redirectTo: 'missionlist', pathMatch: 'full' },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityBlackboxRoutingModule { }
