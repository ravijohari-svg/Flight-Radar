import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperatorRoutesGuard } from 'src/app/custom-guard/operator/operator-routes.guard';
import { PaymentGuard } from 'src/app/custom-guard/payment/payment.guard';
import { OperatorApplicationComponent } from './operator-application.component';
import { OperatorDashboardComponent } from './operator-dashboard/operator-dashboard.component';
import { PaymentResponseComponent } from './payment-response/payment-response.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { MissionPlannerViewComponent } from './mission-planner-view/mission-planner-view.component';
const routes: Routes = [
  {
    path: '',
    component : OperatorApplicationComponent,
    children: [
      { path: 'dashboard',
       component: OperatorDashboardComponent,
        // canActivate: [OperatorRoutesGuard,PaymentGuard],
        data:{paymentMode: ['Free','Basic','Advanced']} },
      {
        path : 'mission',
        canActivate: [OperatorRoutesGuard,PaymentGuard] ,
        loadChildren: () => import('./operator-mission/operator-mission.module').then(m => m.OperatorMissionModule),
        data:{paymentMode: ['Basic' ,'Advanced']}
      },
      {
        path : 'drones-gears',
        canActivate: [OperatorRoutesGuard,PaymentGuard] ,
        loadChildren: () => import('./operator-drones-gears/operator-drones-gears.module').then(m => m.OperatorDronesGearsModule),
        data:{paymentMode: ['Basic' ,'Advanced']}
      },
      {
        path:"payment",
        canActivate:[OperatorRoutesGuard,PaymentGuard],
        loadChildren:()=> import('./operator-payment/operator-payment.module').then(m=> m.OperatorPaymentModule),
        data:{paymentMode: []}
      },
      {
        path:"payment-response/:response",
        canActivate:[OperatorRoutesGuard,PaymentGuard],
        component: PaymentResponseComponent,
        data:{paymentMode: ['Free','Basic','Advanced']}
      },
      {
        path:"error-page",
        canActivate:[OperatorRoutesGuard,PaymentGuard],
        component: ErrorPageComponent,
        data:{paymentMode: ['Free','Basic','Advanced']}
      },
      { path: 'dashboard',
       component: OperatorDashboardComponent,
        canActivate: [OperatorRoutesGuard,PaymentGuard],
        data:{paymentMode: ['Free','Basic','Advanced']} },
      {
         path: 'operators-setting',
      // component: OperatorSettingComponent,
       canActivate: [OperatorRoutesGuard],
       loadChildren: () => import('./operator-setting/operator-setting.module').then(m => m.OperatorSettingModule),
       data:{paymentMode: ['Free']} },

       { path: 'mission-planner',
        component: MissionPlannerViewComponent,
         canActivate: [OperatorRoutesGuard,PaymentGuard],
         data:{paymentMode: ['Free','Basic','Advanced']} },

      { path: '', redirectTo:'dashboard', pathMatch: 'full' },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperatorApplicationRoutingModule { }
