import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityRoutesGuard } from 'src/app/custom-guard/authority/authority-routes.guard';
import { AuthorityPilotsListComponent } from './authority-pilots-list/authority-pilots-list.component';
import { AuthorityPilotsComponent } from './authority-pilots.component';

const routes: Routes = [{
  path: '',
  component: AuthorityPilotsComponent,
  children: [
    { path: 'pilots-list/:metric', component: AuthorityPilotsListComponent, canActivate: [AuthorityRoutesGuard] },
    { path: '', redirectTo: 'pilots-list/:metric', pathMatch: 'full', }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityPilotsRoutingModule { }
