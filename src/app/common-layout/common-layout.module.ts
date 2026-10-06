import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommonLayoutRoutingModule } from './common-layout-routing.module';
import { CommonLayoutComponent } from './common-layout.component';
import { MatStepperModule } from '@angular/material/stepper';
//Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//Ngx-Bootstrap
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

//Services
import { OperatorapisService } from '../custom-services/operator/operatorapis.service';
import { OperatorService } from '../custom-services/operator/operator.service';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthorityapisService } from '../custom-services/authority/authorityapis.service';

@NgModule({
  declarations: [CommonLayoutComponent, ForgotPasswordComponent],
  imports: [
    CommonModule,
    CommonLayoutRoutingModule,
    //Angular Material
    MatStepperModule,
    //Forms
    ReactiveFormsModule,
    FormsModule,
    //Ngx Bootstrap
    BsDatepickerModule.forRoot(),
    TypeaheadModule.forRoot(),
  ],
  providers: [OperatorapisService, OperatorService, AuthorityapisService],
})
export class CommonLayoutModule {}
