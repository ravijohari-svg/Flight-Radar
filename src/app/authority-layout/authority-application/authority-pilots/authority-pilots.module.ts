import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorityPilotsRoutingModule } from './authority-pilots-routing.module';
import { AuthorityPilotsComponent } from './authority-pilots.component';
import { AuthorityPilotsListComponent } from './authority-pilots-list/authority-pilots-list.component';


@NgModule({
  declarations: [AuthorityPilotsComponent, AuthorityPilotsListComponent],
  imports: [
    CommonModule,
    AuthorityPilotsRoutingModule
  ]
})
export class AuthorityPilotsModule { }
