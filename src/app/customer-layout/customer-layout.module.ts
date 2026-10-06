import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerLayoutRoutingModule } from './customer-layout-routing.module';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';

@NgModule({
  declarations: [CustomerDashboardComponent],
  imports: [
    CommonModule,
    CustomerLayoutRoutingModule,
    //Ngx Bootstrap
    AccordionModule.forRoot(),
  ],
})
export class CustomerLayoutModule {}
