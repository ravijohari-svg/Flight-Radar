import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './page/page.component';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
const routes: Routes = [{
  path:'',
  // component:PageComponent,
  children:[{
    path: 'page',
    component : PageComponent
  },
  {path :'transaction-detail',component:TransactionDetailComponent},
  { path: '', redirectTo:'page', pathMatch: 'full' },]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperatorPaymentRoutingModule { }
