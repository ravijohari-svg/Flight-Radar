import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonLayoutComponent } from './common-layout.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

const routes: Routes = [
  {
    path: '',
    component: CommonLayoutComponent,
    children: [
      {
        path: 'authority/forgot-password',
        component: ForgotPasswordComponent,
      },
      {
        path: 'operator/forgot-password',
        component: ForgotPasswordComponent,
      },
      {
        path: '',
        redirectTo: 'operator/',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommonLayoutRoutingModule {}
