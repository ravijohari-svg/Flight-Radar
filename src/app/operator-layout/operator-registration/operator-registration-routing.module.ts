import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperatorRegisterComponent } from './operator-register/operator-register.component';
import { OperatorVerificationComponent } from './operator-verification/operator-verification.component';
import { OperatorPasswordComponent } from './operator-password/operator-password.component';
import { OperatorRegisterGuard } from 'src/app/custom-guard/operator/operator-register.guard';

const routes: Routes = [
  { path: 'register', component: OperatorRegisterComponent },
  { path: 'email-verification',
    canActivate:[OperatorRegisterGuard],
    component: OperatorVerificationComponent },
  { path: 'set-password',
    component: OperatorPasswordComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperatorRegistrationRoutingModule {}
