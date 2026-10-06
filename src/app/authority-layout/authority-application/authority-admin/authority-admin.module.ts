import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorityAdminRoutingModule } from './authority-admin-routing.module';
import { AdminListComponent } from './admin-list/admin-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { PilotsListComponent } from './pilots-list/pilots-list.component';
import { AuthorityAdminComponent } from './authority-admin.component'
@NgModule({
  declarations: [AdminListComponent, PilotsListComponent, AuthorityAdminComponent],
  imports: [
    CommonModule,
    AuthorityAdminRoutingModule,
    ModalModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    //ngx Bootstrap
    TypeaheadModule.forRoot(),
  ],
})
export class AuthorityAdminModule { }
