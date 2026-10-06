import { Injectable, NgModule } from '@angular/core';
import {
  RouterModule,
  RouterStateSnapshot,
  Routes,
  TitleStrategy,
} from '@angular/router';
import { AppComponent } from './app.component';
import { NetworkAwarePreloadService } from './custom-services/common/network-aware-preload.service';
import { TestCcavenueComponent } from './test-ccavenue/test-ccavenue.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: 'operator',
        loadChildren: () =>
          import('./operator-layout/operator-layout.module').then(
            (m) => m.OperatorLayoutModule
          ),
        title: 'Operator',
      },
      {
        path: 'authority',
        loadChildren: () =>
          import('./authority-layout/authority-layout.module').then(
            (m) => m.AuthorityLayoutModule
          ),
        title: 'Authority',
      },
      {
        path: 'report',
        loadChildren: () =>
          import('./report/report.module').then((m) => m.ReportModule),
      },
      {
        path: 'common',
        loadChildren: () =>
          import('./common-layout/common-layout.module').then(
            (m) => m.CommonLayoutModule
          ),
      },
      {
        path: 'flight',
        loadChildren: () =>
          import('./flight-layout/flight-layout.module').then(
            (m) => m.FlightLayoutModule
          ),
      },
      {
        path: 'test-pay-CcAvenue-YSOAGRIA',
        component: TestCcavenueComponent,
      },

      { path: '', redirectTo: 'operator', pathMatch: 'prefix' },
    ],
  },
];

@Injectable()
class TemplatePageTitleStrategy extends TitleStrategy {
  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      document.title = `${title} - SkyeUTM`;
    } else {
      document.title = `SkyeUTM`;
    }
  }
}

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // initialNavigation: 'enabled',
      preloadingStrategy: NetworkAwarePreloadService,
    }),
  ],
  exports: [RouterModule],
  providers: [{ provide: TitleStrategy, useClass: TemplatePageTitleStrategy }],
})
export class AppRoutingModule {}
