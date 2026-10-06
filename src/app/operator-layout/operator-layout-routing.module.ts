import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperatorLayoutComponent } from './operator-layout.component';
import { OperatorLoginComponent } from './operator-login/operator-login.component';
import { OperatorLandingPageComponent } from './operator-landing-page/operator-landing-page.component';
import { OperatorNewLandingPageComponent } from './operator-new-landing-page/operator-new-landing-page.component';
import { ContactComponent } from './contact/contact.component';

const routes: Routes = [{
  path: '',
  component: OperatorLayoutComponent,
  children: [
    {
      path:'operator-registration',
      loadChildren:() => import('./operator-registration/operator-registration.module').then(m =>m.OperatorRegistrationModule)
    },
    {
      path: 'operator-login',
      component : OperatorLoginComponent
    },
    {
      path: 'operator-login/:create-mission',
      component : OperatorLoginComponent
    },
    {
      path : 'operator-app',
      loadChildren: () => import('./operator-application/operator-application.module').then(m => m.OperatorApplicationModule)
    },
    // { 
    //   path: '',
    //   redirectTo: 'operator-app',
    //   pathMatch: 'full' 
    // }
    {
      path: 'home',
      component : OperatorLandingPageComponent
    },
    {
      path: 'latest-landing',
      component : OperatorNewLandingPageComponent
    },
    {
      path: 'operator-login',
      component : OperatorLoginComponent
    },
    { 
      path: '',
      redirectTo: 'home',
      pathMatch: 'full' 
    },
    {
      path: 'contact',
      component : ContactComponent
    }

    ]


  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperatorLayoutRoutingModule { }
