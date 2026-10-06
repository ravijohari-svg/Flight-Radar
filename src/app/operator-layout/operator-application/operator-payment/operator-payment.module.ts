import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperatorPaymentRoutingModule } from './operator-payment-routing.module';
import { PageComponent } from './page/page.component';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';


@NgModule({
  declarations: [PageComponent, TransactionDetailComponent],
  imports: [
    CommonModule,
    OperatorPaymentRoutingModule
  ]
})
export class OperatorPaymentModule { }
