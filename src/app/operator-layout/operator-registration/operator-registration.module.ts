import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperatorRegistrationRoutingModule } from './operator-registration-routing.module';
import { OperatorRegisterComponent } from './operator-register/operator-register.component';
import { OperatorVerificationComponent } from './operator-verification/operator-verification.component';
import { OperatorPasswordComponent } from './operator-password/operator-password.component';
import {ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [OperatorRegisterComponent, OperatorVerificationComponent, OperatorPasswordComponent],
  imports: [
    CommonModule,
    OperatorRegistrationRoutingModule,
    ReactiveFormsModule
  ]
})
export class OperatorRegistrationModule { }
