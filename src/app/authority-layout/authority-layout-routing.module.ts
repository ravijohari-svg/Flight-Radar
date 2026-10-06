import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityLayoutComponent } from './authority-layout.component';
import { AuthorityLoginComponent } from './authority-login/authority-login.component';
import { AuthorityPasswordComponent } from './authority-password/authority-password.component';


const routes: Routes = [
  {
    path: '',
    component: AuthorityLayoutComponent,
    children: [
      {
        path: 'authority-login',
        component: AuthorityLoginComponent,
      },
      {
        path: 'set-password',
        component: AuthorityPasswordComponent,
      },
      {
        path: 'authority-app',
        loadChildren: () =>
          import('./authority-application/authority-application.module').then(
            (m) => m.AuthorityApplicationModule
          ),
      },
      { path: '', redirectTo: 'authority-login', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthorityLayoutRoutingModule {}
