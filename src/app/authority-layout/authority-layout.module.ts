import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorityLayoutRoutingModule } from './authority-layout-routing.module';
import { AuthorityLayoutComponent } from './authority-layout.component';
import { AuthorityLoginComponent } from './authority-login/authority-login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthorityPasswordComponent } from './authority-password/authority-password.component';


@NgModule({
  declarations: [AuthorityLayoutComponent, AuthorityLoginComponent,AuthorityPasswordComponent],
  imports: [
    CommonModule,
    AuthorityLayoutRoutingModule,
    //Forms
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuthorityLayoutModule { }
