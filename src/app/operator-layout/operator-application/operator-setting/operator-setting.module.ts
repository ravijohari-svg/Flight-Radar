import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperatorSettingRoutingModule } from './operator-setting-routing.module';
import { PilotProfileComponent } from './pilot-profile/pilot-profile.component';
import { OperatorSettingComponent } from './operator-setting.component';
import { GeneralComponent } from './general/general.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DocumentsComponent } from './documents/documents.component';
import { RptoFormComponent } from './rpto-form/rpto-form.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    PilotProfileComponent,
    OperatorSettingComponent,
    GeneralComponent,
    DocumentsComponent,
    RptoFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    //  TypeaheadModule,
    //Ngx Bootstrap
    BsDatepickerModule.forRoot(),
    TypeaheadModule.forRoot(),
    ModalModule.forRoot(),
    OperatorSettingRoutingModule,
  ],
})
export class OperatorSettingModule {}
